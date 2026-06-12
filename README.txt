# AURA V11 Google Real Connector

Upload this ZIP to Netlify.

Then set Environment Variables in Netlify:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI

GOOGLE_REDIRECT_URI must be:
https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/google-callback

In Google Cloud Console:
1. Create OAuth Client ID - Web Application
2. Add the same redirect URI
3. Enable Gmail API, Google Calendar API, People API
4. Publish OAuth consent screen or add your email as test user

This is a prototype. For production, store refresh tokens encrypted in Supabase, not cookies.
