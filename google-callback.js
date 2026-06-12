exports.handler = async function(event) {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 400, body: 'Missing Google code' };
  }

  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const token = await tokenRes.json();

  if (!tokenRes.ok) {
    return { statusCode: 500, body: JSON.stringify(token) };
  }

  // NOTE: This prototype stores token in an httpOnly cookie.
  // For production, store encrypted tokens per user in Supabase.
  return {
    statusCode: 302,
    headers: {
      Location: '/',
      'Set-Cookie': `aura_google_token=${encodeURIComponent(token.access_token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3500`
    },
    body: ''
  };
};
