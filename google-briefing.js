function getCookie(header, name) { if (!header) return null; const found = header.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'=')); return found ? decodeURIComponent(found.split('=').slice(1).join('=')) : null; }
async function googleGet(url, token) { const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json().catch(()=>({})); return { ok:res.ok, status:res.status, data }; }
function headerValue(headers, name) { const found = (headers || []).find(h => String(h.name || '').toLowerCase() === name.toLowerCase()); return found ? found.value : ''; }
async function getGmailDetails(token, ids) { const out = []; for (const item of ids.slice(0,10)) { const msg = await googleGet(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, token); if (!msg.ok) continue; const payload = msg.data.payload || {}; out.push({ id: msg.data.id, subject: headerValue(payload.headers,'Subject'), from: headerValue(payload.headers,'From'), date: headerValue(payload.headers,'Date'), snippet: msg.data.snippet || '' }); } return out; }
exports.handler = async function (event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || '';
  const token = getCookie(cookieHeader, 'aura_google_token');
  if (!token) return { statusCode: 401, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body: JSON.stringify({ error:'Missing access token. Connect Google again.' }) };
  const gmailList = await googleGet('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:14d', token);
  const now = new Date().toISOString();
  const calendarRes = await googleGet('https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=10&timeMin=' + encodeURIComponent(now), token);
  const gmailMessages = gmailList.ok ? await getGmailDetails(token, gmailList.data.messages || []) : [];
  const calendarItems = calendarRes.ok ? (calendarRes.data.items || []).map(e => ({ id:e.id, summary:e.summary || '(No title)', start:(e.start && (e.start.dateTime || e.start.date)) || '', end:(e.end && (e.end.dateTime || e.end.date)) || '', location:e.location || '', description:e.description || '' })) : [];
  return { statusCode: 200, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body: JSON.stringify({ gmailCount:gmailMessages.length, calendarCount:calendarItems.length, gmailStatus:gmailList.status, calendarStatus:calendarRes.status, gmail:gmailMessages, calendar:calendarItems, gmailError:gmailList.ok ? null : gmailList.data, calendarError:calendarRes.ok ? null : calendarRes.data }) };
};
