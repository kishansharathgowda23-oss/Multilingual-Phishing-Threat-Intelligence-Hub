# PhishGuard AI - Complete Setup Guide

## 📋 Project Structure

```
SpamDetection/
├── src/                          (React Frontend)
│   ├── components/
│   │   ├── InputSection.jsx
│   │   ├── ResultCard.jsx
│   │   ├── FileUploadSection.jsx
│   │   ├── HistoryDashboard.jsx
│   │   └── WarningModal.jsx
│   ├── services/
│   │   ├── api.js               (Backend API calls)
│   │   └── firebase.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── backend/                      (Node.js/Express Backend)
│   ├── src/
│   │   ├── server.js            (Main server)
│   │   ├── routes/
│   │   │   └── analyze.js       (API endpoints)
│   │   ├── services/
│   │   │   ├── firebase.js      (Firestore integration)
│   │   │   ├── huggingface.js   (AI analysis)
│   │   │   └── webhooks.js      (n8n/Slack webhooks)
│   │   └── utils/
│   │       └── extractors.js    (URL/Email extraction)
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── package.json                  (Frontend dependencies)
├── vite.config.js
├── tailwind.config.js
├── index.html
├── QUICKSTART.md
└── README.md
```

## 🚀 Quick Start (5 Minutes)

### 1. Frontend Setup
```bash
# Already done! Dependencies installed
npm run dev
```
Opens at `http://localhost:3000`

### 2. Backend Setup
```bash
# Install backend dependencies
cd backend
npm install

# Copy env template
cp .env.example .env

# Start backend
npm run dev
```
Runs at `http://localhost:5000`

### 3. Optional: Configure Services
- **Firebase**: Add credentials to `backend/.env`
- **HuggingFace**: Add API key to `backend/.env`
- **n8n**: Add webhook URL to `backend/.env`

## 📚 Detailed Setup

### Backend Installation

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This installs:
   - `express` - Web framework
   - `cors` - Cross-origin requests
   - `axios` - HTTP client
   - `firebase-admin` - Firebase integration
   - `@huggingface/inference` - AI models
   - `dotenv` - Environment variables
   - `nodemon` - Auto-reload (dev)

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

### Configuration

#### Minimal Setup (Backend works without external services)
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```
✅ Backend runs, uses local analysis

#### With HuggingFace AI
1. Get API key from https://huggingface.co/settings/tokens
2. Add to `.env`:
   ```ini
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
   ```
✅ AI-powered phishing detection enabled

#### With Firebase Storage
1. Create Firebase project: https://console.firebase.google.com
2. Create service account:
   - Project Settings → Service Accounts
   - Generate New Private Key
   - Download JSON file
3. Option A: Save as `firebase-key.json` in backend root
4. Option B: Add to `.env`:
   ```ini
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project_id.iam.gserviceaccount.com
   ```
✅ All analyses saved to Firestore

#### With n8n High-Risk Alerts
1. Open your n8n instance
2. Create webhook trigger endpoint
3. Add to `.env`:
   ```ini
   N8N_WEBHOOK_URL=https://your-n8n.com/webhook/your-webhook-id
   ```
✅ High-risk alerts trigger n8n automation

## 🔄 Frontend-Backend Communication

### API Flow

```
Frontend (React)
    ↓
InputSection.jsx
    ↓ (User enters message)
onAnalyze()
    ↓
axios.post('/api/analyze')
    ↓
Backend (Express)
    ↓
/api/analyze route
    ↓
1. Extract URLs, emails, keywords
2. Analyze with HuggingFace
3. Assess risk level
4. Save to Firebase
5. If High: Trigger n8n webhook
    ↓
Response with:
- status: Safe/Suspicious/Spam
- risk: Low/Medium/High
- confidence: 0-100%
- urls: [...detected URLs]
- emails: [...detected emails]
- warning: detailed message
    ↓
ResultCard.jsx displays results
```

### Request/Response Examples

#### POST /api/analyze

**Request:**
```json
{
  "message": "Click here to verify your account: bit.ly/verify123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Suspicious",
    "risk": "High",
    "confidence": 85,
    "urls": ["bit.ly/verify123"],
    "emails": [],
    "suspiciousUrls": ["bit.ly/verify123"],
    "warning": "Contains shortened/suspicious URL(s). Detected phishing indicators (urgency, verification requests).",
    "details": {
      "phishingPatterns": {
        "verification": 1
      }
    }
  }
}
```

## 🔧 Running Both Services

### Terminal 1 - Frontend
```bash
npm run dev
# Frontend at http://localhost:3000
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
# Backend at http://localhost:5000
```

### Test Connection
```bash
curl http://localhost:5000/api/health
# Should return:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

## 📊 Data Flow

### When User Analyzes a Message

1. **Frontend** sends message to backend
2. **Backend extracts**:
   - URLs (detects shortened ones)
   - Email addresses
   - Phishing patterns
3. **Backend analyzes** with HuggingFace model
4. **Backend assesses** risk level
5. **Backend saves** to Firebase (if configured)
6. **Backend triggers** n8n webhook (if High risk)
7. **Backend returns** analysis result
8. **Frontend displays** results and warning modal (if suspicious)

### When User Clicks Suspicious Link

1. **WarningModal** appears
2. User must confirm understanding of risks
3. If confirmed, opens link in new tab

## 🎯 Feature Examples

### Safe Message
```
Input: "Hello, how are you doing today?"

Response:
- Status: Safe
- Risk: Low
- Confidence: 95%
- URLs: None
- Warning: Content appears legitimate
```

### Phishing Message
```
Input: "URGENT: Your account has suspicious activity. Click here to verify: bit.ly/xyz"

Response:
- Status: Suspicious
- Risk: High
- Confidence: 92%
- URLs: ["bit.ly/xyz"]
- Suspicious URLs: ["bit.ly/xyz"]
- Warning: "Contains shortened URL. Detected phishing indicators (urgency, verification)."
- Action: n8n webhook triggered
```

### Spam Message
```
Input: "FREE MONEY! You won $1000000! Click here now: http://freeprize.xyz"

Response:
- Status: Spam
- Risk: Medium
- Confidence: 88%
- URLs: ["http://freeprize.xyz"]
- Warning: "Detected spam characteristics"
```

## 📁 Firebase Collections

### analyses
```
Document ID: auto-generated
{
  userId: "anonymous",
  content: "User message (truncated to 500 chars)",
  status: "Suspicious",
  risk: "High",
  confidence: 85,
  urls: ["bit.ly/verify123"],
  emails: ["user@example.com"],
  suspiciousUrls: ["bit.ly/verify123"],
  warning: "Detailed warning message",
  riskScore: 75,
  timestamp: "2026-04-24T10:30:00.000Z",
  createdAt: server_timestamp
}
```

### webhook_events
```
Document ID: auto-generated
{
  type: "HIGH_RISK_ALERT",
  payload: {...analysis data...},
  status: "sent",
  createdAt: server_timestamp
}
```

## 🔐 Security Best Practices

### Frontend
- ✅ Never store sensitive data in localStorage
- ✅ Validate user input before sending
- ✅ Use HTTPS in production
- ✅ Enable Firebase security rules

### Backend
- ✅ Validate all inputs
- ✅ Use environment variables for secrets
- ✅ Enable CORS for frontend URL only
- ✅ Implement rate limiting (future)
- ✅ Log all high-risk detections
- ✅ Use HTTPS in production

### Firebase
- ✅ Set up proper Firestore rules
- ✅ Use service account for server access
- ✅ Restrict client-side database access
- ✅ Enable audit logs

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Heroku/Railway/Render)
```bash
cd backend
npm install
npm start
```

**Update Frontend API URL:**
In `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api'
```

## 📱 Mobile Testing

**Desktop:**
- Open http://localhost:3000
- Use browser DevTools responsive design

**Mobile Device (same network):**
1. Get your computer IP: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
2. Visit: `http://YOUR_IP:3000` on phone
3. Ensure backend accessible at: `http://YOUR_IP:5000`

## 🐛 Troubleshooting

### Frontend can't reach backend
- Check backend is running: `curl http://localhost:5000`
- Check API URL in `src/services/api.js`
- Check CORS in backend `.env`

### HuggingFace API fails
- Verify API key in `.env`
- Check rate limits (free tier limited)
- Backend falls back to local analysis automatically

### Firebase not saving
- Check credentials in `.env` or `firebase-key.json`
- Verify Firestore is enabled
- Check database rules allow writes

### n8n webhook not triggering
- Verify webhook URL in `.env`
- Check n8n workflow is active
- Test with: `curl -X POST https://your-webhook-url -H "Content-Type: application/json" -d '{"test": true}'`

## 📈 Performance Tips

- Frontend: ~2-3MB bundle (optimized)
- Backend: Lightweight, ~50MB node_modules
- Analysis: <1 second for most messages
- Firebase: Async saves don't block response
- Webhooks: Non-blocking triggers

## 🎓 Learning Resources

### Frontend
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Firebase Web: https://firebase.google.com/docs/web

### Backend
- Express: https://expressjs.com
- HuggingFace: https://huggingface.co/docs/api-inference
- Firebase Admin: https://firebase.google.com/docs/database/admin/start

### Integrations
- n8n: https://docs.n8n.io
- Webhooks: https://en.wikipedia.org/wiki/Webhook

## ✨ Next Steps

1. ✅ Frontend ready
2. ✅ Backend ready
3. 📋 Configure optional services (Firebase, HuggingFace, n8n)
4. 🧪 Test locally
5. 🚀 Deploy to production
6. 📊 Monitor and improve

## 📞 Support

**Frontend Issues**: Check browser console
**Backend Issues**: Check terminal output
**Integration Issues**: Check `.env` configuration

## 🎉 You're All Set!

Both frontend and backend are ready to use. Start with:

```bash
# Terminal 1
npm run dev

# Terminal 2
cd backend
npm run dev
```

Visit http://localhost:3000 and start detecting phishing! 🛡️
