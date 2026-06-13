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
  return isNaN(d) ? esc(value) : d.toLocaleString();
}

async function getJson(url) {
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  return await res.json();
}

function renderStatus(data) {
  $("statusBox").innerHTML = `
    <div class="row"><b>Functions</b><span>${data.ok ? "Working" : "Error"}</span></div>
    <div class="row"><b>GOOGLE_CLIENT_ID</b><span>${data.hasClientId ? "Found" : "Missing"}</span></div>
    <div class="row"><b>GOOGLE_CLIENT_SECRET</b><span>${data.hasClientSecret ? "Found" : "Missing"}</span></div>
    <div class="row"><b>GOOGLE_REDIRECT_URI</b><span>${esc(data.redirectUri)}</span></div>
    <div class="row"><b>Google connected cookie</b><span>${data.googleConnected ? "Connected" : "Missing"}</span></div>
    <div class="row"><b>Access token cookie</b><span>${data.hasToken ? "Found" : "Missing"}</span></div>
    <div class="row"><b>Version</b><span>${esc(data.version || "unknown")}</span></div>
  `;
}

function renderBriefing(data) {
  if (data.error) {
    $("briefingBox").innerHTML = `<div class="error">${esc(data.error)}</div>`;
    return;
  }

  const gmail = data.gmail || [];
  const calendar = data.calendar || [];

  $("briefingBox").innerHTML = `
    <h3>Gmail</h3>
    <p>${data.gmailCount || gmail.length} recent signals</p>
    ${gmail.map(m => `
      <div class="item">
        <b>${esc(m.subject || m.snippet || "(No subject)")}</b>
        <span>${esc(m.from || "")}</span>
        <span>${esc(m.snippet || "")}</span>
      </div>
    `).join("")}

    <h3>Calendar</h3>
    <p>${data.calendarCount || calendar.length} upcoming signals</p>
    ${calendar.map(e => `
      <div class="item">
        <b>${esc(e.summary || "(No title)")}</b>
        <span>${fmtDate(e.start)}${e.location ? " · " + esc(e.location) : ""}</span>
      </div>
    `).join("")}
  `;
}

async function testFunctions() {
  $("statusBox").innerHTML = "Checking...";
  renderStatus(await getJson("/.netlify/functions/status"));
}

async function loadBriefing() {
  $("briefingBox").innerHTML = "Loading...";
  renderBriefing(await getJson("/.netlify/functions/google-briefing"));
}

$("connectBtn").addEventListener("click", () => {
  window.location.href = "/.netlify/functions/google-auth";
});

$("testBtn").addEventListener("click", testFunctions);
$("briefingBtn").addEventListener("click", loadBriefing);

testFunctions();
