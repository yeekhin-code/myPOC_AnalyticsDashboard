# Pre-Deployment Checklist

Complete this checklist before pushing to GitHub to ensure a smooth deployment.

## ✅ Code Quality Checks

### Build Verification
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run build` successfully without errors
- [ ] Check that `dist/` folder is created with all assets
- [ ] Verify no TypeScript errors: `npx tsc --noEmit`

### Local Testing
- [ ] Test application locally: `npm run dev`
- [ ] Test all features work correctly:
  - [ ] Add/edit/delete data endpoints
  - [ ] Toggle endpoints on/off
  - [ ] Select different departments
  - [ ] Change time range filters
  - [ ] View different chart types (bar, line, pie, area, bubble, table)
  - [ ] Verify bubble chart labels appear
  - [ ] Test single chart full-width display
  - [ ] Test multiple charts grid layout
- [ ] Test on different screen sizes (responsive design)
- [ ] Check browser console for errors (F12)

## 🔐 Security Checks

### Sensitive Data
- [ ] No API keys in code (use environment variables)
- [ ] No passwords or tokens committed
- [ ] `.env` files are in `.gitignore`
- [ ] Check `.gitignore` excludes:
  - [ ] `node_modules/`
  - [ ] `dist/`
  - [ ] `.env*`
  - [ ] `.claude/`
  - [ ] `.logs/`

### Code Review
- [ ] Remove any `console.log()` statements (or keep intentional ones)
- [ ] Remove commented-out code
- [ ] Remove debug code
- [ ] Check for TODO comments

## 📝 Documentation Checks

### README.md
- [ ] Project description is accurate
- [ ] Installation instructions are clear
- [ ] Running instructions are correct
- [ ] Features list is up-to-date
- [ ] Technology stack is listed
- [ ] Deployment section is included

### Additional Docs
- [ ] GitHub deployment guide exists
- [ ] Quick start guide exists
- [ ] All internal links work
- [ ] Code examples are correct

## ⚙️ Configuration Checks

### Vite Configuration
- [ ] `vite.config.ts` has correct base path setting
- [ ] Build output directory is `dist/`
- [ ] Sourcemaps are enabled
- [ ] Host is set to `0.0.0.0`

### GitHub Actions
- [ ] `.github/workflows/deploy.yml` exists
- [ ] Workflow triggers on push to main
- [ ] Node version is specified (18)
- [ ] Build and deploy steps are correct

### Package.json
- [ ] `name` field is set
- [ ] `version` is correct
- [ ] `scripts` are defined:
  - [ ] `dev`
  - [ ] `build`
  - [ ] `preview`
- [ ] All dependencies are listed
- [ ] No unused dependencies

## 🌐 Deployment Configuration

### Base Path
- [ ] Determine your GitHub Pages URL structure:
  - [ ] User/Org page: `username.github.io` → base: `/`
  - [ ] Project page: `username.github.io/repo-name/` → base: `/repo-name/`
- [ ] Update base path if needed

### GitHub Repository
- [ ] Repository name chosen
- [ ] Repository description written
- [ ] Visibility selected (Public/Private)

## 🗂️ Git Status Check

### Files to Commit
```bash
git status
```

- [ ] All desired files are staged
- [ ] No unnecessary files are staged
- [ ] `.gitignore` is working correctly

### Commit Message
- [ ] Commit message is descriptive
- [ ] Follows convention: "verb: description"
- [ ] Examples:
  - "Initial commit: Analytics Dashboard"
  - "Add: Bubble chart with labels"
  - "Fix: Department filtering logic"
  - "Update: README deployment section"

## 🚀 Pre-Push Checklist

### Final Verification
- [ ] All tests pass (if applicable)
- [ ] No console errors in browser
- [ ] Build completes successfully
- [ ] All changes committed
- [ ] Commit message is clear
- [ ] Remote repository URL is correct

### GitHub Setup
- [ ] GitHub repository created
- [ ] Remote origin added
- [ ] Personal access token ready (if using HTTPS)
- [ ] SSH key configured (if using SSH)

## 📊 Post-Deployment Checklist

After pushing to GitHub:

### GitHub Actions
- [ ] Go to Actions tab
- [ ] Verify workflow started
- [ ] Wait for green checkmark
- [ ] Check logs if failed

### GitHub Pages
- [ ] Go to Settings → Pages
- [ ] Verify source is "GitHub Actions"
- [ ] Check live URL
- [ ] Note deployment URL

### Live Site Testing
- [ ] Visit deployed URL
- [ ] Test all features work on live site
- [ ] Check mobile responsiveness
- [ ] Verify no 404 errors on assets
- [ ] Test data endpoint connections
- [ ] Verify charts render correctly

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test in Edge
- [ ] Check mobile browsers

## 🐛 If Deployment Fails

### Troubleshooting Steps
1. [ ] Check GitHub Actions logs
2. [ ] Verify build runs locally: `npm run build`
3. [ ] Check base path configuration
4. [ ] Verify workflow permissions enabled
5. [ ] Check Node version compatibility
6. [ ] Review error messages carefully

### Common Issues
- [ ] Build errors → Fix TypeScript/ESLint errors
- [ ] 404 errors → Check base path
- [ ] Blank page → Check browser console
- [ ] Assets not loading → Verify base path
- [ ] Deployment not triggering → Check workflow file

## 📋 Quick Command Reference

```bash
# Pre-deployment
npm install
npm run build
npm run dev

# Git operations
git status
git add .
git commit -m "message"
git push origin main

# Verify remote
git remote -v

# View logs
git log --oneline
```

## ✨ Final Check

Before pushing, ask yourself:
- [ ] Would I be comfortable sharing this publicly?
- [ ] Is the code clean and documented?
- [ ] Have I tested all features?
- [ ] Is sensitive data excluded?
- [ ] Are all files properly committed?

---

**When all checkboxes are complete, you're ready to deploy!** 🚀

Run the commands in `GITHUB_SETUP_COMMANDS.txt` to deploy your application.
