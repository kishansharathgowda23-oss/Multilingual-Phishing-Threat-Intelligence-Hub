import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let db = null

export const initializeFirebase = () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_KEY_PATH || path.join(__dirname, '../../firebase-key.json')
    
    // Check if using environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_KEY_ID || 'key-id',
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || 'client-id',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/'
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('✅ Firebase initialized with environment variables')
    } else if (fs.existsSync(serviceAccountPath)) {
      // Use JSON file if available
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log('✅ Firebase initialized with service account file')
    } else {
      console.warn('⚠️ Firebase service account not configured. Analysis will work but data won\'t be saved.')
      return
    }

    db = admin.firestore()
  } catch (error) {
    console.warn('⚠️ Firebase initialization error (non-critical):', error.message)
  }
}

export const saveAnalysisToFirebase = async (analysisData) => {
  if (!db) {
    console.warn('Firebase not initialized, skipping save')
    return null
  }

  try {
    const docRef = await db.collection('analyses').add({
      ...analysisData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      timestamp: new Date().toISOString()
    })
    console.log('✅ Analysis saved to Firebase:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('❌ Firebase save error:', error)
    throw error
  }
}

export const getAnalysisHistory = async (limit = 20) => {
  if (!db) {
    console.warn('Firebase not initialized')
    return []
  }

  try {
    const snapshot = await db.collection('analyses')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const docs = []
    snapshot.forEach(doc => {
      docs.push({
        id: doc.id,
        ...doc.data()
      })
    })
    return docs
  } catch (error) {
    console.error('❌ Firebase query error:', error)
    return []
  }
}

export const saveWebhookEvent = async (webhookData) => {
  if (!db) return null

  try {
    const docRef = await db.collection('webhook_events').add({
      ...webhookData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('❌ Webhook save error:', error)
    return null
  }
}
