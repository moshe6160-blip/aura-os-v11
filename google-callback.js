exports.handler = async function (event) {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  if (!code) return { statusCode: 302, headers: { Location: "/?google=error-no-code" }, body: "" };

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type":"application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code"
    })
  });
  const data = await res.json();

  if (!data.access_token) return { statusCode: 302, headers: { Location: "/?google=token-error" }, body: "" };

  return {
    statusCode: 302,
    multiValueHeaders: {
      "Set-Cookie": [
        "google_connected=true; Path=/; Max-Age=2592000; Secure; SameSite=Lax",
        `aura_google_token=${encodeURIComponent(data.access_token)}; Path=/; Max-Age=3500; Secure; SameSite=Lax`
      ]
    },
    headers: { Location: "/?google=connected" },
    body: ""
  };
};
