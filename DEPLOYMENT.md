# 🚀 Deployment Guide

This guide covers deploying Hidden Gems to production, connecting to GitHub, and setting up Vercel deployment.

## 📋 Prerequisites

- GitHub account ([github.com](https://github.com))
- Vercel account ([vercel.com](https://vercel.com))
- Git installed locally
- Project repository initialized ✅

## 🔗 Step 1: Connect to GitHub

### 1.1 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `hidden-gems`
3. Description: "A community-driven travel discovery platform"
4. Choose **Public** (for visibility) or **Private** (for privacy)
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"

### 1.2 Push Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd "/Users/akshaykumar/Downloads/LATEST HIDDEN GEMS"

# Add remote origin (replace <your-username> with your GitHub username)
git remote add origin https://github.com/<your-username>/hidden-gems.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/akshaycode/hidden-gems.git
git branch -M main
git push -u origin main
```

### 1.3 Verify on GitHub

- Visit `https://github.com/<your-username>/hidden-gems`
- You should see all your files and commits ✅

## 🚀 Step 2: Deploy to Vercel

### 2.1 Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (authorize Vercel)
3. Click "Add New..."
4. Select "Project"
5. Select "Import Git Repository"
6. Search and select your `hidden-gems` repository
7. Click "Import"

### 2.2 Configure Project Settings

**Project Name:** `hidden-gems` (auto-filled)

**Build & Output Settings:**
- Framework Preset: `Next.js` (auto-detected)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

**Environment Variables:**

Add these environment variables:

```
NEXTAUTH_SECRET = <generate-a-random-string>
NEXTAUTH_URL = https://<your-project>.vercel.app
```

To generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (usually 2-3 minutes)
3. You'll get a deployment URL: `https://<your-project>.vercel.app`

### 2.4 View Deployment Link in GitHub

- Go to your GitHub repository
- You'll see a "Deployments" section in the right sidebar
- Click to see the Vercel deployment link
- The link will auto-update with each push to `main`

## 🔄 Step 3: Enable Automatic Deployments

### 3.1 Production Deployment (Main Branch)

Every push to `main` will automatically deploy to production:

```bash
git push origin main
```

Check deployment status at: `vercel.com/dashboard`

### 3.2 Preview Deployments (Pull Requests)

Every pull request gets a preview deployment:

1. Create a branch: `git checkout -b feature/new-feature`
2. Make changes and commit
3. Push branch: `git push origin feature/new-feature`
4. Open a Pull Request on GitHub
5. Vercel automatically creates a preview deployment
6. Preview link appears in the PR comments

## 🔒 Step 4: Set Up Environment Variables

### 4.1 Production (.env.production)

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   NEXTAUTH_SECRET = (copy your generated secret)
   NEXTAUTH_URL = https://<your-project>.vercel.app
   ```

### 4.2 Preview & Development

These environments inherit from production variables by default.

## 🧪 Step 5: CI/CD Pipeline

Your `.github/workflows/ci-cd.yml` file enables:

- Automated testing on every push
- Linting checks
- Build verification
- Automatic deployment to Vercel (when tests pass)

### Setup GitHub Secrets (for CI/CD)

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   ```
   VERCEL_TOKEN = (from vercel.com/account/tokens)
   VERCEL_ORG_ID = (from Vercel account settings)
   VERCEL_PROJECT_ID = (from Vercel project settings)
   ```

## 📊 Monitoring & Analytics

### Vercel Analytics

1. In Vercel dashboard, go to Analytics
2. View real-time traffic and performance metrics
3. Monitor deployment history and rollbacks

### Enable in Code

Analytics are already configured in `app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/next"
// Analytics automatically tracks page views and interactions
```

## 🔄 Continuous Integration

### GitHub Actions

The CI/CD pipeline runs on every push:

1. **Install Dependencies** - `npm ci`
2. **Lint** - `npm run lint`
3. **Test** - `npm run test`
4. **Build** - `npm run build`
5. **Deploy** - Deploy to Vercel (if main branch and all checks pass)

### View Workflow Status

- Go to GitHub repo → Actions
- See all workflow runs with detailed logs
- Failed runs show error details

## 🌐 Custom Domain

### Add Custom Domain to Vercel

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `hiddengems.com`)
3. Update DNS records at your domain registrar
4. Vercel provides DNS instructions
5. Once verified, your app is live at your custom domain

## 📱 Mobile View

Test your deployment on mobile:
- Visit `https://<your-project>.vercel.app` on your phone
- The responsive design adapts to all screen sizes

## 🔐 Production Checklist

Before going live:

- [ ] Environment variables set in Vercel
- [ ] Authentication working with correct credentials
- [ ] All tests passing locally: `npm run test`
- [ ] Build successful locally: `npm run build`
- [ ] No console errors in production
- [ ] Analytics enabled and tracking
- [ ] Error handling implemented
- [ ] Security headers configured
- [ ] SSL/HTTPS enabled (automatic with Vercel)
- [ ] Custom domain configured (if applicable)

## 🚨 Troubleshooting

### Deployment Fails

1. Check Vercel logs: `vercel.com/dashboard`
2. Run locally: `npm run build`
3. Check CI/CD logs on GitHub
4. Review error messages for specific issues

### Environment Variables Not Working

1. Verify variables are set in Vercel dashboard
2. Redeploy after adding/changing variables
3. Check variable names are exact matches

### Authentication Not Working

1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your domain
3. Test with demo credentials: `demo@example.com` / `demo123`

### Performance Issues

1. Check Vercel Analytics for bottlenecks
2. Review Next.js build optimizations
3. Optimize images using Next.js Image component
4. Enable caching headers

## 📈 Scaling

### When You Need More Power

1. **Upgrade Vercel plan** - Serverless Functions quotas increase
2. **Add database** - PostgreSQL/MongoDB for persistent data
3. **Caching layer** - Redis for performance
4. **CDN optimization** - Already included with Vercel
5. **Load balancing** - Automatic with Vercel

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Guide](https://docs.github.com/en/actions)
- [NextAuth.js Documentation](https://next-auth.js.org)

## ✨ What's Next?

After deployment, consider:

1. **Database Integration** - Replace localStorage with PostgreSQL
2. **User Profiles** - Allow users to create accounts and manage destinations
3. **Real-time Updates** - WebSockets for live destination additions
4. **Advanced Search** - Full-text search and filtering
5. **Social Features** - Comments, ratings, and sharing
6. **Mobile App** - React Native version
7. **API** - Public REST/GraphQL API

---

**Congratulations! Your Hidden Gems app is now live on the internet! 🎉**

For questions or issues, check the CONTRIBUTING.md file or open an issue on GitHub.
