import express from 'express'
import {
  extractUrls,
  extractEmails,
  extractKeywords,
  detectSuspiciousUrls,
  detectPhishingPatterns,
  formatAnalysisResult
} from '../utils/extractors.js'
import {
  analyzeWithHuggingFace,
  assessRiskLevel
} from '../services/huggingface.js'
import {
  triggerN8nWebhook
} from '../services/webhooks.js'
import {
  saveAnalysisToFirebase
} from '../services/firebase.js'
import mlModelsService from '../services/mlModels.js'
import {
  addAnalysisToHistory,
  getRecentHistory
} from '../services/historyStore.js'

const router = express.Router()

router.post('/analyze', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input. Message is required and must be a non-empty string.'
      })
    }

    const urls = extractUrls(message)
    const emails = extractEmails(message)
    const keywords = extractKeywords(message)
    const suspiciousUrls = detectSuspiciousUrls(urls)
    const phishingPatterns = detectPhishingPatterns(message)

    const extractedData = {
      urls,
      emails,
      keywords,
      suspiciousUrls,
      phishingPatterns
    }

    if (!mlModelsService.initialized) {
      await mlModelsService.initialize()
    }

    let mlAnalysis = null
    try {
      mlAnalysis = await mlModelsService.analyzeContent(message)
    } catch (mlError) {
      console.error('ML Analysis error:', mlError.message)
    }

    const analysis = await analyzeWithHuggingFace(message)
    const riskAssessment = assessRiskLevel(analysis, extractedData)
    const result = formatAnalysisResult(analysis, riskAssessment, extractedData)

    let finalStatus = result.status
    let finalRisk = result.risk
    let finalConfidence = result.confidence

    if (mlAnalysis) {
      finalStatus = mlAnalysis.status || result.status
      finalRisk = mlAnalysis.risk || result.risk
      finalConfidence = Math.max(finalConfidence, mlAnalysis.confidence || 0)
    }

    const analysisData = {
      content: message.substring(0, 500),
      status: finalStatus,
      risk: finalRisk,
      confidence: finalConfidence,
      urls: result.urls,
      emails: result.emails,
      suspiciousUrls: result.suspiciousUrls,
      warning: result.warning,
      details: result.details,
      riskScore: riskAssessment.score,
      mlPrediction: mlAnalysis,
      timestamp: new Date().toISOString()
    }

    addAnalysisToHistory(analysisData)

    await saveAnalysisToFirebase(analysisData).catch((err) =>
      console.warn('Failed to save to Firebase:', err.message)
    )

    if (finalRisk === 'High') {
      triggerN8nWebhook(analysisData).catch((err) =>
        console.warn('Webhook trigger failed:', err.message)
      )
    }

    res.json({
      status: finalStatus,
      risk: finalRisk,
      urls: result.urls,
      warning: result.warning,
      emails: result.emails,
      keywords,
      suspiciousLinks: result.suspiciousUrls,
      confidence: finalConfidence,
      mlAnalysis: mlAnalysis
        ? {
            phishing: mlAnalysis.phishing,
            spam: mlAnalysis.spam,
            classification: mlAnalysis.classification,
            models: mlAnalysis.models
          }
        : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    })
  }
})

router.post('/realtime-compare', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input. Message is required and must be a non-empty string.'
      })
    }

    if (!mlModelsService.initialized) {
      await mlModelsService.initialize()
    }

    const mlAnalysis = await mlModelsService.analyzeContent(message)

    res.json({
      status: mlAnalysis.status,
      risk: mlAnalysis.risk,
      confidence: mlAnalysis.confidence,
      mlAnalysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Realtime comparison error:', error)
    res.status(500).json({
      error: 'Realtime comparison failed',
      message: error.message
    })
  }
})

router.post('/analyze-file', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided'
      })
    }

    const fileName = req.file.originalname
    const fileSize = req.file.size
    const urls = extractUrls(fileName)
    const emails = extractEmails(fileName)

    let fileRisk = 'Low'
    let status = 'Safe'
    let confidence = 90

    const suspiciousExtensions = ['.exe', '.bat', '.scr', '.vbs', '.js', '.jar']
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()

    if (suspiciousExtensions.includes(fileExtension)) {
      fileRisk = 'High'
      status = 'Suspicious'
      confidence = 95
    }

    if (fileSize > 10 * 1024 * 1024) {
      fileRisk = fileRisk === 'High' ? 'High' : 'Medium'
      confidence = Math.min(95, confidence + 10)
    }

    const result = {
      status,
      risk: fileRisk,
      confidence,
      fileName,
      fileSize,
      urls,
      emails,
      warning: fileRisk === 'High' ? 'File type or size is suspicious' : 'File appears safe'
    }

    const fileAnalysisData = {
      content: `File: ${fileName}`,
      status: result.status,
      risk: result.risk,
      confidence: result.confidence,
      warning: result.warning,
      fileSize: result.fileSize,
      timestamp: new Date().toISOString()
    }

    addAnalysisToHistory(fileAnalysisData)

    await saveAnalysisToFirebase(fileAnalysisData).catch((err) =>
      console.warn('Firebase save failed:', err.message)
    )

    if (result.risk === 'High') {
      triggerN8nWebhook({
        content: `File: ${fileName}`,
        status: result.status,
        risk: result.risk,
        warning: result.warning
      }).catch((err) => console.warn('Webhook failed:', err.message))
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('File analysis error:', error)
    res.status(500).json({
      error: 'File analysis failed',
      message: error.message
    })
  }
})

router.get('/history', async (req, res) => {
  const limit = Number.parseInt(req.query.limit || '100', 10)

  res.json({
    history: getRecentHistory(Number.isNaN(limit) ? 100 : limit)
  })
})

router.get('/dashboard/overview', async (req, res) => {
  try {
    if (!mlModelsService.initialized) {
      await mlModelsService.initialize()
    }

    res.json(mlModelsService.getDashboardOverview())
  } catch (error) {
    console.error('Dashboard overview error:', error)
    res.status(500).json({
      error: 'Dashboard overview unavailable',
      message: error.message
    })
  }
})

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mlModels: mlModelsService.getHealth()
  })
})

export default router
