# Gym Tracker Backend

Backend API for Gym Tracker app with Garmin Connect and Whoop API integration.

## 🚀 Features

- **Garmin Connect API Integration**
  - OAuth 1.0a authentication
  - Sleep data sync
  - Heart rate metrics
  - Stress scores
  - Body Battery
  - Steps and activity

- **Whoop API Integration**
  - OAuth 2.0 authentication
  - Recovery scores
  - Strain scores
  - Sleep performance
  - HRV trends
  - Workout data

## 📋 Prerequisites

### 1. Garmin Developer Account
1. Go to https://developer.garmin.com
2. Create a developer account (free)
3. Create a new app:
   - App Name: "Gym Tracker"
   - App Type: "Web Application"
   - Callback URL: `https://your-netlify-url.netlify.app/garmin-callback`
4. Get your **Consumer Key** and **Consumer Secret**

### 2. Whoop Developer Account
1. Go to https://developer.whoop.com
2. Request API access
3. Once approved, create an app
4. Get your **Client ID** and **Client Secret**
5. Set redirect URI: `https://your-netlify-url.netlify.app/whoop-callback`

### 3. Netlify Account
1. Sign up at https://netlify.com (free)
2. Connect your GitHub account

## 🛠️ Deployment

### Step 1: Deploy to Netlify

**Option A: Deploy via Netlify CLI (Recommended)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
cd backend
npm install

# Deploy
netlify deploy --prod
```

**Option B: Deploy via Netlify Dashboard**

1. Push this `backend` folder to a GitHub repository
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Select your repository
6. Netlify will auto-detect settings
7. Click "Deploy"

### Step 2: Set Environment Variables

In Netlify Dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
GARMIN_CONSUMER_KEY = your_consumer_key
GARMIN_CONSUMER_SECRET = your_consumer_secret
GARMIN_CALLBACK_URL = https://your-site.netlify.app/garmin-callback

WHOOP_CLIENT_ID = your_client_id
WHOOP_CLIENT_SECRET = your_client_secret
WHOOP_REDIRECT_URI = https://your-site.netlify.app/whoop-callback
```

3. Click "Save"
4. Trigger a new deploy for changes to take effect

### Step 3: Update Frontend

Update your `gym-tracker.html` file with your Netlify backend URL:

```javascript
const API_BASE_URL = 'https://your-site.netlify.app/.netlify/functions';
```

## 📡 API Endpoints

### Garmin Endpoints

**POST** `/.netlify/functions/garmin-auth`
- Request OAuth token
- Exchange for access token

**POST** `/.netlify/functions/garmin-sync`
- Sync health data
- Requires: accessToken, accessSecret

### Whoop Endpoints

**POST** `/.netlify/functions/whoop-auth`
- Get authorization URL
- Exchange code for token
- Refresh access token

**POST** `/.netlify/functions/whoop-sync`
- Sync recovery, sleep, strain data
- Requires: accessToken

## 🔒 Security

- API secrets stored server-side only
- CORS enabled for your frontend domain
- OAuth tokens handled securely
- No credentials in browser code

## 🧪 Testing Locally

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run local dev server
netlify dev

# Your functions will be at:
# http://localhost:8888/.netlify/functions/garmin-auth
# http://localhost:8888/.netlify/functions/garmin-sync
# etc.
```

## 📊 Data Flow

```
Mobile App (PWA)
    ↓
Frontend calls backend API
    ↓
Backend Function (Netlify)
    ↓
Garmin/Whoop API
    ↓
Data returned to frontend
    ↓
Displayed in Health Dashboard
```

## 🐛 Troubleshooting

**Function not found:**
- Check Netlify deploy logs
- Verify functions are in `netlify/functions/` folder
- Ensure `netlify.toml` is correct

**OAuth errors:**
- Verify callback URLs match exactly
- Check environment variables are set
- Ensure API credentials are correct

**CORS errors:**
- Update `Access-Control-Allow-Origin` in function headers
- Set to your actual frontend URL in production

## 📈 Next Steps

1. ✅ Deploy backend to Netlify
2. ✅ Set environment variables
3. ✅ Get Garmin API credentials
4. ✅ Get Whoop API credentials (once approved)
5. ✅ Update frontend with backend URL
6. ✅ Test OAuth flows
7. ✅ Sync your data!

## 💰 Cost

**Netlify Free Tier includes:**
- 125k function requests/month
- 100 hours function runtime/month
- More than enough for personal use!

## 🆘 Support

If you run into issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test with Postman/curl first
4. Check API provider status pages

## 📝 License

Personal use only. API credentials are your own.
