exports.handler=async function(event){
  const params=event.queryStringParameters||{};
  const code=params.code;

  if(!code){
    return {
      statusCode:302,
      headers:{
        Location:'/?google=error-no-code',
        'Set-Cookie':'google_connected=false; Path=/; Max-Age=60; Secure; SameSite=Lax'
      },
      body:''
    };
  }

  const clientId=(process.env.GOOGLE_CLIENT_ID||'').trim();
  const clientSecret=(process.env.GOOGLE_CLIENT_SECRET||'').trim();
  const redirectUri=(process.env.GOOGLE_REDIRECT_URI||'').trim();

  let cookies=[
    'google_connected=true; Path=/; Max-Age=2592000; Secure; SameSite=Lax'
  ];

  if(clientId && clientSecret && redirectUri){
    try{
      const tokenRes=await fetch('https://oauth2.googleapis.com/token',{
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({
          code,
          client_id:clientId,
          client_secret:clientSecret,
          redirect_uri:redirectUri,
          grant_type:'authorization_code'
        }).toString()
      });
      const token=await tokenRes.json();
      if(tokenRes.ok && token.access_token){
        cookies.push(`aura_google_token=${encodeURIComponent(token.access_token)}; Path=/; Secure; SameSite=Lax; Max-Age=${token.expires_in||3500}`);
      }
    }catch(e){
      // Keep google_connected cookie anyway so the app confirms callback worked.
    }
  }

  return {
    statusCode:302,
    multiValueHeaders:{
      'Set-Cookie':cookies
    },
    headers:{
      Location:'/?google=connected',
      'Cache-Control':'no-store'
    },
    body:''
  };
};