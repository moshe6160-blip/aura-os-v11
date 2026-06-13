function getCookie(header, name) {
  if (!header) return null;
  const found = header.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

async function googleGet(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function headerValue(headers, name) {
  const found = (headers || []).find(h => String(h.name || "").toLowerCase() === name.toLowerCase());
  return found ? found.value : "";
}

async function getGmailDetails(token, messages) {
  const emails = [];

  for (const msg of (messages || []).slice(0, 10)) {
    const detail = await googleGet(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      token
    );

    if (!detail.ok) continue;

    const headers = detail.data.payload?.headers || [];
    const subject = headerValue(headers, "Subject") || "(No subject)";
    const from = headerValue(headers, "From") || "";
    const date = headerValue(headers, "Date") || "";
    const snippet = detail.data.snippet || "";

    emails.push({
      id: detail.data.id,
      subject,
      from,
      date,
      snippet
    });
  }

  return emails;
}

exports.handler = async function(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const token = getCookie(cookieHeader, "aura_google_token");

  if (!token) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Google is not connected yet. Tap Connect Google first." })
    };
  }

  const gmailList = await googleGet(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:14d",
    token
  );

  const now = new Date().toISOString();
  const calendarResult = await googleGet(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
      new URLSearchParams({
        timeMin: now,
        maxResults: "10",
        singleEvents: "true",
        orderBy: "startTime"
      }).toString(),
    token
  );

  const emails = gmailList.ok ? await getGmailDetails(token, gmailList.data.messages || []) : [];

  const events = calendarResult.ok ? (calendarResult.data.items || []).map(ev => ({
    id: ev.id,
    summary: ev.summary || "(No title)",
    start: (ev.start && (ev.start.dateTime || ev.start.date)) || "",
    end: (ev.end && (ev.end.dateTime || ev.end.date)) || "",
    location: ev.location || "",
    description: ev.description || ""
  })) : [];

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({
      version: "AURA_OS_V20_UNIVERSE_GOOGLE_MERGED",
      gmailCount: emails.length,
      calendarCount: events.length,
      emails,
      events,
      gmail: emails,
      calendar: events,
      gmailStatus: gmailList.status,
      calendarStatus: calendarResult.status,
      gmailError: gmailList.ok ? null : gmailList.data,
      calendarError: calendarResult.ok ? null : calendarResult.data
    })
  };
};
