import axios from 'axios'
import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const analyzeContent = async (content) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, { message: content })
    const data = response.data || {}
    return {
      content,
      status: data.status || 'Safe',
      risk: data.risk || 'Low',
      confidence: data.confidence || 0,
      details: data.warning || '',
      urls: data.urls || [],
      emails: data.emails || [],
      keywords: data.keywords || [],
      suspiciousUrls: data.suspiciousLinks || [],
      warnings: data.warning || '',
      mlAnalysis: data.mlAnalysis || null,
      timestamp: data.timestamp || new Date().toISOString()
    }
  } catch (error) {
    console.error('Analysis error:', error)
    throw error
  }
}

export const compareRealtimeContent = async (content) => {
  const response = await axios.post(`${API_BASE_URL}/api/realtime-compare`, { message: content })
  return response.data || {}
}

export const uploadAndAnalyzeFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axios.post(`${API_BASE_URL}/api/analyze-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (response.data.success && response.data.data) {
      const data = response.data.data
      return {
        content: data.fileName || file.name,
        status: data.status,
        risk: data.risk,
        confidence: data.confidence,
        details: data.warning,
        fileName: data.fileName,
        fileSize: data.fileSize,
        timestamp: response.data.timestamp || new Date().toISOString()
      }
    }
    return response.data.data
  } catch (error) {
    console.error('File analysis error:', error)
    throw error
  }
}

export const saveAnalysisToFirebase = async (analysisResult, userId = 'anonymous') => {
  if (!db) return null
  try {
    const analysisRef = collection(db, 'analyses')
    const docRef = await addDoc(analysisRef, {
      userId,
      content: analysisResult.content,
      status: analysisResult.status,
      risk: analysisResult.risk,
      confidence: analysisResult.confidence,
      details: analysisResult.details,
      mlAnalysis: analysisResult.mlAnalysis || null,
      timestamp: new Date(),
      createdAt: new Date().toISOString()
    })
    return docRef.id
  } catch (error) {
    console.error('Firebase save error:', error)
    throw error
  }
}

export const getAnalysisHistory = async (userId = 'anonymous', limitCount = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/history`, {
      params: { limit: limitCount }
    })
    if (Array.isArray(response.data?.history)) {
      return response.data.history.map((item) => ({
        ...item,
        mlAnalysis: item.mlAnalysis || item.mlPrediction || null
      }))
    }
  } catch (error) {
    console.warn('Backend history fetch failed, falling back to Firebase:', error.message)
  }

  if (!db) return []

  try {
    const analysisRef = collection(db, 'analyses')
    const q = query(
      analysisRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    const history = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      history.push({
        id: doc.id,
        ...data,
        mlAnalysis: data.mlAnalysis || data.mlPrediction || null
      })
    })
    return history
  } catch (error) {
    console.error('History fetch error:', error)
    throw error
  }
}

export const getDashboardOverview = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/dashboard/overview`)
  return response.data || {}
}
