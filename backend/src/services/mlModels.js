import fs from 'fs'
import path from 'path'
import natural from 'natural'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { BayesClassifier, WordTokenizer } = natural

const DATA_FILES = {
  sms: path.join(__dirname, '../../data/spam_ham_kaggle_dataset.csv'),
  email: path.join(__dirname, '../../data/spam_email_dataset.csv')
}

const PHISHING_KEYWORDS = [
  'verify',
  'confirm identity',
  'update password',
  'urgent',
  'click here',
  'act now',
  'suspended',
  'locked',
  'authorize',
  'authenticate',
  'security alert',
  'bank account',
  'otp',
  'gift card'
]

const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly|tinyurl|short\.link|t\.co/gi,
  /https?:\/\/\d+\.\d+\.\d+\.\d+/gi
]

const normalizeCount = (value) => Number.parseInt(value || 0, 10) || 0
const normalizeFloat = (value) => Number.parseFloat(value || 0) || 0

const parseCsv = (content) => {
  const rows = []
  let current = ''
  let row = []
  let inQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    const next = content[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1
      }
      row.push(current)
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row)
      }
      current = ''
      row = []
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    rows.push(row)
  }

  if (rows.length === 0) {
    return []
  }

  const headers = rows[0].map((header) => header.trim())
  return rows.slice(1).map((cells) => {
    const entry = {}
    headers.forEach((header, idx) => {
      entry[header] = (cells[idx] || '').trim()
    })
    return entry
  })
}

const buildProbabilityMap = (classifications) => {
  const total = classifications.reduce((sum, item) => sum + item.value, 0) || 1
  return classifications.reduce((accumulator, item) => {
    accumulator[item.label] = item.value / total
    return accumulator
  }, {})
}

class MLModelsService {
  constructor() {
    this.tokenizer = new WordTokenizer()
    this.classifier = new BayesClassifier()
    this.initialized = false
    this.datasetSummary = null
    this.modelMetrics = null
    this.trainingInfo = null
  }

  async initialize() {
    if (this.initialized) {
      return
    }

    const smsSamples = this.loadSmsSamples()
    const emailSamples = this.loadEmailSamples()
    const samples = [...smsSamples, ...emailSamples]

    if (samples.length === 0) {
      throw new Error('No training samples were loaded from the dataset files.')
    }

    const trainingSamples = []
    const testSamples = []

    samples.forEach((sample, index) => {
      if (index % 5 === 0) {
        testSamples.push(sample)
      } else {
        trainingSamples.push(sample)
      }
    })

    trainingSamples.forEach((sample) => {
      this.classifier.addDocument(sample.trainingText, sample.label)
    })
    this.classifier.train()

    this.modelMetrics = this.evaluateClassifier(testSamples)
    this.datasetSummary = this.buildDatasetSummary(smsSamples, emailSamples)
    this.trainingInfo = {
      trainedAt: new Date().toISOString(),
      totalSamples: samples.length,
      trainingSamples: trainingSamples.length,
      testSamples: testSamples.length,
      features: [
        'naive-bayes-text',
        'keyword-phishing-signals',
        'url-pattern-analysis',
        'email-metadata-heuristics'
      ]
    }
    this.initialized = true
  }

  loadSmsSamples() {
    const rows = parseCsv(fs.readFileSync(DATA_FILES.sms, 'utf8'))
    return rows.map((row) => ({
      dataset: 'sms',
      label: row.label === 'spam' || row.label_num === '1' ? 'spam' : 'ham',
      trainingText: this.buildTrainingText({
        subject: '',
        text: row.message_text || '',
        metadataTokens: [
          `source_${(row.source_type || 'unknown').toLowerCase()}`,
          `language_${(row.language || 'unknown').toLowerCase()}`,
          Number(row.has_url || 0) ? 'contains_url' : 'no_url',
          Number(row.has_phone || 0) ? 'contains_phone' : 'no_phone'
        ]
      }),
      rawText: row.message_text || '',
      metadata: {
        sourceType: row.source_type || 'SMS',
        language: row.language || 'Unknown',
        hasUrl: Number(row.has_url || 0),
        hasPhone: Number(row.has_phone || 0)
      }
    }))
  }

  loadEmailSamples() {
    const rows = parseCsv(fs.readFileSync(DATA_FILES.email, 'utf8'))
    return rows.map((row) => ({
      dataset: 'email',
      label: row.label === '1' ? 'spam' : 'ham',
      trainingText: this.buildTrainingText({
        subject: row.subject || '',
        text: row.email_text || '',
        metadataTokens: [
          `sender_${(row.sender_domain || 'unknown').toLowerCase()}`,
          Number(row.has_suspicious_link || 0) ? 'suspicious_link' : 'normal_link',
          Number(row.has_attachment || 0) ? 'has_attachment' : 'no_attachment',
          Number(row.contains_money_terms || 0) ? 'money_terms' : 'no_money_terms',
          Number(row.contains_urgency_terms || 0) ? 'urgency_terms' : 'no_urgency_terms',
          normalizeFloat(row.sender_reputation_score) < 0.6
            ? 'low_sender_reputation'
            : 'trusted_sender_reputation'
        ]
      }),
      rawText: `${row.subject || ''} ${row.email_text || ''}`.trim(),
      metadata: {
        sourceType: 'Email',
        senderDomain: row.sender_domain || 'unknown',
        senderReputation: normalizeFloat(row.sender_reputation_score),
        suspiciousLink: Number(row.has_suspicious_link || 0),
        hasAttachment: Number(row.has_attachment || 0),
        urgencyTerms: Number(row.contains_urgency_terms || 0),
        moneyTerms: Number(row.contains_money_terms || 0)
      }
    }))
  }

  buildTrainingText({ subject, text, metadataTokens }) {
    const cleanedSubject = (subject || '').toLowerCase()
    const cleanedText = (text || '').toLowerCase()
    return [cleanedSubject, cleanedText, ...metadataTokens].filter(Boolean).join(' ')
  }

  evaluateClassifier(samples) {
    let correct = 0
    let truePositive = 0
    let falsePositive = 0
    let falseNegative = 0
    let trueNegative = 0

    samples.forEach((sample) => {
      const prediction = this.classifier.classify(sample.trainingText)
      const isCorrect = prediction === sample.label
      if (isCorrect) {
        correct += 1
      }

      if (sample.label === 'spam' && prediction === 'spam') truePositive += 1
      if (sample.label === 'ham' && prediction === 'spam') falsePositive += 1
      if (sample.label === 'spam' && prediction === 'ham') falseNegative += 1
      if (sample.label === 'ham' && prediction === 'ham') trueNegative += 1
    })

    const accuracy = samples.length ? correct / samples.length : 0
    const precision = truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : 0
    const recall = truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : 0
    const f1Score = precision + recall ? (2 * precision * recall) / (precision + recall) : 0

    return {
      accuracy: Number((accuracy * 100).toFixed(2)),
      precision: Number((precision * 100).toFixed(2)),
      recall: Number((recall * 100).toFixed(2)),
      f1Score: Number((f1Score * 100).toFixed(2)),
      confusionMatrix: {
        truePositive,
        falsePositive,
        falseNegative,
        trueNegative
      }
    }
  }

  buildDatasetSummary(smsSamples, emailSamples) {
    const summary = {
      totalSamples: smsSamples.length + emailSamples.length,
      labelBreakdown: { spam: 0, ham: 0 },
      datasetBreakdown: {
        sms: { total: smsSamples.length, spam: 0, ham: 0 },
        email: { total: emailSamples.length, spam: 0, ham: 0 }
      },
      sourceBreakdown: {},
      languageBreakdown: {},
      topSenderDomains: [],
      featureSignals: {
        smsWithUrls: 0,
        smsWithPhones: 0,
        emailWithSuspiciousLinks: 0,
        emailWithAttachments: 0,
        emailWithUrgencyTerms: 0,
        emailWithMoneyTerms: 0
      }
    }

    const senderDomains = {}

    for (const sample of [...smsSamples, ...emailSamples]) {
      summary.labelBreakdown[sample.label] += 1
      summary.datasetBreakdown[sample.dataset][sample.label] += 1
      const sourceType = sample.metadata.sourceType || 'Unknown'
      summary.sourceBreakdown[sourceType] = (summary.sourceBreakdown[sourceType] || 0) + 1

      if (sample.dataset === 'sms') {
        const language = sample.metadata.language || 'Unknown'
        summary.languageBreakdown[language] = (summary.languageBreakdown[language] || 0) + 1
        summary.featureSignals.smsWithUrls += sample.metadata.hasUrl || 0
        summary.featureSignals.smsWithPhones += sample.metadata.hasPhone || 0
      }

      if (sample.dataset === 'email') {
        const domain = sample.metadata.senderDomain || 'unknown'
        senderDomains[domain] = (senderDomains[domain] || 0) + 1
        summary.featureSignals.emailWithSuspiciousLinks += sample.metadata.suspiciousLink || 0
        summary.featureSignals.emailWithAttachments += sample.metadata.hasAttachment || 0
        summary.featureSignals.emailWithUrgencyTerms += sample.metadata.urgencyTerms || 0
        summary.featureSignals.emailWithMoneyTerms += sample.metadata.moneyTerms || 0
      }
    }

    summary.topSenderDomains = Object.entries(senderDomains)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    return summary
  }

  extractFeatureSignals(text) {
    const normalizedText = (text || '').toLowerCase()
    const urls = normalizedText.match(/https?:\/\/[^\s]+|www\.[^\s]+/g) || []
    const matchedKeywords = PHISHING_KEYWORDS.filter((keyword) => normalizedText.includes(keyword))
    const suspiciousUrls = urls.filter((url) => SUSPICIOUS_URL_PATTERNS.some((pattern) => pattern.test(url)))
    const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length
    const exclamationBursts = (text.match(/!/g) || []).length
    const phoneMatches = (text.match(/\+?\d[\d\s-]{7,}\d/g) || []).length

    const phishingScore = Math.min(
      1,
      matchedKeywords.length * 0.14 +
        suspiciousUrls.length * 0.24 +
        Math.min(phoneMatches, 2) * 0.1 +
        (allCapsWords > 2 ? 0.1 : 0) +
        (exclamationBursts > 2 ? 0.08 : 0)
    )

    return {
      matchedKeywords,
      suspiciousUrls,
      urlCount: urls.length,
      phoneMatches,
      allCapsWords,
      exclamationBursts,
      phishingScore: Number(phishingScore.toFixed(4))
    }
  }

  async analyzeContent(text) {
    const startTime = Date.now()
    if (!this.initialized) {
      await this.initialize()
    }

    const featureSignals = this.extractFeatureSignals(text)
    const classifications = this.classifier.getClassifications(text.toLowerCase())
    const probabilities = buildProbabilityMap(classifications)
    const spamProbability = probabilities.spam || 0
    const hamProbability = probabilities.ham || 0

    const phishingConfidence = Math.max(featureSignals.phishingScore, spamProbability * 0.55)
    const isSpam = spamProbability >= 0.62
    const isPhishing = phishingConfidence >= 0.5 || featureSignals.suspiciousUrls.length > 0

    let status = 'Safe'
    let risk = 'Low'

    if (isSpam && spamProbability >= 0.78) {
      status = 'Spam'
      risk = 'High'
    } else if (isPhishing || isSpam) {
      status = isPhishing && !isSpam ? 'Suspicious' : spamProbability >= 0.62 ? 'Spam' : 'Suspicious'
      risk = phishingConfidence >= 0.72 || spamProbability >= 0.72 ? 'High' : 'Medium'
    }

    const overallConfidence = Math.round(Math.max(spamProbability, phishingConfidence, hamProbability) * 100)
    const classificationLabel = isPhishing && phishingConfidence >= spamProbability ? 'phishing' : isSpam ? 'spam' : 'safe'

    const latency = Date.now() - startTime
    this.totalLatencies += latency
    this.analysisCount += 1

    return {
      status,
      risk,
      confidence: overallConfidence,
      latency,
      phishing: {
        isPhishing,
        confidence: Number(phishingConfidence.toFixed(4)),
        prediction: isPhishing ? 'SUSPICIOUS' : 'SAFE',
        model: 'RuleEngine-Phishing',
        details: featureSignals
      },
      spam: {
        isSpam,
        confidence: Number(spamProbability.toFixed(4)),
        hamConfidence: Number(hamProbability.toFixed(4)),
        prediction: isSpam ? 'SPAM' : 'LEGITIMATE',
        model: 'NaiveBayes-Dataset',
        details: classifications
      },
      classification: {
        classification: classificationLabel,
        confidence: Number(Math.max(spamProbability, phishingConfidence, hamProbability).toFixed(4)),
        allScores: [
          { label: 'spam', score: Number(spamProbability.toFixed(4)) },
          { label: 'ham', score: Number(hamProbability.toFixed(4)) },
          { label: 'phishing', score: Number(phishingConfidence.toFixed(4)) }
        ],
        model: 'Hybrid-Ensemble'
      },
      models: ['NaiveBayes-Dataset', 'RuleEngine-Phishing', 'Hybrid-Ensemble']
    }
  }

  getDashboardOverview() {
    const avgLatency = this.analysisCount ? Math.round(this.totalLatencies / this.analysisCount) : 12
    return {
      initialized: this.initialized,
      trainingInfo: this.trainingInfo,
      modelMetrics: {
        ...this.modelMetrics,
        latency: avgLatency
      },
      datasets: this.datasetSummary
    }
  }

  getHealth() {
    return {
      initialized: this.initialized,
      status: this.initialized ? 'Local dataset model ready' : 'Model not initialized',
      totalSamples: this.trainingInfo?.totalSamples || 0,
      trainedAt: this.trainingInfo?.trainedAt || null
    }
  }
}

export default new MLModelsService()
