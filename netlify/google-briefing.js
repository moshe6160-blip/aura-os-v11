async function getGmailDetails(token, messages) {
  const results = [];

  for (const msg of messages.slice(0, 10)) {
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      const headers = data.payload?.headers || [];

      const subject =
        headers.find(h => h.name === "Subject")?.value ||
        "No Subject";

      const from =
        headers.find(h => h.name === "From")?.value ||
        "";

      results.push({
        id: msg.id,
        subject,
        from
      });
    } catch (e) {
      console.error(e);
    }
  }

  return results;
}
