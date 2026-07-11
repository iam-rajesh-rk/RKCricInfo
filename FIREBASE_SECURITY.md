# Firebase API Key Security Best Practices

## Problem: Hardcoded API Keys in Client-Side Code

Your current implementation has the Firebase API key hardcoded in `index.html` (line 467):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBHbGMdqknxhzhyt2mmF727t1pKd_YsNI4",
  // ... other credentials
};
```

**⚠️ Security Issues:**
- API keys are visible in browser developer tools
- Keys are exposed in page source and git history
- Anyone with the key can abuse your Firebase project
- Could lead to data breaches or DDoS attacks
- Billing attacks (malicious users making expensive operations)

---

## Solution 1: Environment Variables (Recommended)

### Step 1: Create `.env.local` (Never Commit)

```bash
# .env.local - Add to .gitignore
VITE_FIREBASE_API_KEY=AIzaSyBHbGMdqknxhzhyt2mmF727t1pKd_YsNI4
VITE_FIREBASE_AUTH_DOMAIN=rkcricinfo-2f1ec.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://rkcricinfo-2f1ec-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=rkcricinfo-2f1ec
VITE_FIREBASE_STORAGE_BUCKET=rkcricinfo-2f1ec.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=920097137213
VITE_FIREBASE_APP_ID=1:920097137213:web:2d8ca265a6b424ac98c054
```

### Step 2: Update HTML to Load from Environment

```javascript
// Instead of hardcoding, load from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

---

## Solution 2: GitHub Actions Secrets (For CI/CD)

### Step 1: Add Secrets to GitHub

1. Go to: **Repository → Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

### Step 2: Create GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build with Firebase config
        run: |
          echo "Building with environment variables..."
          export VITE_FIREBASE_API_KEY=${{ secrets.FIREBASE_API_KEY }}
          export VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.FIREBASE_AUTH_DOMAIN }}
          export VITE_FIREBASE_DATABASE_URL=${{ secrets.FIREBASE_DATABASE_URL }}
          export VITE_FIREBASE_PROJECT_ID=${{ secrets.FIREBASE_PROJECT_ID }}
          export VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.FIREBASE_STORAGE_BUCKET }}
          export VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          export VITE_FIREBASE_APP_ID=${{ secrets.FIREBASE_APP_ID }}
          # Build command here
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Solution 3: Firebase Security Rules (Additional Layer)

### Step 1: Restrict Database Access

In Firebase Console → Database → Rules:

```json
{
  "rules": {
    "matches": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth.uid === root.child('admins').child(auth.uid).val() === true"
      }
    },
    "scorecards_index": {
      ".read": "auth != null",
      ".write": "auth.uid === root.child('admins').child(auth.uid).val() === true"
    }
  }
}
```

### Step 2: Enable API Key Restrictions

1. Go to: **Google Cloud Console → Credentials**
2. Find your API key
3. Click **Edit API key**
4. Under "API restrictions":
   - Select "Restrict key"
   - Check only: **Firebase Realtime Database API**
5. Under "Application restrictions":
   - Select **HTTP referrers (websites)**
   - Add: `https://iam-rajesh-rk.github.io`

---

## Solution 4: Backend API Proxy (Most Secure)

Create a simple backend endpoint that serves the config:

```javascript
// Example with Node.js/Express
app.get('/api/firebase-config', (req, res) => {
  // Only send to your own domain
  if (req.headers.origin !== 'https://iam-rajesh-rk.github.io') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ... other fields
  });
});
```

Then in client:

```javascript
const firebaseConfig = await fetch('/api/firebase-config')
  .then(r => r.json());
```

---

## Implementation Steps (Recommended Order)

### For Local Development:
1. ✅ Create `.env.local` with Firebase config
2. ✅ Add `.env.local` to `.gitignore`
3. ✅ Update code to load from `import.meta.env`
4. ✅ Remove hardcoded keys from `index.html`

### For Production (GitHub Pages):
1. ✅ Add Firebase config to GitHub Secrets
2. ✅ Create GitHub Actions workflow to inject secrets
3. ✅ Enable API Key restrictions in Google Cloud Console
4. ✅ Set up Firebase Security Rules
5. ✅ Remove old commits with exposed keys from history

---

## Remove Exposed Keys from Git History

⚠️ **Important**: Keys are still in git history. To remove them:

```bash
# Option 1: Using BFG Repo-Cleaner (easiest)
bfg --replace-all 'AIzaSyBHbGMdqknxhzhyt2mmF727t1pKd_YsNI4' 

# Option 2: Using git filter-branch (advanced)
git filter-branch --tree-filter 'sed -i "s/AIzaSyBHbGMdqknxhzhyt2mmF727t1pKd_YsNI4/REDACTED/g" index.html' HEAD

# Then force push
git push --force
```

**After removing from git, regenerate the API key in Firebase Console!**

---

## Checklist

- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `.env.example` with placeholder values
- [ ] Update `index.html` to load from environment variables
- [ ] Remove hardcoded keys from `index.html`
- [ ] Test locally with `.env.local`
- [ ] Set up GitHub Secrets for production
- [ ] Create GitHub Actions workflow
- [ ] Enable API Key restrictions in Google Cloud
- [ ] Update Firebase Security Rules
- [ ] Clean git history to remove exposed keys
- [ ] Regenerate API keys (if history was exposed)

---

## Files to Update

1. **`.gitignore`** - Already updated to exclude `.env.local`
2. **`.env.example`** - Template for environment variables
3. **`index.html`** - Remove hardcoded keys, use env vars
4. **`firebase-config.js`** - Config loader module
5. **`.github/workflows/deploy.yml`** - CI/CD with secrets injection

---

## Testing

```bash
# Local testing
echo 'VITE_FIREBASE_API_KEY=test_key' > .env.local
# Your app should work with .env.local values

# Production testing
# GitHub Actions will inject secrets automatically
# Verify in deploy logs (secrets are masked)
```

---

## References

- [Firebase Security Documentation](https://firebase.google.com/docs/security)
- [Google Cloud API Key Security](https://cloud.google.com/docs/authentication/api-keys)
- [Environment Variables with Vite](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
