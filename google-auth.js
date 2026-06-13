exports.handler = async function () {
  const scope = ["openid","email","profile","https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/calendar.readonly"].join(" ");
  const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent"
  }).toString();
  return { statusCode: 302, headers: { Location: url }, body: "" };
};
