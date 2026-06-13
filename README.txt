AURA OS V14 COOKIE FIX

Upload ALL files to GitHub repository root and replace existing files.

This version avoids the iPhone Safari token cookie problem:
- google-callback stores google_connected=true cookie
- status checks google_connected cookie
- briefing will show connection status even if the real access token cookie is blocked

Functions are directly in:
netlify/google-auth.js
netlify/google-callback.js
netlify/google-briefing.js
netlify/status.js

Do NOT create netlify/functions.

After upload:
1. Commit
2. Wait Netlify deploy
3. Open app
4. Press Connect Google
5. Press Continue on Google
6. Press Test Functions
