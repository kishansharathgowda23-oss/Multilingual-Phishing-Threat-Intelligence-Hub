"""
BACKEND EXAMPLE - PhishGuard AI API
This is an example Flask/Node.js backend implementation

Flask Example (Python):
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    """
    Analyze text/link for phishing/spam
    
    Request:
    {
        "content": "message or link",
        "timestamp": "ISO timestamp"
    }
    
    Response:
    {
        "content": "analyzed content",
        "status": "Safe|Spam|Suspicious",
        "risk": "Low|Medium|High",
        "confidence": 95,
        "details": "Detailed analysis..."
    }
    """
    try:
        data = request.json
        content = data.get('content', '').lower()
        
        # Simple heuristic analysis (replace with real ML model)
        status = 'Safe'
        risk = 'Low'
        confidence = 90
        details = 'Content appears legitimate.'
        
        # Check for common phishing patterns
        phishing_keywords = ['verify account', 'confirm identity', 'update payment', 'urgent action']
        if any(keyword in content for keyword in phishing_keywords):
            status = 'Suspicious'
            risk = 'High'
            confidence = 85
            details = 'Content contains phishing-like keywords.'
        
        # Check for spam patterns
        spam_keywords = ['click here', 'free money', 'limited time']
        if any(keyword in content for keyword in spam_keywords):
            status = 'Spam'
            risk = 'Medium'
            confidence = 75
            details = 'Content resembles spam/marketing.'
        
        return jsonify({
            'content': data.get('content', ''),
            'status': status,
            'risk': risk,
            'confidence': confidence,
            'details': details,
            'url': extract_url(content),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-file', methods=['POST'])
def analyze_file():
    """
    Analyze uploaded file
    
    Request: multipart/form-data with 'file' field
    Response: Same as /analyze endpoint
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Real implementation would scan file content
        return jsonify({
            'fileName': file.filename,
            'status': 'Safe',
            'risk': 'Low',
            'confidence': 85,
            'details': 'File appears safe after scanning.',
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_url(content):
    """Extract URL from content"""
    import re
    urls = re.findall(r'https?://[^\s]+', content)
    return urls[0] if urls else None

if __name__ == '__main__':
    app.run(debug=True, port=5000)


"""
Node.js Express Example:

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/analyze', (req, res) => {
    const { content, timestamp } = req.body;
    
    let status = 'Safe';
    let risk = 'Low';
    let confidence = 90;
    let details = 'Content appears legitimate.';
    
    const phishingKeywords = ['verify account', 'confirm identity', 'update payment'];
    if (phishingKeywords.some(k => content.toLowerCase().includes(k))) {
        status = 'Suspicious';
        risk = 'High';
        confidence = 85;
        details = 'Content contains phishing-like keywords.';
    }
    
    res.json({
        content,
        status,
        risk,
        confidence,
        details,
        timestamp: new Date().toISOString()
    });
});

app.post('/api/analyze-file', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }
    
    res.json({
        fileName: req.file.originalname,
        status: 'Safe',
        risk: 'Low',
        confidence: 85,
        details: 'File appears safe.',
        timestamp: new Date().toISOString()
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));

To use this Node.js backend:
1. npm install express cors multer
2. node backend.js
3. Backend will run on http://localhost:5000
"""
