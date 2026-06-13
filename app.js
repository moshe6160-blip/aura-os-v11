const $ = id => document.getElementById(id);

function esc(v){return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]))}
function fmtDate(value){if(!value)return""; const d=new Date(value); return Number.isNaN(d.getTime())?esc(value):d.toLocaleString(undefined,{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}
async function getJson(url){const res=await fetch(url,{credentials:"include",cache:"no-store"});const data=await res.json().catch(()=>({error:"Bad server response"}));return{ok:res.ok,data}}

function tickClock(){
  const now = new Date();
  $("timeNow").textContent = now.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  $("dateNow").textContent = now.toLocaleDateString([], {weekday:"long", month:"short", day:"numeric"});
}
setInterval(tickClock, 30000); tickClock();

function openScreen(id, tab){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".dock button").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));
  if(tab) openTab(tab);
  window.scrollTo({top:0,behavior:"smooth"});
}
window.openScreen=openScreen;

function openTab(tabId){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active", x.dataset.tab === tabId));
  document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active", x.id === tabId));
}

function pClass(v){return v==="High"?"high":v==="Medium"?"medium":"normal"}

function renderBriefing(data){
  const sofia=data.sofia||{}, g=sofia.gmail||{}, c=sofia.calendar||{}, actions=sofia.recommendedActions||[];
  const emails=data.emails||data.gmail||[], events=data.events||data.calendar||[];
  $("briefStatus").textContent="Just now";
  $("versionBadge").textContent=data.version||"V25";
  $("alertCount").textContent=String((g.highPriority||0)+(actions.length||0));
  $("heroTitle").innerHTML="Sofia is live.";
  $("heroText").textContent=sofia.message||`You have ${emails.length} Gmail signals and ${events.length} calendar signals.`;
  $("systemLine").textContent="All systems live";

  $("nodeGmailCount").textContent=`${emails.length} signals`;
  $("nodeCalendarCount").textContent=`${events.length} upcoming`;
  $("nodeGmailBadge").textContent=String(g.highPriority||emails.length||0);
  $("nodeCalendarBadge").textContent=String(c.today||events.length||0);

  $("briefRows").innerHTML=`
    <div class="briefRow"><i>📩</i><span><b>${g.highPriority||0} important emails</b><small>${emails.length} Gmail signals loaded</small></span></div>
    <div class="briefRow"><i>📅</i><span><b>${c.today||0} meetings today</b><small>${events[0] ? "Next: " + esc(events[0].summary) : "No next meeting"}</small></span></div>
    <div class="briefRow"><i>✅</i><span><b>${actions.length} recommended actions</b><small>${esc(actions[0]||"No urgent action")}</small></span></div>`;

  $("metricGrid").innerHTML=`
    <div class="metric"><i>📩</i><b>${g.highPriority||0}</b><span>Important Emails</span><button onclick="openScreen('communication','gmailPanel')">View</button></div>
    <div class="metric"><i>📅</i><b>${c.today||0}</b><span>Meetings Today</span><button onclick="openScreen('communication','calendarPanel')">View</button></div>
    <div class="metric"><i>🟢</i><b>—</b><span>WhatsApp Prepared</span><button onclick="openScreen('social')">View</button></div>
    <div class="metric"><i>✅</i><b>${actions.length}</b><span>Actions</span><button onclick="openScreen('ai')">View</button></div>`;

  $("upNextList").innerHTML=events.length?events.slice(0,4).map(e=>`
    <div class="calItem"><b>${esc(e.summary||"(No title)")}</b><span>${fmtDate(e.start)}${e.location?" · "+esc(e.location):""}</span></div>`).join(""):`<div class="empty">No upcoming meetings.</div>`;

  $("priorityActions").innerHTML=actions.length?actions.map((a,i)=>`
    <div class="actionItem"><b>${esc(a)}</b><span>${i===0?"Top priority":"Sofia recommendation"}</span></div>`).join(""):`<div class="empty">No urgent actions.</div>`;

  $("sofiaInsights").innerHTML=`
    <div class="insight"><i>🧠</i><span><b>Focus Time</b><small>Best time to clear priority emails.</small></span></div>
    <div class="insight"><i>📊</i><span><b>Productivity</b><small>${emails.length} messages and ${events.length} meetings analyzed.</small></span></div>
    <div class="insight"><i>💡</i><span><b>Suggestion</b><small>${esc(actions[0]||"No urgent action detected right now.")}</small></span></div>`;
  $("aiInsights").innerHTML=$("sofiaInsights").innerHTML;

  renderGmail(data); renderCalendar(data);
}

function renderGmail(data){
  const emails=data.emails||data.gmail||[];
  $("gmailList").innerHTML=emails.length?emails.map(e=>`
    <div class="mailItem">
      <b>${esc(e.subject||e.snippet||"(No subject)")}</b>
      ${e.from?`<span>From: ${esc(e.from)}</span>`:""}
      ${e.date?`<span>${esc(e.date)}</span>`:""}
      ${e.snippet?`<span>${esc(e.snippet)}</span>`:""}
      <span class="tag ${pClass(e.priority)}">${esc(e.priority||"Normal")}</span>
      <span class="tag">${esc(e.type||"Update")}</span>
    </div>`).join(""):`<div class="empty">No Gmail data loaded yet.</div>`;
}
function renderCalendar(data){
  const events=data.events||data.calendar||[];
  $("calendarList").innerHTML=events.length?events.map(e=>`
    <div class="calItem"><b>${esc(e.summary||"(No title)")}</b><span>${fmtDate(e.start)}${e.location?" · "+esc(e.location):""}</span></div>`).join(""):`<div class="empty">No Calendar data loaded yet.</div>`;
}

async function loadBriefing(){
  $("heroText").textContent="Sofia is reading Gmail and Calendar...";
  const {ok,data}=await getJson("/.netlify/functions/google-briefing");
  if(!ok){$("heroText").textContent=data.error||"Briefing failed";return}
  renderBriefing(data);
}

async function testFunctions(){
  const {ok,data}=await getJson("/.netlify/functions/status");
  const rows=[
    ["Gmail",data.hasToken&&data.hasClientId,"Google mail connector"],
    ["Calendar",data.hasToken&&data.hasClientId,"Google calendar connector"],
    ["WhatsApp",false,"Prepared"],
    ["Facebook",false,"Prepared"],
    ["Instagram",false,"Prepared"],
    ["Functions",ok,"Netlify runtime"]
  ];
  $("systemConnectors").innerHTML=rows.map(r=>`<div class="statusPill"><div><b>${r[0]}</b><small>${r[2]}</small></div><span class="dot ${r[1]?"ok":""}"></span></div>`).join("");
  $("systemLine").textContent = data.hasToken ? "All systems live" : (data.googleConnected ? "Google connected, token refresh needed" : "Google not connected");
  if(data.googleConnected && data.hasToken) $("heroText").textContent="Google connected. Load the live briefing.";
}

document.querySelectorAll(".dock button").forEach(b=>b.addEventListener("click",()=>openScreen(b.dataset.screen)));
document.querySelectorAll(".appNode").forEach(b=>b.addEventListener("click",()=>openScreen(b.dataset.screen,b.dataset.tab)));
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>openTab(t.dataset.tab)));
$("connectGoogleBtn").addEventListener("click",()=>location.href="/.netlify/functions/google-auth");
$("loadBriefingBtn").addEventListener("click",loadBriefing);
$("loadBriefingBtn2").addEventListener("click",loadBriefing);
$("testFunctionsBtn").addEventListener("click",testFunctions);
$("refreshStatusBtn").addEventListener("click",testFunctions);
testFunctions();
