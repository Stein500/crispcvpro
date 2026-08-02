/* CrispCV Convert — moteur de conversion 100 % local.
   - Natif : image→PDF, compresser, redimensionner, JPG/PNG/WebP,
     réduire un PDF (rasterisation maîtrisée), PDF→DOCX (texte)
   - Bibliothèques CDN chargées à la demande (connexion requise) : HEIC, PDF (fusion/scission/→JPG)
   Aucun fichier n'est jamais envoyé sur un serveur. */
import { toast, download, fmtSize, esc } from '../ui.js';
import { t, getLang } from '../i18n.js';
import { imagesToPDF, fileToImage, imageToJpeg, dataURItoBlob } from './mini-pdf.js';
import { makeZip } from '../mini-zip.js';

const $ = (s) => document.querySelector(s);
const CDN = {
  pdflib: 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  pdfjs: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  pdfjsWorker: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  heic: 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js',
};
const loaded = {};
function loadScript(key) {
  if (loaded[key]) return loaded[key];
  loaded[key] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CDN[key];
    s.onload = resolve;
    s.onerror = () => reject(new Error(t('common.required_net')));
    document.head.appendChild(s);
  });
  return loaded[key];
}

/* ---------- définition des outils ---------- */
const TOOLS = [
  { id: 'img-pdf', icon: 'M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 0v6h6',
    name: 'Image → PDF', fmt: 'JPG · PNG · WEBP → PDF', net: false, multi: true, accept: 'image/*',
    desc: 'Assemblez une ou plusieurs images en un PDF propre, au format A4. Idéal pour un diplôme ou une pièce d\u2019identité.' },
  { id: 'heic-jpg', icon: 'M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4',
    name: 'HEIC → JPG', fmt: 'Photo iPhone → JPG', net: true, multi: true, accept: '.heic,.heif,image/heic,image/heif',
    desc: 'Les photos iPhone (HEIC) sont souvent refusées par les formulaires de candidature. Convertissez-les en JPG universel.' },
  { id: 'compress-img', icon: 'M4 14h16M4 10h16M8 4l-4 3 4 3M16 20l4-3-4-3',
    name: 'Compresser une image', fmt: 'JPG · PNG · WEBP', net: false, multi: false, accept: 'image/*',
    desc: 'Réduisez le poids d\u2019une photo ou d\u2019un scan pour passer sous la limite d\u2019un formulaire, sans perdre en lisibilité.' },
  { id: 'resize-img', icon: 'M4 4h16v16H4zM4 14l5-5 4 4 3-3 4 4',
    name: 'Redimensionner', fmt: 'Largeur/hauteur max', net: false, multi: false, accept: 'image/*',
    desc: 'Réduisez les dimensions d\u2019une image (ex. 1200 px de large) pour l\u2019alléger ou respecter un gabarit.' },
  { id: 'convert-img', icon: 'M8 3v18M16 3v18M3 8h5M3 16h5M16 8h5M16 16h5',
    name: 'Convertir le format', fmt: 'JPG ⇄ PNG ⇄ WEBP', net: false, multi: true, accept: 'image/*',
    desc: 'Passez d\u2019un format d\u2019image à l\u2019autre selon ce que le site de candidature accepte.' },
  { id: 'merge-pdf', icon: 'M7 3h8l4 4v14H7zM15 3v5h5M4 8v13h13M4 8h4',
    name: 'Fusionner des PDF', fmt: 'PDF + PDF → PDF', net: true, multi: true, accept: 'application/pdf',
    desc: 'Regroupez CV, lettre et diplômes en un seul PDF, dans l\u2019ordre choisi.' },
  { id: 'split-pdf', icon: 'M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm6 10v10M9 19l3 3 3-3',
    name: 'Extraire des pages', fmt: 'PDF → pages choisies', net: true, multi: false, accept: 'application/pdf',
    desc: 'Récupérez uniquement les pages utiles d\u2019un PDF (ex. « 1-3,7 »).' },
  { id: 'shrink-pdf', icon: 'M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM12 8v6m0 0-3-3m3 3 3-3',
    name: 'Réduire un PDF', fmt: 'PDF → PDF plus léger', net: true, multi: false, accept: 'application/pdf',
    desc: 'Recompose chaque page en image compressée : efficace sur les scans lourds. Le texte devient non sélectionnable — à réserver aux documents scannés.' },
  { id: 'pdf-jpg', icon: 'M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 15 3-3 3 3M9 10h6',
    name: 'PDF → JPG', fmt: 'Pages en images', net: true, multi: false, accept: 'application/pdf',
    desc: 'Transforme chaque page d\u2019un PDF en image JPG (archive .zip si plusieurs pages).' },
  { id: 'pdf-docx', icon: 'M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM9 12h6M9 16h4M9 8h6',
    name: 'PDF → texte / DOCX', fmt: 'Extraction de texte', net: true, multi: false, accept: 'application/pdf',
    desc: 'Extrait le texte d\u2019un PDF vers un fichier .txt ou .docx. La mise en page complexe (colonnes, tableaux) n\u2019est pas reconstruite.' },
];

let currentTool = null;
let files = [];

/* ---------- rendu ---------- */
function renderToolGrid() {
  const grid = $('#toolGrid');
  grid.innerHTML = '';
  TOOLS.forEach((tool) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'tool-card card-doc';
    card.style.setProperty('--ear', '18px');
    card.setAttribute('aria-pressed', currentTool === tool.id);
    card.innerHTML = `
      <span style="display:flex;align-items:center;gap:10px">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.7" stroke-linecap="square"><path d="${tool.icon}"/></svg>
        <h3>${esc(tool.name)}</h3>
      </span>
      <span class="fmt">${esc(tool.fmt)}</span>
      <p>${esc(tool.desc)}</p>
      ${tool.net ? `<span class="pill">CDN · en ligne</span>` : `<span class="pill pill-ok">100 % local</span>`}`;
    card.addEventListener('click', () => selectTool(tool.id));
    grid.appendChild(card);
  });
}

function selectTool(id) {
  currentTool = id;
  files = [];
  $('#fileChips').innerHTML = '';
  $('#results').innerHTML = '';
  setProgress(0);
  renderToolGrid();
  const tool = TOOLS.find((x) => x.id === id);
  const panel = $('#workPanel');
  panel.hidden = false;
  $('#workTitle').textContent = tool.name;
  $('#noticeNet').hidden = !tool.net;
  $('#noticeLocal').hidden = tool.net;
  $('#noticeShrink').hidden = id !== 'shrink-pdf';
  $('#noticeDocx').hidden = id !== 'pdf-docx';
  $('#optQuality').hidden = !['compress-img', 'img-pdf', 'shrink-pdf', 'pdf-jpg', 'heic-jpg'].includes(id);
  $('#optResize').hidden = id !== 'resize-img';
  showDims();
  $('#optFormat').hidden = !['convert-img', 'resize-img', 'compress-img'].includes(id);
  $('#optPages').hidden = id !== 'split-pdf';
  $('#optOut').hidden = id !== 'pdf-docx';
  const dz = $('#dropzone');
  dz.querySelector('.dz-title').textContent = tool.multi
    ? 'Glissez vos fichiers ici, ou cliquez pour choisir'
    : 'Glissez votre fichier ici, ou cliquez pour choisir';
  $('#fileInput').accept = tool.accept;
  $('#fileInput').multiple = tool.multi;
  $('#results').innerHTML = '';
  $('#progress').firstElementChild.style.width = '0';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------- fichiers ---------- */
async function showDims() {
  const el = $('#resizeDims');
  if (!el) return;
  if (currentTool !== 'resize-img' || !files.length) { el.textContent = ''; return; }
  try {
    const { img, url } = await fileToImage(files[0]);
    el.textContent = (getLang() === 'en'
      ? `image : ${img.naturalWidth} × ${img.naturalHeight} px — empty = original size`
      : `image : ${img.naturalWidth} × ${img.naturalHeight} px — vide = taille d’origine`);
    URL.revokeObjectURL(url);
  } catch { el.textContent = ''; }
}

function addFiles(list) {
  const tool = TOOLS.find((x) => x.id === currentTool);
  files = tool.multi ? files.concat([...list]) : [...list].slice(0, 1);
  const MAX = 50 * 1024 * 1024;
  files = files.filter((f) => {
    if (f.size > MAX) { toast(`« ${f.name} » dépasse 50 Mo. Choisissez un autre fichier.`, false); return false; }
    return true;
  });
  renderFileChips();
  showDims();
  if (files.length) run();
}
function renderFileChips() {
  const host = $('#fileChips');
  host.innerHTML = files.map((f, i) =>
    `<span class="tag">${esc(f.name)} <button type="button" data-i="${i}" aria-label="Retirer">✕</button></span>`).join('');
  host.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => { files.splice(+b.dataset.i, 1); renderFileChips(); if (!files.length) $('#results').innerHTML = ''; }));
}

/* ---------- résultats ---------- */
function addResult(name, blob, before, note) {
  const host = $('#results');
  const item = document.createElement('div');
  item.className = 'result-item';
  const win = before && blob.size < before ? `<span class="win">−${Math.round((1 - blob.size / before) * 100)} %</span>` : '';
  item.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.8"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 0v6h6"/></svg>
    <div style="flex:1;min-width:140px"><b style="font-size:.92rem">${esc(name)}</b><br>
    <span class="sz">${fmtSize(blob.size)}${before ? ` (avant : ${fmtSize(before)})` : ''} ${note ? '· ' + esc(note) : ''}</span></div>
    ${win}<button type="button" class="btn btn-sm">${esc(t('common.download'))}</button>`;
  item.querySelector('button').addEventListener('click', () => download(blob, name));
  host.appendChild(item);
}
const setProgress = (r) => { $('#progress').firstElementChild.style.width = `${Math.round(r * 100)}%`; };
const base = (n) => n.replace(/\.[^.]+$/, '');

/* ---------- conversions ---------- */
let running = false, rerunQueued = false;

/* Une conversion est relancée automatiquement dès qu'un réglage change —
   l'utilisateur voit le résultat se mettre à jour sans rien re-upload. */
let rerunTimer = null;
function queueRun() {
  if (!files.length || !currentTool) return;
  clearTimeout(rerunTimer);
  rerunTimer = setTimeout(() => run(), 450);
}

async function run() {
  if (running) { rerunQueued = true; return; }
  running = true;
  const tool = currentTool;
  const q = +$('#qRange').value / 100;
  const outFmt = $('#imgFmt').value;
  $('#results').innerHTML = '';
  setProgress(0.05);
  try {
    switch (tool) {
      case 'img-pdf': {
        const pages = [];
        for (let i = 0; i < files.length; i++) {
          const { img, url } = await fileToImage(files[i]);
          pages.push(imageToJpeg(img, { maxW: 2480, quality: q }));
          URL.revokeObjectURL(url);
          setProgress(0.1 + 0.8 * (i + 1) / files.length);
        }
        addResult('images-vers-pdf.pdf', imagesToPDF(pages), files.reduce((a, f) => a + f.size, 0), `${pages.length} page(s) A4`);
        break;
      }
      case 'heic-jpg': {
        await loadScript('heic');
        for (let i = 0; i < files.length; i++) {
          const blob = await window.heic2any({ blob: files[i], toType: 'image/jpeg', quality: q });
          addResult(base(files[i].name) + '.jpg', blob, files[i].size);
          setProgress(0.1 + 0.85 * (i + 1) / files.length);
        }
        break;
      }
      case 'compress-img': {
        const { img, url } = await fileToImage(files[0]);
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        const mime = outFmt === 'auto' ? (files[0].type === 'image/png' ? 'image/png' : 'image/jpeg') : outFmt;
        const blob = await new Promise((r) => c.toBlob(r, mime, q));
        URL.revokeObjectURL(url);
        const ext = mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg';
        addResult(base(files[0].name) + '-compresse' + ext, blob, files[0].size, `qualité ${Math.round(q * 100)} %`);
        break;
      }
      case 'resize-img': {
        const { img, url } = await fileToImage(files[0]);
        const maxW = +$('#maxW').value || 0, maxH = +$('#maxH').value || 0;
        const r = imageToJpeg(img, { maxW, maxH, quality: q });
        const mime = outFmt === 'auto' ? 'image/jpeg' : outFmt;
        const blob = mime === 'image/jpeg' ? r.blob : await (async () => {
          const c = document.createElement('canvas'); c.width = r.w; c.height = r.h;
          c.getContext('2d').drawImage(img, 0, 0, r.w, r.h);
          return new Promise((res) => c.toBlob(res, mime, q));
        })();
        URL.revokeObjectURL(url);
        const ext = mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg';
        addResult(base(files[0].name) + `-${r.w}x${r.h}` + ext, blob, files[0].size, `${r.w} × ${r.h} px`);
        break;
      }
      case 'convert-img': {
        for (let i = 0; i < files.length; i++) {
          const { img, url } = await fileToImage(files[i]);
          const c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const ctx = c.getContext('2d');
          if (outFmt === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise((r) => c.toBlob(r, outFmt === 'auto' ? 'image/jpeg' : outFmt, q));
          const mime = outFmt === 'auto' ? 'image/jpeg' : outFmt;
          const ext = mime === 'image/png' ? '.png' : mime === 'image/webp' ? '.webp' : '.jpg';
          addResult(base(files[i].name) + ext, blob, files[i].size);
          URL.revokeObjectURL(url);
          setProgress(0.1 + 0.85 * (i + 1) / files.length);
        }
        break;
      }
      case 'merge-pdf': {
        await loadScript('pdflib');
        const { PDFDocument } = window.PDFLib;
        const out = await PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          const src = await PDFDocument.load(await files[i].arrayBuffer());
          (await out.copyPages(src, src.getPageIndices())).forEach((p) => out.addPage(p));
          setProgress(0.1 + 0.85 * (i + 1) / files.length);
        }
        addResult('pdf-fusionne.pdf', new Blob([await out.save()], { type: 'application/pdf' }),
          files.reduce((a, f) => a + f.size, 0), `${files.length} fichiers`);
        break;
      }
      case 'split-pdf': {
        await loadScript('pdflib');
        const { PDFDocument } = window.PDFLib;
        const src = await PDFDocument.load(await files[0].arrayBuffer());
        const n = src.getPageCount();
        const wanted = parseRanges($('#pagesRange').value, n);
        if (!wanted.length) throw new Error(`Indiquez des pages entre 1 et ${n} (ex. 1-3,${n})`);
        const out = await PDFDocument.create();
        (await out.copyPages(src, wanted)).forEach((p) => out.addPage(p));
        addResult(base(files[0].name) + '-extrait.pdf', new Blob([await out.save()], { type: 'application/pdf' }), files[0].size, `${wanted.length}/${n} page(s)`);
        break;
      }
      case 'shrink-pdf': {
        await loadScript('pdfjs');
        setupPdfjs();
        const doc = await window.pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
        const pages = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const pg = await doc.getPage(i);
          const vp = pg.getViewport({ scale: 1.6 });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          const r = imageToJpeg(c, { quality: Math.min(q, 0.85) });
          pages.push(r);
          setProgress(0.1 + 0.85 * i / doc.numPages);
        }
        addResult(base(files[0].name) + '-leger.pdf', imagesToPDF(pages), files[0].size, `${pages.length} page(s), texte devenu image`);
        break;
      }
      case 'pdf-jpg': {
        await loadScript('pdfjs');
        setupPdfjs();
        const doc = await window.pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
        const outs = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const pg = await doc.getPage(i);
          const vp = pg.getViewport({ scale: 2 });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', q));
          outs.push({ name: `${base(files[0].name)}-page-${i}.jpg`, blob });
          setProgress(0.1 + 0.85 * i / doc.numPages);
        }
        if (outs.length === 1) addResult(outs[0].name, outs[0].blob, files[0].size);
        else {
          const entries = await Promise.all(outs.map(async (o) =>
            ({ name: o.name, data: new Uint8Array(await o.blob.arrayBuffer()) })));
          const zip = makeZip(entries);
          addResult(base(files[0].name) + '-pages.zip', zip, files[0].size, `${outs.length} images JPG`);
        }
        break;
      }
      case 'pdf-docx': {
        await loadScript('pdfjs');
        setupPdfjs();
        const doc = await window.pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
        let text = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const pg = await doc.getPage(i);
          const tc = await pg.getTextContent();
          text += tc.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').trim() + '\n\n';
          setProgress(0.1 + 0.85 * i / doc.numPages);
        }
        if ($('#outFmt').value === 'docx') {
          addResult(base(files[0].name) + '.docx', textToDocx(text), files[0].size, 'texte seul, mise en page non reproduite');
        } else {
          addResult(base(files[0].name) + '.txt', new Blob([text], { type: 'text/plain;charset=utf-8' }), files[0].size);
        }
        break;
      }
    }
    setProgress(1);
    setTimeout(() => setProgress(0), 900); /* la barre s'efface doucement après le succès */
    toast(getLang() === 'en' ? 'Converted' : 'Converti');
  } catch (err) {
    setProgress(0);
    toast(err.message || String(err), false);
  } finally {
    running = false;
    if (rerunQueued) { rerunQueued = false; queueRun(); }
  }
}

function setupPdfjs() { window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN.pdfjsWorker; }
function parseRanges(str, max) {
  const out = new Set();
  (str || '').split(',').forEach((part) => {
    const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) return;
    const a = +m[1], b = +(m[2] || m[1]);
    for (let i = Math.max(1, a); i <= Math.min(max, b); i++) out.add(i - 1);
  });
  return [...out].sort((x, y) => x - y);
}
function textToDocx(text) {
  const xe = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paras = text.split(/\n+/).map((l) =>
    `<w:p><w:r><w:t xml:space="preserve">${xe(l)}</w:t></w:r></w:p>`).join('');
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`;
  const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  return makeZip([{ name: '[Content_Types].xml', data: types }, { name: '_rels/.rels', data: rels }, { name: 'word/document.xml', data: document }]);
}

/* ---------- init ---------- */
function init() {
  renderToolGrid();
  const dz = $('#dropzone');
  const fi = $('#fileInput');
  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); }
  });
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('over'); if (currentTool) addFiles(e.dataTransfer.files); });
  fi.addEventListener('change', () => { addFiles(fi.files); fi.value = ''; /* sinon, re-choisir le même fichier ne déclenche rien */ });
  $('#qOut').textContent = $('#qRange').value + ' %';
  $('#qRange').addEventListener('input', () => { $('#qOut').textContent = $('#qRange').value + ' %'; queueRun(); });
  ['#maxW', '#maxH', '#imgFmt', '#outFmt', '#pagesRange'].forEach((sel) => {
    const elx = $(sel);
    if (elx) elx.addEventListener('input', queueRun);
  });
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
