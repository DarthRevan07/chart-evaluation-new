# Quick Setup Checklist

Follow this checklist to get your chart evaluation system live in 15 minutes:

## ✅ Phase 1: Repository Setup (2 minutes)
- [ ] Create new GitHub repository
- [ ] Push your code to GitHub
- [ ] Enable GitHub Pages in repository settings
- [ ] Note your GitHub Pages URL: `https://yourusername.github.io/repository-name`

## ✅ Phase 2: Google Apps Script Setup (5 minutes)
- [ ] Open your Google Sheet for responses
- [ ] Open Extensions → Apps Script
- [ ] Paste code from `google_apps_script.gs`
- [ ] Deploy as Web App (access: anyone with link)
- [ ] Copy the Web App URL

## ✅ Phase 3: Update Endpoint in UI (2 minutes)
- [ ] Edit `simple_evaluation_slider.js`
- [ ] Update `GOOGLE_SCRIPT_URL` with your deployed Apps Script URL
- [ ] Commit and push changes to GitHub
- [ ] Wait for GitHub Pages to update

## ✅ Phase 4: Test Everything (3 minutes)
- [ ] Visit your GitHub Pages URL
- [ ] Navigate through a few questions
- [ ] Fill out an evaluation form
- [ ] Click "Submit All"
- [ ] Verify new rows appear in your Google Sheet

## 🚀 You're Live!

Your evaluation system is now:
- ✅ Hosted on GitHub Pages (free)
- ✅ Processing submissions via Google Apps Script + Google Sheets
- ✅ Automatically backing up to localStorage
- ✅ Collecting structured JSON data

## 📊 Next Steps

1. **Share the GitHub Pages URL** with your participants
2. **Monitor Google Sheet** for submissions
3. **Export data** periodically from Google Sheets or localStorage
4. **Analyze results** using the collected JSON data

## 🆘 If Something Doesn't Work

1. **Check browser console** for error messages
2. **Verify Apps Script Web App deployment** is active
3. **Confirm `GOOGLE_SCRIPT_URL`** in `simple_evaluation_slider.js` is correct
4. **Check GitHub Pages** deployment status

## 📧 Data Collection Options

Current setup:
- **Google Sheets** - Primary submission target
- **JSON Export** - Local backup from browser storage

## 🔒 Privacy Notes

- No personal information is collected
- Only evaluation responses and timestamps
- Data stays in participant's browser until submitted
- You control where submitted data goes

---

**Need help?** Create an issue in your GitHub repository with any error messages.