AURA OS V12 - Full Netlify Ready

Upload ALL files/folders from this ZIP to GitHub repository root.

Must include:
- index.html
- package.json
- build.js
- netlify.toml
- netlify/functions/status.js
- netlify/functions/google-auth.js
- netlify/functions/google-callback.js
- netlify/functions/google-briefing.js

Netlify settings:
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions

Environment variables:
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

For aura-os-v11.netlify.app:
GOOGLE_REDIRECT_URI=https://aura-os-v11.netlify.app/.netlify/functions/google-callback

Google Cloud OAuth must also have:
Authorized JavaScript origins:
https://aura-os-v11.netlify.app

Authorized redirect URIs:
https://aura-os-v11.netlify.app/.netlify/functions/google-callback
