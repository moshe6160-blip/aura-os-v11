AURA OS V15 - google-briefing.js token fix

Upload this file to GitHub:
netlify/google-briefing.js

Replace the existing file completely.

After upload:
1. Commit changes
2. Wait for Netlify deploy
3. Open Aura
4. Press Load Real Briefing

This fixes:
Missing access token
by checking both event.headers.cookie and event.headers.Cookie.
