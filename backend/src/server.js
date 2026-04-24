import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initializeFirebase } from './services/firebase.js'
import analyzeRouter from './routes/analyze.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Initialize Firebase
console.log('🔥 Initializing Firebase...')
initializeFirebase()

// Routes
app.use('/api', analyzeRouter)
app.use('/', analyzeRouter)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PhishGuard AI Backend',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      analyze: 'POST /analyze or /api/analyze',
      analyzeFile: 'POST /api/analyze-file',
      health: 'GET /api/health'
    },
    documentation: 'See README.md for detailed API documentation'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🛡️  PhishGuard AI API Server        ║
╚═══════════════════════════════════════╝

✅ Server running on: http://localhost:${PORT}
📝 Environment: ${NODE_ENV}
🌐 CORS enabled for: ${FRONTEND_URL}

Endpoints:
  POST   /analyze               - Analyze message/link
  POST   /api/analyze           - Analyze message/link
  POST   /api/analyze-file      - Analyze uploaded file
  GET    /api/health            - Health check

Services:
  🤖 HuggingFace: ${process.env.HUGGINGFACE_API_KEY ? '✅ Enabled' : '⚠️ Disabled'}
  🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID ? '✅ Enabled' : '⚠️ Disabled'}
  🔗 n8n Webhook: ${process.env.N8N_WEBHOOK_URL ? '✅ Enabled' : '⚠️ Disabled'}

Ready to detect phishing! 🚀
  `)
})

export default app
