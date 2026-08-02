/* Accueil — remplace le squelette du hero par un VRAI CV
   généré par le moteur de rendu du Studio (preuve produit). */
import { renderCV } from './cv/render.js';
import { exampleProfile } from './cv/store.js';

const host = document.getElementById('heroCv');
if (host) {
  try {
    const p = exampleProfile();
    p.prefs.template = 'latitude';
    p.prefs.accent = '';
    const wrap = document.createElement('div');
    wrap.className = 'hcv';
    wrap.innerHTML = renderCV(p);
    host.textContent = '';
    host.appendChild(wrap);
    const sheet = wrap.firstElementChild;
    const fit = () => {
      const w = wrap.clientWidth;
      if (!w || !sheet.offsetWidth) return;
      const s = Math.min(1, w / sheet.offsetWidth);
      sheet.style.transform = s < 0.999 ? `scale(${s})` : '';
      sheet.style.transformOrigin = 'top left';
      wrap.style.height = Math.round(sheet.offsetHeight * s) + 'px';
    };
    requestAnimationFrame(fit);
    addEventListener('resize', fit);
    /* Recalage une fois les polices chargées + si le conteneur change de taille */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
  } catch { /* le squelette décoratif reste en place */ }
}
