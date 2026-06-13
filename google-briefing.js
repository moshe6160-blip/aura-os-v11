function getCookie(header, name) {
  if (!header) return null;
  const found = header.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

async function googleGet(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function headerValue(headers, name) {
  const found = (headers || []).find(h => String(h.name || "").toLowerCase() === name.toLowerCase());
  return found ? found.value : "";
}

async function getGmailDetails(token, messages) {
  const items = [];

  for (const msg of (messages || []).slice(0, 10)) {
    const detail = await googleGet(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      token
    );

    if (!detail.ok) continue;

    const headers = detail.data.payload?.headers || [];

    items.push({
      id: detail.data.id,
      subject: headerValue(headers, "Subject") || "(No subject)",
      from: headerValue(headers, "From") || "",
      date: headerValue(headers, "Date") || "",
      snippet: detail.data.snippet || ""
    });
  }

  return items;
}

exports.handler = async function (event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const token = getCookie(cookieHeader, "aura_google_token");

  if (!token) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Missing access token. Connect Google again." })
    };
  }

  const gmailList = await googleGet(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:14d",
    token
  );

  const now = new Date().toISOString();

  const calendarResult = await googleGet(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=10&timeMin=" + encodeURIComponent(now),
    token
  );

  const gmailItems = gmailList.ok
    ? await getGmailDetails(token, gmailList.data.messages || [])
    : [];

  const calendarItems = calendarResult.ok
    ? (calendarResult.data.items || []).map(e => ({
        id: e.id,
        summary: e.summary || "(No title)",
        start: e.start?.dateTime || e.start?.date || "",
        end: e.end?.dateTime || e.end?.date || "",
        location: e.location || "",
        description: e.description || ""
      }))
    : [];

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({
      gmailCount: gmailItems.length,
      calendarCount: calendarItems.length,
      gmail: gmailItems,
      calendar: calendarItems,
      gmailStatus: gmailList.status,
      calendarStatus: calendarResult.status,
      gmailError: gmailList.ok ? null : gmailList.data,
      calendarError: calendarResult.ok ? null : calendarResult.data
    })
  };
};
