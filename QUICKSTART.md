# 🚀 PhishGuard AI - Quick Start Guide

## Project Setup Complete! ✅

Your PhishGuard AI application has been created with all necessary files and structure.

## Next Steps

### 1. Complete Installation (If not already done)
```bash
cd c:\E-commerce\SpamDetection
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database (test mode for development)
4. Copy your Firebase config
5. Update `src/services/firebase.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}
```

### 3. Set Up Backend API

Option A: Use the Python example
```bash
pip install flask flask-cors
python BACKEND_EXAMPLE.py
```

Option B: Use the Node.js example
```bash
npm install express cors multer
node backend.js
```

The backend will run at `http://localhost:5000`

### 4. Update Backend URL (if needed)
Edit `src/services/api.js` and change:
```javascript
const API_BASE_URL = 'http://localhost:5000/api'
```

### 5. Start Development Server
```bash
npm run dev
```

Opens automatically at `http://localhost:3000`

## Project Structure

```
PhishGuard AI/
├── src/
│   ├── components/          # UI components
│   ├── services/            # API & Firebase
│   ├── styles/              # CSS & Tailwind
│   ├── App.jsx              # Main component
│   └── main.jsx             # Entry point
├── public/                  # Static files
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
└── README.md                # Full documentation
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

## Features Implemented

✅ Real-time message/link analysis
✅ File upload with drag-and-drop
✅ Risk assessment (Low/Medium/High)
✅ Status classification (Safe/Suspicious/Spam)
✅ Warning modal for suspicious content
✅ Analysis history dashboard
✅ Firebase integration (ready to configure)
✅ Dark theme UI
✅ Fully responsive mobile design
✅ Tailwind CSS styling

## Key Components

1. **InputSection.jsx** - Message input with paste/analyze
2. **ResultCard.jsx** - Results display with risk/status
3. **FileUploadSection.jsx** - Drag-drop file upload
4. **HistoryDashboard.jsx** - Analysis history table
5. **WarningModal.jsx** - Phishing warning popup

## API Endpoints Expected

The backend should provide these endpoints:

### POST /api/analyze
Request:
```json
{
  "content": "message or link",
  "timestamp": "ISO string"
}
```

Response:
```json
{
  "content": "analyzed content",
  "status": "Safe|Suspicious|Spam",
  "risk": "Low|Medium|High",
  "confidence": 95,
  "details": "Detailed analysis explanation"
}
```

### POST /api/analyze-file
Request: multipart/form-data with file

Response:
```json
{
  "fileName": "file.pdf",
  "status": "Safe|Suspicious|Spam",
  "risk": "Low|Medium|High",
  "confidence": 88,
  "details": "File analysis details"
}
```

## Firestore Database Structure

When configured, the app will create a `analyses` collection with documents like:

```json
{
  "userId": "anonymous",
  "content": "analyzed message",
  "status": "Safe",
  "risk": "Low",
  "confidence": 95,
  "details": "Analysis details",
  "timestamp": "2026-04-24T...",
  "createdAt": "2026-04-24T..."
}
```

## Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3001
```

### Clear Cache
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### Firebase Issues
- Check credentials in `src/services/firebase.js`
- Verify Firestore is enabled in Firebase Console
- Check security rules in Firestore

### API Not Responding
- Ensure backend is running on port 5000
- Check API_BASE_URL in `src/services/api.js`
- Verify CORS is enabled in backend

## Deployment

### Build for Production
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Deploy To

- **Vercel** (Recommended for Vite)
  ```bash
  npm install -g vercel
  vercel
  ```

- **Netlify**
  - Connect GitHub repo
  - Set build command: `npm run build`
  - Set publish directory: `dist`

- **Firebase Hosting**
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase init
  npm run build
  firebase deploy
  ```

## Development Tips

1. **Component Development**
   - Components are in `src/components/`
   - Each component is self-contained
   - Use Tailwind classes for styling

2. **API Testing**
   - Use Postman to test backend endpoints
   - Check network tab in DevTools

3. **Firebase Testing**
   - Use Firebase Console to check data
   - Test security rules in test mode first

4. **Mobile Testing**
   - Use DevTools responsive design mode
   - Test on actual mobile devices

## Security Notes

1. Never commit Firebase credentials to GitHub
2. Use `.env` file for sensitive data in production
3. Validate all inputs on backend
4. Set up proper Firestore security rules:
   ```
   match /analyses/{document=**} {
     allow read, write: if request.auth != null;
   }
   ```

## Support & Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## What's Next?

1. ✅ Project structure created
2. ⏳ Dependencies installed (in progress)
3. 📋 Configure Firebase
4. 🔧 Set up backend API
5. 🚀 Run `npm run dev`
6. 🎨 Customize colors/branding
7. 📦 Build for production

Enjoy building PhishGuard AI! 🎉
