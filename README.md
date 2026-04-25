# Shildex - Phishing Detection Web App

A modern, mobile-friendly React application for detecting phishing, spam, and suspicious links/messages in real-time.

## Features

✨ **Core Features:**
- 🔍 **Real-time Analysis** - Analyze messages and links instantly
- 📊 **Risk Assessment** - Get status (Safe/Spam/Suspicious) and risk levels (Low/Medium/High)
- ⚠️ **Smart Warnings** - Modal alerts for suspicious content with confirmation prompts
- 📁 **File Upload & Scanning** - Scan images and documents for threats
- 📈 **Dashboard History** - Track all analyzed content with detailed history table
- 🔒 **Firebase Integration** - Secure cloud storage of analysis results
- 🎨 **Dark Theme** - Easy on the eyes, modern design
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## Tech Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS with dark theme
- **Backend Integration:** Axios for API calls
- **Database:** Firebase (Firestore & Storage)
- **Build Tool:** Vite with optimized bundling

## Project Structure

```
src/
├── components/          # React components
│   ├── InputSection.jsx     # Message/link input
│   ├── ResultCard.jsx       # Analysis results display
│   ├── FileUploadSection.jsx # File upload drag-drop
│   ├── HistoryDashboard.jsx # Analysis history table
│   └── WarningModal.jsx     # Suspicious link warning
├── pages/              # Page components
├── services/
│   ├── api.js          # Backend API calls
│   └── firebase.js      # Firebase configuration
├── styles/
│   └── index.css       # Tailwind + custom styles
├── App.jsx             # Main app component
└── main.jsx            # React entry point
```

## Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Clone and navigate:**
```bash
cd c:\E-commerce\SpamDetection
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure Firebase:**
   - Create a Firebase project at https://firebase.google.com
   - Get your Firebase config
   - Update `src/services/firebase.js` with your credentials:
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

4. **Set backend URL:**
   - Update `API_BASE_URL` in `src/services/api.js` to match your backend server

## Development

### Start Development Server
```bash
npm run dev
```
Opens at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## Backend Integration

The app expects a backend API at `/api/analyze` and `/api/analyze-file`:

### `/analyze` Endpoint
```
POST /api/analyze
Content-Type: application/json

{
  "content": "message or link to analyze",
  "timestamp": "2026-04-24T..."
}

Response:
{
  "content": "analyzed content",
  "status": "Safe|Spam|Suspicious",
  "risk": "Low|Medium|High",
  "confidence": 95,
  "details": "Detailed analysis explanation",
  "url": "extracted-url-if-present"
}
```

### `/analyze-file` Endpoint
```
POST /api/analyze-file
Content-Type: multipart/form-data
file: [binary file]

Response:
{
  "fileName": "file.pdf",
  "status": "Safe|Spam|Suspicious",
  "risk": "Low|Medium|High",
  "confidence": 88,
  "details": "File analysis details"
}
```

## Features Deep Dive

### 1. Message/Link Analysis
- Paste or type messages and links
- One-click paste from clipboard
- Real-time validation

### 2. Risk Assessment
- **Safe:** Legitimate and safe content
- **Suspicious:** Potentially risky, needs verification
- **Spam:** Known phishing/spam content
- Confidence percentage for each analysis

### 3. Warning Modal
When suspicious content is detected:
- Shows risk assessment
- Requires explicit confirmation before proceeding
- Security-first approach

### 4. File Upload
- Drag-and-drop interface
- Support: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
- 10MB file size limit (configurable)

### 5. History Dashboard
- Complete analysis history table
- Search and filter capabilities
- Timestamps and confidence scores
- Mobile-friendly table view

### 6. Firebase Storage
- Automatic cloud backup of analyses
- User-based history tracking
- Searchable and filterable results

## Styling Guide

The app uses Tailwind CSS with custom dark theme:

### Color Palette
- **Background:** Gray-900, Gray-800
- **Text:** Gray-300, Gray-400
- **Primary:** Blue-600
- **Success:** Green-500
- **Warning:** Yellow-500
- **Danger:** Red-600

### Component Classes
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Danger button
- `.card` - Card container
- `.input-field` - Text input
- `.badge-safe` - Safe status badge
- `.badge-suspicious` - Suspicious status badge
- `.badge-spam` - Spam status badge

## Security Considerations

1. **Never trust frontend validation alone** - Always validate on backend
2. **Use HTTPS** - All API calls should use HTTPS in production
3. **Validate File Types** - Check file types on both frontend and backend
4. **Rate Limiting** - Implement rate limiting on backend API
5. **Firebase Security** - Set up proper Firestore security rules

## Mobile Responsiveness

- Full responsive design using Tailwind breakpoints
- Touch-friendly buttons and input areas
- Mobile-optimized modal and table layouts
- Tested on devices from 320px to 1920px

## Customization

### Change Colors
Edit `tailwind.config.js` theme section

### Add New Analysis Fields
1. Update backend response format
2. Modify `ResultCard.jsx` to display new fields
3. Update Firebase schema in `services/api.js`

### Customize API Endpoint
Update `API_BASE_URL` in `src/services/api.js`

## Troubleshooting

### "Backend not responding"
- Ensure backend server is running
- Check API_BASE_URL is correct
- Verify backend CORS settings

### "Firebase error"
- Check Firebase credentials in `firebase.js`
- Verify Firestore rules allow read/write
- Check project ID matches

### "Styles not loading"
- Run `npm install` to ensure Tailwind is installed
- Clear browser cache
- Restart dev server

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use and modify

## Support

For issues or questions, check:
- Console for error messages
- Network tab in DevTools for API issues
- Firebase Console for database errors
