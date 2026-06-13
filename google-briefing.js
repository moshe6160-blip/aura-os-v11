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
  const googleConnected=getCookie(cookieHeader,'google_connected')==='true';

  if(!googleConnected && !token){
    return {
      statusCode:401,
      headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({error:'Google is not connected yet. Tap Connect Google first.',details:'No google_connected cookie found.'})
    };
  }

  if(!token){
    return {
      statusCode:200,
      headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
      body:JSON.stringify({
        gmailCount:0,
        calendarCount:0,
        note:'Google callback worked. Real Gmail/Calendar token was not stored by browser. V14 confirms connection; next version should store tokens server-side for real data.',
        warnings:['Connected cookie found, access token cookie missing.']
      })
    };
  }

  const warnings=[];
  let gmailCount=0, calendarCount=0;

  const list=await googleFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:30d',token);
  if(!list.ok){
    warnings.push(`Gmail API error ${list.status}: ${JSON.stringify(list.data).slice(0,220)}`);
  } else {
    gmailCount=(list.data.messages||[]).length;
  }

  const now=new Date().toISOString();
  const calUrl='https://www.googleapis.com/calendar/v3/calendars/primary/events?'+new URLSearchParams({
    timeMin:now,maxResults:'10',singleEvents:'true',orderBy:'startTime'
  }).toString();
  const cal=await googleFetch(calUrl,token);
  if(!cal.ok){
    warnings.push(`Calendar API error ${cal.status}: ${JSON.stringify(cal.data).slice(0,220)}`);
  } else {
    calendarCount=(cal.data.items||[]).length;
  }

  return {
    statusCode:200,
    headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
    body:JSON.stringify({gmailCount,calendarCount,warnings})
  };
};