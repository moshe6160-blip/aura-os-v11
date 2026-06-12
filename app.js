const statusEl = document.getElementById('status');
const briefingEl = document.getElementById('briefing');

document.getElementById('connectBtn').onclick = () => {
  window.location.href = '/.netlify/functions/google-auth';
};

document.getElementById('refreshBtn').onclick = async () => {
  briefingEl.innerHTML = '<p>Loading real Google signals...</p>';
  try {
    const res = await fetch('/.netlify/functions/google-briefing');
    const data = await res.json();

    if (!res.ok) {
      briefingEl.innerHTML = `<p>${data.error || 'Not connected yet.'}</p>`;
      return;
    }

    statusEl.textContent = 'Google connected. Sofia is reading real signals.';

    const emails = data.emails || [];
    const events = data.events || [];

    briefingEl.innerHTML = `
      <div class="item"><b>Gmail</b><small>${emails.length} recent email signals</small></div>
      ${emails.map(e => `<div class="item"><b>${escapeHtml(e.subject || 'No subject')}</b><small>${escapeHtml(e.from || '')}</small></div>`).join('')}
      <div class="item"><b>Calendar</b><small>${events.length} upcoming calendar signals</small></div>
      ${events.map(ev => `<div class="item"><b>${escapeHtml(ev.summary || 'Untitled')}</b><small>${escapeHtml(ev.start || '')}</small></div>`).join('')}
    `;
  } catch (e) {
    briefingEl.innerHTML = '<p>Could not load real data. Check Netlify functions and environment variables.</p>';
  }
};

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
