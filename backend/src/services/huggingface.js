import axios from 'axios'

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY

// Lightweight, production-ready text classification models
const SPAM_MODEL = 'mrm8488/bert-tiny-finetuned-sms-spam-detection'
const PHISHING_MODEL = 'ealvaradob/bert-finetuned-phishing'

const callHuggingFaceModel = async (model, text) => {
  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    { inputs: text },
    {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    }
  )

  const raw = Array.isArray(response.data) ? response.data[0] : []
  return Array.isArray(raw) ? raw : []
}

const getMaxScoreForLabels = (scores, labels) => {
  const normalizedLabels = labels.map(label => label.toLowerCase())
  return scores.reduce((maxScore, scoreItem) => {
    const label = `${scoreItem.label || ''}`.toLowerCase()
    if (normalizedLabels.some(candidate => label.includes(candidate))) {
      return Math.max(maxScore, scoreItem.score || 0)
    }
    return maxScore
  }, 0)
}

export const analyzeWithHuggingFace = async (text) => {
  if (!HUGGINGFACE_API_KEY) {
    console.warn('HuggingFace API key not set, using fallback analysis.')
    return performFallbackAnalysis(text)
  }

  try {
    const [spamScores, phishingScores] = await Promise.all([
      callHuggingFaceModel(SPAM_MODEL, text),
      callHuggingFaceModel(PHISHING_MODEL, text)
    ])

    const spamScore = getMaxScoreForLabels(spamScores, ['spam', 'label_1', 'phishing'])
    const phishingScore = getMaxScoreForLabels(phishingScores, ['phish', 'phishing', 'fraud', 'label_1'])
    const confidence = Math.max(spamScore, phishingScore)
    const isSpammy = confidence >= 0.55

    return {
      isSpammy,
      confidence,
      sentiment: isSpammy ? 'negative' : 'positive',
      scores: {
        spamScore,
        phishingScore
      }
    }
  } catch (error) {
    console.warn('HuggingFace API error, using fallback analysis:', error.message)
    return performFallbackAnalysis(text)
  }
}

// Fallback analysis using heuristics
export const performFallbackAnalysis = (text) => {
  const lowerText = text.toLowerCase()

  // Phishing keywords
  const phishingKeywords = [
    'verify account',
    'confirm identity',
    'update payment',
    'urgent action',
    'click here immediately',
    'suspicious activity',
    'confirm password',
    'reset password',
    'validate',
    'authenticate',
    're-enter',
    'act now',
    'limited time',
    'account will be closed'
  ]

  // Spam keywords
  const spamKeywords = [
    'free money',
    'you won',
    'congratulations',
    'claim prize',
    'limited offer',
    'buy now',
    'click here',
    'don\'t miss',
    'exclusive',
    'urgent',
    'act fast',
    'risk free'
  ]

  const phishingCount = phishingKeywords.filter(k => lowerText.includes(k)).length
  const spamCount = spamKeywords.filter(k => lowerText.includes(k)).length

  const totalMatches = phishingCount + spamCount
  const isSpammy = totalMatches > 0

  return {
    isSpammy,
    confidence: Math.min(0.95, (totalMatches * 0.3)),
    sentiment: isSpammy ? 'negative' : 'positive',
    phishingMatches: phishingCount,
    spamMatches: spamCount
  }
}

export const assessRiskLevel = (analysis, extractedData) => {
  let riskScore = 0

  // Hugging Face analysis score
  riskScore += analysis.confidence * 50

  // Suspicious URLs
  if (extractedData.suspiciousUrls && extractedData.suspiciousUrls.length > 0) {
    riskScore += extractedData.suspiciousUrls.length * 25
  }

  // Multiple URLs (could be spam)
  if (extractedData.urls && extractedData.urls.length > 3) {
    riskScore += 15
  }

  // Multiple emails
  if (extractedData.emails && extractedData.emails.length > 2) {
    riskScore += 10
  }

  const phishingPatternCount = Object.values(extractedData.phishingPatterns || {}).reduce((sum, value) => {
    return sum + value
  }, 0)

  if (phishingPatternCount > 0) {
    riskScore += Math.min(25, phishingPatternCount * 5)
  }

  // Normalize to 0-100
  riskScore = Math.min(100, riskScore)

  if (riskScore >= 65) return { level: 'High', score: riskScore }
  if (riskScore >= 35) return { level: 'Medium', score: riskScore }
  return { level: 'Low', score: riskScore }
}
