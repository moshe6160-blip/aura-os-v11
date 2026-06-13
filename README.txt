AURA OS V13 FULL FIX

Upload ALL files to the GitHub repository root and replace existing files.

IMPORTANT:
This version is built for your current GitHub structure.
Netlify Functions are directly inside:
netlify/google-auth.js
netlify/google-callback.js
netlify/google-briefing.js
netlify/status.js

Do NOT create netlify/functions.

Netlify env vars:
GOOGLE_CLIENT_ID = your Google OAuth Client ID ending with .apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your Google OAuth Client Secret
GOOGLE_REDIRECT_URI = https://aura-os-v11.netlify.app/.netlify/functions/google-callback

After upload:
1. Commit
2. Wait for Netlify deploy
3. Open app
4. Press Connect Google again
5. Press Load Real Briefing
