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

async function getBriefContext(token) {
  if (!token) return { emails: [], events: [] };

  const gmailList = await googleGet(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=newer_than:14d",
    token
  );

  const emails = [];
  for (const msg of (gmailList.data.messages || []).slice(0, 8)) {
    const detail = await googleGet(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      token
    );
    if (!detail.ok) continue;
    const headers = detail.data.payload?.headers || [];
    emails.push({
      subject: headerValue(headers, "Subject") || "(No subject)",
      from: headerValue(headers, "From") || "",
      date: headerValue(headers, "Date") || "",
      snippet: detail.data.snippet || ""
    });
  }

  const now = new Date().toISOString();
  const calendarResult = await googleGet(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?" +
      new URLSearchParams({ timeMin: now, maxResults: "8", singleEvents: "true", orderBy: "startTime" }).toString(),
    token
  );

  const events = (calendarResult.data.items || []).map(ev => ({
    summary: ev.summary || "(No title)",
    start: (ev.start && (ev.start.dateTime || ev.start.date)) || "",
    location: ev.location || ""
  }));

  return { emails, events };
}

function formatEvent(ev) {
  if (!ev) return "";
  const d = new Date(ev.start);
  const when = Number.isNaN(d.getTime()) ? ev.start : d.toLocaleString("he-IL", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });
  return `${ev.summary} ב-${when}${ev.location ? " · " + ev.location : ""}`;
}

async function getWeather(lat, lon) {
  if (!lat || !lon) return null;
  const url = "https://api.open-meteo.com/v1/forecast?" + new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,precipitation,weather_code,wind_speed_10m",
    timezone: "auto"
  }).toString();

  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  return data?.current || null;
}

function fallbackAnswer(message, context, weather) {
  const q = String(message || "").toLowerCase();
  const emails = context.emails || [];
  const events = context.events || [];

  if (!message || !message.trim()) {
    return "אני כאן, משה. תגיד לי מה אתה צריך.";
  }

  if (q.includes("מה שלומך") || q.includes("how are you")) {
    return "אני בסדר, משה. אני מחוברת ומוכנה לעזור לך לנהל את היום.";
  }

  if (q.includes("בוקר טוב") || q.includes("good morning")) {
    return "בוקר טוב משה. אני כאן. אפשר להתחיל מבריפינג קצר של מיילים, יומן ומה דורש טיפול.";
  }

  if (q.includes("שעה") || q.includes("time")) {
    return "השעה עכשיו " + new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }) + ".";
  }

  if (q.includes("מזג") || q.includes("weather")) {
    if (!weather) return "כדי לתת מזג אוויר מדויק אני צריכה הרשאת מיקום בדפדפן.";
    return `עכשיו בערך ${Math.round(weather.temperature_2m)}°C, רוח ${Math.round(weather.wind_speed_10m)} קמ״ש.`;
  }

  if (q.includes("פגישה") || q.includes("meeting") || q.includes("יומן") || q.includes("calendar")) {
    if (!events.length) return "לא מצאתי פגישות קרובות ביומן.";
    return "הפגישה הקרובה שלך היא: " + formatEvent(events[0]);
  }

  if (q.includes("מייל") || q.includes("email") || q.includes("mail")) {
    if (!emails.length) return "לא מצאתי מיילים אחרונים.";
    const important = emails.filter(e => /invoice|payment|billing|urgent|important|approval|scanner/i.test(`${e.subject} ${e.snippet}`));
    const pick = important[0] || emails[0];
    return `מצאתי ${emails.length} מיילים אחרונים. הכי חשוב כרגע נראה: ${pick.subject}, מאת ${pick.from}.`;
  }

  if (q.includes("מה חשוב") || q.includes("דחוף") || q.includes("important")) {
    const ev = events[0] ? " הפגישה הקרובה: " + formatEvent(events[0]) + "." : "";
    const em = emails[0] ? " המייל האחרון: " + emails[0].subject + "." : "";
    return `כרגע הייתי בודקת קודם את המיילים החשובים ואז את היומן.${em}${ev}`;
  }

  return "אני מבינה. כרגע אני יכולה לענות על מיילים, יומן, שעה, מזג אוויר ושאלות כלליות קצרות. כדי לנהל שיחה חופשית מלאה צריך להוסיף OPENAI_API_KEY ל-Netlify.";
}

async function openAIAnswer(message, context, weather) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const system = `
You are Sofia, the AI assistant inside AURA OS for Moshe.
Speak naturally, warmly, and concisely. Hebrew if the user writes Hebrew.
You can use the provided Gmail/Calendar/weather context. Never invent facts.
If asked to open something, explain what can be opened and return a short helpful answer.
`;

  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "system", content: JSON.stringify({ context, weather }) },
      { role: "user", content: message }
    ],
    temperature: 0.5,
    max_tokens: 350
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  return data.choices?.[0]?.message?.content || null;
}

exports.handler = async function(event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const token = getCookie(cookieHeader, "aura_google_token");

  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}

  const message = body.message || "";
  const lat = body.lat;
  const lon = body.lon;

  const context = await getBriefContext(token).catch(() => ({ emails: [], events: [] }));
  const weather = await getWeather(lat, lon).catch(() => null);

  const ai = await openAIAnswer(message, context, weather).catch(() => null);
  const reply = ai || fallbackAnswer(message, context, weather);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({
      ok: true,
      version: "AURA_OS_V32_REAL_SOFIA_CHAT",
      reply,
      hasRealAI: !!process.env.OPENAI_API_KEY,
      contextCounts: {
        emails: context.emails.length,
        events: context.events.length,
        weather: !!weather
      }
    })
  };
};
