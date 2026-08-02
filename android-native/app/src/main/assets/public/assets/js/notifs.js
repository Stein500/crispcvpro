/* notifs.js — centre de notifications local : chaque action importante est
   enregistrée sur l'appareil et consultable sur la page Notifications. */
const KEY = 'crispcv.notifs';
const READ = 'crispcv.notifs.read';
const MAX = 60;

export function allNotifs() {
  try { const a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a : []; }
  catch { return []; }
}

export function unreadCount() {
  const read = +localStorage.getItem(READ) || 0;
  return allNotifs().filter((n) => n.t > read).length;
}

export function pushNotif(msg, ok = true) {
  const a = allNotifs();
  a.unshift({ t: Date.now(), msg, ok });
  try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, MAX))); } catch { /* quota */ }
  updateBell();
}

export function markAllRead() {
  const a = allNotifs();
  localStorage.setItem(READ, String(a[0]?.t || Date.now()));
  updateBell();
}

export function clearNotifs() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(READ);
  updateBell();
}

/* Badge numéroté sur la cloche du header (toutes les pages). */
export function updateBell() {
  const c = unreadCount();
  document.querySelectorAll('.bell-badge').forEach((b) => {
    b.hidden = c === 0;
    b.textContent = c > 99 ? '99+' : String(c);
  });
}

/* Temps relatif humain, FR/EN selon la langue de l'appareil du site. */
export function relTime(ts, lang = 'fr') {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  const fr = lang !== 'en';
  if (s < 60) return fr ? 'à l\u2019instant' : 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return fr ? `il y a ${m} min` : `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return fr ? `il y a ${h} h` : `${h} h ago`;
  const j = Math.floor(h / 24);
  if (j < 30) return fr ? `il y a ${j} j` : `${j} d ago`;
  return new Date(ts).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR');
}
