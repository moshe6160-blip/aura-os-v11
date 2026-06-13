AURA OS V32 REAL SOFIA CHAT

What changed:
- Sofia is now a conversation layer, not only a fixed briefing.
- You can ask naturally:
  "סופיה מה הפגישה הבאה?"
  "סופיה מה שלומך?"
  "מה השעה?"
  "מה מזג האוויר?"
  "מה חשוב היום?"
- Browser voice input added where supported.
- Weather works with browser location permission through Open-Meteo.
- Gmail/Calendar context is pulled inside the Sofia chat function.
- Optional real AI:
  Add OPENAI_API_KEY in Netlify Environment Variables for full free conversation.
  Without OPENAI_API_KEY Sofia still answers Gmail/Calendar/time/weather/basic conversation.

Keep existing Google env vars:
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

Optional:
OPENAI_API_KEY
OPENAI_MODEL = gpt-4o-mini
