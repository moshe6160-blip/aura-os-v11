exports.handler = async function() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return { statusCode: 500, body: "Missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI" };
  }

  const scope = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar.readonly"
  ].join(" ");

  const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope
  }).toString();

  return { statusCode: 302, headers: { Location: url }, body: "" };
};
