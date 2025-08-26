# Frontend-Backend Connection Fix Guide

## Issues Fixed

1. **Missing Environment Configuration**: Added `.env` file with backend URL
2. **API Service**: Created centralized API service for consistent backend communication
3. **CORS Configuration**: Updated backend to handle deployed frontend domains
4. **Missing Function**: Added `getFullBackendUrl` function in AuthContext

## Changes Made

### 1. Frontend Environment Configuration
- Created `client/.env` with your deployed backend URL
- Updated all API calls to use centralized service

### 2. API Service (`client/src/services/api.js`)
- Centralized axios configuration
- Automatic token handling
- Error handling and redirects

### 3. Backend CORS Update
- Added support for Netlify, Vercel, Render, and GitHub Pages
- Enhanced CORS configuration with proper methods and headers

### 4. Connection Testing
- Added `testConnection.js` utility for debugging

## Deployment Steps

### Frontend Deployment (Netlify/Vercel)

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify:**
   - Upload `dist` folder to Netlify
   - Set environment variable: `VITE_BACKEND_URL=https://learnify-backend-d08q.onrender.com`

3. **Deploy to Vercel:**
   - Connect GitHub repo
   - Set environment variable: `VITE_BACKEND_URL=https://learnify-backend-d08q.onrender.com`

### Backend Environment Update

Update your Render backend environment variables:
```
FRONTEND_URL=https://your-frontend-domain.netlify.app
CLIENT_URL=https://your-frontend-domain.netlify.app
```

## Testing the Connection

Add this to any component to test:
```javascript
import { testBackendConnection } from '../utils/testConnection';

// Test connection
testBackendConnection().then(result => {
  console.log('Connection test:', result);
});
```

## Common Issues & Solutions

### 1. CORS Errors
- Ensure your frontend domain is added to backend CORS configuration
- Check that credentials are enabled

### 2. 404 Errors on API Calls
- Verify `VITE_BACKEND_URL` is set correctly
- Check that backend routes are properly configured

### 3. Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT token in browser dev tools

### 4. Environment Variables Not Working
- Restart development server after adding `.env`
- For production, set variables in hosting platform

## Next Steps

1. **Deploy frontend** with the new configuration
2. **Update backend environment** with your frontend URL
3. **Test all features** after deployment
4. **Monitor logs** for any remaining issues

Your frontend should now properly connect to your deployed backend!