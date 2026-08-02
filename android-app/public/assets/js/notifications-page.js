/* Page Notifications : liste l'historique local, marque tout comme lu. */
import { allNotifs, clearNotifs, markAllRead, relTime } from './notifs.js';
import { getLang, t } from './i18n.js';
import { confirmDlg } from './ui.js';

const list = document.getElementById('notifList');
const empty = document.getElementById('notifEmpty');
const btnClear = document.getElementById('btnClear');

function render() {
  const items = allNotifs();
  list.innerHTML = '';
  empty.hidden = items.length > 0;
  btnClear.disabled = items.length === 0;
  const lang = getLang();
  items.forEach((n) => {
    const li = document.createElement('li');
    li.className = 'notif-item card';
    li.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="${n.ok ? 'M4 12.5 9.5 18 20 6.5' : 'M6 6l12 12M18 6 6 18'}"/></svg>
      <span class="n-msg"></span><time class="n-time mono" datetime="${new Date(n.t).toISOString()}"></time>`;
    li.querySelector('.n-msg').textContent = n.msg;
    li.querySelector('.n-time').textContent = relTime(n.t, lang);
    li.querySelector('svg').style.color = n.ok ? 'var(--success)' : 'var(--accent)';
    list.appendChild(li);
  });
}

btnClear.addEventListener('click', async () => {
  const okClear = await confirmDlg({
    title: t('notif.clear'), msg: t('notif.clear_ask'),
    okLabel: t('notif.clear'), cancelLabel: t('dlg.cancel'),
  });
  if (!okClear) return;
  clearNotifs();
  render();
});
document.addEventListener('crispcv:lang', render);

render();
markAllRead(); /* la visite de la page marque tout comme lu */
