/**
 * Firebase Configuration Loader
 * 
 * This module loads Firebase configuration from a secure location.
 * For GitHub Pages (static hosting), the configuration is loaded from
 * environment variables at build time or from a config file not committed to the repo.
 * 
 * IMPORTANT: Never hardcode API keys in client-side code!
 */

// For local development, load from .env.local (not committed to git)
// For production (GitHub Pages), use GitHub Actions secrets and build-time injection

export const getFirebaseConfig = async () => {
  // Check if config is injected at build time (via GitHub Actions)
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  // For development: load from a config file
  if (process.env.NODE_ENV === 'development') {
    try {
      const response = await fetch('/config/.firebase-config.json');
      if (!response.ok) throw new Error('Config not found');
      return await response.json();
    } catch (error) {
      console.error('Failed to load Firebase config:', error);
      return null;
    }
  }

  // Fallback: log error
  console.error('Firebase configuration not available');
  return null;
};

// For server-side applications (if you add a backend later)
export const getSecureFirebaseConfig = () => {
  // This would call your own backend API to get the config securely
  // Example: POST /api/firebase-config (with authentication)
  return fetch('/api/firebase-config', {
    method: 'GET',
    credentials: 'same-origin',
  }).then(r => r.json());
};
