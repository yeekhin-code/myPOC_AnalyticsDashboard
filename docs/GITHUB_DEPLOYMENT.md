# GitHub Deployment Guide

Complete guide for hosting your Analytics Dashboard on GitHub and deploying to GitHub Pages.

## 📋 Prerequisites

- Git installed on your machine
- GitHub account
- Node.js 18+ installed locally (for testing)

## 🚀 Step-by-Step Deployment Instructions

### **Step 1: Create GitHub Repository**

1. **Go to GitHub**: Navigate to [https://github.com](https://github.com)
2. **Click "New Repository"** (green button or + icon in top right)
3. **Configure Repository:**
   - **Repository name**: `analytics-dashboard` (or your preferred name)
   - **Description**: "Interactive analytics and reporting dashboard with dynamic data visualization"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. **Click "Create repository"**

### **Step 2: Connect Local Repository to GitHub**

From your project directory, run these commands:

```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/analytics-dashboard.git

# Verify remote was added
git remote -v
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### **Step 3: Stage and Commit Your Files**

```bash
# Stage all project files
git add .

# Create initial commit
git commit -m "Initial commit: Analytics Dashboard with department filtering and bubble charts"
```

### **Step 4: Push to GitHub**

```bash
# Push to main branch
git push -u origin main
```

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a [Personal Access Token](https://github.com/settings/tokens), not your account password

### **Step 5: Enable GitHub Pages**

1. **Go to Repository Settings:**
   - Navigate to your repository on GitHub
   - Click **Settings** tab

2. **Configure GitHub Pages:**
   - Scroll down to **Pages** section (left sidebar)
   - Under **Source**, select: **GitHub Actions**
   - Click **Save**

3. **Enable Workflow Permissions:**
   - Go to **Settings** → **Actions** → **General**
   - Scroll to **Workflow permissions**
   - Select: **Read and write permissions**
   - Check: **Allow GitHub Actions to create and approve pull requests**
   - Click **Save**

### **Step 6: Trigger Deployment**

The deployment will automatically trigger when you push to main. You can also:

1. Go to **Actions** tab in your repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

### **Step 7: Configure Base Path (If Needed)**

If your repository name is NOT your GitHub username:

1. **Update vite.config.ts** (already configured):
   ```typescript
   base: process.env.VITE_BASE_PATH || '/'
   ```

2. **For GitHub Pages with repository name in URL:**
   ```bash
   # Your URL will be: https://username.github.io/analytics-dashboard/
   # Update package.json homepage (optional)
   ```

3. **Set environment variable in GitHub Actions** (if needed):
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository variable**
   - Name: `VITE_BASE_PATH`
   - Value: `/analytics-dashboard/` (with leading and trailing slashes)

### **Step 8: Access Your Deployed Application**

After deployment completes (3-5 minutes):

1. **Check Actions tab** for build status (should be green ✓)
2. **Access your site:**
   - **Standard URL**: `https://YOUR_USERNAME.github.io/REPO_NAME/`
   - **Example**: `https://johndoe.github.io/analytics-dashboard/`

3. **Find exact URL:**
   - Go to **Settings** → **Pages**
   - Your URL will be shown at the top

## 🔄 Updating Your Application

After making changes:

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: XYZ"

# Push to GitHub
git push origin main
```

The deployment workflow will automatically rebuild and deploy your site.

## 🛠️ Configuration Files Created

### `.github/workflows/deploy.yml`
Automated GitHub Actions workflow that:
- Triggers on push to main branch
- Installs dependencies
- Builds the application
- Deploys to GitHub Pages

### `.gitignore`
Excludes from version control:
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.claude/` - Claude Code files
- `.env*` - Environment variables
- `.logs/` - Log files

## 📊 Build Configuration

### Vite Base Path
The application uses environment-based base path:
```typescript
base: process.env.VITE_BASE_PATH || '/'
```

### Build Command
```bash
npm run build
```

Outputs to: `dist/` directory

## 🔐 Security Best Practices

1. **Never commit sensitive data:**
   - API keys
   - Authentication tokens
   - Database credentials

2. **Use environment variables:**
   - Store secrets in GitHub Secrets
   - Access via `import.meta.env.VITE_*`

3. **Review .gitignore:**
   - Ensure `.env` files are excluded
   - Verify no secrets in committed files

## 🐛 Troubleshooting

### **Deployment Failed**

**Check Actions tab:**
1. Click failed workflow
2. Review error logs
3. Common issues:
   - Build errors (check locally: `npm run build`)
   - Missing dependencies (run: `npm install`)
   - Node version mismatch (workflow uses Node 18)

### **404 Error After Deployment**

**Check base path:**
1. Verify `vite.config.ts` base path matches repository structure
2. For repo-based deployment: `base: '/repo-name/'`
3. For user/org pages: `base: '/'`

### **Blank Page After Deployment**

**Check browser console:**
1. Open Developer Tools (F12)
2. Look for 404 errors on assets
3. Verify base path is correct
4. Check `index.html` is in `dist/` folder

### **Changes Not Showing**

**Clear cache and verify:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Check GitHub Actions completed successfully
3. Verify commit was pushed: `git log`
4. Check GitHub Pages build time (can take 3-5 minutes)

## 📝 Additional Commands

### View Commit History
```bash
git log --oneline
```

### Check Current Branch
```bash
git branch
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create New Branch
```bash
git checkout -b feature/new-feature
```

### View Remote URLs
```bash
git remote -v
```

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file to `public/` directory:**
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

2. **Configure DNS:**
   - Add A records pointing to GitHub Pages IPs
   - Or CNAME record pointing to `username.github.io`

3. **Update GitHub Settings:**
   - Go to **Settings** → **Pages**
   - Enter custom domain
   - Enable HTTPS

## 📚 Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Git Documentation](https://git-scm.com/doc)

## ✅ Deployment Checklist

- [ ] Created GitHub repository
- [ ] Added remote origin
- [ ] Committed all files
- [ ] Pushed to GitHub
- [ ] Enabled GitHub Pages (Actions)
- [ ] Set workflow permissions
- [ ] Verified deployment successful
- [ ] Tested deployed application
- [ ] Configured custom domain (if applicable)
- [ ] Updated README with live URL

---

**Your dashboard is now live on GitHub Pages!** 🎉
