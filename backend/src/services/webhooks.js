import axios from 'axios'
import { saveWebhookEvent } from './firebase.js'

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

export const triggerN8nWebhook = async (analysisData) => {
  if (!N8N_WEBHOOK_URL) {
    console.warn('⚠️ n8n webhook URL not configured')
    return false
  }

  try {
    const payload = {
      analysis: {
        content: analysisData.content,
        status: analysisData.status,
        risk: analysisData.risk,
        confidence: analysisData.confidence,
        urls: analysisData.urls,
        emails: analysisData.emails,
        warning: analysisData.warning,
        timestamp: new Date().toISOString()
      },
      alert: {
        severity: 'HIGH',
        type: 'PHISHING_DETECTED',
        message: `High-risk content detected: ${analysisData.warning}`,
        action: 'IMMEDIATE_REVIEW_REQUIRED'
      }
    }

    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('✅ n8n webhook triggered successfully')

    // Save webhook event to Firebase
    await saveWebhookEvent({
      type: 'HIGH_RISK_ALERT',
      payload,
      response: response.data,
      status: 'sent'
    })

    return true
  } catch (error) {
    console.error('❌ n8n webhook error:', error.message)
    
    // Still save the failed attempt
    await saveWebhookEvent({
      type: 'HIGH_RISK_ALERT',
      payload: analysisData,
      error: error.message,
      status: 'failed'
    })

    return false
  }
}

export const notifySlack = async (analysisData) => {
  // Optional: Send to Slack if webhook available
  const slackWebhook = process.env.SLACK_WEBHOOK_URL

  if (!slackWebhook) return false

  try {
    const message = {
      text: '🚨 High Risk Phishing Alert',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*High Risk Content Detected*\n*Risk Level:* ${analysisData.risk}\n*Status:* ${analysisData.status}\n*Confidence:* ${analysisData.confidence}%`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:* ${analysisData.content.substring(0, 100)}...`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*URLs Detected:* ${analysisData.urls.join(', ') || 'None'}`
          }
        }
      ]
    }

    await axios.post(slackWebhook, message, { timeout: 5000 })
    console.log('✅ Slack notification sent')
    return true
  } catch (error) {
    console.warn('⚠️ Slack notification failed:', error.message)
    return false
  }
}
