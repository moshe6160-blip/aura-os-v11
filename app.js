const $ = (id) => document.getElementById(id);

const PLANETS = [
  { id:"communication", icon:"💬", title:"Communication Planet", desc:"Gmail and Calendar live. WhatsApp, Facebook and Instagram are prepared." },
  { id:"social", icon:"🌐", title:"Social Planet", desc:"WhatsApp / Facebook / Instagram connector shells ready." },
  { id:"media", icon:"🎬", title:"Media Planet", desc:"Spotify, YouTube, Netflix and content signals." },
  { id:"ai", icon:"✨", title:"AI Planet", desc:"Sofia State Engine, summaries and next actions." },
  { id:"system", icon:"⚙️", title:"System Planet", desc:"OAuth, cookies, functions and connector health." },
  { id:"home", icon:"🟡", title:"POD Control Center", desc:"Aura Pod command surface and device state." }
];

const CONNECTORS = [
  { name:"Gmail", status:"Live", detail:"Subjects, sender, date, snippet" },
  { name:"Calendar", status:"Live", detail:"Upcoming meetings, time and location" },
  { name:"WhatsApp", status:"Prepared", detail:"Ready for official connector" },
  { name:"Facebook", status:"Prepared", detail:"Ready for social connector" },
  { name:"Instagram", status:"Prepared", detail:"Ready for social connector" }
];

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
  return d.toLocaleString(undefined, { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

async function getJson(url) {
  const res = await fetch(url, { credentials:"include", cache:"no-store" });
  const data = await res.json().catch(() => ({ error:"Could not parse server response" }));
  return { ok: res.ok, data };
}

function openScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  document.querySelectorAll(".dock button").forEach(b => b.classList.toggle("active", b.dataset.screen === id));
  window.scrollTo({ top:0, behavior:"smooth" });
}

function renderPlanets() {
  $("planetGrid").innerHTML = PLANETS.map(p => `
    <button class="planet" onclick="openScreen('${p.id}')">
      <div class="icon">${p.icon}</div>
      <b>${esc(p.title)}</b>
      <small>${esc(p.desc)}</small>
    </button>
  `).join("");

  $("connectors").innerHTML = CONNECTORS.map(c => `
    <div class="connector">
      <div><b>${esc(c.name)}</b><small>${esc(c.detail)}</small></div>
      <span class="badge ${c.status === "Live" ? "ok" : ""}">${esc(c.status)}</span>
    </div>
  `).join("");
}

function priorityClass(value) {
  if (value === "High") return "high";
  if (value === "Medium") return "medium";
  return "normal";
}

function renderSummary(data) {
  const sofia = data.sofia || {};
  const gmail = sofia.gmail || {};
  const calendar = sofia.calendar || {};
  const actions = sofia.recommendedActions || [];

  $("liveBadge").textContent = data.version || "Live";
  $("sofiaSummary").innerHTML = `
    <div class="mini"><b>Gmail</b><span>${gmail.total ?? data.gmailCount ?? 0} signals · ${gmail.highPriority ?? 0} important</span></div>
    <div class="mini"><b>Calendar</b><span>${calendar.total ?? data.calendarCount ?? 0} upcoming · ${calendar.today ?? 0} today</span></div>
    <div class="mini"><b>Next Action</b><span>${esc(actions[0] || "No urgent action")}</span></div>
  `;

  $("actionCenter").innerHTML = actions.map(a => `
    <div class="actionItem"><b>${esc(a)}</b><span>Sofia recommended action</span></div>
  `).join("") || `<div class="empty">No urgent action detected.</div>`;

  $("brainBox").innerHTML = `
    <h3>${esc(sofia.title || "Sofia Today")}</h3>
    <p>${esc(sofia.message || "Sofia is ready.")}</p>
    ${actions.map(a => `<div class="actionItem"><b>${esc(a)}</b><span>Action generated from Gmail and Calendar.</span></div>`).join("")}
  `;
}

function renderGmail(data) {
  const emails = data.emails || data.gmail || [];
  $("gmailList").innerHTML = emails.length ? emails.map(e => `
    <div class="mailItem">
      <b>${esc(e.subject || e.snippet || "(No subject)")}</b>
      ${e.from ? `<span>From: ${esc(e.from)}</span>` : ""}
      ${e.date ? `<span>${esc(e.date)}</span>` : ""}
      ${e.snippet ? `<span>${esc(e.snippet)}</span>` : ""}
      <span class="tag ${priorityClass(e.priority)}">${esc(e.priority || "Normal")}</span>
      <span class="tag">${esc(e.type || "Update")}</span>
    </div>
  `).join("") : `<div class="empty">No Gmail items returned.</div>`;
}

function renderCalendar(data) {
  const events = data.events || data.calendar || [];
  $("calendarList").innerHTML = events.length ? events.map(e => `
    <div class="calItem">
      <b>${esc(e.summary || "(No title)")}</b>
      <span>${fmtDate(e.start)}${e.location ? " · " + esc(e.location) : ""}</span>
    </div>
  `).join("") : `<div class="empty">No upcoming calendar items returned.</div>`;
}

function renderBriefing(data) {
  if (data.error) {
    $("briefing").innerHTML = `<p class="bad">${esc(data.error)}</p>`;
    return;
  }

  renderSummary(data);
  renderGmail(data);
  renderCalendar(data);

  const emails = data.emails || data.gmail || [];
  const events = data.events || data.calendar || [];

  $("briefing").innerHTML = `
    <h3>Sofia Summary</h3>
    <p>${esc(data.sofia?.message || "Real data loaded.")}</p>
    <h3>Gmail</h3>
    <p>${emails.length} recent signals</p>
    ${emails.slice(0,5).map(e => `
      <div class="mailItem">
        <b>${esc(e.subject || e.snippet || "(No subject)")}</b>
        ${e.from ? `<span>From: ${esc(e.from)}</span>` : ""}
        ${e.snippet ? `<span>${esc(e.snippet)}</span>` : ""}
      </div>
    `).join("")}
    <h3>Calendar</h3>
    <p>${events.length} upcoming signals</p>
    ${events.slice(0,5).map(e => `
      <div class="calItem">
        <b>${esc(e.summary || "(No title)")}</b>
        <span>${fmtDate(e.start)}${e.location ? " · " + esc(e.location) : ""}</span>
      </div>
    `).join("")}
  `;

  $("heroTitle").textContent = "Sofia is live.";
  $("heroText").textContent = data.sofia?.message || "Gmail and Calendar connected.";
}

async function loadBriefing() {
  $("briefing").innerHTML = `<p>Loading real Google signals...</p>`;
  const { ok, data } = await getJson("/.netlify/functions/google-briefing");
  if (!ok) {
    $("briefing").innerHTML = `<p class="bad">${esc(data.error || "Briefing failed")}</p>`;
    return;
  }
  renderBriefing(data);
}

async function testFunctions() {
  $("debug").innerHTML = `<p>Testing...</p>`;
  const { ok, data } = await getJson("/.netlify/functions/status");
  $("debug").innerHTML = `
    <div class="statusRow"><b>Functions</b><span class="${ok ? "ok" : "bad"}">${ok ? "Working" : "Problem"}</span></div>
    <div class="statusRow"><b>Version</b><span>${esc(data.version || "unknown")}</span></div>
    <div class="statusRow"><b>GOOGLE_CLIENT_ID</b><span>${data.hasClientId ? "Found" : "Missing"}</span></div>
    <div class="statusRow"><b>GOOGLE_CLIENT_SECRET</b><span>${data.hasClientSecret ? "Found" : "Missing"}</span></div>
    <div class="statusRow"><b>GOOGLE_REDIRECT_URI</b><span>${esc(data.redirectUri || "Missing")}</span></div>
    <div class="statusRow"><b>Google connected cookie</b><span>${data.googleConnected ? "Connected" : "Missing"}</span></div>
    <div class="statusRow"><b>Access token cookie</b><span>${data.hasToken ? "Found" : "Missing"}</span></div>
  `;
  if (data.googleConnected) $("heroText").textContent = "Google connected. Load Sofia Briefing.";
}

document.querySelectorAll(".dock button").forEach(btn => btn.addEventListener("click", () => openScreen(btn.dataset.screen)));
$("connectGoogleBtn").addEventListener("click", () => location.href = "/.netlify/functions/google-auth");
$("loadBriefingBtn").addEventListener("click", loadBriefing);
$("testFunctionsBtn").addEventListener("click", testFunctions);
$("refreshStatusBtn").addEventListener("click", testFunctions);

renderPlanets();
testFunctions();
