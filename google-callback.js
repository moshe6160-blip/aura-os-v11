exports.handler = async function(event) {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  if (!code) return { statusCode: 302, headers: { Location: "/?google=error-no-code" }, body: "" };

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    }).toString()
  });

  const token = await tokenRes.json();

  if (!tokenRes.ok || !token.access_token) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify(token) };
  }

  return {
    statusCode: 302,
    multiValueHeaders: {
      "Set-Cookie": [
        "google_connected=true; Path=/; Secure; SameSite=Lax; Max-Age=2592000",
        `aura_google_token=${encodeURIComponent(token.access_token)}; Path=/; Secure; SameSite=Lax; Max-Age=3500`
      ]
    },
    headers: { Location: "/?google=connected" },
    body: ""
  };
};
