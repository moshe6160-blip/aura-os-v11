const $ = (id) => document.getElementById(id);

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[s]));
}

function fmtDate(value) {
  if (!value) return "";
  if (typeof value === "object") value = value.dateTime || value.date || "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return esc(value);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  return await res.json().catch(() => ({ error: "Could not parse server response." }));
}

function renderStatus(data) {
  $("statusBox").innerHTML = `
    <div class="row"><b>Functions</b><span>${data.ok ? "Working" : "Error"}</span></div>
    <div class="row"><b>GOOGLE_CLIENT_ID</b><span>${data.hasClientId ? "Found" : "Missing"}</span></div>
    <div class="row"><b>GOOGLE_CLIENT_SECRET</b><span>${data.hasClientSecret ? "Found" : "Missing"}</span></div>
    <div class="row"><b>GOOGLE_REDIRECT_URI</b><span>${esc(data.redirectUri || "Missing")}</span></div>
    <div class="row"><b>Google connected cookie</b><span>${data.googleConnected ? "Connected" : "Missing / connect again"}</span></div>
    <div class="row"><b>Access token cookie</b><span>${data.hasToken ? "Found" : "Missing / connect again"}</span></div>
    <div class="row"><b>Version</b><span>${esc(data.version || "unknown")}</span></div>
  `;
  $("connectionText").textContent = data.googleConnected ? "Google connected." : "Connect Google to start reading Gmail and Calendar signals.";
}

function renderBriefing(data) {
  if (data.error) {
    $("briefingBox").innerHTML = `<div class="error">${esc(data.error)}</div>`;
    return;
  }

  const gmail = Array.isArray(data.gmail) ? data.gmail : [];
  const calendar = Array.isArray(data.calendar) ? data.calendar : [];

  $("briefingBox").innerHTML = `
    <h3>Gmail</h3>
    <p>${data.gmailCount ?? gmail.length} recent signals</p>
    ${
      gmail.length
        ? gmail.map(m => `
          <div class="item">
            <b>${esc(m.subject || m.snippet || "(No subject)")}</b>
            ${m.from ? `<span>From: ${esc(m.from)}</span>` : ""}
            ${m.date ? `<span>${esc(m.date)}</span>` : ""}
            ${m.snippet ? `<span>${esc(m.snippet)}</span>` : ""}
          </div>
        `).join("")
        : `<div class="empty">No Gmail items returned.</div>`
    }

    <h3>Calendar</h3>
    <p>${data.calendarCount ?? calendar.length} upcoming signals</p>
    ${
      calendar.length
        ? calendar.map(e => `
          <div class="item">
            <b>${esc(e.summary || "(No title)")}</b>
            <span>${fmtDate(e.start)}${e.location ? " · " + esc(e.location) : ""}</span>
          </div>
        `).join("")
        : `<div class="empty">No upcoming calendar items returned.</div>`
    }
  `;
}

async function testFunctions() {
  $("statusBox").innerHTML = `<div class="row"><b>Functions</b><span>Checking...</span></div>`;
  renderStatus(await getJson("/.netlify/functions/status"));
}

async function loadBriefing() {
  $("briefingBox").innerHTML = `<div class="empty">Loading real briefing...</div>`;
  renderBriefing(await getJson("/.netlify/functions/google-briefing"));
}

$("connectBtn").addEventListener("click", () => {
  window.location.href = "/.netlify/functions/google-auth";
});
$("testBtn").addEventListener("click", testFunctions);
$("briefingBtn").addEventListener("click", loadBriefing);

testFunctions();
