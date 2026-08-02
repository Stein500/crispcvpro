/* CrispCV — comportements transverses : thème, langue, nav mobile,
   révélation au scroll, toast, enregistrement du service worker. */
import { applyLang, setLang, getLang, t } from './i18n.js';
import { pushNotif, updateBell } from './notifs.js';

const root = document.body.dataset.root || '.';

/* Thème clair/sombre — blanc par défaut (cahier §7) */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('crispcv.theme', theme);
  /* Barre système du navigateur assortie au thème (Chrome/Android) */
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0B0B0A' : '#FAFAF8');
  const btn = document.querySelectorAll('.theme-toggle');
  btn.forEach((b) => {
    b.setAttribute('aria-label', theme === 'dark' ? t('theme.light') : t('theme.dark'));
    b.querySelector('.ic-sun').style.display = theme === 'dark' ? 'none' : '';
    b.querySelector('.ic-moon').style.display = theme === 'dark' ? '' : 'none';
  });
}
const pref = localStorage.getItem('crispcv.theme')
  || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = pref;

document.addEventListener('DOMContentLoaded', () => {
  applyLang();
  applyTheme(pref);
  showSplash();

  document.querySelectorAll('.theme-toggle').forEach((b) =>
    b.addEventListener('click', () =>
      applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')));

  document.querySelectorAll('.lang-toggle').forEach((b) =>
    b.addEventListener('click', () => setLang(getLang() === 'fr' ? 'en' : 'fr')));

  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  /* Bottom nav : désormais en HTML statique dans chaque page — zéro
     clignotement à la navigation, disponible avant même le JS. */
  updateBell();

  /* Révélation discrète au chargement/scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.isIntersecting && en.target.classList.add('in'));
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* Plus de mode hors-ligne : désinscription de tout ancien service worker et
     purge des caches des versions précédentes → le site se recharge toujours frais. */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  }
  if ('caches' in window) {
    caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
  }
});

/* Toast partagé */
export function toast(msg, ok = true) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="${ok ? 'M4 12.5 9.5 18 20 6.5' : 'M6 6l12 12M18 6 6 18'}"/></svg><span></span>`;
  el.querySelector('span').textContent = msg;
  el.querySelector('svg').style.color = ok ? 'var(--success)' : 'var(--accent)';
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2000); /* 2 s nettes */
  pushNotif(msg, ok); /* archivée dans le centre de notifications */
}

/* Utilitaires partagés */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000); /* délai large : les téléphones lents démarrent le téléchargement en retard */
}

/* Boîte de confirmation maison — remplace les confirm() natifs du navigateur.
   Renvoie une promesse : true si l'utilisateur confirme. */
export function confirmDlg({ title, msg, okLabel, cancelLabel, danger = true }) {
  return new Promise((resolve) => {
    const o = document.createElement('div');
    o.className = 'export-modal dlg';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.innerHTML = `
      <div class="card export-sheet card-doc dlg-sheet" style="--ear:16px">
        <div class="export-head"><b></b></div>
        <p class="dlg-msg"></p>
        <div class="dlg-actions">
          <button type="button" class="btn btn-ghost dlg-no"></button>
          <button type="button" class="btn ${danger ? 'btn-accent' : ''} dlg-yes"></button>
        </div>
      </div>`;
    o.querySelector('b').textContent = title || '';
    o.querySelector('.dlg-msg').textContent = msg || '';
    o.querySelector('.dlg-no').textContent = cancelLabel || 'Annuler';
    o.querySelector('.dlg-yes').textContent = okLabel || 'Confirmer';
    document.body.appendChild(o);
    document.documentElement.style.overflow = 'hidden';
    const done = (v) => {
      o.remove();
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      resolve(v);
    };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    document.addEventListener('keydown', onKey);
    o.addEventListener('pointerdown', (e) => { if (e.target === o) done(false); });
    o.querySelector('.dlg-no').addEventListener('click', () => done(false));
    o.querySelector('.dlg-yes').addEventListener('click', () => done(true));
    requestAnimationFrame(() => o.classList.add('open'));
    o.querySelector('.dlg-no').focus();
  });
}

export const fmtSize = (n) => {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / 1024 / 1024).toFixed(2)} Mo`;
};

/* ---------- Bottom nav : HTML statique par page (voir index.html & co).
   Avant, elle était injectée en JS → clignotement à chaque navigation.
   Cette section est volontairement vide : la nav vit dans le markup. ---------- */

/* ---------- Splash pro : de vrais CV générés par le moteur du site ---------- */
async function showSplash() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const standalone = matchMedia('(display-mode: standalone)').matches;
  if (sessionStorage.getItem('crispcv.splashed') && !standalone) return;
  sessionStorage.setItem('crispcv.splashed', '1');

  const sp = document.createElement('div');
  sp.className = 'splash';
  sp.setAttribute('aria-hidden', 'true');
  sp.innerHTML = `<div class="splash-inner">
    <div class="splash-cvs"><div class="sc"></div><div class="sc"></div><div class="sc"></div></div>
    <div class="splash-brand">
      <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true"><path d="M15 4h26l14 14v40a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="currentColor"/><path d="M41 4v14h14Z" fill="#B23A2E"/><path d="M21 33.5 28 40.5 44 24.5" fill="none" stroke="var(--paper)" stroke-width="5.5"/></svg>
      <span><b>Crisp</b><i style="font-style:normal;color:var(--g1);font-weight:500">CV</i></span>
    </div>
    <p class="splash-tag">Un CV net. Le bon format.</p>
    <div class="splash-bar"><i></i></div>
  </div>`;
  document.body.appendChild(sp);

  try {
    /* Les 3 feuilles sont de vrais rendus du moteur (render.js), pas des images */
    const [{ renderCV }, { exampleProfile }] = await Promise.all([
      import('./cv/render.js'), import('./cv/store.js')]);
    ['latitude', 'essentiel', 'capitale'].forEach((tpl, i) => {
      const pr = exampleProfile();
      pr.prefs.template = tpl; pr.prefs.accent = '';
      sp.querySelectorAll('.sc')[i].innerHTML = renderCV(pr);
    });
  } catch { /* la marque seule suffit si le rendu échoue */ }

  requestAnimationFrame(() => sp.classList.add('go'));
  setTimeout(() => { sp.classList.add('bye'); setTimeout(() => sp.remove(), 550); }, 1450);
}

/* ---------- Bouton d'installation PWA ---------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'install-btn';
  b.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 20h16"/></svg><span>${t('install.btn')}</span>`;
  b.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    b.remove();
  });
  document.body.appendChild(b);
});
window.addEventListener('appinstalled', () => {
  document.querySelector('.install-btn')?.remove();
  toast(t('install.done'));
});

/* ---------- Entrée « Installer » permanente dans le menu burger ----------
   Toujours visible, jamais flottante : elle déclenche l'installation native
   quand le navigateur le permet, sinon elle explique le geste manuel. */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;
  const a = document.createElement('a');
  a.href = '#';
  a.dataset.i18n = 'install.btn';
  a.textContent = t('install.btn');
  a.style.color = 'var(--accent)';
  a.style.fontWeight = '600';
  a.addEventListener('click', async (e) => {
    e.preventDefault();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      document.querySelector('.install-btn')?.remove();
    } else {
      toast(t('install.hint'));
    }
  });
  nav.appendChild(a);
});
