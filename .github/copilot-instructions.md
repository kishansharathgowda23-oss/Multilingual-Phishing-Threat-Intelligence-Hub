# PhishGuard AI - Copilot Instructions

## Project Overview
PhishGuard AI is a modern React web application for phishing detection and spam analysis. It features real-time analysis, file uploads, and cloud integration with a dark theme UI.

## Development Guidelines

### Code Style
- Use functional components with React hooks
- Follow ESLint rules in configuration
- Use descriptive variable and function names
- Keep components focused and reusable

### Component Structure
- All React components in `src/components/`
- Services layer for API calls in `src/services/`
- Centralized styling with Tailwind CSS + `src/styles/index.css`

### API Integration
- All backend calls through `src/services/api.js`
- Firebase operations through `src/services/firebase.js`
- Use try-catch for error handling

### Styling Rules
- Use Tailwind CSS for all styling
- Custom styles in `src/styles/index.css` for component classes
- Dark theme by default (gray-900 background, gray-800 cards)
- Mobile-first responsive design

### Git Workflow
- Keep commits atomic and descriptive
- Branch naming: `feature/`, `fix/`, `docs/`
- Always test locally before committing

## Adding New Features

### New Component
1. Create in `src/components/ComponentName.jsx`
2. Import in `App.jsx` or relevant parent
3. Add styling to `index.css` if needed
4. Follow existing component patterns

### New API Endpoint
1. Add function to `src/services/api.js`
2. Use axios with proper error handling
3. Update `API_BASE_URL` for environment-specific URLs

### Firebase Integration
- Add queries to `src/services/firebase.js`
- Update Firestore security rules in Firebase Console
- Test with sample data before production

## Backend Requirements

The backend should provide:
- `POST /api/analyze` - Analyze text/links
- `POST /api/analyze-file` - Analyze uploaded files
- Proper CORS headers
- Error responses with meaningful messages

## Testing
- Manual testing in dev server
- Test on mobile devices/responsive mode
- Check all API endpoints respond correctly
- Verify Firebase connectivity

## Performance Tips
- Lazy load components if needed
- Use React.memo for heavy components
- Optimize images and assets
- Monitor bundle size with `npm run build`

## Deployment
- Build: `npm run build`
- Output in `dist/` folder
- Deploy to Vercel, Netlify, Firebase Hosting, etc.
- Update backend URL for production
- Configure Firebase for production project

## Resources
- React Docs: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Firebase: https://firebase.google.com
- Vite: https://vitejs.dev
