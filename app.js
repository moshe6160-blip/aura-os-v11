const $ = id => document.getElementById(id);

const apps = [
  {screen:"communication", icon:"💬", title:"Communication", desc:"Gmail, Calendar, WhatsApp"},
  {screen:"social", icon:"🌐", title:"Social", desc:"Facebook, Instagram, LinkedIn"},
  {screen:"media", icon:"🎬", title:"Media", desc:"Spotify, YouTube, Netflix"},
  {screen:"ai", icon:"✨", title:"AI", desc:"Sofia Intelligence"},
  {screen:"system", icon:"⚙️", title:"System", desc:"Connectors and health"},
  {screen:"home", icon:"📁", title:"Files", desc:"Prepared file layer"}
];

function esc(v){return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]))}
function fmtDate(value){if(!value)return""; const d=new Date(value); return Number.isNaN(d.getTime())?esc(value):d.toLocaleString(undefined,{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}
async function getJson(url){const res=await fetch(url,{credentials:"include",cache:"no-store"});const data=await res.json().catch(()=>({error:"Bad server response"}));return{ok:res.ok,data}}

function openScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".dock button").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
window.openScreen=openScreen;

function renderApps(){
  $("appGrid").innerHTML=apps.map(a=>`<button class="appTile" onclick="openScreen('${a.screen}')"><i>${a.icon}</i><b>${esc(a.title)}</b><span>${esc(a.desc)}</span></button>`).join("");
}
function priorityClass(v){return v==="High"?"high":v==="Medium"?"medium":"normal"}

function renderCommand(data){
  const sofia=data.sofia||{}, g=sofia.gmail||{}, c=sofia.calendar||{}, actions=sofia.recommendedActions||[];
  $("liveBadge").textContent=data.version||"Live";
  $("commandGrid").innerHTML=`
    <div class="commandCard"><b>Priority</b><span>${g.highPriority||0} important emails</span></div>
    <div class="commandCard"><b>Messages</b><span>${g.total??data.gmailCount??0} Gmail signals</span></div>
    <div class="commandCard"><b>Schedule</b><span>${c.today||0} today · ${c.total??data.calendarCount??0} upcoming</span></div>
    <div class="commandCard"><b>Next Action</b><span>${esc(actions[0]||"No urgent action")}</span></div>`;
  $("sofiaFeed").innerHTML=actions.map(a=>`<div class="insight"><b>${esc(a)}</b><span>Sofia recommended action</span></div>`).join("")||`<div class="empty">No urgent action.</div>`;
  $("aiInsights").innerHTML=`
    <div class="insight"><b>Today Analysis</b><span>${esc(sofia.message||"Briefing loaded.")}</span></div>
    ${(actions||[]).map(a=>`<div class="insight"><b>${esc(a)}</b><span>Generated from Gmail and Calendar.</span></div>`).join("")}`;
}

function renderGmail(data){
  const emails=data.emails||data.gmail||[];
  $("gmailList").innerHTML=emails.length?emails.map(e=>`
    <div class="mailItem">
      <b>${esc(e.subject||e.snippet||"(No subject)")}</b>
      ${e.from?`<span>From: ${esc(e.from)}</span>`:""}
      ${e.date?`<span>${esc(e.date)}</span>`:""}
      ${e.snippet?`<span>${esc(e.snippet)}</span>`:""}
      <span class="tag ${priorityClass(e.priority)}">${esc(e.priority||"Normal")}</span>
      <span class="tag">${esc(e.type||"Update")}</span>
    </div>`).join(""):`<div class="empty">No Gmail items returned.</div>`;
}

function renderCalendar(data){
  const events=data.events||data.calendar||[];
  $("calendarList").innerHTML=events.length?events.map(e=>`
    <div class="calItem"><b>${esc(e.summary||"(No title)")}</b><span>${fmtDate(e.start)}${e.location?" · "+esc(e.location):""}</span></div>`).join(""):`<div class="empty">No upcoming calendar items returned.</div>`;
}

async function loadBriefing(){
  $("heroText").textContent="Loading Sofia live briefing...";
  const {ok,data}=await getJson("/.netlify/functions/google-briefing");
  if(!ok){$("heroText").textContent=data.error||"Briefing failed";return}
  renderCommand(data);renderGmail(data);renderCalendar(data);
  $("heroTitle").textContent="Sofia is live.";
  $("heroText").textContent=data.sofia?.message||"Live data loaded.";
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
  if(data.googleConnected){$("heroText").textContent=data.hasToken?"Google connected. Sofia can load real briefing.":"Google connected. Reconnect Google if token is missing."}
}

document.querySelectorAll(".dock button").forEach(b=>b.addEventListener("click",()=>openScreen(b.dataset.screen)));
document.querySelectorAll(".sat").forEach(b=>b.addEventListener("click",()=>openScreen(b.dataset.screen)));
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
  t.classList.add("active"); $(t.dataset.tab).classList.add("active");
}));
$("connectGoogleBtn").addEventListener("click",()=>location.href="/.netlify/functions/google-auth");
$("loadBriefingBtn").addEventListener("click",loadBriefing);
$("loadBriefingBtn2").addEventListener("click",loadBriefing);
$("testFunctionsBtn").addEventListener("click",testFunctions);
$("refreshStatusBtn").addEventListener("click",testFunctions);
renderApps();testFunctions();
