# Firebase Configuration Implementation Guide

## Quick Start

### 1. Local Development Setup

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your actual Firebase credentials
# (These are already pre-filled from your index.html)
cat .env.local
```

### 2. Update index.html

Replace the hardcoded Firebase config (around line 466):

**BEFORE:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBHbGMdqknxhzhyt2mmF727t1pKd_YsNI4",
  authDomain: "rkcricinfo-2f1ec.firebaseapp.com",
  // ... etc (hardcoded)
};
```

**AFTER:**
```javascript
// Import environment variables
const getFirebaseConfig = () => {
  // For static sites without build step, load from window or fetch
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }
  
  // Fallback to hardcoded for now (will be replaced)
  return {
    apiKey: "AIzaSyBHbGMdqknxhzhyt2mmF727t1pKd_YsNI4",
    authDomain: "rkcricinfo-2f1ec.firebaseapp.com",
    databaseURL: "https://rkcricinfo-2f1ec-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "rkcricinfo-2f1ec",
    storageBucket: "rkcricinfo-2f1ec.firebasestorage.app",
    messagingSenderId: "920097137213",
    appId: "1:920097137213:web:2d8ca265a6b424ac98c054"
  };
};

const firebaseConfig = getFirebaseConfig();
```

### 3. Regenerate Firebase API Key

⚠️ **IMPORTANT**: Your key was exposed in git history!

```bash
# 1. Go to Firebase Console
# https://console.firebase.google.com/

# 2. Project Settings → Service Accounts
# 3. Delete or disable the old API key
# 4. Create a new Web API key
# 5. Update .env.local with new key
```

### 4. Set Up GitHub Secrets

```bash
# 1. Go to: Repository → Settings → Secrets and variables → Actions
# 2. Add new secret: FIREBASE_API_KEY (and others)
# 3. Copy values from your .env.local
```

### 5. Create GitHub Actions Workflow

Create file: `.github/workflows/inject-secrets.yml`

```yaml
name: Build with Firebase Secrets

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Create config file
        run: |
          cat > public/config.js << 'EOF'
          window.__FIREBASE_CONFIG__ = {
            apiKey: "${{ secrets.FIREBASE_API_KEY }}",
            authDomain: "${{ secrets.FIREBASE_AUTH_DOMAIN }}",
            databaseURL: "${{ secrets.FIREBASE_DATABASE_URL }}",
            projectId: "${{ secrets.FIREBASE_PROJECT_ID }}",
            storageBucket: "${{ secrets.FIREBASE_STORAGE_BUCKET }}",
            messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
            appId: "${{ secrets.FIREBASE_APP_ID }}"
          };
          EOF
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

### 6. Enable API Restrictions

1. **Google Cloud Console**:
   - Go to: Credentials
   - Find your API key
   - Click "Edit API key"
   - Application restrictions: HTTP referrers
   - Add: `https://iam-rajesh-rk.github.io/*`
   - API restrictions: Firebase Realtime Database API only

2. **Firebase Security Rules**:
   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "matches": {
         ".read": "auth != null",
         ".write": "auth != null && root.child('admins').child(auth.uid).val() === true"
       }
     }
   }
   ```

---

## File Structure After Implementation

```
.
├── index.html                    # Updated to load config dynamically
├── .gitignore                    # Already has .env* entries
├── .env.example                  # Pre-filled with values (safe to commit)
├── .env.local                    # Your local secrets (DO NOT COMMIT)
├── firebase-config.js            # Config loader module
├── FIREBASE_SECURITY.md          # Security best practices
├── IMPLEMENTATION_GUIDE.md       # This file
└── .github/
    └── workflows/
        └── inject-secrets.yml    # CI/CD workflow with secrets
```

---

## Verification Checklist

### ✅ Local Setup
- [ ] `.env.local` created with Firebase credentials
- [ ] `.env.local` is in `.gitignore`
- [ ] `index.html` loads config from `window.__FIREBASE_CONFIG__` or env vars
- [ ] App works locally

### ✅ GitHub Setup
- [ ] GitHub Secrets added (FIREBASE_API_KEY, etc.)
- [ ] GitHub Actions workflow created
- [ ] Workflow successfully injects secrets
- [ ] GitHub Pages deployment works

### ✅ Security
- [ ] API Key restrictions enabled in Google Cloud Console
- [ ] HTTP referrer restriction added
- [ ] Firebase Security Rules configured
- [ ] Old exposed key is removed from git history or rotated

---

## Troubleshooting

### Problem: "Firebase config is undefined"
**Solution**: 
- Check that `window.__FIREBASE_CONFIG__` is set
- Verify GitHub Actions workflow is running
- Check browser console for errors

### Problem: "Permission denied" Firebase errors
**Solution**:
- Check Firebase Security Rules
- Verify user is authenticated
- Check API Key restrictions

### Problem: GitHub Pages still shows old version
**Solution**:
```bash
# Clear GitHub Pages cache
git rm -r --cached .
git add .
git commit -m "Clear cache"
git push
```

---

## Next Steps

1. ✅ Implement environment variables locally
2. ✅ Test app with `.env.local`
3. ✅ Set up GitHub Secrets
4. ✅ Create GitHub Actions workflow
5. ✅ Test production deployment
6. ✅ Enable API Key restrictions
7. ✅ Configure Firebase Security Rules
8. ✅ Remove exposed keys from git history (use `git filter-branch` or `bfg`)
9. ✅ Regenerate Firebase API key
10. ✅ Monitor for unauthorized access

---

## References

- [Firebase Security Documentation](https://firebase.google.com/docs/security)
- [GitHub Secrets Guide](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
