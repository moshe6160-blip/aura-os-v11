exports.handler=async function(event){
  const code=event.queryStringParameters&&event.queryStringParameters.code;
  if(!code) return {statusCode:400,body:'Missing Google code'};
  const clientId=(process.env.GOOGLE_CLIENT_ID||'').trim();
  const clientSecret=(process.env.GOOGLE_CLIENT_SECRET||'').trim();
  const redirectUri=(process.env.GOOGLE_REDIRECT_URI||'').trim();
  if(!clientId||!clientSecret||!redirectUri){
    return {statusCode:500,body:'Missing Google environment variables'};
  }
  const params=new URLSearchParams({
    code,
    client_id:clientId,
    client_secret:clientSecret,
    redirect_uri:redirectUri,
    grant_type:'authorization_code'
  });
  const tokenRes=await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:params.toString()
  });
  const token=await tokenRes.json();
  if(!tokenRes.ok || !token.access_token){
    return {statusCode:500,headers:{'Content-Type':'application/json'},body:JSON.stringify(token)};
  }

  const cookies=[
    `aura_google_token=${encodeURIComponent(token.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${token.expires_in||3500}`,
    token.refresh_token ? `aura_google_refresh=${encodeURIComponent(token.refresh_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` : ''
  ].filter(Boolean);

  return {
    statusCode:302,
    headers:{
      Location:'/',
      'Set-Cookie':cookies,
      'Cache-Control':'no-store'
    },
    body:''
  };
};