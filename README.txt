AURA OS V17 FIX

Replace this file:
netlify/google-briefing.js

This fixes:
1. Gmail subjects showing as (No subject)
2. Gmail sender/snippet missing
3. Calendar [object Object] dates
4. Briefing now returns:
   gmail: [{ subject, from, date, snippet }]
   calendar: [{ summary, start, end, location }]

After upload:
1. Commit changes
2. Wait for Netlify Deploy
3. Open Aura
4. Press Connect Google again
5. Press Load Real Briefing
