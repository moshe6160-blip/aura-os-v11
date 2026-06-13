const $ = id => document.getElementById(id);
let dataState = null;
let inboxFilter = "urgent";

function esc(v){return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]))}
function fmt(v){if(!v)return"";const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):d.toLocaleString(undefined,{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}
async function getJson(url){const res=await fetch(url,{credentials:"include",cache:"no-store"});const data=await res.json().catch(()=>({error:"Bad response"}));return{ok:res.ok,data}}

function openScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".dock button").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));
  scrollTo({top:0,behavior:"smooth"});
}
function emailBucket(e){
  const txt=`${e.subject} ${e.snippet} ${e.from}`.toLowerCase();
  if(e.type==="Billing") return "billing";
  if(e.priority==="High") return "urgent";
  if(txt.includes("reply")||txt.includes("approval")||txt.includes("approve")) return "reply";
  return "info";
}
function renderInbox(){
  const emails=dataState?.emails||[];
  const groups={urgent:[],reply:[],billing:[],info:[]};
  emails.forEach(e=>groups[emailBucket(e)].push(e));
  $("inboxSummary").innerHTML=Object.entries(groups).map(([k,v])=>`<div><b>${v.length}</b><span>${k}</span></div>`).join("");
  const list=groups[inboxFilter]||[];
  $("mailGroups").innerHTML=list.length?list.map(e=>`
    <div class="mail-card ${inboxFilter}">
      <b>${esc(e.subject||"(No subject)")}</b>
      <span>${esc(e.from||"")}</span>
      <span>${esc(e.snippet||"")}</span>
      <span class="tag ${inboxFilter==="billing"?"gold":inboxFilter==="urgent"?"red":"blue"}">${esc(e.priority||"Normal")}</span>
      <span class="tag ${inboxFilter==="billing"?"gold":"blue"}">${esc(e.type||"Update")}</span>
    </div>`).join(""):`<div class="muted">Nothing in this group.</div>`;
}
function renderTimeline(events){
  $("timeline").innerHTML=events.length?events.map(e=>`
    <div class="timeline-item"><b>${fmt(e.start)}</b><span>${esc(e.summary||"(No title)")}</span>${e.location?`<span>${esc(e.location)}</span>`:""}</div>
  `).join(""):`<div class="muted">No upcoming events.</div>`;
}
function feedItem(icon,title,sub,kind=""){
  return `<div class="feed-card ${kind}"><b>${icon} ${esc(title)}</b><span>${esc(sub)}</span></div>`;
}
function renderHome(d){
  const sof=d.sofia||{}, g=sof.gmail||{}, c=sof.calendar||{}, actions=sof.recommendedActions||[];
  const emails=d.emails||[], events=d.events||[];
  $("notifyCount").textContent=String((g.highPriority||0)+actions.length);
  $("orbitMail").textContent=String(g.highPriority||0);
  $("orbitCal").textContent=String(c.total||0);
  $("sofiaState").textContent="live";
  $("mainLine").textContent="Good afternoon, Moshe.";
  $("mainText").textContent=sof.message||"Sofia has prepared your briefing.";
  $("todayFocus").innerHTML=`
    <div><b>${g.highPriority||0} important emails</b><span>${g.total||emails.length} Gmail signals analyzed</span></div>
    <div><b>${events[0]?events[0].summary:"No next meeting"}</b><span>${events[0]?fmt(events[0].start):"Calendar is clear"}</span></div>
    <div><b>${actions[0]||"No urgent action"}</b><span>Sofia recommendation</span></div>`;
  $("sofiaFeed").innerHTML=[
    feedItem("🔴",`${g.highPriority||0} emails need attention`,`${g.billing||0} billing emails detected`,"urgent"),
    feedItem("🟠",events[0]?.summary||"No next meeting",events[0]?fmt(events[0].start):"Calendar clear",""),
    ...actions.slice(0,3).map(a=>feedItem("✅",a,"Recommended by Sofia"))
  ].join("");
  $("alertList").innerHTML=$("sofiaFeed").innerHTML;
  renderInbox();
  renderTimeline(events);
}
async function loadBriefing(){
  $("mainText").textContent="Sofia is reading Gmail and Calendar…";
  const {ok,data}=await getJson("/.netlify/functions/google-briefing");
  if(!ok){$("mainText").textContent=data.error||"Briefing failed";return}
  dataState=data;
  renderHome(data);
}
function speak(){
  const text = $("mainText").textContent + ". " + Array.from(document.querySelectorAll("#sofiaFeed b")).map(x=>x.textContent).join(". ");
  if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.95;u.pitch=1.05;speechSynthesis.speak(u);}
  $("voiceBar").classList.add("active");setTimeout(()=>$("voiceBar").classList.remove("active"),4000);
}
async function status(){
  const {ok,data}=await getJson("/.netlify/functions/status");
  $("systemList").innerHTML=[
    ["Gmail",data.hasToken&&data.hasClientId],
    ["Calendar",data.hasToken&&data.hasClientId],
    ["WhatsApp",false],
    ["Facebook",false],
    ["Instagram",false],
    ["Functions",ok]
  ].map(([n,on])=>`<div class="system-row"><b>${n}</b><span class="dot ${on?"ok":""}"></span></div>`).join("");
}

document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>openScreen(b.dataset.screen)));
document.querySelectorAll(".segment").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".segment").forEach(x=>x.classList.remove("active"));b.classList.add("active");inboxFilter=b.dataset.filter;renderInbox();}));
$("briefBtn").addEventListener("click",loadBriefing);$("briefBtn2").addEventListener("click",loadBriefing);
$("connectBtn").addEventListener("click",()=>location.href="/.netlify/functions/google-auth");
$("talkBtn").addEventListener("click",speak);$("readBtn").addEventListener("click",speak);
$("refreshBtn").addEventListener("click",status);
$("notifyBtn").addEventListener("click",()=>$("notificationCenter").classList.add("active"));
$("closeNotify").addEventListener("click",()=>$("notificationCenter").classList.remove("active"));
status();
