const $ = id => document.getElementById(id);
let dataState = null;
let inboxFilter = "urgent";
let editMode = false;

const defaultOrbit = [
  {id:"gmail", icon:"✉️", screen:"inbox", x:18, y:10, count:"orbitMail"},
  {id:"calendar", icon:"📅", screen:"calendar", x:70, y:10, count:"orbitCal"},
  {id:"whatsapp", icon:"💬", screen:"social", x:84, y:43},
  {id:"files", icon:"📁", screen:"files", x:69, y:75},
  {id:"media", icon:"🎵", screen:"media", x:22, y:75},
  {id:"system", icon:"⚙️", screen:"system", x:4, y:43}
];
let orbit = JSON.parse(localStorage.getItem("aura_orbit_v31") || "null") || defaultOrbit;

function esc(v){return String(v??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]))}
function fmt(v){if(!v)return"";const d=new Date(v);return Number.isNaN(d.getTime())?esc(v):d.toLocaleString(undefined,{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}
async function getJson(url){const res=await fetch(url,{credentials:"include",cache:"no-store"});const data=await res.json().catch(()=>({error:"Bad response"}));return{ok:res.ok,data}}

function renderOrbit(){
  $("orbitApps").innerHTML = orbit.map(a=>`
    <button class="orb-icon" data-id="${a.id}" data-screen="${a.screen}" style="left:${a.x}%;top:${a.y}%">
      <span>${a.icon}</span><small id="${a.count || ""}">${a.count ? "0" : ""}</small><i class="x">×</i>
    </button>`).join("");
  wireOrbit();
}

function wireOrbit(){
  let pressTimer=null, drag=null;
  document.querySelectorAll(".orb-icon").forEach(btn=>{
    btn.addEventListener("click",e=>{
      if(editMode){ e.preventDefault(); return; }
      openScreen(btn.dataset.screen);
    });
    btn.addEventListener("pointerdown",e=>{
      pressTimer=setTimeout(()=>setEditMode(true),650);
      if(editMode){
        drag={el:btn,id:btn.dataset.id};
        btn.setPointerCapture(e.pointerId);
        btn.classList.add("dragging");
      }
    });
    btn.addEventListener("pointermove",e=>{
      if(!drag || drag.el!==btn) return;
      const rect=$("orbitZone").getBoundingClientRect();
      const x=Math.max(0,Math.min(88,((e.clientX-rect.left)/rect.width)*100-8));
      const y=Math.max(0,Math.min(88,((e.clientY-rect.top)/rect.height)*100-8));
      btn.style.left=x+"%"; btn.style.top=y+"%";
      const item=orbit.find(o=>o.id===drag.id); if(item){item.x=Math.round(x); item.y=Math.round(y);}
    });
    btn.addEventListener("pointerup",e=>{
      clearTimeout(pressTimer);
      if(drag){localStorage.setItem("aura_orbit_v31",JSON.stringify(orbit));btn.classList.remove("dragging");drag=null;}
    });
    btn.querySelector(".x").addEventListener("click",e=>{
      e.stopPropagation();
      orbit=orbit.filter(o=>o.id!==btn.dataset.id);
      localStorage.setItem("aura_orbit_v31",JSON.stringify(orbit));
      renderOrbit();
    });
  });
}
function setEditMode(on){editMode=on;document.body.classList.toggle("edit-mode",on);$("mainText").textContent=on?"Edit Mode: drag icons, remove with ×, tap ✦ to finish.":"Edit mode closed."}
function openScreen(id){
  setEditMode(false);
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
  $("mailGroups").innerHTML=list.length?list.map((e,i)=>`
    <div class="mail-card ${inboxFilter}">
      <b>${esc(e.subject||"(No subject)")}</b>
      <span>${esc(e.from||"")}</span>
      <span>${esc(e.snippet||"")}</span>
      <span class="tag ${inboxFilter==="billing"?"gold":inboxFilter==="urgent"?"red":"blue"}">${esc(e.priority||"Normal")}</span>
      <button onclick="openEmail(${emails.indexOf(e)})">Open Email</button>
    </div>`).join(""):`<div class="muted">Nothing in this group.</div>`;
}
function openEmail(idx){
  const e=(dataState?.emails||[])[idx]; if(!e)return;
  $("modalTitle").textContent=e.subject||"Email";
  $("modalBody").innerHTML=`<p><b>From:</b> ${esc(e.from||"")}</p><p>${esc(e.date||"")}</p><p>${esc(e.snippet||"")}</p>`;
  $("detailModal").classList.add("active");
}
window.openEmail=openEmail;

function renderTimeline(events){
  $("timeline").innerHTML=events.length?events.map((e,i)=>`
    <div class="timeline-item"><b>${fmt(e.start)}</b><span>${esc(e.summary||"(No title)")}</span>${e.location?`<span>${esc(e.location)}</span>`:""}<button onclick="openEvent(${i})">Open Event</button></div>
  `).join(""):`<div class="muted">No upcoming events.</div>`;
}
function openEvent(i){
  const e=(dataState?.events||[])[i]; if(!e)return;
  $("modalTitle").textContent=e.summary||"Calendar Event";
  $("modalBody").innerHTML=`<p><b>Time:</b> ${fmt(e.start)}</p><p><b>Location:</b> ${esc(e.location||"")}</p><p>${esc(e.description||"")}</p>`;
  $("detailModal").classList.add("active");
}
window.openEvent=openEvent;

function feedItem(icon,title,sub,target,btn="Open"){
  return `<div class="feed-card"><b>${icon} ${esc(title)}</b><span>${esc(sub)}</span>${target?`<button onclick="openScreen('${target}')">${btn}</button>`:""}</div>`;
}
function renderHome(d){
  const sof=d.sofia||{}, g=sof.gmail||{}, c=sof.calendar||{}, actions=sof.recommendedActions||[];
  const emails=d.emails||[], events=d.events||[];
  $("notifyCount").textContent=String((g.highPriority||0)+actions.length);
  if($("orbitMail"))$("orbitMail").textContent=String(g.highPriority||0);
  if($("orbitCal"))$("orbitCal").textContent=String(c.total||0);
  $("sofiaState").textContent="live";
  $("mainLine").textContent="Good afternoon, Moshe.";
  $("mainText").textContent=sof.message||"Sofia has prepared your briefing.";
  $("todayFocus").innerHTML=`
    <div><b>${g.highPriority||0} important emails</b><span>${g.total||emails.length} Gmail signals analyzed</span></div>
    <div><b>${events[0]?events[0].summary:"No next meeting"}</b><span>${events[0]?fmt(events[0].start):"Calendar is clear"}</span></div>
    <div><b>${actions[0]||"No urgent action"}</b><span>Sofia recommendation</span></div>`;
  $("sofiaFeed").innerHTML=[
    feedItem("🔴",`${g.highPriority||0} emails need attention`,`${g.billing||0} billing emails detected`,"inbox","Open Inbox"),
    feedItem("🟠",events[0]?.summary||"No next meeting",events[0]?fmt(events[0].start):"Calendar clear","calendar","Open Calendar"),
    ...actions.slice(0,3).map(a=>feedItem("✅",a,"Recommended by Sofia","inbox","Open"))
  ].join("");
  $("actionCenter").innerHTML=$("sofiaFeed").innerHTML;
  $("alertList").innerHTML=$("sofiaFeed").innerHTML;
  renderInbox(); renderTimeline(events);
}
async function loadBriefing(){
  $("mainText").textContent="Sofia is reading Gmail and Calendar…";
  const {ok,data}=await getJson("/.netlify/functions/google-briefing");
  if(!ok){$("mainText").textContent=data.error||"Briefing failed";return}
  dataState=data; renderHome(data);
}
function answerSofia(q){
  q=q.toLowerCase();
  if(!dataState){return "I need to load your briefing first."}
  const emails=dataState.emails||[], events=dataState.events||[], sof=dataState.sofia||{};
  if(q.includes("meeting")||q.includes("פגישה")) return events[0]?`Your next meeting is ${events[0].summary} at ${fmt(events[0].start)}.`:"You have no upcoming meetings loaded.";
  if(q.includes("email")||q.includes("mail")||q.includes("מייל")) return `You have ${emails.length} recent Gmail signals and ${sof.gmail?.highPriority||0} important emails.`;
  if(q.includes("important")||q.includes("חשוב")||q.includes("דחוף")) return (sof.recommendedActions||[])[0] || "No urgent action detected.";
  if(q.includes("calendar")||q.includes("יומן")) return `I found ${events.length} upcoming calendar events.`;
  return sof.message || "I reviewed your Gmail and Calendar.";
}
function ask(){
  const q=$("askInput").value.trim(); if(!q)return;
  const a=answerSofia(q);
  $("mainText").textContent=a;
  $("sofiaFeed").insertAdjacentHTML("afterbegin", feedItem("💬", q, a, null));
  speak(a);
  $("askInput").value="";
}
function speak(text){
  text=text||$("mainText").textContent;
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
$("talkBtn").addEventListener("click",()=>speak());$("readBtn").addEventListener("click",()=>speak());
$("voiceBtn").addEventListener("click",()=>speak("Ask me what is important today, your next meeting, or your urgent emails."));
$("askSend").addEventListener("click",ask);$("askInput").addEventListener("keydown",e=>{if(e.key==="Enter")ask()});
$("editToggle").addEventListener("click",()=>setEditMode(!editMode));
$("resetLayoutBtn").addEventListener("click",()=>{orbit=defaultOrbit;localStorage.setItem("aura_orbit_v31",JSON.stringify(orbit));renderOrbit();});
$("refreshBtn").addEventListener("click",status);
$("notifyBtn").addEventListener("click",()=>$("notificationCenter").classList.add("active"));
$("closeNotify").addEventListener("click",()=>$("notificationCenter").classList.remove("active"));
$("closeModal").addEventListener("click",()=>$("detailModal").classList.remove("active"));
$("clearActionsBtn").addEventListener("click",()=>$("actionCenter").innerHTML='<div class="muted">Cleared.</div>');
$("openWhatsapp").addEventListener("click",()=>{location.href="https://wa.me/";});
renderOrbit(); status();


/* AURA V32 REAL SOFIA CHAT OVERRIDES */
async function getGeoForSofia() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve({});
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 600000 }
    );
  });
}

async function askSofiaServer(message) {
  const geo = await getGeoForSofia();
  const res = await fetch("/.netlify/functions/sofia-chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...geo })
  });
  return await res.json();
}

async function ask() {
  const q = $("askInput").value.trim();
  if (!q) return;

  $("askInput").value = "";
  $("mainText").textContent = "Sofia is thinking…";
  $("sofiaFeed").insertAdjacentHTML("afterbegin", feedItem("🧑‍💼", q, "You asked Sofia", null));

  try {
    const data = await askSofiaServer(q);
    const answer = data.reply || "אני כאן, משה.";
    $("mainText").textContent = answer;
    $("sofiaFeed").insertAdjacentHTML("afterbegin", feedItem("✨", "Sofia", answer, null));
    speak(answer);
  } catch (e) {
    const answer = "יש בעיה זמנית בחיבור לשיחה של Sofia.";
    $("mainText").textContent = answer;
    $("sofiaFeed").insertAdjacentHTML("afterbegin", feedItem("⚠️", "Sofia", answer, null));
  }
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    speak("המכשיר הזה לא תומך עדיין בהכתבה קולית בדפדפן. אפשר להקליד לי בשדה למטה.");
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = "he-IL";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  $("voiceBar").classList.add("active");
  rec.onresult = e => {
    const text = e.results[0][0].transcript;
    $("askInput").value = text;
    ask();
  };
  rec.onend = () => $("voiceBar").classList.remove("active");
  rec.start();
}

setTimeout(() => {
  const input = $("askInput");
  if (input) input.placeholder = "סופיה…";
  const voice = $("voiceBtn");
  if (voice) voice.onclick = startVoiceInput;
  const send = $("askSend");
  if (send) send.onclick = ask;
  if (input) input.onkeydown = e => { if (e.key === "Enter") ask(); };
}, 0);
