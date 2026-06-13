AURA OS V18 FULL FINAL GOOGLE BRIEFING

Upload ALL files/folders from this ZIP to the GitHub repository ROOT.
Do not upload the ZIP itself. Upload the contents.

Important:
- Replace existing files.
- Keep folder name exactly: netlify
- Netlify build settings:
  command: npm run build
  publish: dist
  functions: netlify

Netlify environment variables:
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI = https://aura-os-v11.netlify.app/.netlify/functions/google-callback

Google Cloud:
Gmail API = Enabled
Google Calendar API = Enabled

After upload:
1. Commit to main
2. Wait for Netlify deploy
3. Open Aura
4. Connect Google again
5. Test Functions
6. Load Real Briefing

Fixes included:
- Full app.js
- Full google-briefing.js with Gmail subject/from/snippet
- Calendar date fix, no [object Object]
- Status version V18
