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
      warnings: data.warning || ''
    }
  } catch (error) {
    console.error('Analysis error:', error)
    throw error
  }
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
        fileSize: data.fileSize
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
      history.push({ id: doc.id, ...doc.data() })
    })
    return history
  } catch (error) {
    console.error('History fetch error:', error)
    throw error
  }
}
