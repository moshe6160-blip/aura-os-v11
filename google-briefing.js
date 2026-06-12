function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map(v => v.trim());
  const found = parts.find(v => v.startsWith(name + '='));
  return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null;
}

async function googleFetch(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  return res.json();
}

exports.handler = async function(event) {
  const token = getCookie(event.headers.cookie || event.headers.Cookie, 'aura_google_token');

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Google is not connected yet. Tap Connect Google first.' })
    };
  }

  const list = await googleFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=newer_than:7d', token);
  const emails = [];

  if (list && list.messages) {
    for (const m of list.messages.slice(0, 5)) {
      const msg = await googleFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, token);
      const headers = (msg && msg.payload && msg.payload.headers) || [];
      emails.push({
        subject: (headers.find(h => h.name === 'Subject') || {}).value || '',
        from: (headers.find(h => h.name === 'From') || {}).value || ''
      });
    }
  }

  const now = new Date().toISOString();
  const cal = await googleFetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({
    timeMin: now,
    maxResults: '5',
    singleEvents: 'true',
    orderBy: 'startTime'
  }).toString(), token);

  const events = ((cal && cal.items) || []).map(ev => ({
    summary: ev.summary,
    start: (ev.start && (ev.start.dateTime || ev.start.date)) || ''
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails, events })
  };
};
