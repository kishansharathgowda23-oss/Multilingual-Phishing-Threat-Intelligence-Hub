# PhishGuard AI - Service Configuration Guide

Complete setup instructions for all external services integration.

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `phishguard-ai`
4. Accept terms and create

### Step 2: Enable Firestore Database

1. In Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose location (closest to your users)
4. Start in **Test mode** (development only!)
5. Create

### Step 3: Create Service Account

1. Go to **Project Settings** (gear icon)
2. Select **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file as `firebase-key.json` in backend root

### Step 4: Update Backend Configuration

**Option A: Using JSON File**
```bash
# Place firebase-key.json in backend root
backend/
├── src/
├── package.json
├── .env
└── firebase-key.json   ← Download here
```

**Option B: Using Environment Variables**

From the JSON file, extract these values and add to `.env`:

```ini
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

⚠️ **Important**: Make sure to include the `\n` characters for newlines in the private key!

### Step 5: Set Firestore Security Rules (Production)

In Firestore console, go to **Rules** tab:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /analyses/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow anyone to write webhook events (for n8n)
    match /webhook_events/{document=**} {
      allow write: if true;
      allow read: if request.auth != null;
    }
  }
}
```

**For Development (Test Mode)**:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Verify Firebase Connection

```bash
curl http://localhost:5000/api/health
# Should show Firebase: ✅ Enabled
```

Check the terminal for:
```
✅ Firebase initialized with service account file
```

---

## 🤖 HuggingFace Configuration

### Step 1: Create Account

1. Go to [HuggingFace](https://huggingface.co)
2. Sign up or login
3. Agree to terms

### Step 2: Generate API Token

1. Go to **Settings** (user menu, top right)
2. Click **Access Tokens**
3. Click **New token**
4. Give it a name: `phishguard-api`
5. Role: **read** (only need to read models)
6. Create token
7. Copy the token

### Step 3: Add to Backend

Add to `backend/.env`:
```ini
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Verify Connection

The first analysis request will test the connection. Check the terminal:
```
✅ HuggingFace: Enabled
```

If API key is invalid or rate-limited, the backend automatically falls back to local analysis (still works!).

### API Rate Limits (Free Tier)

- **Requests per minute**: ~32
- **Requests per day**: ~100
- For higher limits, upgrade account

**Solution**: If you hit limits:
1. Upgrade HuggingFace account (paid)
2. Or use local analysis (automatic fallback)

### Available Models

The backend uses:
- `distilbert-base-uncased-finetuned-sst-2-english` - Sentiment analysis
- Automatically falls back to keyword-based analysis if unavailable

---

## 🔗 n8n Webhook Configuration

### Step 1: Set Up n8n

**Option A: Self-Hosted**
```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: Cloud**
1. Go to [n8n Cloud](https://cloud.n8n.io)
2. Sign up for free
3. Create workspace

### Step 2: Create Webhook Workflow

1. Create new workflow
2. Add trigger: **Webhook**
3. Set method to **POST**
4. Copy the webhook URL

Example URL:
```
https://your-n8n-instance.com/webhook/unique-id
```

### Step 3: Add Webhook Response

1. Add a **Respond to Webhook** node
2. Set response code: 200
3. Set response body:
```json
{
  "status": "received",
  "message": "Alert processed"
}
```

### Step 4: Add Alert Action

Choose what happens when high-risk content detected:

**Option A: Send Email**
1. Add **Gmail** node
2. Configure with your Gmail
3. Template:
```
Subject: 🚨 PhishGuard High Risk Alert

Body:
Risk Level: {{$json.alert.severity}}
Type: {{$json.alert.type}}
Content: {{$json.analysis.content}}
Message: {{$json.alert.message}}
```

**Option B: Send Slack Message**
1. Add **Slack** node
2. Configure with Slack channel
3. Template:
```
🚨 High Risk Phishing Alert
Risk: {{$json.alert.severity}}
Type: {{$json.alert.type}}
Content: {{$json.analysis.content}}
```

**Option C: Save to Database**
1. Add **PostgreSQL** or **MongoDB** node
2. Save the entire alert payload

### Step 5: Update Backend Configuration

Add to `backend/.env`:
```ini
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

### Step 6: Test the Webhook

In n8n, click "Execute Workflow" and send a test request:

```bash
curl -X POST https://your-n8n-instance.com/webhook/xxxxx \
  -H "Content-Type: application/json" \
  -d '{
    "analysis": {
      "content": "Test message",
      "risk": "High",
      "status": "Suspicious"
    },
    "alert": {
      "severity": "HIGH",
      "message": "Test alert"
    }
  }'
```

You should see the webhook trigger in n8n console.

### Step 7: Test from PhishGuard

Analyze a suspicious message in the app. If risk is High, the webhook should trigger automatically.

Check n8n workflow runs for confirmation.

### Example n8n Workflow

```
[Webhook Trigger]
    ↓
[Extract High Risk]
    ↓
[Filter: If Risk = High]
    ↓
├→ [Send Email Notification]
├→ [Slack Alert Message]
└→ [Save to Database]
    ↓
[Respond to Webhook]
```

---

## 🔔 Optional: Slack Notifications

Add **Slack** direct notifications (in addition to n8n):

### Step 1: Create Slack Bot

1. Go to [Slack App Directory](https://api.slack.com/apps)
2. Create New App → From scratch
3. Name: `PhishGuard Alert Bot`
4. Workspace: your workspace

### Step 2: Configure Permissions

1. Go to **OAuth & Permissions**
2. Add scopes:
   - `chat:write`
   - `chat:write.public`
3. Install app to workspace
4. Copy **Bot Token** (starts with `xoxb-`)

### Step 3: Add to Backend

```ini
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Or use the bot token in code.

### Step 4: Test

```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-type: application/json' \
  -d '{"text":"Test message from PhishGuard"}'
```

---

## 📊 Testing All Services

### Backend Health Check

```bash
curl http://localhost:5000
```

Response shows which services are enabled:
```json
{
  "name": "PhishGuard AI Backend",
  "environment": "development",
  "endpoints": {...},
  "services": {
    "HuggingFace": "✅ Enabled",
    "Firebase": "✅ Enabled",
    "n8n Webhook": "✅ Enabled"
  }
}
```

### Test Message to Verify Everything

**Safe Message**:
```
Hi, how are you doing today?
```
Expected: Status: Safe, Risk: Low

**Suspicious Message**:
```
URGENT! Your account has unusual activity. Click here to verify: bit.ly/verify123
```
Expected: Status: Suspicious, Risk: High

**Spam Message**:
```
FREE MONEY! You won $1,000,000! Click now: http://freeprize.xyz
```
Expected: Status: Spam, Risk: Medium

---

## 🔐 Environment Variables Checklist

### Required (Backend Works)
- ✅ `PORT` - Server port (default: 5000)
- ✅ `NODE_ENV` - development/production
- ✅ `FRONTEND_URL` - Frontend URL

### Optional (Enhanced Features)
- ⚙️ `HUGGINGFACE_API_KEY` - AI analysis
- ⚙️ `FIREBASE_PROJECT_ID` - Data storage
- ⚙️ `FIREBASE_PRIVATE_KEY` - Firebase auth
- ⚙️ `FIREBASE_CLIENT_EMAIL` - Firebase auth
- ⚙️ `N8N_WEBHOOK_URL` - High-risk alerts

### Complete `.env` Template

```ini
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# HuggingFace AI (optional)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx

# Firebase (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com

# n8n Webhook (optional)
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/id

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 🚀 Production Configuration

### Firebase (Production)

1. Create separate production Firebase project
2. Set up production Firestore
3. Implement proper security rules
4. Enable backup/restore
5. Set up monitoring alerts

### HuggingFace (Production)

1. Upgrade to paid account for higher limits
2. Consider using Hugging Face Inference Endpoints
3. Set up rate limiting on backend

### n8n (Production)

1. Use n8n Cloud or self-hosted with SSL
2. Implement authentication
3. Set up error handling
4. Monitor webhook delivery

### Backend (Production)

1. Use environment variables for all secrets
2. Enable HTTPS/SSL
3. Set up rate limiting
4. Enable logging/monitoring
5. Use process manager (PM2)
6. Configure CORS properly

---

## 📝 Verification Steps

After configuration, verify:

1. **Frontend works**: `http://localhost:3000` loads
2. **Backend works**: `curl http://localhost:5000` responds
3. **Firebase works**: Check `backend/.env` or `firebase-key.json`
4. **HuggingFace works**: Check API key in `.env`
5. **n8n works**: Webhook URL responds to POST

Run test analysis and check logs for success messages.

---

## ❓ FAQ

**Q: Do I need all services?**
A: No! Backend works with just Node.js. Services are optional for full features.

**Q: My HuggingFace API hits rate limit?**
A: Backend automatically falls back to local analysis. Upgrade HuggingFace account for higher limits.

**Q: Firebase not saving data?**
A: Check credentials and security rules. Backend logs will show connection errors.

**Q: n8n webhook not triggering?**
A: Verify webhook URL is correct, workflow is active, and network allows outbound connections.

**Q: How do I debug?**
A: Check backend terminal logs and browser DevTools console.

---

## 🎓 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [HuggingFace API Docs](https://huggingface.co/docs/api-inference)
- [n8n Documentation](https://docs.n8n.io)
- [Slack API Reference](https://api.slack.com/docs)

**Happy configuring!** 🎉
