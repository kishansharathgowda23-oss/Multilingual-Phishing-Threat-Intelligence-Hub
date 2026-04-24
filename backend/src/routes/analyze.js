import express from 'express'
import axios from 'axios'
import multer from 'multer'
import csv from 'csv-parser'
import { Readable } from 'stream'
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
  triggerN8nWebhook,
  notifySlack
} from '../services/webhooks.js'
import FormData from 'form-data'
import {
  saveAnalysisToFirebase
} from '../services/firebase.js'
import mlModelsService from '../services/mlModels.js'
import {
  addAnalysisToHistory,
  getRecentHistory
} from '../services/historyStore.js'

const router = express.Router()
const upload = multer()


// ── Sector Configuration (Now served from backend) ──
const SECTORS = [
  { id: '1', name: 'Banking Pro', icon: '💳', category: 'FINANCE' },
  { id: '2', name: 'SMS & Messages', icon: '💬', category: 'COMMUNICATION' },
  { id: '3', name: 'Instagram', icon: '📸', category: 'SOCIAL MEDIA' },
  { id: '4', name: 'Facebook', icon: '👥', category: 'SOCIAL MEDIA' },
  { id: '5', name: 'WhatsApp', icon: '📞', category: 'SOCIAL' },
  { id: '6', name: 'Gmail', icon: '📧', category: 'COMMUNICATION' },
  { id: '7', name: 'Chrome Browser', icon: '🌐', category: 'UTILITY' },
  { id: '8', name: 'System Settings', icon: '⚙️', category: 'SYSTEM' },
]

router.get('/sectors', (req, res) => {
  res.json(SECTORS)
})

router.get('/history', async (req, res) => {
  try {
    const { userId, limit } = req.query
    // In a real app, use the userId to filter. For now, fetch all.
    // We'll use a dynamic import or the existing service
    const { getAnalysisHistory } = await import('../services/firebase.js')
    const history = await getAnalysisHistory(userId || 'anonymous', parseInt(limit) || 50)
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history', message: error.message })
  }
})

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
<    const result = formatAnalysisResult(analysis, riskAssessment, extractedData)

    // Call Python ML Service for additional verification
    let mlScores = [];
    try {
      const mlResponse = await axios.post('http://127.0.0.1:5002/predict', { message });
      if (mlResponse.data && mlResponse.data.mlScores) {
        mlScores = mlResponse.data.mlScores;
      }
    } catch (err) {
      console.warn('Python ML service not reachable or failed:', err.message);
    }

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
      mlScores: mlScores,
      timestamp: new Date().toISOString()
    }

    // Save to local history store and Firebase
    addAnalysisToHistory(analysisData)

    await saveAnalysisToFirebase(analysisData).catch((err) =>
      console.warn('Failed to save to Firebase:', err.message)
    )

    if (finalRisk === 'High') {
      triggerN8nWebhook(analysisData).catch((err) =>
        console.warn('Webhook trigger failed:', err.message)
      )
      notifySlack(analysisData).catch(err =>
        console.warn('Slack trigger failed:', err.message)
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
      mlScores: mlScores,
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

router.post('/analyze-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided'
      })
    }

    const fileName = req.file.originalname
    const fileSize = req.file.size
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    const suspiciousExtensions = ['.exe', '.bat', '.sh', '.apk', '.js', '.vbs', '.scr', '.com', '.pif', '.jar']

    const urls = extractUrls(fileName)
    const emails = extractEmails(fileName)

    let fileRisk = 'Low'
    let status = 'Safe'
    let confidence = 0

    // Check for images
    const isImage = fileExtension.match(/\.(jpg|jpeg|png|gif|webp)$/i)

    if (isImage) {
      // Respond to user immediately and scan in background
      res.json({
        success: true,
        data: {
          status: 'Scanning',
          risk: 'Pending',
          confidence: 0,
          fileName,
          fileSize,
          warning: 'Deep image scan running in background...'
        },
        timestamp: new Date().toISOString()
      })

      // Perform Python ML image scan in background
      try {
        const formData = new FormData()
        formData.append('file', req.file.buffer, {
          filename: fileName,
          contentType: req.file.mimetype
        })

        axios.post('http://127.0.0.1:5002/analyze-image', formData, {
          headers: formData.getHeaders(),
          timeout: 10000 
        }).then(async (response) => {
          const mlResult = response.data
          const finalData = {
            content: `Image: ${fileName}`,
            status: mlResult.status,
            risk: mlResult.risk,
            confidence: mlResult.confidence,
            warning: mlResult.summary,
            details: mlResult.details,
            fileSize,
            timestamp: new Date().toISOString()
          }

          addAnalysisToHistory(finalData)
          await saveAnalysisToFirebase(finalData).catch(err => 
            console.warn('Firebase save failed for image:', err.message)
          )

          if (mlResult.risk === 'High') {
            finalData.urls = []
            notifySlack(finalData).catch(err => 
              console.warn('Slack image alert failed:', err.message)
            )
          }
        }).catch(err => console.error('Background image scan failed:', err.message))
        
        return 
      } catch (err) {
        console.error('Failed to initiate background image scan:', err)
      }
    }

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
      const alertData = {
        content: `File: ${fileName}`,
        status: result.status,
        risk: result.risk,
        warning: result.warning,
        urls: [],
        confidence: result.confidence
      }
      triggerN8nWebhook(alertData).catch(err => console.warn('Webhook failed:', err.message))
      notifySlack(alertData).catch(err => console.warn('Slack failed:', err.message))
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

// ─── Payment Link & QR Code Protection ────────────────────────

router.post('/payment/auto-scan', async (req, res) => {
  try {
    const { url, context } = req.body
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Payment URL is required.' })
    }

    const mlResponse = await axios.post('http://127.0.0.1:5002/payment/auto-scan', {
      url,
      context: context || ''
    }, { timeout: 5000 })

    const result = mlResponse.data
    if (result.action === 'BLOCK') {
      const alertData = {
        content: `⚠️ Payment Fraud Blocked: ${url}`,
        status: 'Blocked',
        risk: 'High',
        confidence: result.risk_score,
        warning: result.summary,
        urls: [url]
      }
      notifySlack(alertData).catch(err => console.warn('Slack payment alert failed:', err.message))

      const scanData = {
        content: `Payment: ${url}`,
        status: 'Blocked',
        risk: 'High',
        confidence: result.risk_score,
        warning: result.summary,
        payment_type: result.payment_type,
        timestamp: new Date().toISOString()
      }
      addAnalysisToHistory(scanData)
      await saveAnalysisToFirebase(scanData).catch(err => console.warn('Firebase save failed:', err.message))
    }
    res.json(result)
  } catch (error) {
    console.error('Payment auto-scan error:', error.message)
    res.status(503).json({ error: 'Security Analysis Service Unavailable' })
  }
})

router.post('/payment/deep-scan', async (req, res) => {
  try {
    const { url, context } = req.body
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Payment URL is required.' })
    }

    const mlResponse = await axios.post('http://127.0.0.1:5002/payment/deep-scan', {
      url,
      context: context || ''
    }, { timeout: 10000 })

    const result = mlResponse.data
    if (result.action === 'BLOCK' || result.action === 'AUTH_REQUIRED') {
      const scanData = {
        content: `Payment: ${url}`,
        status: result.verdict,
        risk: result.risk_level,
        confidence: result.risk_score,
        warning: result.summary,
        payment_type: result.payment_type,
        mlScores: result.ml_scores,
        timestamp: new Date().toISOString()
      }
      addAnalysisToHistory(scanData)
      await saveAnalysisToFirebase(scanData).catch(err => console.warn('Firebase save failed:', err.message))
    }
    res.json(result)
  } catch (error) {
    console.error('Payment deep-scan error:', error.message)
    res.status(500).json({ error: 'Deep scan failed', message: error.message })
  }
})

router.post('/payment/verify-auth', async (req, res) => {
  try {
    const { link_hash, auth_token, user_confirmed } = req.body
    if (!link_hash) return res.status(400).json({ error: 'link_hash is required.' })

    const mlResponse = await axios.post('http://127.0.0.1:5002/payment/verify-auth', {
      link_hash,
      auth_token: auth_token || '',
      user_confirmed: user_confirmed || false
    }, { timeout: 5000 })
    res.json(mlResponse.data)
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Auth verification failed' })
  }
})

router.post('/upload-threats-csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No CSV file provided' })

  const results = []
  const stream = Readable.from(req.file.buffer)
  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        let count = 0
        for (const row of results) {
          const analysisData = {
            content: row.content || row.message || 'Unknown Content',
            status: row.status || (row.label === '1' ? 'Suspicious' : 'Safe'),
            risk: row.risk || (row.label === '1' ? 'High' : 'Low'),
            confidence: parseFloat(row.confidence) || 90,
            timestamp: new Date().toISOString(),
            details: row.details || 'Imported via CSV'
          }
          await saveAnalysisToFirebase(analysisData)
          count++
        }
        res.json({ message: `Successfully imported ${count} threats from CSV.`, count })
      } catch (err) {
        res.status(500).json({ error: 'Failed to save CSV data' })
      }
    })
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
