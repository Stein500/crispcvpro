/* fit.js — mise à l'échelle fidèle des feuilles A4.
   Le CV est TOUJOURS composé à 210 mm de large (vrai papier), puis réduit
   visuellement par transform:scale(). Le contenu ne re-flue jamais. */
export function fitSheet(container, { syncHeight = false, max = 1 } = {}) {
  const sheet = container.querySelector('.cv-sheet');
  if (!sheet) return;
  const w = container.clientWidth;
  if (!w) return;
  const s = Math.min(max, w / sheet.offsetWidth);
  sheet.style.transform = s < 0.999 ? `scale(${s})` : '';
  sheet.style.transformOrigin = 'top left';
  if (syncHeight) container.style.height = Math.round(sheet.offsetHeight * s) + 'px';
}

/* Aligne toutes les miniatures d'un scope (après rendu ou resize). */
export function fitThumbs(scope = document) {
  scope.querySelectorAll('.thumb, .fab-thumb, .hcv').forEach((c) => fitSheet(c));
}

/* Un seul recalcul global sur resize / après chargement des polices. */
let armed = false;
export function armGlobalFit(scopeSel) {
  if (armed) return;
  armed = true;
  let t = null;
  const run = () => { clearTimeout(t); t = setTimeout(() => fitThumbs(scopeSel ? document.querySelector(scopeSel) || document : document), 120); };
  addEventListener('resize', run);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
}
