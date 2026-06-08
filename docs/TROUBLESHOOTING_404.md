# Troubleshooting 404 Errors on GitHub Pages

## Problem: Assets Not Loading (404 Errors)

If you see errors like these in the browser console after deploying to GitHub Pages:

```
index-Cq4nj53G.css:1  Failed to load resource: the server responded with a status of 404 ()
index-vBbLPBlL.js:1  Failed to load resource: the server responded with a status of 404 ()
```

This means the application is looking for assets in the wrong location.

## Root Cause

GitHub Pages serves your project at:
- `https://username.github.io/repository-name/`

But if the base path isn't configured, the app looks for assets at:
- `https://username.github.io/` (root level - wrong!)

## ✅ Solution (Already Applied)

The `.github/workflows/deploy.yml` file has been updated to automatically set the correct base path:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: /${{ github.event.repository.name }}/
```

This automatically uses your repository name as the base path.

## How to Apply the Fix

### Step 1: Commit and Push the Fix

```bash
# The fix has already been committed
git push origin main
```

### Step 2: Wait for Deployment

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Wait for the new deployment to complete (3-5 minutes)
4. Look for a green checkmark

### Step 3: Clear Browser Cache

After successful deployment:
1. Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Or clear browser cache completely

### Step 4: Verify

Visit your site again:
```
https://YOUR_USERNAME.github.io/REPOSITORY_NAME/
```

The application should now load correctly!

## Alternative: Manual Base Path Configuration

If you need to set a custom base path, you can:

### Option 1: Update Workflow File

Edit `.github/workflows/deploy.yml`:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: /your-custom-path/
```

### Option 2: Set Repository Variable

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **Variables** tab
3. Click **New repository variable**
4. Name: `VITE_BASE_PATH`
5. Value: `/your-custom-path/`
6. Update workflow to use it:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: ${{ vars.VITE_BASE_PATH }}
```

## Debugging Tips

### Check Build Logs

1. Go to **Actions** tab
2. Click on latest workflow run
3. Click on **build** job
4. Expand **Build** step
5. Look for: `VITE_BASE_PATH` in the output

### Inspect HTML Source

1. Visit your deployed site
2. Right-click → **View Page Source**
3. Look at `<script>` and `<link>` tags
4. Asset paths should be: `/repository-name/assets/...`

If they're just `/assets/...`, the base path wasn't set.

### Check GitHub Pages Settings

1. Go to **Settings** → **Pages**
2. Verify your site URL
3. Note the path structure

## For User/Organization Pages

If your repository is named `username.github.io`, you don't need a base path:

Update workflow to:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: /
```

## Testing Locally with Base Path

To test the base path locally:

```bash
# Build with base path
VITE_BASE_PATH=/repository-name/ npm run build

# Preview the build
npm run preview
```

Access at: `http://localhost:4173/repository-name/`

## Common Mistakes

### ❌ Wrong: Missing Slashes
```yaml
VITE_BASE_PATH: repository-name
```

### ✅ Correct: With Leading and Trailing Slashes
```yaml
VITE_BASE_PATH: /repository-name/
```

### ❌ Wrong: Hardcoded Repository Name
```yaml
VITE_BASE_PATH: /my-old-repo-name/
```

### ✅ Correct: Dynamic Repository Name
```yaml
VITE_BASE_PATH: /${{ github.event.repository.name }}/
```

## Verification Checklist

After applying the fix:

- [ ] Committed and pushed the updated workflow file
- [ ] GitHub Actions workflow completed successfully
- [ ] Cleared browser cache
- [ ] Visited site with correct URL
- [ ] No 404 errors in browser console
- [ ] All assets loading correctly
- [ ] Navigation works properly
- [ ] Charts render correctly

## Still Having Issues?

### 1. Check the Deployed Files

Visit: `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/assets/`

You should see a directory listing or 403 (not 404).

### 2. Verify Build Output Locally

```bash
npm run build
ls -la dist/
cat dist/index.html | grep assets
```

The paths should include the base path.

### 3. Check for Typos

- Repository name in URL matches actual repo name
- No extra spaces in base path
- Slashes are correct

### 4. Try Manual Deployment

Build locally with correct base path and check the output:

```bash
VITE_BASE_PATH=/your-repo-name/ npm run build
npx serve dist -p 8080
```

Visit: `http://localhost:8080/your-repo-name/`

## Additional Resources

- [Vite Base Path Documentation](https://vitejs.dev/config/shared-options.html#base)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Variables](https://docs.github.com/en/actions/learn-github-actions/variables)

---

**The fix has been applied to your project. Push the changes to deploy!** 🚀
