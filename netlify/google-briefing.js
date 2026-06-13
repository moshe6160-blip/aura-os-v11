function getCookie(header, name) {
  if (!header) return null;

  const found = header
    .split(";")
    .map(v => v.trim())
    .find(v => v.startsWith(name + "="));

  return found
    ? decodeURIComponent(found.split("=").slice(1).join("="))
    : null;
}

async function googleGet(url, token) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    status: res.status,
    data
  };
}

exports.handler = async function (event) {
  const cookieHeader =
    event.headers.cookie ||
    event.headers.Cookie ||
    "";

  const token = getCookie(
    cookieHeader,
    "aura_google_token"
  );

  if (!token) {
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Missing access token. Connect Google again."
      })
    };
  }

  const gmail = await googleGet(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10",
    token
  );

  const now = new Date().toISOString();

  const calendar = await googleGet(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=10&timeMin=" +
      encodeURIComponent(now),
    token
  );

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      gmailCount: gmail.ok
        ? (gmail.data.messages || []).length
        : 0,

      calendarCount: calendar.ok
        ? (calendar.data.items || []).length
        : 0,

      gmail: gmail.ok
        ? (gmail.data.messages || [])
        : [],

      calendar: calendar.ok
        ? (calendar.data.items || [])
        : [],

      gmailStatus: gmail.status,
      calendarStatus: calendar.status,

      gmailError: gmail.ok
        ? null
        : gmail.data,

      calendarError: calendar.ok
        ? null
        : calendar.data
    })
  };
};
