import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Home, Brain, Users, CalendarDays, Settings, Mail, MessageCircle, CheckCircle2, Phone, Sparkles, Clock, ChevronRight, Mic, Send, Shield, Zap} from 'lucide-react';
import './styles.css';

const tabs = [
  {id:'home', label:'Home', icon:Home},
  {id:'sofia', label:'Sofia', icon:Brain},
  {id:'people', label:'People', icon:Users},
  {id:'day', label:'Day', icon:CalendarDays},
  {id:'universe', label:'Universe', icon:Settings},
];

const people = [
  {name:'Cam', role:'Secretary', status:'Calendar test pending', tone:'Work'},
  {name:'Washington', role:'Project team', status:'Waiting for centrelines', tone:'Project'},
  {name:'O Two Hotel', role:'Revenue OS', status:'Occupancy attention in 12 days', tone:'Business'},
  {name:'Vardophase', role:'Operations', status:'2 approvals pending', tone:'Company'},
];

function GlassCard({children, className=''}){ return <div className={`glass ${className}`}>{children}</div> }
function Stat({n,label,kind}){return <GlassCard className={`stat ${kind}`}><b>{n}</b><span>{label}</span></GlassCard>}

function HomeScreen({setTab}){
  return <main className="screen homeScreen">
    <section className="hero">
      <div className="brandRow"><span className="orbMini"/> <span>AURA LIFE</span></div>
      <h1>Good Evening,<br/>Moshe</h1>
      <p className="date">Friday, 12 June</p>
    </section>

    <GlassCard className="sofiaPulse" onClick={()=>setTab('sofia')}>
      <div>
        <span className="eyebrow"><Sparkles size={14}/> Sofia Insight</span>
        <h2>Your day needs focus, not more apps.</h2>
        <p>3 critical items, 7 pending actions and 2 opportunities are waiting for review.</p>
      </div>
      <button className="roundButton"><Brain size={28}/></button>
    </GlassCard>

    <div className="statsGrid">
      <Stat n="3" label="Critical" kind="red"/><Stat n="7" label="Pending" kind="amber"/><Stat n="2" label="Opportunities" kind="green"/>
    </div>

    <section className="section"><h3>Today</h3><div className="quickGrid">
      <GlassCard><Mail/><span>Emails</span><small>3 important</small></GlassCard>
      <GlassCard><CalendarDays/><span>Meetings</span><small>2 today</small></GlassCard>
      <GlassCard><CheckCircle2/><span>Tasks</span><small>7 open</small></GlassCard>
      <GlassCard><MessageCircle/><span>Messages</span><small>4 waiting</small></GlassCard>
    </div></section>

    <GlassCard className="focusCard"><span className="eyebrow">Focus</span><h3>Hotel occupancy looks weak in 12 days.</h3><p>Sofia recommends checking pricing, OTA visibility and upcoming flight demand.</p><button onClick={()=>setTab('sofia')}>Ask Sofia <ChevronRight size={16}/></button></GlassCard>
  </main>
}

function SofiaScreen(){return <main className="screen"><div className="sofiaHeader"><div className="orbBig"><Brain size={42}/></div><h1>Sofia</h1><p>Your Life AI — organized, focused, automated.</p></div><div className="chat">
  <GlassCard className="msg ai">Good evening Moshe. I found 3 things that need attention today.</GlassCard>
  <GlassCard className="msg user">What requires attention?</GlassCard>
  <GlassCard className="msg ai">Start with O Two occupancy, then review pending approvals, then answer Cam about calendar access.</GlassCard>
</div><div className="suggestions"><button>Summarize my day</button><button>Show critical items</button><button>Plan tomorrow</button></div><div className="inputBar"><Mic/><input placeholder="Ask Sofia..."/><Send/></div></main>}

function PeopleScreen(){return <main className="screen"><h1>People</h1><p className="sub">Communication is organized by person, not by app.</p><div className="peopleList">{people.map(p=><GlassCard className="person" key={p.name}><div><h3>{p.name}</h3><p>{p.role}</p><small>{p.status}</small></div><span>{p.tone}</span></GlassCard>)}</div></main>}
function DayScreen(){const items=[['08:30','Review critical items','AURA'],['10:00','Follow up with Cam','People'],['13:30','Revenue check','Business'],['16:00','Plan tomorrow','Sofia']]; return <main className="screen"><h1>Day</h1><p className="sub">A clean timeline for morning, noon and evening.</p><div className="timeline">{items.map(([t,title,type])=><GlassCard className="timeItem" key={t}><Clock/><div><b>{t}</b><h3>{title}</h3><p>{type}</p></div></GlassCard>)}</div></main>}
function UniverseScreen(){return <main className="screen"><h1>Universe</h1><p className="sub">Future connections. For now, everything stays clean and local.</p><div className="quickGrid universeGrid"><GlassCard><Shield/><span>Privacy First</span><small>No live connectors yet</small></GlassCard><GlassCard><Zap/><span>Future Sync</span><small>Gmail, Calendar, WhatsApp</small></GlassCard><GlassCard><Settings/><span>Design</span><small>Black / Gold / Glass</small></GlassCard><GlassCard><Brain/><span>Sofia Core</span><small>AI layer ready</small></GlassCard></div></main>}

function App(){const [tab,setTab]=useState('home'); const Current=useMemo(()=>({home:HomeScreen,sofia:SofiaScreen,people:PeopleScreen,day:DayScreen,universe:UniverseScreen}[tab]),[tab]); return <div className="app"><Current setTab={setTab}/><nav>{tabs.map(t=>{const Icon=t.icon; return <button key={t.id} onClick={()=>setTab(t.id)} className={tab===t.id?'active':''}><Icon size={22}/><span>{t.label}</span></button>})}</nav></div>}

createRoot(document.getElementById('root')).render(<App/>);
