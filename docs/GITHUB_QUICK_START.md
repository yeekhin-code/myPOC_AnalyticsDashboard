# GitHub Quick Start Guide

Quick reference for hosting your Analytics Dashboard on GitHub.

## 🚀 One-Time Setup

### 1. Create GitHub Repository

Go to [GitHub](https://github.com/new) and create a new repository:
- Name: `analytics-dashboard` (or your choice)
- Visibility: Public or Private
- **DO NOT** initialize with README

### 2. Link Local Repository to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/analytics-dashboard.git
```

### 3. Initial Push

```bash
# Stage all files
git add .

# Create commit
git commit -m "Initial commit: Analytics Dashboard"

# Push to GitHub
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select: **GitHub Actions**
4. Go to **Settings** → **Actions** → **General**
5. Enable **Read and write permissions**
6. Click **Save**

### 5. Wait for Deployment

- Go to **Actions** tab
- Wait for green checkmark (3-5 minutes)
- Your site is live at: `https://YOUR_USERNAME.github.io/analytics-dashboard/`

## 🔄 Daily Workflow

### Making Changes

```bash
# 1. Make your code changes

# 2. Stage changes
git add .

# 3. Commit with message
git commit -m "Description of changes"

# 4. Push to GitHub (triggers auto-deployment)
git push origin main
```

### Check Status

```bash
# See what files changed
git status

# View commit history
git log --oneline

# See what changed in files
git diff
```

## 📝 Common Git Commands

| Command | Description |
|---------|-------------|
| `git status` | Check current status |
| `git add .` | Stage all changes |
| `git add file.txt` | Stage specific file |
| `git commit -m "message"` | Commit changes |
| `git push origin main` | Push to GitHub |
| `git pull origin main` | Pull latest changes |
| `git log` | View commit history |
| `git diff` | See changes |

## 🔐 Authentication

### Using Personal Access Token

If prompted for password, use a Personal Access Token:

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy token
5. Use token as password when pushing

### Using SSH (Recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH Keys → New SSH key
```

Then use SSH URL:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/analytics-dashboard.git
```

## 🌐 Access Your Live Site

Your deployed URL format:
- **Repository**: `https://github.com/YOUR_USERNAME/analytics-dashboard`
- **Live Site**: `https://YOUR_USERNAME.github.io/analytics-dashboard/`

Find exact URL:
- Go to **Settings** → **Pages**
- URL shown at top after deployment

## 🐛 Quick Troubleshooting

### Deployment Failed
```bash
# Check build locally
npm run build

# If successful, push again
git push origin main
```

### 404 Error
- Check **Actions** tab for deployment status
- Wait 5 minutes for GitHub Pages to update
- Hard refresh: `Ctrl + Shift + R`

### Blank Page
- Open browser DevTools (F12)
- Check Console for errors
- Verify base path in `vite.config.ts`

### Changes Not Showing
```bash
# Verify commit was pushed
git log

# Check GitHub Actions status
# Go to repository → Actions tab
```

## 📊 Project Files

**Configuration Files:**
- `.github/workflows/deploy.yml` - Deployment automation
- `.gitignore` - Files to exclude from Git
- `vite.config.ts` - Vite configuration

**Important Directories:**
- `src/` - Source code
- `dist/` - Build output (auto-generated, not committed)
- `docs/` - Documentation

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Enable GitHub Pages
3. ✅ Wait for deployment
4. ✅ Visit your live site
5. ✅ Share the URL!

## 📚 Full Documentation

For detailed instructions, see: [GitHub Deployment Guide](GITHUB_DEPLOYMENT.md)

---

**That's it! Your dashboard is live on GitHub Pages.** 🎉
