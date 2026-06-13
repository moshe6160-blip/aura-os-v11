function getCookie(header, name) {
  if (!header) return null;
  const found = header.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=").slice(1).join("=")) : null;
}

exports.handler = async function (event) {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({
      ok: true,
      version: "AURA_OS_V18_FULL_FINAL_GOOGLE_BRIEFING",
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || null,
      googleConnected: getCookie(cookieHeader, "google_connected") === "true",
      hasToken: !!getCookie(cookieHeader, "aura_google_token")
    })
  };
};
