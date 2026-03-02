# Quick Setup Checklist

Follow this checklist to get your chart evaluation system live in 15 minutes:

## ✅ Phase 1: Repository Setup (2 minutes)
- [ ] Create new GitHub repository
- [ ] Push your code to GitHub
- [ ] Enable GitHub Pages in repository settings
- [ ] Note your GitHub Pages URL: `https://yourusername.github.io/repository-name`

## ✅ Phase 2: Backend Setup (5 minutes)
- [ ] Create account at [netlify.com](https://netlify.com)
- [ ] Connect your GitHub repository
- [ ] Confirm build settings (should auto-detect)
- [ ] Wait for deployment to complete
- [ ] Note your Netlify URL: `https://your-site-name.netlify.app`

## ✅ Phase 3: Discord Notifications (3 minutes)
- [ ] Create Discord server (or use existing)
- [ ] Create #evaluation-submissions channel
- [ ] Create webhook in channel settings
- [ ] Copy webhook URL
- [ ] Add webhook URL to Netlify environment variables

## ✅ Phase 4: Update Code (2 minutes)
- [ ] Edit `simple_evaluation.js` line ~120
- [ ] Replace `your-netlify-site` with your actual Netlify site name
- [ ] Commit and push changes to GitHub
- [ ] Wait for Netlify to auto-deploy

## ✅ Phase 5: Test Everything (3 minutes)
- [ ] Visit your GitHub Pages URL
- [ ] Navigate through a few questions
- [ ] Fill out an evaluation form
- [ ] Click "Submit Evaluation"
- [ ] Check Discord for submission message
- [ ] Verify data looks correct

## 🚀 You're Live!

Your evaluation system is now:
- ✅ Hosted on GitHub Pages (free)
- ✅ Processing submissions via Netlify Functions (free)
- ✅ Sending notifications to Discord (free)
- ✅ Automatically backing up to localStorage
- ✅ Collecting structured JSON data

## 📊 Next Steps

1. **Share the GitHub Pages URL** with your participants
2. **Monitor Discord** for submissions
3. **Export data** periodically from Discord or localStorage
4. **Analyze results** using the collected JSON data

## 🆘 If Something Doesn't Work

1. **Check browser console** for error messages
2. **Verify Netlify deployment** succeeded
3. **Test Discord webhook** by posting a test message
4. **Check GitHub Pages** deployment status

## 📧 Data Collection Options

Choose one or more:
- **Discord** (recommended) - Real-time notifications
- **Email** - Add EmailJS integration
- **Google Sheets** - Direct spreadsheet updates
- **JSON Export** - Download from localStorage

## 🔒 Privacy Notes

- No personal information is collected
- Only evaluation responses and timestamps
- Data stays in participant's browser until submitted
- You control where submitted data goes

---

**Need help?** Create an issue in your GitHub repository with any error messages.