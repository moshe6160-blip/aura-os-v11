exports.handler = async function (event) {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 302,
      headers: {
        Location: "/?google=error-no-code",
        "Set-Cookie": "google_connected=false; Path=/; Max-Age=60; Secure; SameSite=Lax"
      },
      body: ""
    };
  }

  return {
    statusCode: 302,
    headers: {
      Location: "/?google=connected",
      "Set-Cookie": "google_connected=true; Path=/; Max-Age=2592000; Secure; SameSite=Lax"
    },
    body: ""
  };
};
