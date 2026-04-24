import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';

/**
 * Frontend ML Service
 * Provides client-side ML inference for real-time analysis
 * Uses TensorFlow.js for browser-based ML models
 */

class FrontendMLService {
  constructor() {
    this.toxicityModel = null;
    this.modelLoaded = false;
    this.threshold = 0.9; // Confidence threshold for toxicity detection
  }

  /**
   * Initialize ML models
   * Load TensorFlow.js models on first use
   */
  async initialize() {
    try {
      if (this.modelLoaded) {
        return true;
      }

      console.log('Loading toxicity model...');
      
      // Load toxicity detection model
      this.toxicityModel = await toxicity.load(this.threshold);
      
      this.modelLoaded = true;
      console.log('✅ ML Models loaded successfully');
      return true;
    } catch (error) {
      console.error('Error initializing ML models:', error);
      this.modelLoaded = false;
      return false;
    }
  }

  /**
   * Detect toxicity in text using TensorFlow.js
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Toxicity detection results
   */
  async detectToxicity(text) {
    if (!text || text.trim().length === 0) {
      return {
        isToxic: false,
        confidence: 0,
        predictions: [],
      };
    }

    try {
      if (!this.modelLoaded) {
        await this.initialize();
      }

      if (!this.toxicityModel) {
        return this.fallbackToxicityDetection(text);
      }

      const predictions = await this.toxicityModel.classify([text]);

      // Extract results
      const results = {
        isToxic: false,
        confidence: 0,
        predictions: [],
      };

      predictions.forEach((prediction) => {
        results.predictions.push({
          label: prediction.label,
          score: prediction.results[0].match,
        });

        if (prediction.results[0].match) {
          results.isToxic = true;
          results.confidence = Math.max(results.confidence, prediction.results[0].match);
        }
      });

      return results;
    } catch (error) {
      console.error('Toxicity detection error:', error);
      return this.fallbackToxicityDetection(text);
    }
  }

  /**
   * Detect phishing patterns using heuristics
   * @param {string} text - Text to analyze
   * @returns {Object} - Phishing detection results
   */
  detectPhishingPatterns(text) {
    const phishingIndicators = {
      urgency: {
        keywords: ['urgent', 'immediately', 'now', 'asap', 'quickly'],
        weight: 0.15,
      },
      verification: {
        keywords: ['verify', 'confirm', 'validate', 'authenticate', 'authorize'],
        weight: 0.2,
      },
      personalInfo: {
        keywords: ['password', 'credit card', 'ssn', 'bank account', 'social security'],
        weight: 0.25,
      },
      suspiciousLinks: {
        patterns: [/bit\.ly|tinyurl|goo\.gl|short\.link/gi],
        weight: 0.2,
      },
      urgentAction: {
        keywords: ['update now', 'confirm identity', 're-enter', 'click here', 'act now'],
        weight: 0.2,
      },
    };

    let score = 0;
    const detectedPatterns = [];
    const lowerText = text.toLowerCase();

    // Check each indicator
    Object.entries(phishingIndicators).forEach(([indicator, data]) => {
      if (data.keywords) {
        data.keywords.forEach((keyword) => {
          if (lowerText.includes(keyword)) {
            score += data.weight;
            if (!detectedPatterns.includes(indicator)) {
              detectedPatterns.push(indicator);
            }
          }
        });
      }

      if (data.patterns) {
        data.patterns.forEach((pattern) => {
          if (pattern.test(text)) {
            score += data.weight;
            if (!detectedPatterns.includes(indicator)) {
              detectedPatterns.push(indicator);
            }
          }
        });
      }
    });

    return {
      isPhishing: score > 0.4,
      score: Math.min(score, 1),
      confidence: score,
      detectedPatterns,
    };
  }

  /**
   * Detect spam patterns
   * @param {string} text - Text to analyze
   * @returns {Object} - Spam detection results
   */
  detectSpam(text) {
    const spamIndicators = [
      'congratulations',
      'you won',
      'claim prize',
      'limited offer',
      'act now',
      'buy now',
      'free',
      'no credit card',
      'risk free',
      'guaranteed',
      'unsubscribe',
    ];

    let score = 0;
    const matchedIndicators = [];
    const lowerText = text.toLowerCase();

    // Check spam keywords
    spamIndicators.forEach((indicator) => {
      if (lowerText.includes(indicator)) {
        score += 0.08;
        matchedIndicators.push(indicator);
      }
    });

    // Check for excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    if (exclamationCount + questionCount > 3) {
      score += 0.1;
      matchedIndicators.push('excessive_punctuation');
    }

    // Check for excessive caps
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    if (capsCount / text.length > 0.3) {
      score += 0.1;
      matchedIndicators.push('excessive_caps');
    }

    return {
      isSpam: score > 0.3,
      score: Math.min(score, 1),
      confidence: score,
      matchedIndicators,
    };
  }

  /**
   * Extract and analyze URLs
   * @param {string} text - Text containing URLs
   * @returns {Object} - URL analysis results
   */
  analyzeUrls(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlPattern) || [];

    const suspicious = urls.filter((url) => {
      // Check for suspicious patterns
      const isSuspicious =
        /bit\.ly|tinyurl|goo\.gl|short\.link/i.test(url) ||
        /https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url) || // IP-based URLs
        !url.includes('.') || // No domain
        url.length > 100; // Suspiciously long

      return isSuspicious;
    });

    return {
      urls,
      suspiciousUrls: suspicious,
      suspiciousCount: suspicious.length,
      urlCount: urls.length,
    };
  }

  /**
   * Combined analysis using multiple techniques
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} - Combined analysis results
   */
  async analyzeText(text) {
    if (!text || text.trim().length === 0) {
      return {
        isRisky: false,
        riskLevel: 'Low',
        confidence: 0,
        analysis: {},
      };
    }

    try {
      const [toxicity, phishing, spam, urls] = await Promise.all([
        this.detectToxicity(text),
        Promise.resolve(this.detectPhishingPatterns(text)),
        Promise.resolve(this.detectSpam(text)),
        Promise.resolve(this.analyzeUrls(text)),
      ]);

      // Calculate overall risk
      const riskScore =
        (toxicity.confidence || 0) * 0.3 +
        (phishing.confidence || 0) * 0.35 +
        (spam.confidence || 0) * 0.25 +
        (urls.suspiciousCount > 0 ? 0.1 : 0) * 0.1;

      let riskLevel = 'Low';
      if (riskScore > 0.6) {
        riskLevel = 'High';
      } else if (riskScore > 0.3) {
        riskLevel = 'Medium';
      }

      return {
        isRisky: riskScore > 0.3,
        riskLevel,
        riskScore: Math.round(riskScore * 100),
        confidence: Math.round(riskScore * 100),
        analysis: {
          toxicity,
          phishing,
          spam,
          urls,
        },
      };
    } catch (error) {
      console.error('Error in text analysis:', error);
      return {
        isRisky: false,
        riskLevel: 'Unknown',
        confidence: 0,
        error: error.message,
      };
    }
  }

  /**
   * Fallback toxicity detection (no ML model)
   */
  fallbackToxicityDetection(text) {
    const toxicKeywords = [
      'hate',
      'kill',
      'die',
      'stupid',
      'idiot',
      'racist',
      'sexist',
    ];

    let score = 0;
    const predictions = [];
    const lowerText = text.toLowerCase();

    toxicKeywords.forEach((keyword) => {
      if (lowerText.includes(keyword)) {
        score += 0.15;
      }
    });

    return {
      isToxic: score > 0.3,
      confidence: Math.min(score, 1),
      predictions,
    };
  }

  /**
   * Check if models are loaded
   */
  isReady() {
    return this.modelLoaded;
  }

  /**
   * Clean up and unload models
   */
  dispose() {
    if (this.toxicityModel) {
      this.toxicityModel.dispose();
      this.toxicityModel = null;
    }
    this.modelLoaded = false;
  }
}

export default new FrontendMLService();
