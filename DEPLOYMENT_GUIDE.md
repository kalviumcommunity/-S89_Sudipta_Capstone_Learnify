# Learnify Deployment Guide

## Backend (Render)
- **URL**: https://s89-sudipta-capstone-learnify-4.onrender.com
- **Status**: ✅ Running and accessible
- **Health Check**: `GET /health` returns 200 OK

## Frontend (Netlify) Configuration

### Environment Variables
Add the following environment variable in your Netlify dashboard:

```
VITE_BACKEND_URL=https://s89-sudipta-capstone-learnify-4.onrender.com
```

### Steps to Deploy:
1. Go to your Netlify dashboard
2. Navigate to Site Settings > Environment Variables
3. Add the `VITE_BACKEND_URL` variable with the value above
4. Deploy your React frontend

## Your Netlify Deployment
- **URL**: https://learnify3.netlify.app
- **Status**: ✅ Deployed and accessible

## Changes Made for Deployment

### 1. CORS Configuration (Server/server.js)
Updated CORS settings to allow requests from:
- Your Netlify domain: https://learnify3.netlify.app
- All Netlify domains (*.netlify.app)
- Local development (localhost, 127.0.0.1)
- Render domains (*.render.com)

### 2. API Configuration (client/src/context/AuthContext.jsx)
- Removed hardcoded localhost fallback for Google OAuth
- Uses environment variable `VITE_BACKEND_URL` for all API calls

### 3. Question Fetching (client/src/Components/MockTest/TestPage.jsx)
- Replaced hardcoded localhost URL with environment-based URL
- Added fallback to localhost for development

## Testing the Connection

### Backend Health Check
```bash
curl https://s89-sudipta-capstone-learnify-4.onrender.com/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-08-26T05:11:15.817Z",
  "uptime": 11.196782575
}
```

### API Endpoints
All API endpoints are available at:
- `https://s89-sudipta-capstone-learnify-4.onrender.com/api/*`

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure the Netlify domain is allowed in the CORS configuration
2. **Environment Variables**: Verify `VITE_BACKEND_URL` is set correctly in Netlify
3. **Backend Status**: Check if the Render service is running

### Testing Locally:
For local development, the app will fall back to:
- Backend: `http://localhost:5000` (when `VITE_BACKEND_URL` is not set)
- Frontend: `http://localhost:3000` (or your React dev server port)

## ✅ LATEST UPDATES (Current Session)

### Additional Files Modified
- ✅ `client/src/utils/api.js` - New centralized API utility for consistent backend URL handling
- ✅ `client/.env.production` - Production environment variables file
- ✅ `netlify.toml` - Added VITE_BACKEND_URL environment variable
- ✅ `Server/server.js` - Enhanced CORS configuration with better domain handling

### New Testing Commands

**Environment Variable Check (Netlify Console):**
```javascript
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
// Should output: https://s89-sudipta-capstone-learnify-4.onrender.com
```

**API Configuration Check:**
```javascript
console.log('Axios base URL:', axios.defaults.baseURL);
// Should output: https://s89-sudipta-capstone-learnify-4.onrender.com/api
```

**CORS Test from Netlify:**
```javascript
fetch('https://s89-sudipta-capstone-learnify-4.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('✅ CORS test successful:', data))
  .catch(error => console.error('❌ CORS test failed:', error));
```

### Deployment Checklist
- [ ] Backend deployed to Render with updated CORS
- [ ] Environment variables set in Netlify (VITE_BACKEND_URL)
- [ ] Frontend code pushed to trigger Netlify build
- [ ] Health endpoint accessible: `/health`
- [ ] CORS test passes from Netlify domain
- [ ] User authentication works (login/signup/OAuth)
- [ ] API calls successful (dashboard, questions, etc.)

## Support
If you encounter any issues:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Ensure both frontend and backend are properly deployed
4. Test API endpoints directly using curl or Postman
5. Check Render and Netlify deployment logs

## Quick Fix Commands

**If CORS still fails, update your Netlify domain in the backend:**
Replace `https://learnify3.netlify.app` with your actual Netlify URL in the CORS configuration.

**If environment variables don't load:**
1. Redeploy Netlify after adding variables
2. Clear browser cache
3. Check variable name starts with `VITE_`
