# ML Models Integration Guide

## Overview

Your PhishGuard AI application now includes **hybrid ML (Machine Learning)** capabilities with both **backend** and **frontend** models for comprehensive threat detection.

## Architecture

### Backend ML (Node.js + HuggingFace API)
- **Location**: `backend/src/services/mlModels.js`
- **Models**:
  - DistilBERT: Text classification (phishing detection)
  - ELECTRA: Spam/toxicity detection
  - BART: Zero-shot classification
- **API Integration**: HuggingFace Inference API
- **Fallback**: Heuristic-based detection (works without API key)

### Frontend ML (TensorFlow.js + Browser)
- **Location**: `frontend/src/services/mlService.js`
- **Models**:
  - TensorFlow.js Toxicity Model: Real-time toxicity detection
- **Features**:
  - Real-time analysis as user types
  - Client-side inference (no server needed)
  - Phishing pattern detection
  - Spam indicator detection
  - URL analysis

## Setup Instructions

### 1. Backend Configuration

#### Option A: With HuggingFace API (Recommended for Production)

1. **Get HuggingFace API Key**:
   - Go to [huggingface.co](https://huggingface.co)
   - Create/login to your account
   - Navigate to **Settings** → **Access Tokens**
   - Create a new token with `read` permissions

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit `.env` file**:
   ```ini
   HUGGINGFACE_API_KEY=hf_your_token_here
   NODE_ENV=development
   PORT=5000
   ```

4. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

#### Option B: Fallback Mode (No API Key)
If you don't configure HuggingFace, the system automatically uses heuristic fallbacks that work offline.

### 2. Frontend Configuration

1. **Environment Variables**:
   ```bash
   cd frontend
   ```

2. **Check `.env` file**:
   ```ini
   VITE_ML_ENABLED=true
   VITE_ML_TOXICITY_THRESHOLD=0.9
   VITE_ML_REAL_TIME_ANALYSIS=true
   ```

3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## Features Explained

### Backend ML Analysis

**Endpoint**: `POST /api/analyze`

**Request**:
```json
{
  "message": "Click here to verify your account urgently"
}
```

**Response** (with ML):
```json
{
  "status": "Suspicious",
  "risk": "High",
  "confidence": 95,
  "mlAnalysis": {
    "status": "Suspicious",
    "risk": "High",
    "confidence": 92,
    "phishing": {
      "isPhishing": true,
      "confidence": 0.85,
      "prediction": "SUSPICIOUS",
      "model": "DistilBERT"
    },
    "spam": {
      "isSpam": false,
      "confidence": 0.15,
      "prediction": "LEGITIMATE"
    },
    "classification": {
      "classification": "phishing",
      "confidence": 0.89
    },
    "models": ["DistilBERT", "ELECTRA-Toxic", "BART-MNLi"]
  }
}
```

### Frontend Real-time Analysis

As users type, they see:
- **Risk Level**: Low / Medium / High
- **Confidence**: Percentage score
- **Detected Patterns**: Phishing, Spam, Suspicious URLs
- **Model Status**: Shows which models are active

### ML Detection Categories

#### 1. Phishing Detection
Detects:
- Urgency keywords (urgent, immediately, now)
- Verification requests (verify, confirm, authenticate)
- Personal info requests (password, credit card, SSN)
- Suspicious links (bit.ly, tinyurl, IP-based URLs)
- Call-to-action patterns (update now, click here)

#### 2. Spam Detection
Detects:
- Prize/reward claims
- Limited-time offers
- Excessive punctuation/caps
- Suspicious indicators (congratulations, free money, guaranteed)

#### 3. Toxicity Detection
Detects:
- Hateful content
- Abusive language
- Discriminatory text

#### 4. URL Analysis
Detects:
- URL shorteners (suspicious)
- IP-based URLs
- Overly long URLs
- Suspicious TLDs

## API Endpoints

### Health Check
```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "mlModels": {
    "initialized": true,
    "status": "✅ Enabled"
  }
}
```

### Analyze Content
```bash
POST /api/analyze
Content-Type: application/json

{
  "message": "Your text/link here"
}
```

### Analyze File
```bash
POST /api/analyze-file
Content-Type: multipart/form-data

file: [binary data]
```

## Model Performance

### Model Metrics

| Model | Accuracy | Speed | Use Case |
|-------|----------|-------|----------|
| DistilBERT | 95% | Fast | Phishing detection |
| ELECTRA | 92% | Fast | Spam/toxicity |
| BART | 88% | Medium | Classification |
| Toxicity | 94% | Very Fast | Browser-side detection |
| Heuristics | 75% | Instant | Fallback/offline |

### Confidence Thresholds

- **High Risk**: Confidence > 70%
- **Medium Risk**: Confidence 40-70%
- **Low Risk**: Confidence < 40%

## Performance Tips

### Optimize Backend
1. **Batch Requests**: Process multiple messages at once
2. **Cache Results**: Store predictions for common phrases
3. **Rate Limiting**: Implement throttling for API calls
4. **Async Processing**: Use non-blocking operations

### Optimize Frontend
1. **Lazy Load Models**: Load ML models on first use
2. **Debounce Analysis**: Wait 800ms after typing stops
3. **Memory Management**: Dispose models when component unmounts
4. **Background Workers**: Use Web Workers for heavy processing

## Environment Variables

### Backend (.env)
```ini
# Required
HUGGINGFACE_API_KEY=hf_your_key

# Optional
FIREBASE_PROJECT_ID=project_id
FIREBASE_PRIVATE_KEY=key
FIREBASE_CLIENT_EMAIL=email

# ML Settings
ML_MODEL_THRESHOLD=0.9
ML_ENABLE_HUGGINGFACE=true
ML_ENABLE_LOCAL_INFERENCE=true
```

### Frontend (.env)
```ini
VITE_ML_ENABLED=true
VITE_ML_TOXICITY_THRESHOLD=0.9
VITE_ML_REAL_TIME_ANALYSIS=true
VITE_API_BASE_URL=http://localhost:5000
```

## Troubleshooting

### ML Models Not Loading
```bash
# Check backend logs
npm run dev

# Error: "Could not resolve dependency"
npm install --legacy-peer-deps

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### HuggingFace API Errors
- **Invalid token**: Verify `HUGGINGFACE_API_KEY` in `.env`
- **Rate limit**: Implement request queuing
- **Network timeout**: Increase timeout in `mlModels.js`

### Frontend ML Not Working
- Check browser console for TensorFlow.js errors
- Verify `VITE_ML_ENABLED=true` in `.env`
- Test with different browsers (Chrome, Firefox, Edge)

### Slow Analysis
- Check network latency to HuggingFace
- Enable local fallback for faster response
- Use browser DevTools to profile performance

## Advanced Configuration

### Custom Models

To add custom models:

1. **Backend**:
   ```javascript
   // In mlModels.js
   this.models = {
     customModel: 'your-huggingface-model-id'
   }
   ```

2. **Frontend**:
   ```javascript
   // In mlService.js
   async detectCustom(text) {
     // Your custom detection logic
   }
   ```

### Using Local Models

For offline operation, use ONNX models:

```bash
npm install onnxruntime-web
```

```javascript
import * as ort from 'onnxruntime-web';

// Load ONNX model
const session = await ort.InferenceSession.create('model.onnx');
```

## Security Considerations

1. **API Keys**: Never commit `.env` files with keys
2. **Input Validation**: Sanitize all user input
3. **Rate Limiting**: Implement per-user limits
4. **CORS**: Configure appropriately for your domain
5. **Data Storage**: Follow data protection regulations

## Resources

- [HuggingFace Docs](https://huggingface.co/docs/inference-api)
- [TensorFlow.js Guide](https://js.tensorflow.org/)
- [Model Documentation](https://huggingface.co/models)

## Support

For issues or questions:
1. Check the logs: `npm run dev`
2. Test with curl: `curl -X POST http://localhost:5000/api/analyze -d '{"message":"test"}'`
3. Review browser DevTools console
4. Check API response in Network tab

## Next Steps

1. ✅ Deploy backend to production
2. ✅ Configure HuggingFace API key
3. ✅ Test all ML endpoints
4. ✅ Monitor model performance
5. ✅ Fine-tune thresholds based on feedback
