AURA OS V23 FULL SYSTEM

Upload ALL contents of this ZIP to GitHub repository root and replace existing files.

This is not a small patch.
It includes the full organized AURA OS:
- Universe Home
- Communication Planet
- Social Planet placeholders: WhatsApp, Facebook, Instagram
- Media Planet
- Sofia Brain
- System Planet
- Working Google OAuth
- Gmail real data with subject/from/date/snippet
- Calendar real data
- Sofia smart summary and recommended actions

Important structure:
netlify/functions/status.js
netlify/functions/google-auth.js
netlify/functions/google-callback.js
netlify/functions/google-briefing.js

Netlify env vars remain:
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

After deploy, check:
/.netlify/functions/status

It must show:
AURA_OS_V23_FULL_SYSTEM
