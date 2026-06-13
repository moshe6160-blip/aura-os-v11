function getCookie(h,n){
  if(!h) return null;
  const f=h.split(';').map(v=>v.trim()).find(v=>v.startsWith(n+'='));
  return f?decodeURIComponent(f.split('=').slice(1).join('=')):null;
}
async function googleFetch(url,token){
  const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
  let data=null;
  try{ data=await r.json(); }catch(e){ data={raw:await r.text().catch(()=>null)}; }
  return {ok:r.ok,status:r.status,data};
}
exports.handler=async function(event){
  const cookieHeader=event.headers.cookie||event.headers.Cookie||'';
  const token=getCookie(cookieHeader,'aura_google_token');
  if(!token){
    return {
      statusCode:401,
      headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({error:'Google is not connected yet. Tap Connect Google first.',details:'No aura_google_token cookie found.'})
    };
  }

  const warnings=[];
  const emails=[];

  const list=await googleFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:30d',token);
  if(!list.ok){
    warnings.push(`Gmail API error ${list.status}: ${JSON.stringify(list.data).slice(0,220)}`);
  } else if(list.data && list.data.messages){
    for(const m of list.data.messages.slice(0,5)){
      const msg=await googleFetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,token);
      if(msg.ok){
        const hs=(msg.data&&msg.data.payload&&msg.data.payload.headers)||[];
        emails.push({
          subject:(hs.find(h=>h.name==='Subject')||{}).value||'No subject',
          from:(hs.find(h=>h.name==='From')||{}).value||''
        });
      }
    }
  }

  const events=[];
  const now=new Date().toISOString();
  const calUrl='https://www.googleapis.com/calendar/v3/calendars/primary/events?'+new URLSearchParams({
    timeMin:now,
    maxResults:'10',
    singleEvents:'true',
    orderBy:'startTime'
  }).toString();
  const cal=await googleFetch(calUrl,token);
  if(!cal.ok){
    warnings.push(`Calendar API error ${cal.status}: ${JSON.stringify(cal.data).slice(0,220)}`);
  } else {
    for(const ev of ((cal.data&&cal.data.items)||[]).slice(0,5)){
      events.push({
        summary:ev.summary||'Untitled',
        start:(ev.start&&(ev.start.dateTime||ev.start.date))||''
      });
    }
  }

  return {
    statusCode:200,
    headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
    body:JSON.stringify({emails,events,warnings})
  };
};