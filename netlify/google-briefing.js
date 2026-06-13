function getCookie(header, name) {
  if (!header) return null;
  const found = header.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

exports.handler = async function (event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const token = getCookie(cookieHeader, "aura_google_token");

  if (!token) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing access token. Connect Google again." })
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gmailCount: 0,
      calendarCount: 0,
      message: "Access token found. Briefing function is working."
    })
  };
};
