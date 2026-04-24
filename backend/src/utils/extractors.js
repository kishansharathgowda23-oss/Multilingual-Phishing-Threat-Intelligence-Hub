// Extract URLs from text
export const extractUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const matches = text.match(urlRegex) || []
  return [...new Set(matches)] // Remove duplicates
}

// Extract emails from text
export const extractEmails = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailRegex) || []
  return [...new Set(matches)] // Remove duplicates
}

// Extract keywords/hashtags
export const extractKeywords = (text) => {
  const keywords = text.match(/#\w+/g) || []
  return [...new Set(keywords)]
}

// Detect suspicious URLs
export const detectSuspiciousUrls = (urls) => {
  const suspiciousShorteners = [
    'bit.ly',
    'tinyurl.com',
    'short.link',
    'goo.gl',
    'ow.ly',
    'adf.ly',
    'u.to',
    'clck.ru',
    'lnk.co',
    't.co'
  ]

  const suspicious = urls.filter((url) => {
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.toLowerCase()
      const path = parsed.pathname.toLowerCase()

      const isShortener = suspiciousShorteners.some(domain => host === domain || host.endsWith(`.${domain}`))
      const hasPunycode = host.includes('xn--')
      const hasIpAddressHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
      const hasEncodedChars = /%[0-9a-f]{2}/i.test(url)
      const hasFakeAuth = url.includes('@')
      const hasSuspiciousTld = /\.(zip|mov|gq|tk|xyz|top)$/i.test(host)
      const hasLoginBait = /(login|verify|secure|update|wallet|bank|account)/i.test(path)

      return isShortener || hasPunycode || hasIpAddressHost || hasEncodedChars || hasFakeAuth || hasSuspiciousTld || hasLoginBait
    } catch (_error) {
      return true
    }
  })

  return [...new Set(suspicious)]
}

// Detect suspicious domains
export const detectSuspiciousDomains = (urls) => {
  const suspiciousDomains = [
    'bit.do',
    'short.link',
    'tinyurl.com',
    'bit.ly',
    'goo.gl',
    'ow.ly',
    'adf.ly',
    'u.to',
    'clck.ru'
  ]

  const suspicious = urls.filter(url => {
    return suspiciousDomains.some(domain => url.includes(domain))
  })

  return suspicious
}

// Check for common phishing patterns
export const detectPhishingPatterns = (text) => {
  const patterns = {
    urgency: /(urgent|immediately|quickly|act now|today only)/gi,
    verification: /(verify|confirm|validate|authenticate|re-enter)/gi,
    threat: /(account will be (closed|suspended|locked)|suspicious activity|unauthorized)/gi,
    financial: /(payment method|billing|credit card|bank|wire transfer)/gi
  }

  const found = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern) || []
    if (matches.length > 0) {
      found[key] = matches.length
    }
  }

  return found
}

// Generate warning message
export const generateWarningMessage = (analysis, extractedData) => {
  const warnings = []

  if (extractedData.suspiciousUrls && extractedData.suspiciousUrls.length > 0) {
    warnings.push(`Contains ${extractedData.suspiciousUrls.length} shortened/suspicious URL(s)`)
  }

  if (extractedData.phishingPatterns) {
    const patternCount = Object.values(extractedData.phishingPatterns).reduce((a, b) => a + b, 0)
    if (patternCount > 0) {
      warnings.push(`Detected ${patternCount} phishing indicators (urgency, verification requests, threats)`)
    }
  }

  if (extractedData.emails && extractedData.emails.length > 0) {
    warnings.push(`Contains ${extractedData.emails.length} email address(es)`)
  }

  if (analysis.isSpammy) {
    warnings.push('Matches spam/phishing characteristics')
  }

  return warnings.length > 0 
    ? warnings.join('. ') 
    : 'Content appears legitimate but review manually to be safe.'
}

// Format analysis result
export const formatAnalysisResult = (analysis, riskAssessment, extractedData) => {
  return {
    status: analysis.isSpammy ? 'Suspicious' : 'Safe',
    risk: riskAssessment.level,
    confidence: Math.round(analysis.confidence * 100),
    urls: extractedData.urls || [],
    emails: extractedData.emails || [],
    suspiciousUrls: extractedData.suspiciousUrls || [],
    warning: generateWarningMessage(analysis, extractedData),
    details: {
      phishingPatterns: extractedData.phishingPatterns || {},
      sentiment: analysis.sentiment
    }
  }
}
