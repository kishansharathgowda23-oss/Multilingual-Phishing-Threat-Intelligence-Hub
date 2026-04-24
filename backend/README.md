# PhishGuard AI Backend API

## Overview

Node.js Express backend for PhishGuard AI with Hugging Face integration, URL/email extraction, and Firebase storage.

## Features

- 🤖 **HuggingFace Integration** - AI-powered spam/phishing detection
- 🔗 **URL Extraction** - Detects and analyzes URLs in messages
- 📧 **Email Detection** - Extracts and tracks email addresses
- ⚠️ **Risk Assessment** - Low/Medium/High risk classification
- 🔥 **Firebase Storage** - Saves all analyses to Firestore
- 🚀 **n8n Webhook** - Triggers alerts for high-risk content
- 📊 **Pattern Detection** - Identifies phishing patterns
- 🛡️ **Security First** - Safe, non-invasive analysis

## Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Create `.env` file**
```bash
cp .env.example .env
```

3. **Configure environment variables** (in `.env`):

```ini
# Server
PORT=5000
NODE_ENV=development

# HuggingFace (Get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=your_huggingface_token

# Firebase (Get from Firebase Console -> Project Settings)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email

# n8n (Get from your n8n instance)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project or select existing one
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the JSON and use values in `.env`

**Alternative**: Save JSON file as `firebase-key.json` in backend root

### HuggingFace Setup

1. Go to [HuggingFace](https://huggingface.co)
2. Create account or login
3. Go to Settings → Access Tokens
4. Create new token with "read" access
5. Copy token to `HUGGINGFACE_API_KEY` in `.env`

### n8n Webhook Setup

1. Open your n8n instance
2. Create workflow with "Webhook" trigger
3. Copy webhook URL
4. Add to `N8N_WEBHOOK_URL` in `.env`

**Example n8n Setup**:
```
Webhook Trigger (POST) → Email/Slack Notification → Save to Database
```

## Running the Server

### Development Mode
```bash
npm run dev
```
Auto-restarts on file changes

### Production Mode
```bash
npm start
```

### Check Health
```bash
curl http://localhost:5000/api/health
```

## API Endpoints

### POST /api/analyze

**Analyze a message or link for phishing/spam**

**Request:**
```json
{
  "message": "Click here to verify your account: bit.ly/xxxxx"
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
    "urls": ["bit.ly/xxxxx"],
    "emails": ["user@example.com"],
    "suspiciousUrls": ["bit.ly/xxxxx"],
    "warning": "Contains shortened/suspicious URL(s). Detected phishing indicators (urgency, verification requests). Contains email address(es).",
    "details": {
      "phishingPatterns": {
        "urgency": 1,
        "verification": 1
      },
      "sentiment": "negative"
    }
  },
  "timestamp": "2026-04-24T10:30:00.000Z"
}
```

### POST /api/analyze-file

**Analyze uploaded file**

**Request:**
```
Content-Type: multipart/form-data
file: <binary file data>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Suspicious",
    "risk": "High",
    "confidence": 95,
    "fileName": "malware.exe",
    "fileSize": 1024000,
    "warning": "File type or size is suspicious"
  },
  "timestamp": "2026-04-24T10:30:00.000Z"
}
```

### GET /api/health

**Health check endpoint**

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-24T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Risk Levels

- **Low** (0-40 points): Appears safe, standard communication
- **Medium** (40-70 points): Some suspicious indicators, user should verify
- **High** (70+ points): Strong indicators of phishing/spam, high risk

## Risk Calculation

Points are assigned for:
- HuggingFace analysis: +40 per confidence point
- Suspicious URLs: +20 per URL
- Multiple URLs (>3): +15
- Multiple emails (>2): +10

## Data Storage

### Firebase Firestore Collections

**analyses**
```
{
  userId: "anonymous",
  content: "Message content",
  status: "Suspicious",
  risk: "High",
  confidence: 85,
  urls: ["url1", "url2"],
  emails: ["email@example.com"],
  warning: "Warning message",
  timestamp: "2026-04-24T...",
  createdAt: server timestamp
}
```

**webhook_events** (when high-risk detected)
```
{
  type: "HIGH_RISK_ALERT",
  payload: {...},
  status: "sent",
  createdAt: server timestamp
}
```

## n8n Webhook Payload

When risk is **High**, the following payload is sent:

```json
{
  "analysis": {
    "content": "Message content",
    "status": "Suspicious",
    "risk": "High",
    "confidence": 85,
    "urls": ["url"],
    "warning": "Warning message",
    "timestamp": "2026-04-24T..."
  },
  "alert": {
    "severity": "HIGH",
    "type": "PHISHING_DETECTED",
    "message": "High-risk content detected: ...",
    "action": "IMMEDIATE_REVIEW_REQUIRED"
  }
}
```

## Error Handling

### 400 Bad Request
```json
{
  "error": "Invalid input. Message is required and must be a non-empty string."
}
```

### 500 Internal Server Error
```json
{
  "error": "Analysis failed",
  "message": "Error description"
}
```

## Service Fallbacks

- **HuggingFace**: If API fails, uses local heuristic analysis
- **Firebase**: If not configured, skips data storage (non-blocking)
- **n8n**: If webhook fails, continues normally (non-blocking)

All failures are logged but don't stop the analysis process.

## Extraction Features

### URL Detection
- Extracts all URLs from message
- Identifies shortened URLs (bit.ly, tinyurl, goo.gl, etc.)
- Detects suspicious domains

### Email Detection
- Extracts email addresses
- Validates email format

### Keyword Extraction
- Identifies hashtags and keywords
- Supports filtering

### Phishing Pattern Detection
- **Urgency**: "urgent", "immediately", "act now"
- **Verification**: "verify", "confirm", "validate"
- **Threats**: "account closed", "suspended", "locked"
- **Financial**: "payment", "credit card", "bank"

## Development

### Project Structure
```
backend/
├── src/
│   ├── server.js              (Main server)
│   ├── routes/
│   │   └── analyze.js         (API routes)
│   ├── services/
│   │   ├── firebase.js        (Firebase integration)
│   │   ├── huggingface.js     (AI analysis)
│   │   └── webhooks.js        (n8n/Slack)
│   └── utils/
│       └── extractors.js      (Data extraction)
├── package.json               (Dependencies)
├── .env.example              (Config template)
└── README.md                 (This file)
```

### Adding New Features

1. **New extraction method**: Add to `utils/extractors.js`
2. **New AI model**: Update `services/huggingface.js`
3. **New webhook**: Update `services/webhooks.js`
4. **New route**: Create in `routes/` and import in `server.js`

## Performance Tips

- HuggingFace API calls are cached when possible
- Firebase saves are non-blocking (async)
- Webhook triggers don't block response
- Max message size: 10MB

## Security

- CORS enabled for frontend URL only
- Input validation on all endpoints
- No sensitive data in response errors (dev only)
- Firebase rules should restrict access in production

## Troubleshooting

### HuggingFace API not responding
- Check API key is valid
- Check rate limits (free tier: limited requests)
- Falls back to local analysis automatically

### Firebase connection error
- Verify credentials in `.env`
- Check Firebase project is active
- Check Firestore rules allow write access

### n8n webhook not triggering
- Verify webhook URL is correct
- Check n8n workflow is active
- Check payload format matches workflow expectations

### CORS errors from frontend
- Verify `FRONTEND_URL` in `.env`
- Check frontend is running on that URL
- Restart backend after .env changes

## Logging

Server logs include:
- Request timestamp and method
- Service initialization status
- Analysis results
- Error messages with context
- Webhook triggers and failures

## Production Deployment

### Environment Setup
```bash
NODE_ENV=production
FIREBASE_PROJECT_ID=your_prod_project
HUGGINGFACE_API_KEY=your_prod_key
# Use strong, secure values
```

### Recommendations
- Use environment variables for all secrets
- Enable Firebase security rules
- Use HTTPS for all endpoints
- Set up monitoring/alerting
- Use process manager (PM2, forever, etc.)
- Enable request rate limiting
- Set up database backups

### PM2 Example
```bash
pm2 start src/server.js --name "phishguard-api"
pm2 save
pm2 startup
```

## Support

Check logs for detailed error messages:
```bash
npm run dev  # See console output
```

## License

MIT
