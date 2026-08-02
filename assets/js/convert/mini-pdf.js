/* Mini-PDF — génère un vrai PDF (vectoriel conteneur, images JPEG embarquées
   en DCTDecode) entièrement en local. Utilisé pour Image→PDF et « réduire un PDF ». */

/**
 * pages: [{jpeg: Uint8Array, w: px, h: px}]
 * Mise en page : chaque image ajustée dans une page A4 (595×842 pt), ratio conservé.
 */
export function imagesToPDF(pages) {
  const chunks = [];
  let len = 0;
  const push = (data) => {
    const u = typeof data === 'string' ? ascii(data) : data;
    chunks.push(u); len += u.length;
  };
  const ascii = (s) => {
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xFF;
    return u;
  };

  const A4W = 595.28, A4H = 841.89;
  const kids = [];
  const objects = []; // {id, build()}
  let nextId = 1;
  const catalogId = nextId++, pagesId = nextId++;

  const pageRefs = [];
  for (const pg of pages) {
    const imgId = nextId++, contentId = nextId++, pageId = nextId++;
    const r = Math.min(A4W / pg.w, A4H / pg.h);
    const w = Math.round(pg.w * r * 100) / 100, h = Math.round(pg.h * r * 100) / 100;
    const x = Math.round((A4W - w) / 2 * 100) / 100, y = Math.round((A4H - h) / 2 * 100) / 100;
    pageRefs.push({ pageId, imgId, contentId, content: `q\n${w} 0 0 ${h} ${x} ${y} cm\n/Im${imgId} Do\nQ\n` });
    objects.push({ id: imgId, stream: pg.jpeg, dict: `/Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode` });
    objects.push({ id: contentId, str: pageRefs[pageRefs.length - 1].content, streamOf: 'content' });
    objects.push({ id: pageId, body: `<</Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4W} ${A4H}] /Resources <</XObject <</Im${imgId} ${imgId} 0 R>> /ProcSet [/PDF /ImageC]>> /Contents ${contentId} 0 R>>` });
    kids.push(`${pageId} 0 R`);
  }

  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  push(header);
  const offsets = [0];
  const writeObj = (id, bodyStr) => {
    offsets[id] = len;
    push(`${id} 0 obj\n${bodyStr}\nendobj\n`);
  };
  writeObj(catalogId, `<</Type /Catalog /Pages ${pagesId} 0 R>>`);
  writeObj(pagesId, `<</Type /Pages /Count ${kids.length} /Kids [${kids.join(' ')}]>>`);
  for (const o of objects) {
    if (o.stream) {
      offsets[o.id] = len;
      push(`${o.id} 0 obj\n<</Length ${o.stream.length} ${o.dict || ''}>>\nstream\n`);
      push(o.stream);
      push('\nendstream\nendobj\n');
    } else writeObj(o.id, o.body);
  }
  const xrefPos = len;
  const total = nextId;
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) xref += `${String(offsets[i] || 0).padStart(10, '0')} 00000 n \n`;
  push(xref + `trailer\n<</Size ${total} /Root ${catalogId} 0 R>>\nstartxref\n${xrefPos}\n%%EOF`);

  const out = new Uint8Array(len);
  let pos = 0;
  for (const c of chunks) { out.set(c, pos); pos += c.length; }
  return new Blob([out], { type: 'application/pdf' });
}

/* Charge un fichier image → canvas → JPEG (base pour toutes les conversions image) */
export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible : ' + file.name)); };
    img.src = url;
  });
}

export function imageToJpeg(img, { maxW = 0, maxH = 0, quality = 0.92, bg = '#FFFFFF' } = {}) {
  let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  if (maxW || maxH) {
    const r = Math.min(maxW ? maxW / w : 1, maxH ? maxH / h : 1, 1);
    w = Math.round(w * r); h = Math.round(h * r);
  }
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const dataUrl = c.toDataURL('image/jpeg', quality);
  const bin = atob(dataUrl.split(',')[1]);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return { bytes: u, w, h, dataUrl, blob: dataURItoBlob(dataUrl) };
}

export function dataURItoBlob(dataUri) {
  const [head, b64] = dataUri.split(',');
  const mime = /data:(.*?)(;|$)/.exec(head)[1];
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: mime });
}
