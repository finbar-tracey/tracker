# 🚀 QUICK START - Deploy Your Backend in 10 Minutes

## What You're Deploying

A serverless backend that connects Garmin and Whoop to your gym tracker app.

---

## ⚡ Fastest Path: Netlify Drop (No GitHub needed!)

### Step 1: Prepare Backend (2 min)

1. Download the entire `backend` folder I created
2. Zip it up into `backend.zip`

### Step 2: Deploy to Netlify (3 min)

1. Go to https://app.netlify.com
2. Sign up / Log in (free account)
3. Click "Add new site" → "Deploy manually"
4. Drag and drop your `backend.zip` folder
5. Wait 30 seconds for deployment
6. **Copy your site URL** (looks like: `https://random-name-123.netlify.app`)

### Step 3: Add API Credentials (3 min)

1. In Netlify dashboard, click "Site settings"
2. Go to "Environment variables"
3. Click "Add a variable"
4. Add these (get credentials first - see below):

```
GARMIN_CONSUMER_KEY = [from Garmin developer portal]
GARMIN_CONSUMER_SECRET = [from Garmin developer portal]
GARMIN_CALLBACK_URL = https://your-site-url.netlify.app/garmin-callback

WHOOP_CLIENT_ID = [from Whoop developer portal]
WHOOP_CLIENT_SECRET = [from Whoop developer portal]
WHOOP_REDIRECT_URI = https://your-site-url.netlify.app/whoop-callback
```

5. Click "Save"
6. Go to "Deploys" → Click "Trigger deploy" → "Clear cache and deploy"

### Step 4: Update Your Frontend (2 min)

Edit your `gym-tracker.html` and add this near the top of the `<script>` section:

```javascript
const API_BASE_URL = 'https://your-actual-site-url.netlify.app/.netlify/functions';
```

Re-upload to your phone and you're done!

---

## 🔑 Getting API Credentials

### Garmin (5 minutes)

1. Go to https://developer.garmin.com
2. Sign in / Create account
3. Go to "Applications"
4. Click "Create Application"
5. Fill in:
   - Name: "Gym Tracker"
   - Type: "Web"
   - Callback URL: `https://your-netlify-url.netlify.app/garmin-callback`
6. Submit
7. **Copy your Consumer Key and Consumer Secret**

### Whoop (Wait 1-2 days for approval)

1. Go to https://developer.whoop.com
2. Click "Request Access"
3. Fill out form:
   - App name: "Gym Tracker"
   - Description: "Personal fitness tracking integration"
   - Use case: "Personal use"
4. Submit and wait for approval email
5. Once approved, create app and get Client ID & Secret

---

## ✅ Testing

Once deployed:

1. Open your app on phone
2. Go to Health tab
3. Tap "Connect Garmin"
4. You'll be redirected to Garmin login
5. Authorize the app
6. Data syncs automatically!

---

## 🎯 What Happens Next

**Daily automatic sync:**
- Your app calls your backend
- Backend calls Garmin/Whoop APIs
- Data populates your Health dashboard
- See readiness score, sleep, HRV, etc.

**No manual entry needed!**

---

## 💡 Pro Tips

- Garmin approval is instant
- Whoop takes 1-2 days
- Start with Garmin while waiting for Whoop
- Backend is FREE on Netlify (125k requests/month)
- Everything runs automatically

---

## 🐛 Issues?

**Backend not working:**
- Check Netlify function logs
- Verify environment variables are saved
- Make sure you triggered a new deploy after adding variables

**OAuth failing:**
- Callback URLs must match EXACTLY
- Include https://
- No trailing slashes

**Still stuck:**
- Check README.md for detailed troubleshooting
- Test endpoints with curl/Postman first

---

**That's it! Your backend is live and ready to sync wearable data.** 🎉
