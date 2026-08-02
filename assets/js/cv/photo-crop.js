/* photo-crop.js — recadrage de la photo de CV, 100 % local (canvas), sans dépendance.
   Glisser pour positionner, curseur pour zoomer, aperçu rond/carré. */
import { esc } from '../ui.js';
import { B } from './labels.js';

/* openCropper(file, cb) → cb({ photo: dataURL, shape: 'round'|'square' } | null) */
export function openCropper(file, cb) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    build(img, cb);
  };
  img.onerror = () => { URL.revokeObjectURL(url); cb(null); };
  img.src = url;
}

function build(img, cb) {
  const SIZE = 300; // côté du carré d'aperçu (px CSS)
  const OUT = 440;  // résolution de sortie
  let shape = 'square';
  /* échelle minimale = l'image couvre tout le carré */
  const cover = SIZE / Math.min(img.width, img.height);
  let scale = cover;
  let dx = (SIZE - img.width * scale) / 2;
  let dy = (SIZE - img.height * scale) / 2;

  const overlay = document.createElement('div');
  overlay.className = 'crop-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', B('crop_title'));
  overlay.innerHTML = `
    <div class="card crop-card card-doc" style="--ear:16px">
      <div class="crop-head"><b>${esc(B('crop_title'))}</b>
        <button type="button" class="icon-btn crop-x" aria-label="${esc(B('crop_cancel'))}">✕</button></div>
      <div class="crop-stage"><canvas width="${SIZE}" height="${SIZE}" aria-label="${esc(B('crop_title'))}"></canvas></div>
      <div class="crop-row">
        <label class="muted" style="font-size:.8rem;flex:none">${esc(B('crop_zoom'))}</label>
        <input type="range" class="crop-range" min="1" max="4" step="0.01" value="1" aria-label="${esc(B('crop_zoom'))}">
      </div>
      <div class="crop-row crop-shapes" role="group" aria-label="${esc(B('photo_shape'))}">
        <button type="button" class="filter-btn sh-sq" aria-pressed="true">${esc(B('shape_square'))}</button>
        <button type="button" class="filter-btn sh-rd" aria-pressed="false">${esc(B('shape_round'))}</button>
      </div>
      <p class="hint" style="margin:2px 0 0">${esc(B('crop_hint'))}</p>
      <div class="crop-actions">
        <button type="button" class="btn btn-ghost crop-cancel">${esc(B('crop_cancel'))}</button>
        <button type="button" class="btn btn-accent crop-ok">${esc(B('crop_apply'))}</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';

  const canvas = overlay.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const range = overlay.querySelector('.crop-range');
  const stage = overlay.querySelector('.crop-stage');

  const clamp = () => {
    const w = img.width * scale, h = img.height * scale;
    dx = Math.min(0, Math.max(SIZE - w, dx));
    dy = Math.min(0, Math.max(SIZE - h, dy));
  };
  const draw = () => {
    clamp();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
  };
  draw();

  /* zoom : on garde le point central stable */
  range.addEventListener('input', () => {
    const prev = scale;
    scale = cover * parseFloat(range.value);
    const k = scale / prev;
    dx = SIZE / 2 - (SIZE / 2 - dx) * k;
    dy = SIZE / 2 - (SIZE / 2 - dy) * k;
    draw();
  });

  /* glisser (souris + tactile via Pointer Events) */
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX - dx, y: e.clientY - dy };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    dx = e.clientX - drag.x;
    dy = e.clientY - drag.y;
    draw();
  });
  const stop = () => { drag = null; };
  stage.addEventListener('pointerup', stop);
  stage.addEventListener('pointercancel', stop);

  /* forme d'aperçu (visuelle ; la sortie reste un carré) */
  const setShape = (s) => {
    shape = s;
    stage.style.borderRadius = s === 'round' ? '50%' : '6px';
    overlay.querySelector('.sh-sq').setAttribute('aria-pressed', s === 'square');
    overlay.querySelector('.sh-rd').setAttribute('aria-pressed', s === 'round');
  };
  overlay.querySelector('.sh-sq').addEventListener('click', () => setShape('square'));
  overlay.querySelector('.sh-rd').addEventListener('click', () => setShape('round'));

  const close = (res) => {
    overlay.remove();
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    cb(res);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(null); };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) close(null); });
  overlay.querySelector('.crop-x').addEventListener('click', () => close(null));
  overlay.querySelector('.crop-cancel').addEventListener('click', () => close(null));
  overlay.querySelector('.crop-ok').addEventListener('click', () => {
    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    const k = OUT / SIZE;
    const octx = out.getContext('2d');
    octx.fillStyle = '#fff';
    octx.fillRect(0, 0, OUT, OUT);
    octx.drawImage(img, dx * k, dy * k, img.width * scale * k, img.height * scale * k);
    close({ photo: out.toDataURL('image/jpeg', 0.9), shape });
  });
}
