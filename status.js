function getCookie(h,n){
  if(!h) return null;
  const f=h.split(';').map(v=>v.trim()).find(v=>v.startsWith(n+'='));
  return f?decodeURIComponent(f.split('=').slice(1).join('=')):null;
}
exports.handler=async function(event){
  const cookieHeader=(event.headers.cookie||event.headers.Cookie||'');
  const token=getCookie(cookieHeader,'aura_google_token');
  const googleConnected=getCookie(cookieHeader,'google_connected')==='true';
  return {
    statusCode:200,
    headers:{'Content-Type':'application/json','Cache-Control':'no-store'},
    body:JSON.stringify({
      ok:true,
      version:'AURA_OS_V14_COOKIE_FIX',
      hasClientId:!!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret:!!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri:process.env.GOOGLE_REDIRECT_URI||null,
      googleConnected,
      hasToken:!!token
    })
  };
};