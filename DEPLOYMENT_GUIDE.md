# Chart Evaluation System - Deployment Guide

This guide provides complete instructions for hosting your chart evaluation system and collecting submission data.

## 🛠 Setup Options (Easiest to Advanced)

## Option 1: GitHub Pages + Netlify Functions (RECOMMENDED - FREE)

### Why Choose This?
- ✅ Free hosting for both frontend and backend
- ✅ Automatic deployment from GitHub
- ✅ Built-in analytics and monitoring
- ✅ Easy to set up

### Step 1: Repository Setup

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Chart evaluation system"
   git remote add origin https://github.com/yourusername/chart-evaluation.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/ (root)`
   - Site URL: `https://yourusername.github.io/chart-evaluation`

### Step 2: Netlify Setup

1. **Create Netlify Account:** [netlify.com](https://netlify.com)
2. **Connect Repository:** "New site from Git" → Choose your GitHub repo
3. **Configure Build Settings:**
   - Build command: (leave empty)
   - Publish directory: `/`
   - Functions directory: `netlify/functions`

### Step 3: Environment Variables (Optional but Recommended)

In Netlify dashboard → Site settings → Environment variables, add:

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
WEBHOOK_URL=https://your-data-collection-service.com/webhook
```

### Step 4: Update API Endpoint

In your deployment, replace `your-netlify-site` with your actual Netlify site name:
```javascript
// In simple_evaluation.js, line ~120
: 'https://your-actual-netlify-site.netlify.app/.netlify/functions/submit-evaluation'
```

### Step 5: Data Collection Methods

#### Method A: Discord Webhook (Simple)
1. Create Discord server → Create webhook in desired channel
2. Copy webhook URL to Netlify environment variables
3. Submissions will appear as messages in Discord

#### Method B: Email Notifications
Add to your Netlify function:
```javascript
// Using EmailJS or similar service
const emailData = {
  to_email: "your-email@example.com",
  subject: "New Chart Evaluation",
  message: JSON.stringify(data, null, 2)
};
```

#### Method C: Google Sheets Integration
Add to your Netlify function:
```javascript
// Using Google Sheets API
const sheetsResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets/{sheetId}/values/{range}', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: JSON.stringify({ values: [[data.timestamp, data.pairId, ...]] })
});
```

---

## Option 2: Vercel (Alternative to Netlify)

### Setup Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Create API Function:**
   ```bash
   mkdir api
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Create API Function:

**File: `api/submit-evaluation.js`**
```javascript
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      console.log('Evaluation received:', data);
      
      // Your data processing logic here
      
      res.status(200).json({ success: true, message: 'Evaluation submitted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process submission' });
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
```

---

## Option 3: Simple Form Services (No Code Backend)

### FormSpree (Easiest - No Backend Code)

1. **Sign up:** [formspree.io](https://formspree.io)
2. **Get endpoint:** `https://formspree.io/f/your-form-id`
3. **Update submission function:**

```javascript
// Replace the fetch call in submitSimpleEvaluation()
const response = await fetch('https://formspree.io/f/your-form-id', {
  method: 'POST',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify(submitData)
});
```

### Other Form Services:
- **Getform.io** - Similar to FormSpree
- **Basin.com** - Form backend service
- **Typeform** - More advanced form handling

---

## Option 4: Self-Hosted Backend

### Simple Node.js Server

**File: `server.js`**
```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/submit-evaluation', (req, res) => {
  const data = req.body;
  const filename = `evaluations/eval_${Date.now()}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log('Evaluation saved:', filename);
  
  res.json({ success: true, message: 'Evaluation submitted' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Deploy to:**
- **Railway.app** (easy deployment)
- **Render.com** (free tier)
- **Heroku** (with database addon)

---

## 📊 Data Collection & Analysis

### View Collected Data

#### Option 1: Discord Channel
- All submissions appear as formatted messages
- Easy to review and export

#### Option 2: Google Sheets
- Real-time updates
- Easy analysis and charts
- Shareable with team

#### Option 3: Download JSON Files
- Direct file downloads from Netlify Functions
- Process with any analytics tool

### Export Functionality

The system includes built-in export:
```javascript
// Users can export their local data
exportSimpleEvaluations(); // Downloads JSON file
```

### Analytics Integration

Add these to your HTML for usage analytics:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>

<!-- Plausible Analytics (Privacy-focused) -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/plausible.js"></script>
```

---

## 🚀 Quick Start (Recommended Path)

1. **Fork this repository** or create new one with your files
2. **Enable GitHub Pages** (takes 2 minutes)
3. **Create Netlify account** and connect repository (takes 5 minutes)
4. **Set up Discord webhook** for notifications (takes 3 minutes)
5. **Update API endpoint** in code with your Netlify site URL
6. **Test submission** - you should see data in Discord

**Total setup time: ~15 minutes**

---

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors:** Make sure your backend includes proper CORS headers
2. **API Endpoint 404:** Check the function deployment in Netlify/Vercel dashboard
3. **GitHub Pages Not Loading Files:** Ensure files are in root directory or properly configured
4. **Form Not Submitting:** Check browser console for JavaScript errors

### Debug Mode:
Add this to your console to test submissions:
```javascript
// Test the submission system
window.forceReloadPair(); // Reload current data
```

### Contact for Support:
If you encounter issues, create a GitHub issue with:
- Error messages from browser console
- Your hosting setup (GitHub Pages, Netlify, etc.)
- Example of data that's not working

---

## 📱 Mobile Optimization

Your current design is mobile-responsive. For better mobile experience:

1. **Test on devices:** iPhone, Android, tablets
2. **Check touch targets:** Buttons and checkboxes should be at least 44px
3. **Verify scroll behavior:** Sticky header should work properly

---

## 🔒 Privacy & Security

- **No personal identifiers** collected by default
- **Session IDs** are randomly generated
- **Local storage** keeps data on user's device
- **HTTPS required** for GitHub Pages and Netlify

### GDPR Compliance:
Add privacy notice if collecting personal data:
```html
<div class="privacy-notice">
  By submitting this evaluation, you consent to anonymous data collection for research purposes.
</div>
```