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

const router = express.Router()

router.post('/analyze', async (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input. Message is required and must be a non-empty string.'
      })
    }

    // Extract data from message
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

    // Analyze with HuggingFace or fallback
    const analysis = await analyzeWithHuggingFace(message)

    // Assess risk level
    const riskAssessment = assessRiskLevel(analysis, extractedData)

    // Format result
    const result = formatAnalysisResult(analysis, riskAssessment, extractedData)

    // Prepare data for saving
    const analysisData = {
      content: message.substring(0, 500), // Truncate for storage
      status: result.status,
      risk: result.risk,
      confidence: result.confidence,
      urls: result.urls,
      emails: result.emails,
      suspiciousUrls: result.suspiciousUrls,
      warning: result.warning,
      details: result.details,
      riskScore: riskAssessment.score,
      timestamp: new Date().toISOString()
    }

    // Save all analysis data to Firebase
    await saveAnalysisToFirebase(analysisData).catch(err => 
      console.warn('Failed to save to Firebase:', err.message)
    )

    // Trigger webhook if High risk
    if (result.risk === 'High') {
      triggerN8nWebhook(analysisData).catch(err =>
        console.warn('Webhook trigger failed:', err.message)
      )
    }

    // Return API contract response
    res.json({
      status: result.status,
      risk: result.risk,
      urls: result.urls,
      warning: result.warning,
      emails: result.emails,
      keywords,
      suspiciousLinks: result.suspiciousUrls,
      confidence: result.confidence,
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

router.post('/analyze-file', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided'
      })
    }

    // For now, just analyze filename and basic checks
    const fileName = req.file.originalname
    const fileSize = req.file.size

    // Extract from filename
    const urls = extractUrls(fileName)
    const emails = extractEmails(fileName)

    // Risk assessment for files
    let fileRisk = 'Low'
    let status = 'Safe'
    let confidence = 90

    // Check suspicious patterns
    const suspiciousExtensions = ['.exe', '.bat', '.scr', '.vbs', '.js', '.jar']
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()

    if (suspiciousExtensions.includes(fileExtension)) {
      fileRisk = 'High'
      status = 'Suspicious'
      confidence = 95
    }

    // Check file size (>10MB might be suspicious)
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

    // Save to Firebase
    await saveAnalysisToFirebase({
      content: `File: ${fileName}`,
      status: result.status,
      risk: result.risk,
      confidence: result.confidence,
      warning: result.warning,
      fileSize: result.fileSize,
      timestamp: new Date().toISOString()
    }).catch(err => console.warn('Firebase save failed:', err.message))

    // Trigger webhook if High risk
    if (result.risk === 'High') {
      triggerN8nWebhook({
        content: `File: ${fileName}`,
        status: result.status,
        risk: result.risk,
        warning: result.warning
      }).catch(err => console.warn('Webhook failed:', err.message))
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

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

export default router
