# 🚀 Complete Setup Guide - Hidden Gems Travel Discovery Platform

## Repository: https://github.com/ak-8225/HIDDEN_GEMS_NEW

Welcome! This guide will walk you through every step needed to get your Hidden Gems application running, deployed, and connected to GitHub with Vercel.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Local Development](#local-development)
3. [Connecting to GitHub](#connecting-to-github)
4. [Deploy to Vercel](#deploy-to-vercel)
5. [Post-Deployment](#post-deployment)
6. [Running Tests](#running-tests)
7. [Authentication Setup](#authentication-setup)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Initial Setup

### Step 1: Clone the Repository (If on a new machine)

```bash
git clone https://github.com/ak-8225/HIDDEN_GEMS_NEW.git
cd HIDDEN_GEMS_NEW
```

### Step 2: Install Dependencies

```bash
npm install
```

**What this does:**
- Installs all project dependencies from `package.json`
- Creates `node_modules` folder
- Generates `package-lock.json`

### Step 3: Create Environment Variables

The `.env.local` file is already created with demo credentials, but verify it exists:

```bash
cat .env.local
```

You should see:
```
NEXTAUTH_SECRET=hidden-gems-secret-key-for-development-only
NEXTAUTH_URL=http://localhost:3000
```

---

## 🏃 Local Development

### Step 4: Start the Development Server

```bash
npm run dev
```

You should see:
```
✓ Next.js 16.2.4 (Turbopack)
✓ Ready in 629ms
- Local:         http://localhost:3000
- Network:       http://192.168.1.5:3000
```

### Step 5: Open in Browser

Visit: **http://localhost:3000**

### Step 6: Test the Application

1. **Explore Page** - Click "Explore Hidden Gems" to see 6 pre-loaded destinations
2. **Add Destination** - Click "Share a Destination" to add a new travel spot
3. **View Details** - Click on any destination card to see full details
4. **Dark Mode** - Look for theme toggle in header (if implemented)

### Step 7: Understand the Project Structure

```
hidden-gems/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Home/landing page
│   ├── layout.tsx               # Root layout
│   ├── explore/                 # Browse destinations
│   ├── add-destination/         # Add new destination form
│   ├── destination/[id]/        # Single destination view
│   ├── login/                   # Login page
│   └── api/
│       └── auth/                # NextAuth API routes
├── components/                  # React components
│   ├── header.tsx              # Navigation header
│   ├── footer.tsx              # Footer
│   └── ui/                     # 40+ Radix UI components
├── lib/
│   ├── destinations.ts         # Destination data logic
│   └── utils.ts                # Utility functions
├── hooks/                       # Custom React hooks
├── public/                      # Static images and assets
├── styles/                      # Global CSS
├── .github/workflows/           # CI/CD configuration
├── __tests__/                   # Unit tests
├── jest.config.ts              # Jest testing config
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

---

## 🔗 Connecting to GitHub

Your repository is already created at: **https://github.com/ak-8225/HIDDEN_GEMS_NEW**

### Step 8: Add GitHub Remote

Check if remote is already set:

```bash
git remote -v
```

If not set, add it:

```bash
git remote add origin https://github.com/ak-8225/HIDDEN_GEMS_NEW.git
```

### Step 9: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

### Step 10: Verify on GitHub

1. Visit: https://github.com/ak-8225/HIDDEN_GEMS_NEW
2. You should see your code is now on GitHub ✅
3. Check commits tab to see all your commits

### Step 11: Create a .env.example file (Already Done)

This file shows what environment variables are needed without exposing secrets. Never commit `.env.local`!

---

## 🚀 Deploy to Vercel

### Step 12: Connect GitHub to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** (if first time)
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### Step 13: Create New Project on Vercel

1. Click **"New Project"** on Vercel dashboard
2. Find and click **"HIDDEN_GEMS_NEW"** repository
3. Click **"Import"**

### Step 14: Configure Project Settings

1. **Project Name:** `hidden-gems` (or your preferred name)
2. **Framework Preset:** Next.js (should auto-detect)
3. **Root Directory:** `./` (default)
4. **Environment Variables:** Add these:
   ```
   NEXTAUTH_SECRET = (generate a secure key, see Step 15)
   NEXTAUTH_URL = https://your-project-name.vercel.app
   ```

### Step 15: Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in Vercel.

### Step 16: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (usually 2-5 minutes)
3. You'll see: **"Congratulations! Your project has been deployed."**
4. Click **"Visit"** to see your live site

### Step 17: Verify Deployment

Your site is now live at: **https://hidden-gems-[random].vercel.app**

You should see:
- ✅ Landing page loads
- ✅ Navigation works
- ✅ Explore page shows 6 destinations
- ✅ Add destination form works
- ✅ Images load correctly

---

## 📝 Post-Deployment

### Step 18: Add Deployment URL to GitHub

1. Go to your GitHub repo: https://github.com/ak-8225/HIDDEN_GEMS_NEW
2. Click **"Settings"**
3. Scroll down to **"About"**
4. Click the ⚙️ gear icon
5. Paste your Vercel URL in **"Website"**
6. Click **"Save"**

### Step 19: Enable Automatic Deployments (Optional)

Your repo is already configured for CI/CD:

- **File:** `.github/workflows/ci-cd.yml`
- **What it does:**
  - Runs tests on every push
  - Runs linter on every push
  - Auto-deploys to Vercel on main branch push

You can see actions here: https://github.com/ak-8225/HIDDEN_GEMS_NEW/actions

### Step 20: Monitor Deployments

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click your **"hidden-gems"** project
3. You'll see:
   - Deployment history
   - Build logs
   - Analytics
   - Environment variables

---

## 🧪 Running Tests

### Step 21: Run Tests Locally

```bash
npm test
```

This will run Jest tests for the destinations library.

### Step 22: Run Tests in Watch Mode

```bash
npm run test:watch
```

Perfect for development - tests re-run as you change files.

### Step 23: Generate Coverage Report

```bash
npm run test:coverage
```

Shows how much of your code is covered by tests.

### Step 24: Add Tests to Your Workflow

Tests automatically run on GitHub Actions before deployment:
- Check `.github/workflows/ci-cd.yml`
- Tests must pass before Vercel deployment

---

## 🔐 Authentication Setup

### Step 25: Test Demo Login

**Demo Credentials:**
- **Email:** `demo@example.com`
- **Password:** `demo123`

To test login (once implemented on login page):
1. Go to `/login`
2. Enter demo credentials
3. You'll be authenticated

### Step 26: Understand Authentication Flow

The auth system is configured in:
- **File:** `app/api/auth/config.ts`
- **Currently:** Uses demo user with Credentials provider
- **To scale:** Replace with database + OAuth providers

### Step 27: Add More Auth Providers (Optional)

To add Google, GitHub, or other providers:

1. Install provider:
```bash
npm install @auth/provider-name
```

2. Add to `app/api/auth/config.ts`:
```typescript
import GoogleProvider from "next-auth/providers/google"

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
]
```

3. Add env vars to Vercel

---

## 🚨 Troubleshooting

### Issue: Port 3000 Already in Use

**Solution:**
```bash
npm run dev -- -p 3001
```

### Issue: Dependencies Not Installing

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors

**Solution:**
```bash
npm run lint
npm run build
```

### Issue: Build Failing on Vercel

**Check:**
1. View build logs on Vercel dashboard
2. Ensure `.env.local` variables are set in Vercel
3. Check GitHub Actions: https://github.com/ak-8225/HIDDEN_GEMS_NEW/actions

### Issue: NextAuth Not Working

**Verify:**
1. `NEXTAUTH_SECRET` is set in `.env.local` and Vercel
2. `NEXTAUTH_URL` matches your site URL
3. Clear browser cookies and try again

### Issue: Images Not Loading

**Check:**
1. Images are in `/public` folder
2. Use relative paths: `/image-name.jpg`
3. Image names match exactly (case-sensitive on Linux)

---

## 📊 Next Steps & Enhancements

### Short Term (Week 1-2):
- [ ] Test all features thoroughly
- [ ] Customize demo data
- [ ] Update contact email
- [ ] Add your own brand colors

### Medium Term (Month 1):
- [ ] Connect to database (MongoDB/PostgreSQL)
- [ ] Implement real user authentication
- [ ] Add social features (comments, ratings)
- [ ] Setup email notifications

### Long Term (Month 2+):
- [ ] Mobile app (React Native)
- [ ] Advanced search & filtering
- [ ] User dashboard & profiles
- [ ] Analytics & insights
- [ ] API documentation

---

## 🎯 Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm start                  # Start production server

# Testing
npm test                   # Run tests once
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Code Quality
npm run lint              # Run ESLint

# Git
git status                # Check changes
git add .                 # Stage all changes
git commit -m "message"   # Commit
git push                  # Push to GitHub
```

### Important URLs

| Purpose | URL |
|---------|-----|
| GitHub Repo | https://github.com/ak-8225/HIDDEN_GEMS_NEW |
| Live Site | https://your-domain.vercel.app |
| Vercel Dashboard | https://vercel.com/dashboard |
| Local Dev | http://localhost:3000 |
| Admin Email | akshay@example.com |

---

## 📞 Support

**If you get stuck:**

1. **Check this guide** - Most issues are covered above
2. **Check GitHub Issues** - Look for similar problems
3. **Check Vercel Docs** - https://vercel.com/docs
4. **Check Next.js Docs** - https://nextjs.org/docs

---

## ✨ Congratulations! 

You now have:
- ✅ A professional Next.js application
- ✅ Git repository on GitHub
- ✅ Live deployment on Vercel
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Authentication system
- ✅ Automated testing
- ✅ Professional README & documentation

**Your app is live and ready for the world! 🌍**

---

**Last Updated:** April 26, 2026  
**Version:** 0.1.0  
**Maintainer:** Akshay Kumar
