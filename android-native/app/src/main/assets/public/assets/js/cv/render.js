/* CrispCV Studio — moteur de rendu commun à tous les modèles.
   renderCV(profile) → HTML d'une feuille A4 (.cv-sheet).
   Tout contenu utilisateur est échappé (anti-injection, cf. confidentialité). */
import { esc } from '../ui.js';
import { getTemplate } from './templates.js';
import { B, LEVELS } from './labels.js';

let stylesDone = false;
export function ensureCvStyles() {
  if (stylesDone) return;
  stylesDone = true;
  const st = document.createElement('style');
  st.id = 'cv-tpl-styles';
  st.textContent = `
.cv-sheet[data-font="inter"] h1,.cv-sheet[data-font="inter"] h3{font-family:Inter,system-ui,sans-serif}
.cv-sheet[data-font="inter"] .cv-sec>h2{font-family:Inter,system-ui,sans-serif;font-weight:700;letter-spacing:.1em}
.cv-sheet[data-font="grotesk"] h1,.cv-sheet[data-font="grotesk"] h3{font-family:"Space Grotesk",system-ui,sans-serif}
.cv-sheet .sec-plain>h2{border:none;font-family:"Space Grotesk",system-ui,sans-serif;font-size:11.5pt;text-transform:none;letter-spacing:-.01em;padding-bottom:0}
.cv-sheet .sec-leftbar>h2{border:none;border-left:3px solid var(--cv-accent);padding-left:2.5mm;padding-bottom:0}
.cv-sheet .sec-band>h2{background:var(--cv-accent);color:#fff;border:none;padding:1.4mm 3mm}
.cv-sheet .sec-num>h2{border:none;display:flex;gap:2.6mm;align-items:baseline;padding-bottom:1.2mm;border-bottom:1px solid #ddd}
.cv-sheet .sec-num>h2 .n{color:var(--cv-accent);font-size:8.5pt}
.cv-sheet[data-layout^="sidebar"]{display:flex;padding:0}
.cv-sheet[data-layout="sidebar-left"]{flex-direction:row}
.cv-sheet[data-layout="sidebar-right"]{flex-direction:row-reverse}
.cv-sheet[data-layout^="sidebar"] .cv-side{width:62mm;flex:none;padding:11mm 7mm}
.cv-sheet[data-layout^="sidebar"] .cv-main{flex:1;padding:11mm 9mm;min-width:0}
.cv-sheet[data-layout^="sidebar"] .cv-main .cv-head{display:block}
.cv-sheet[data-density="compact"][data-layout^="sidebar"] .cv-main{padding:8mm 7mm}
.cv-sheet[data-density="compact"][data-layout^="sidebar"] .cv-side{padding:8mm 6mm}
.cv-sheet .head-band-sec .cv-sec:first-child{margin-top:0}
.cv-sheet .tl{position:relative;padding-left:5mm;border-left:1.5px solid #ddd;margin-left:1mm}
.cv-sheet .tl .cv-item{position:relative}
.cv-sheet .tl .cv-item::before{content:"";position:absolute;left:-5.85mm;top:1.35mm;width:2.6mm;height:2.6mm;border-radius:50%;background:var(--cv-accent)}
.cv-sheet.hdr-center .cv-head{display:block;text-align:center}
.cv-sheet.hdr-center .cv-contact{justify-content:center}
.cv-sheet.hdr-split .cv-head{align-items:flex-end}
.cv-sheet.hdr-split h1{font-size:30pt;line-height:1.02;max-width:60%}
.cv-sheet .cv-side .cv-sec>h2{font-size:8.8pt}
.cv-sheet .cv-side .cv-photo{margin:0 0 6mm}
.cv-sheet a{color:inherit;text-decoration:none;border-bottom:1px dotted #999}`;
  document.head.appendChild(st);
}

const join = (arr) => arr.filter(Boolean).join('');
const has = (s) => s && String(s).trim().length > 0;

/* ---------- corps de sections ---------- */
function secBody(id, p, tpl) {
  switch (id) {
    case 'summary':
      return has(p.summary) ? `<p style="font-size:9.5pt">${esc(p.summary)}</p>` : '';
    case 'experience': {
      const items = p.experiences.map((e) => {
        const pts = (e.points || []).filter(has);
        return `<div class="cv-item">
          <div class="cv-item-head"><h3>${esc(e.role)}</h3><span class="cv-date">${esc(e.start)}${has(e.start) && (has(e.end) || e.current) ? ' — ' : ''}${e.current ? esc(B('present')) : esc(e.end)}</span></div>
          <div class="cv-org">${esc(join2(e.org, e.city))}</div>
          ${pts.length ? `<ul>${pts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        </div>`;
      }).join('');
      if (!has(items)) return '';
      return tpl.sec === 'timeline' ? `<div class="tl">${items}</div>` : items;
    }
    case 'education':
      if (!p.education.length) return '';
      return p.education.map((e) => `<div class="cv-item">
        <div class="cv-item-head"><h3>${esc(e.degree)}</h3><span class="cv-date">${esc(e.start)}${has(e.start) && has(e.end) ? ' — ' : ''}${esc(e.end)}</span></div>
        <div class="cv-org">${esc(join2(e.school, e.city))}</div>
        ${has(e.details) ? `<div style="font-size:9pt;color:#444">${esc(e.details)}</div>` : ''}
      </div>`).join('');
    case 'skills':
      if (!p.skills.length) return '';
      return `<div class="cv-tags">${p.skills.map((s) => `<span class="cv-tag">${esc(s)}</span>`).join('')}</div>`;
    case 'languages':
      if (!p.languages.length) return '';
      return p.languages.map((l) => `<div class="cv-item" style="margin-bottom:1.4mm">
        <div class="cv-item-head"><h3 style="font-size:9.8pt">${esc(l.name)}</h3><span class="cv-date">${esc(l.level)}</span></div></div>`).join('');
    case 'certifications':
      if (!p.certs.length) return '';
      return `<ul style="margin-left:4.5mm">${p.certs.map((c) => `<li>${esc(c.name)}${has(c.org) ? ` — ${esc(c.org)}` : ''}${has(c.year) ? ` (${esc(c.year)})` : ''}</li>`).join('')}</ul>`;
    case 'projects':
      if (!p.projects.length) return '';
      return p.projects.map((x) => `<div class="cv-item">
        <div class="cv-item-head"><h3 style="font-size:9.8pt">${esc(x.name)}</h3>${has(x.link) ? `<span class="cv-date" style="white-space:normal">${esc(x.link)}</span>` : ''}</div>
        ${has(x.desc) ? `<div style="font-size:9pt;color:#444">${esc(x.desc)}</div>` : ''}</div>`).join('');
    case 'volunteering':
      if (!p.volunteering.length) return '';
      return p.volunteering.map((v) => `<div class="cv-item">
        <div class="cv-item-head"><h3 style="font-size:9.8pt">${esc(v.role)}</h3><span class="cv-date">${esc(v.period)}</span></div>
        <div class="cv-org">${esc(v.org)}</div>
        ${has(v.desc) ? `<div style="font-size:9pt;color:#444">${esc(v.desc)}</div>` : ''}</div>`).join('');
    case 'interests':
      if (!p.interests.length) return '';
      return `<p style="font-size:9.3pt">${p.interests.map(esc).join(' · ')}</p>`;
    case 'custom':
      if (!p.custom.length) return '';
      return p.custom.map((c) => `<div class="cv-item">
        ${has(c.title) ? `<h3 style="font-size:9.8pt;margin-bottom:1mm">${esc(c.title)}</h3>` : ''}
        ${(c.lines || []).filter(has).length ? `<ul style="margin-left:4.5mm">${c.lines.filter(has).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
      </div>`).join('');
    default:
      return '';
  }
}
const join2 = (a, b) => [a, b].filter(has).join(', ');

function secShell(id, idx, body, tpl) {
  if (!body) return '';
  const title = esc(B('sec_' + id));
  let head;
  switch (tpl.sec) {
    case 'plain': return `<section class="cv-sec sec-plain"><h2>${title}</h2>${body}</section>`;
    case 'leftbar': return `<section class="cv-sec sec-leftbar"><h2>${title}</h2>${body}</section>`;
    case 'band': return `<section class="cv-sec sec-band"><h2>${title}</h2>${body}</section>`;
    case 'numbered':
    case 'timeline':
      return `<section class="cv-sec sec-num"><h2><span class="n">${String(idx + 1).padStart(2, '0')}</span>${title}</h2>${body}</section>`;
    default:
      return `<section class="cv-sec"><h2>${title}</h2>${body}</section>`;
  }
}

/* ---------- en-tête ---------- */
function photoShape(p, tpl) {
  const s = (p.prefs && p.prefs.photoShape) || '';
  return s === 'round' || s === 'square' ? s : (tpl.photo === 'none' ? 'square' : tpl.photo);
}

function headerHTML(p, tpl) {
  const c = p.contact;
  const photo = tpl.photo !== 'none' && c.photo
    ? `<img class="cv-photo" src="${c.photo}" alt="" style="${photoShape(p, tpl) === 'round' ? 'border-radius:50%' : ''}">` : '';
  const contactBits = [c.email, c.phone, c.city, c.link].filter(has)
    .map((x) => `<span>${esc(x)}</span>`).join('');
  const nameBlock = `<div>
      <h1 style="${tpl.header === 'band' ? '' : `color:${'inherit'}`}">${esc(c.fullName) || esc(B('ph_name'))}</h1>
      <div class="cv-title" style="color:${tpl.header === 'band' ? '#E8D9B8' : 'var(--cv-accent)'};font-weight:600">${esc(c.title)}</div>
      <div class="cv-contact">${contactBits}</div>
    </div>`;
  if (tpl.header === 'center') return `<div class="cv-head hdr-center" style="text-align:center">${photo}<div style="margin-top:${photo ? '3mm' : '0'}">${nameBlock}</div></div>`;
  if (tpl.header === 'split') return `<div class="cv-head"><div style="flex:1">${nameBlock}</div>${photo}</div>`;
  return `<div class="cv-head"><div style="flex:1;min-width:0">${nameBlock}</div>${photo}</div>`;
}

/* ---------- rendu principal ---------- */
export function renderCV(p) {
  ensureCvStyles();
  const tpl = getTemplate(p.prefs.template);
  const accent = p.prefs.accent || tpl.accent;
  const density = p.prefs.density || tpl.density;
  const font = p.prefs.font || 'grotesk';

  const visible = p.sections.filter((s) => s.visible).map((s) => s.id);
  const sideSet = tpl.side || [];
  const sideSecs = visible.filter((id) => sideSet.includes(id));
  const mainSecs = visible.filter((id) => !sideSet.includes(id));

  const renderSecs = (ids) => join(ids.map((id, i) => secShell(id, i, secBody(id, p, tpl), tpl)));
  const head = headerHTML(p, tpl);
  /* Couleur choisie par l'utilisateur : le bandeau « Capitale » la reprend aussi. */
  const headBg = p.prefs.accent ? `;--cv-headBg:${accent}` : '';
  const attrs = `class="cv-sheet hdr-${tpl.header}" data-layout="${tpl.layout}" data-density="${density}" data-font="${font}" style="--cv-accent:${accent}${headBg}"`;

  if (tpl.layout === 'sidebar-left' || tpl.layout === 'sidebar-right') {
    const sidePhoto = tpl.photo !== 'none' && p.contact.photo
      ? `<img class="cv-photo" src="${p.contact.photo}" alt="" style="${photoShape(p, tpl) === 'round' ? 'border-radius:50%' : ''}">` : '';
    return `<div ${attrs}>
      <aside class="cv-side" style="background:${tpl.sideBg || '#F2F2EF'}">${sidePhoto}${renderSecs(sideSecs)}</aside>
      <div class="cv-main">${head}${renderSecs(mainSecs)}</div>
    </div>`;
  }
  if (tpl.layout === 'two-col') {
    return `<div ${attrs}>${head}<div class="cv-cols"><div class="cv-main">${renderSecs(mainSecs)}</div><aside class="cv-side">${renderSecs(sideSecs)}</aside></div></div>`;
  }
  return `<div ${attrs}>${head}<div class="head-band-sec">${renderSecs(visible)}</div></div>`;
}
