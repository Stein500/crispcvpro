/* CrispCV Studio — éditeur : sections, aperçu en direct, modèles,
   personnalisation, vérification ATS, multi-versions, exports.
   Plan du fichier (dans l'ordre) :
     1. état & persistance        2. aperçu A4 (é + lignes de coupe)
     3. vérification ATS          4. éditeur (accordéons, photo + recadrage)
     5. superpositions            zoom modèle · mode guidé · partage
     6. panneaux                  modèles · sections
     7. barre & versions de CV    8. bulle FAB de progression
     9. initialisation                                     */
import { toast, download, esc, confirmDlg } from '../ui.js';
import { t } from '../i18n.js';
import { store, uid, emptyProfile, exampleProfile } from './store.js';
import { renderCV, ensureCvStyles } from './render.js';
import { TEMPLATES, FAMILIES, getTemplate } from './templates.js';
import { checkATS } from './ats.js';
import { profileToDOCXBlob, printSheet, safeName } from './exporters.js';
import { B, LEVELS } from './labels.js';
import { fitSheet, fitThumbs, armGlobalFit } from './fit.js';
import { openCropper } from './photo-crop.js';

const $ = (s) => document.querySelector(s);
const has = (s) => s && String(s).trim().length > 0;
let state = { cvs: [], activeId: null };
let view = 'edit'; // edit | templates | sections | ats
let activeFamily = 'all';
let sampleCache = null;

const cv = () => state.cvs.find((c) => c.id === state.activeId);
const p = () => cv().data;

/* ==================== persistance ==================== */
let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    cv().updatedAt = Date.now();
    await store.put(cv());
  }, 350);
}

/* ==================== aperçu ==================== */
function renderPreview() {
  const box = $('#previewBox');
  box.innerHTML = renderCV(p());
  const sheet = box.firstElementChild;
  /* Colonne masquée (bascule mobile « Éditer ») : pas de mesure fiable —
     on recalculera au basculement vers « Aperçu » (setPane → renderPreview).
     La progression FAB, elle, se met à jour dans tous les cas. */
  if (sheet.offsetParent === null && matchMedia('(max-width:1020px)').matches) { updateFab(); return; }
  requestAnimationFrame(() => {
    const A4 = 297 * (96 / 25.4); // mm → px @96dpi
    const pages = Math.max(1, Math.round(sheet.scrollHeight / A4));
    const info = $('#pageInfo');
    info.textContent = pages === 1 ? B('pages_one') : B('pages_many')(pages);
    info.className = 'page-info pill ' + (pages === 1 ? 'pill-ok' : 'pill-accent');
    /* Lignes de coupe : matérialise chaque fin de page A4 (façon Word). */
    sheet.querySelector('.page-cuts')?.remove();
    if (pages > 1) {
      const cuts = document.createElement('div');
      cuts.className = 'page-cuts';
      cuts.setAttribute('aria-hidden', 'true');
      for (let i = 1; i < pages; i++) {
        cuts.insertAdjacentHTML('beforeend',
          `<i style="top:${(A4 * i).toFixed(1)}px"><span>Page ${i + 1}</span></i>`);
      }
      sheet.appendChild(cuts);
    }
    /* Mise à l'échelle fidèle : la feuille reste un vrai A4 (210 mm),
       simplement réduite visuellement pour tenir dans la colonne. */
    const wrapEl = box.parentElement;
    const cs = getComputedStyle(wrapEl);
    const avail = wrapEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const scale = Math.min(1, avail / sheet.offsetWidth);
    if (scale < 0.999) {
      sheet.style.transform = `scale(${scale})`;
      sheet.style.transformOrigin = 'top left';
      box.style.height = sheet.offsetHeight * scale + 'px';
      /* Le transform ne retrecit pas la boîte de layout (794px natif) :
         on fixe aussi la largeur réduite, sinon le wrapper flex centre
         la boîte non réduite et la feuille part hors écran à gauche. */
      box.style.width = Math.round(sheet.offsetWidth * scale) + 'px';
      box.style.justifyContent = 'flex-start';
    } else {
      sheet.style.transform = '';
      box.style.height = '';
      box.style.width = '';
    }
  });
  updateFab();
}

/* ==================== ATS ==================== */
function renderAts() {
  const r = checkATS(p());
  const chip = $('#atsChip');
  chip.textContent = `ATS — ${r.label}`;
  chip.className = 'pill ' + r.cls;
  chip.title = B('ats_hint');
  const panel = $('#atsPanel');
  if (!panel) return;
  panel.innerHTML = `
    <h3 style="margin-top:0">${esc(B('ats_title'))} <span class="pill ${r.cls}" style="margin-left:8px">${r.label}</span></h3>
    <p class="muted small">${esc(B('ats_hint'))}</p>
    <ul class="ats-list">${r.checks.map((c) => `<li class="${c.level}"><b>${c.level === 'ok' ? 'OK' : c.level === 'warn' ? '!' : 'i'}</b><span>${esc(c.msg)}</span></li>`).join('')}</ul>`;
}

/* ==================== éditeur (colonne gauche) ==================== */
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
const input = (val, ph, type = 'text') => `<input type="${type}" value="${esc(val)}" placeholder="${esc(ph || '')}">`;
const textarea = (val, ph) => `<textarea placeholder="${esc(ph || '')}">${esc(val)}</textarea>`;
const fgroup = (label, inner, hint) =>
  `<div class="field"><label>${esc(label)}</label>${inner}${hint ? `<span class="hint">${esc(hint)}</span>` : ''}</div>`;
const bind = (node, sel, set) => node.querySelector(sel).addEventListener('input', (e) => {
  set(e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  scheduleSave(); renderPreview(); renderAts();
});
const bindC = (node, sel, set) => node.querySelector(sel).addEventListener('change', (e) => {
  set(e.target.checked); scheduleSave(); renderPreview(); renderAts();
});

function listSection(sec, title, empty, items, entryHTML, wire, addLabel, add) {
  const acc = el(`<details class="acc" open><summary>${esc(title)} <span class="pill" style="margin-left:6px">${items.length}</span><span class="chev">›</span></summary><div class="body"></div></details>`);
  const body = acc.querySelector('.body');
  if (!items.length) body.appendChild(el(`<div class="empty">${esc(empty)}</div>`));
  items.forEach((it, i) => {
    const n = el(entryHTML(it, i));
    wire(n, it, i);
    body.appendChild(n);
  });
  const btn = el(`<button type="button" class="add-btn">${esc(addLabel)}</button>`);
  btn.addEventListener('click', () => { add(); structural(); });
  body.appendChild(btn);
  return acc;
}
function structural() { scheduleSave(); renderEditor(); renderPreview(); renderAts(); }

/* ---- bascule mobile Éditer / Aperçu ---- */
function setPane(pane) {
  const root = $('#builderRoot');
  if (!root) return;
  root.dataset.pane = pane;
  document.querySelectorAll('.pane-btn').forEach((b) => b.setAttribute('aria-pressed', b.dataset.pane === pane));
  if (pane === 'preview') renderPreview(); /* la largeur change → recalage */
}
function entryHead(title, items, i) {
  return `<div class="entry-head"><b>${esc(title)}</b><div class="mini-btns">
    <button type="button" class="mini-btn up" aria-label="Monter" ${i === 0 ? 'disabled' : ''}>↑</button>
    <button type="button" class="mini-btn down" aria-label="Descendre" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
    <button type="button" class="mini-btn danger del" aria-label="Supprimer">✕</button></div></div>`;
}
function wireEntryHead(node, items, i) {
  node.querySelector('.del').addEventListener('click', () => { items.splice(i, 1); structural(); });
  const up = node.querySelector('.up'), down = node.querySelector('.down');
  if (up) up.addEventListener('click', () => { [items[i - 1], items[i]] = [items[i], items[i - 1]]; structural(); });
  if (down) down.addEventListener('click', () => { [items[i + 1], items[i]] = [items[i], items[i + 1]]; structural(); });
}

function tagSection(sec, title, items, addLabel, ph) {
  const acc = el(`<details class="acc" open><summary>${esc(title)} <span class="pill" style="margin-left:6px">${items.length}</span><span class="chev">›</span></summary><div class="body"></div></details>`);
  const body = acc.querySelector('.body');
  const tags = el(`<div class="tags" style="margin-bottom:10px"></div>`);
  items.forEach((s, i) => {
    const chip = el(`<span class="tag">${esc(s)}<button type="button" aria-label="Retirer">✕</button></span>`);
    chip.querySelector('button').addEventListener('click', () => { items.splice(i, 1); structural(); });
    tags.appendChild(chip);
  });
  body.appendChild(tags);
  const row = el(`<div style="display:flex;gap:8px"><input type="text" placeholder="${esc(ph)}"><button type="button" class="btn btn-sm btn-ghost" style="flex:none">${esc(addLabel)}</button></div>`);
  const commit = () => {
    const inp = row.querySelector('input');
    if (has(inp.value)) { items.push(inp.value.trim()); structural(); }
  };
  row.querySelector('button').addEventListener('click', commit);
  row.querySelector('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
  });
  body.appendChild(row);
  return acc;
}

function renderEditor() {
  const host = $('#editorSections');
  host.innerHTML = '';
  if (view === 'templates') { host.appendChild(buildTemplatesPanel()); return; }
  if (view === 'sections') { host.appendChild(buildSectionsPanel()); return; }
  if (view === 'ats') { const d = el('<div class="acc" open><div class="body" id="atsPanel"></div></div>'); host.appendChild(d); renderAts(); return; }

  const d = p();

  /* --- coordonnées --- */
  const c = el(`<details class="acc" open><summary>${esc(B('sec_contact'))}<span class="chev">›</span></summary><div class="body">
    <div class="grid-2">
      ${fgroup(B('f_fullname'), input(d.contact.fullName, B('ph_name')), '')}
      ${fgroup(B('f_title'), input(d.contact.title, B('ph_title')), '')}
      ${fgroup(B('f_email'), input(d.contact.email, B('ph_email'), 'email'), '')}
      ${fgroup(B('f_phone'), input(d.contact.phone, B('ph_phone'), 'tel'), '')}
      ${fgroup(B('f_city'), input(d.contact.city, B('ph_city')), '')}
      ${fgroup(B('f_link'), input(d.contact.link, B('ph_link')), '')}
    </div>
    <div class="field"><label>${esc(B('f_photo'))}</label>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <button type="button" class="btn btn-sm btn-ghost ph-add">${esc(d.contact.photo ? B('f_photo_rm') : B('f_photo_add'))}</button>
        ${d.contact.photo ? `<button type="button" class="btn btn-sm btn-ghost ph-recrop">${esc(B('crop_title'))}</button>` : ''}
        <input type="file" accept="image/*" class="ph-file" hidden>
        <span class="ph-prev">${d.contact.photo ? `<img src="${d.contact.photo}" alt="" style="width:38px;height:38px;object-fit:cover;border-radius:${(p().prefs.photoShape || '') === 'round' ? '50%' : '4px'}">` : ''}</span>
        <select class="ph-shape" aria-label="${esc(B('photo_shape'))}" style="width:auto;padding:7px 9px;font-size:.83rem">
          <option value="">${esc(B('shape_template'))}</option>
          <option value="round">${esc(B('shape_round'))}</option>
          <option value="square">${esc(B('shape_square'))}</option>
        </select>
      </div>
      <span class="hint">${esc(B('f_photo_hint'))}</span>
    </div></div></details>`);
  const map = ['fullName', 'title', 'email', 'phone', 'city', 'link'];
  c.querySelectorAll('.grid-2 input').forEach((inp, i) =>
    inp.addEventListener('input', () => { d.contact[map[i]] = inp.value; scheduleSave(); renderPreview(); renderAts(); }));
  const phBtn = c.querySelector('.ph-add'), phFile = c.querySelector('.ph-file');
  const phShape = c.querySelector('.ph-shape'), phRe = c.querySelector('.ph-recrop');
  let lastPhotoFile = null;
  phShape.value = p().prefs.photoShape || '';
  phShape.addEventListener('change', () => { p().prefs.photoShape = phShape.value; scheduleSave(); renderPreview(); });
  const pickAndCrop = () => phFile.click();
  phBtn.addEventListener('click', () => {
    if (d.contact.photo) { d.contact.photo = ''; structural(); } else pickAndCrop();
  });
  if (phRe) phRe.addEventListener('click', () => {
    if (lastPhotoFile) { openCropper(lastPhotoFile, applyCrop); return; }
    phFile.click();
  });
  const applyCrop = (res) => {
    if (!res) return;
    d.contact.photo = res.photo;
    d.prefs.photoShape = res.shape;
    structural();
  };
  phFile.addEventListener('change', () => {
    const f = phFile.files[0];
    if (!f) return;
    lastPhotoFile = f;
    openCropper(f, applyCrop);
    phFile.value = '';
  });
  host.appendChild(c);

  /* --- accroche --- */
  const s = el(`<details class="acc" open><summary>${esc(B('sec_summary'))}<span class="chev">›</span></summary><div class="body">
    ${fgroup(B('f_summary'), textarea(d.summary, B('ph_summary')), B('f_summary_hint'))}</div></details>`);
  bind(s, 'textarea', (v) => { d.summary = v; });
  host.appendChild(s);

  /* --- sections à listes, dans l'ordre choisi --- */
  const visible = d.sections.filter((x) => x.visible).map((x) => x.id);
  for (const id of visible) {
    if (id === 'summary') continue;
    host.appendChild(buildListSection(id, d));
  }
  if (guided.on) applyGuided(false); /* les accordéons sont reconstruits : on recale */
}

function buildListSection(id, d) {
  switch (id) {
    case 'experience':
      return listSection(id, B('sec_experience'), B('empty_exp'), d.experiences,
        (e, i) => `<div class="entry">${entryHead(e.role || B('f_role') + ' ' + (i + 1), d.experiences, i)}
          <div class="grid-2">
            ${fgroup(B('f_role'), input(e.role, B('ph_role')))}
            ${fgroup(B('f_org'), input(e.org, B('ph_org')))}
            ${fgroup(B('f_city'), input(e.city, B('ph_city')))}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              ${fgroup(B('f_start'), input(e.start, B('ph_start')))}
              ${fgroup(B('f_end'), input(e.end, B('ph_end')))}
            </div>
          </div>
          <label class="checkbox" style="margin-bottom:12px"><input type="checkbox" class="cur" ${e.current ? 'checked' : ''}><span>${esc(B('f_current'))}</span></label>
          ${fgroup(B('f_points'), textarea((e.points || []).join('\n'), B('ph_points')), B('f_points_hint'))}
        </div>`,
        (n, e, i) => {
          wireEntryHead(n, d.experiences, i);
          const inps = n.querySelectorAll('.grid-2 input');
          const keys = ['role', 'org', 'city', 'start', 'end'];
          inps.forEach((inp, k) => inp.addEventListener('input', () => { e[keys[k]] = inp.value; scheduleSave(); renderPreview(); }));
          inps[4].disabled = e.current;
          n.querySelector('.cur').addEventListener('change', (ev) => { e.current = ev.target.checked; inps[4].disabled = e.current; scheduleSave(); renderPreview(); });
          bind(n, 'textarea', (v) => { e.points = v.split('\n'); });
        },
        B('opt_add_exp'), () => d.experiences.push({ id: uid(), role: '', org: '', city: '', start: '', end: '', current: false, points: [] }));
    case 'education':
      return listSection(id, B('sec_education'), B('empty_edu'), d.education,
        (e, i) => `<div class="entry">${entryHead(e.degree || B('f_degree') + ' ' + (i + 1), d.education, i)}
          <div class="grid-2">
            ${fgroup(B('f_degree'), input(e.degree, B('ph_degree')))}
            ${fgroup(B('f_school'), input(e.school, B('ph_school')))}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              ${fgroup(B('f_start'), input(e.start, '2019'))}
              ${fgroup(B('f_end'), input(e.end, '2022'))}
            </div>
            ${fgroup(B('f_details'), input(e.details, ''))}
          </div></div>`,
        (n, e, i) => {
          wireEntryHead(n, d.education, i);
          const keys = ['degree', 'school', 'start', 'end', 'details'];
          n.querySelectorAll('input').forEach((inp, k) => inp.addEventListener('input', () => { e[keys[k]] = inp.value; scheduleSave(); renderPreview(); }));
        },
        B('opt_add_edu'), () => d.education.push({ id: uid(), degree: '', school: '', city: '', start: '', end: '', details: '' }));
    case 'skills':
      return tagSection(id, B('sec_skills'), d.skills, B('f_skill_add'), B('ph_skill'));
    case 'languages':
      return listSection(id, B('sec_languages'), B('empty_generic'), d.languages,
        (e, i) => `<div class="entry">${entryHead(e.name || B('f_lang_name') + ' ' + (i + 1), d.languages, i)}
          <div class="grid-2">
            ${fgroup(B('f_lang_name'), input(e.name, 'Français'))}
            ${fgroup(B('f_lang_level'), `<select>${LEVELS().map((l) => `<option ${l === e.level ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`)}
          </div></div>`,
        (n, e, i) => {
          wireEntryHead(n, d.languages, i);
          n.querySelector('input').addEventListener('input', (ev) => { e.name = ev.target.value; scheduleSave(); renderPreview(); });
          n.querySelector('select').addEventListener('change', (ev) => { e.level = ev.target.value; scheduleSave(); renderPreview(); });
        },
        B('opt_add_lang'), () => d.languages.push({ id: uid(), name: '', level: LEVELS()[2] }));
    case 'certifications':
      return listSection(id, B('sec_certifications'), B('empty_generic'), d.certs,
        (e, i) => `<div class="entry">${entryHead(e.name || B('f_cert_name') + ' ' + (i + 1), d.certs, i)}
          <div class="grid-2">
            ${fgroup(B('f_cert_name'), input(e.name, ''))}
            ${fgroup(B('f_cert_org'), input(e.org, ''))}
            ${fgroup(B('f_year'), input(e.year, '2024'))}
          </div></div>`,
        (n, e, i) => {
          wireEntryHead(n, d.certs, i);
          const keys = ['name', 'org', 'year'];
          n.querySelectorAll('input').forEach((inp, k) => inp.addEventListener('input', () => { e[keys[k]] = inp.value; scheduleSave(); renderPreview(); }));
        },
        B('opt_add_cert'), () => d.certs.push({ id: uid(), name: '', org: '', year: '' }));
    case 'projects':
      return listSection(id, B('sec_projects'), B('empty_generic'), d.projects,
        (e, i) => `<div class="entry">${entryHead(e.name || B('f_proj_name') + ' ' + (i + 1), d.projects, i)}
          ${fgroup(B('f_proj_name'), input(e.name, ''))}
          <div class="grid-2">${fgroup(B('f_proj_link'), input(e.link, ''))}${fgroup(B('f_proj_desc'), input(e.desc, ''))}</div></div>`,
        (n, e, i) => {
          wireEntryHead(n, d.projects, i);
          const keys = ['name', 'link', 'desc'];
          n.querySelectorAll('input').forEach((inp, k) => inp.addEventListener('input', () => { e[keys[k]] = inp.value; scheduleSave(); renderPreview(); }));
        },
        B('opt_add_proj'), () => d.projects.push({ id: uid(), name: '', link: '', desc: '' }));
    case 'volunteering':
      return listSection(id, B('sec_volunteering'), B('empty_generic'), d.volunteering,
        (e, i) => `<div class="entry">${entryHead(e.role || B('f_vol_role') + ' ' + (i + 1), d.volunteering, i)}
          <div class="grid-2">
            ${fgroup(B('f_vol_role'), input(e.role, ''))}
            ${fgroup(B('f_vol_org'), input(e.org, ''))}
            ${fgroup(B('f_period'), input(e.period, '2023'))}
            ${fgroup(B('f_proj_desc'), input(e.desc, ''))}
          </div></div>`,
        (n, e, i) => {
          wireEntryHead(n, d.volunteering, i);
          const keys = ['role', 'org', 'period', 'desc'];
          n.querySelectorAll('input').forEach((inp, k) => inp.addEventListener('input', () => { e[keys[k]] = inp.value; scheduleSave(); renderPreview(); }));
        },
        B('opt_add_vol'), () => d.volunteering.push({ id: uid(), role: '', org: '', period: '', desc: '' }));
    case 'interests':
      return tagSection(id, B('sec_interests'), d.interests, B('f_interest_add'), B('ph_interest'));
    case 'custom':
      return listSection(id, B('sec_custom'), B('empty_generic'), d.custom,
        (e, i) => `<div class="entry">${entryHead(e.title || B('sec_custom') + ' ' + (i + 1), d.custom, i)}
          ${fgroup(B('f_custom_title'), input(e.title, B('ph_custom_title')))}
          ${fgroup(B('f_custom_text'), textarea((e.lines || []).join('\n'), ''))}
        </div>`,
        (n, e, i) => {
          wireEntryHead(n, d.custom, i);
          n.querySelector('input').addEventListener('input', (ev) => { e.title = ev.target.value; scheduleSave(); renderPreview(); });
          bind(n, 'textarea', (v) => { e.lines = v.split('\n'); });
        },
        B('opt_add_custom'), () => d.custom.push({ id: uid(), title: '', lines: [] }));
    default:
      return el('<div></div>');
  }
}

/* ---- zoom plein écran sur un modèle ---- */
function openTplZoom(tp) {
  if (!sampleCache) sampleCache = exampleProfile();
  const sample = JSON.parse(JSON.stringify(sampleCache));
  sample.prefs = { template: tp.id, accent: '', font: 'grotesk', density: '' };
  const overlay = el(`<div class="tpl-zoom" role="dialog" aria-modal="true" aria-label="${esc(tp.name)}">
    <div class="card tpl-zoom-card card-doc" style="--ear:18px">
      <div class="tpl-zoom-head">
        <div><b>${esc(tp.name)}</b> <span class="pill" style="font-size:.62rem">${esc(B('fam_' + tp.family))}</span>
          <p class="small muted" style="margin:4px 0 0">${esc(tp.desc)}</p></div>
        <button type="button" class="icon-btn zoom-x" aria-label="${esc(B('tpl_close'))}">✕</button>
      </div>
      <span class="thumb thumb-xl">${renderCV(sample)}</span>
      <button type="button" class="btn btn-accent zoom-use" style="width:100%;justify-content:center">${esc(B('tpl_use'))}</button>
    </div></div>`);
  document.body.appendChild(overlay);
  document.documentElement.style.overflow = 'hidden';
  const thumb = overlay.querySelector('.thumb');
  const close = () => { overlay.remove(); document.documentElement.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.zoom-x').addEventListener('click', close);
  overlay.querySelector('.zoom-use').addEventListener('click', () => {
    close();
    p().prefs.template = tp.id;
    scheduleSave(); renderPreview(); renderAts(); buildTemplatesPanelRefreshAll();
    toast(tp.name);
  });
  requestAnimationFrame(() => { fitSheet(thumb); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitSheet(thumb)); });
}
/* rafraîchit l'état sélectionné des cartes si le panneau modèles est affiché */
function buildTemplatesPanelRefreshAll() {
  const grid = document.querySelector('.tpl-grid');
  if (!grid) return;
  grid.querySelectorAll('.tpl-card').forEach((c) => c.setAttribute('aria-pressed', c.dataset.tpl === p().prefs.template));
}

/* ==================== panneau modèles ==================== */
function buildTemplatesPanel() {
  const wrap = el(`<div>
    <div class="filters" style="margin-top:0">
      <button type="button" class="filter-btn" data-f="all" aria-pressed="${activeFamily === 'all'}">${esc(B('fam_all'))}</button>
      ${FAMILIES.map((f) => `<button type="button" class="filter-btn" data-f="${f}" aria-pressed="${activeFamily === f}">${esc(B('fam_' + f))}</button>`).join('')}
    </div>
    <div class="tpl-grid"></div></div>`);
  const grid = wrap.querySelector('.tpl-grid');
  wrap.querySelectorAll('.filter-btn').forEach((b) => b.addEventListener('click', () => {
    activeFamily = b.dataset.f;
    wrap.querySelectorAll('.filter-btn').forEach((x) => x.setAttribute('aria-pressed', x === b));
    fill();
  }));
  const fill = () => {
    grid.innerHTML = '';
    if (!sampleCache) sampleCache = exampleProfile();
    TEMPLATES.filter((tp) => activeFamily === 'all' || tp.family === activeFamily).forEach((tp) => {
      const sample = JSON.parse(JSON.stringify(sampleCache));
      sample.prefs = { template: tp.id, accent: '', font: 'grotesk', density: '' };
      const card = el(`<button type="button" class="tpl-card card-doc" style="--ear:18px" aria-pressed="${p().prefs.template === tp.id}" data-tpl="${tp.id}">
        <span class="thumb-wrap"><span class="thumb">${renderCV(sample)}</span>
          <span class="zoom-btn" role="button" tabindex="0" aria-label="${esc(B('tpl_zoom'))} — ${esc(tp.name)}" title="${esc(B('tpl_zoom'))}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>
          </span></span>
        <h4>${esc(tp.name)} <span class="pill" style="font-size:.62rem;margin-left:auto">${esc(B('fam_' + tp.family))}</span></h4>
        <p class="small muted" style="margin:0">${esc(tp.desc)}</p></button>`);
      const zb = card.querySelector('.zoom-btn');
      const zoom = (e) => { e.stopPropagation(); e.preventDefault(); openTplZoom(tp); };
      zb.addEventListener('click', zoom);
      zb.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') zoom(e); });
      card.addEventListener('click', () => { p().prefs.template = tp.id; scheduleSave(); renderPreview(); renderAts(); buildTemplatesPanelRefreshAll(); });
      grid.appendChild(card);
    });
    /* Miniatures fidèles : feuille A4 réduite visuellement, jamais re-fluée. */
    requestAnimationFrame(() => requestAnimationFrame(() => fitThumbs(grid)));
  };
  fill();
  return wrap;
}

/* ==================== panneau sections ==================== */
function buildSectionsPanel() {
  const d = p();
  const wrap = el(`<div><p class="notice info" style="margin-top:0">${esc(B('sec_panel_hint'))}</p><div class="sec-list" style="display:grid;gap:8px"></div></div>`);
  const list = wrap.querySelector('.sec-list');
  d.sections.forEach((s, i) => {
    const row = el(`<label class="sec-toggle"><input type="checkbox" ${s.visible ? 'checked' : ''} style="accent-color:var(--accent)">
      <span style="flex:1">${esc(B('sec_' + s.id))}</span>
      <button type="button" class="mini-btn up" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button type="button" class="mini-btn down" ${i === d.sections.length - 1 ? 'disabled' : ''}>↓</button></label>`);
    row.querySelector('input').addEventListener('change', (e) => { s.visible = e.target.checked; scheduleSave(); renderPreview(); });
    const rerender = () => { const parent = wrap.parentElement; parent.innerHTML = ''; parent.appendChild(buildSectionsPanel()); renderPreview(); scheduleSave(); };
    const up = row.querySelector('.up'), down = row.querySelector('.down');
    up && up.addEventListener('click', (e) => { e.preventDefault(); [d.sections[i - 1], d.sections[i]] = [d.sections[i], d.sections[i - 1]]; rerender(); });
    down && down.addEventListener('click', (e) => { e.preventDefault(); [d.sections[i + 1], d.sections[i]] = [d.sections[i], d.sections[i + 1]]; rerender(); });
    list.appendChild(row);
  });
  return wrap;
}

/* ==================== barre & personnalisation ==================== */
function refreshBar() {
  $('#cvName').value = cv().name;
  const sel = $('#cvVersions');
  sel.innerHTML = state.cvs.map((c) => `<option value="${c.id}" ${c.id === state.activeId ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  document.querySelectorAll('.view-tab').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === view));
  /* la bascule Éditer/Aperçu et le mode guidé n'ont de sens qu'en vue « Éditer » */
  const ps = $('#paneSwitch'); if (ps) ps.hidden = view !== 'edit';
  const bg = $('#btnGuided'); if (bg) bg.hidden = view !== 'edit';
  if (view !== 'edit') { setPane('edit'); if (guided.on) exitGuided(); }
}

/* ==================== mode guidé (une section à la fois) ==================== */
const guided = { on: false, idx: 0, hud: null, sections: [] };
function startGuided() {
  if (view !== 'edit') return;
  guided.on = true;
  guided.idx = 0;
  document.body.classList.add('guided-on'); /* masque la bulle FAB : évite les chevauchements */
  $('#editorSections').classList.add('guided');
  guided.hud = el(`<div class="guided-hud card-doc" style="--ear:14px" role="dialog" aria-label="${esc(B('guided_title'))}">
    <div class="g-info"><b class="g-count">1/1</b><span class="g-title"></span></div>
    <button type="button" class="btn btn-sm btn-ghost g-prev">${esc(B('guided_prev'))}</button>
    <button type="button" class="btn btn-sm btn-accent g-next">${esc(B('guided_next'))}</button>
    <button type="button" class="icon-btn g-quit" aria-label="${esc(B('guided_close'))}">✕</button>
  </div>`);
  document.body.appendChild(guided.hud);
  guided.hud.querySelector('.g-prev').addEventListener('click', () => { guided.idx--; applyGuided(true); });
  guided.hud.querySelector('.g-next').addEventListener('click', () => {
    if (guided.idx >= guided.sections.length - 1) { exitGuided(); return; }
    guided.idx++; applyGuided(true);
  });
  guided.hud.querySelector('.g-quit').addEventListener('click', exitGuided);
  applyGuided(true);
}
function applyGuided(scroll) {
  guided.sections = [...$('#editorSections').querySelectorAll(':scope > .acc')];
  if (!guided.sections.length) { exitGuided(); return; }
  guided.idx = Math.max(0, Math.min(guided.idx, guided.sections.length - 1));
  guided.sections.forEach((s, k) => s.classList.toggle('cur', k === guided.idx));
  const cur = guided.sections[guided.idx];
  cur.open = true;
  const sum = cur.querySelector('summary');
  const title = sum ? (sum.childNodes[0]?.textContent || '').trim() : '';
  guided.hud.querySelector('.g-count').textContent = `${guided.idx + 1}/${guided.sections.length}`;
  guided.hud.querySelector('.g-title').textContent = title;
  guided.hud.querySelector('.g-prev').disabled = guided.idx === 0;
  const next = guided.hud.querySelector('.g-next');
  next.textContent = guided.idx === guided.sections.length - 1 ? B('guided_done') : B('guided_next');
  if (scroll) cur.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function exitGuided() {
  guided.on = false;
  document.body.classList.remove('guided-on');
  $('#editorSections')?.classList.remove('guided');
  $('#editorSections')?.querySelectorAll('.acc.cur').forEach((s) => s.classList.remove('cur'));
  guided.hud?.remove();
  guided.hud = null;
}

const SWATCHES = ['', '#0A0A0A', '#B23A2E', '#2F6E4F', '#A98B4E', '#555555'];
function renderCustomizer() {
  const sw = $('#accentSwatches');
  sw.innerHTML = '';
  SWATCHES.forEach((col) => {
    const b = el(`<button type="button" class="swatch" style="background:${col || 'linear-gradient(135deg,var(--paper) 50%,var(--g2) 50%)'}" title="${col || 'Auto'}" aria-pressed="${(p().prefs.accent || '') === col}"></button>`);
    b.addEventListener('click', () => { p().prefs.accent = col; scheduleSave(); renderPreview(); renderCustomizer(); });
    sw.appendChild(b);
  });
  $('#fontSel').value = p().prefs.font || 'grotesk';
  $('#densitySel').value = p().prefs.density || '';
}

async function switchCV(id) {
  state.activeId = id;
  localStorage.setItem('crispcv.active', id);
  refreshBar(); renderCustomizer(); renderEditor(); renderPreview(); renderAts();
}

async function addCV(name, data) {
  const c = { id: uid(), name, updatedAt: Date.now(), data: data || emptyProfile() };
  state.cvs.push(c);
  await store.put(c);
  await switchCV(c.id);
  return c;
}

/* ==================== bulle de progression (style Messenger) ==================== */
const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;
let fab = null, fabPanel = null;

function cvProgress() {
  const d = p();
  const items = [];
  const em = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const add = (w, ok, label) => items.push({ w, ok, label });
  add(12, has(d.contact.fullName), B('f_fullname'));
  add(10, em.test(d.contact.email || ''), B('f_email'));
  add(8, has(d.contact.phone), B('f_phone'));
  add(16, (d.summary || '').trim().length >= 40, B('sec_summary'));
  add(24, d.experiences.some((e) => has(e.role) && has(e.org)), B('sec_experience'));
  add(10, d.education.some((e) => has(e.degree)), B('sec_education'));
  add(8, d.skills.length >= 4, B('sec_skills'));
  add(6, d.languages.length > 0, B('sec_languages'));
  add(6, d.experiences.some((e) => (e.points || []).some(has)), B('fab_points'));
  const total = items.reduce((a, i) => a + i.w, 0);
  const got = items.filter((i) => i.ok).reduce((a, i) => a + i.w, 0);
  return { pct: Math.round((got / total) * 100), items };
}

function buildFab() {
  fab = el(`<button type="button" class="cv-fab" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(B('fab_aria'))}">
    <svg class="ring" width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden="true">
      <circle cx="29" cy="29" r="${RING_R}" stroke="var(--g3)" stroke-width="4"/>
      <circle class="fg" cx="29" cy="29" r="${RING_R}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}"/>
    </svg><span class="pct">0%</span></button>`);
  fabPanel = el(`<div class="cv-fab-panel" role="dialog" aria-label="${esc(B('fab_aria'))}" hidden></div>`);
  document.body.append(fab, fabPanel);
  fab.addEventListener('click', () => toggleFab());
  document.addEventListener('click', (e) => {
    if (fabPanel && !fabPanel.hidden && !fabPanel.contains(e.target) && !fab.contains(e.target)) toggleFab(false);
  });
}

function toggleFab(force) {
  const open = force !== undefined ? force : fabPanel.hidden;
  fabPanel.hidden = !open;
  fab.setAttribute('aria-expanded', String(open));
  if (open) fillFab();
}

function updateFab() {
  if (!fab) return;
  const { pct } = cvProgress();
  fab.querySelector('.pct').textContent = pct + '%';
  const fg = fab.querySelector('.fg');
  fg.style.strokeDashoffset = RING_C * (1 - pct / 100);
  fg.style.stroke = pct >= 80 ? 'var(--success)' : 'var(--accent)';
  if (!fabPanel.hidden) fillFab();
}

function fillFab() {
  const { pct, items } = cvProgress();
  fabPanel.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px">
      <b style="font:700 1.8rem var(--font-head);line-height:1">${pct}%</b>
      <div style="min-width:0"><h3 style="margin:0 0 2px;font-size:1rem">${esc(B('fab_title'))}</h3>
      <span class="small muted">${esc(pct >= 80 ? B('fab_ready') : B('fab_tip'))}</span></div>
    </div>
    <ul class="ats-list" style="margin:13px 0 14px;max-height:180px;overflow:auto">
      ${items.map((i) => `<li class="${i.ok ? 'ok' : 'warn'}"><b>${i.ok ? 'OK' : '→'}</b><span>${esc(i.label)}</span></li>`).join('')}
    </ul>
    <div class="fab-thumb" aria-hidden="true"></div>
    <button type="button" class="btn btn-sm fab-go" style="width:100%;margin-top:12px;justify-content:center">${esc(B('fab_preview'))}</button>`;
  const sheet = $('#previewBox .cv-sheet');
  const th = fabPanel.querySelector('.fab-thumb');
  if (sheet) {
    const c = sheet.cloneNode(true);
    c.style.transform = '';
    th.appendChild(c);
    requestAnimationFrame(() => {
      fitSheet(th, { max: 0.42 });
      th.style.height = Math.min(150, c.offsetHeight * Math.min(0.42, th.clientWidth / c.offsetWidth)) + 'px';
    });
  }
  fabPanel.querySelector('.fab-go').addEventListener('click', () => {
    toggleFab(false);
    if (view !== 'edit') { view = 'edit'; refreshBar(); renderEditor(); }
    setPane('preview');
    $('#previewBox').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ==================== init ==================== */
async function init() {
  ensureCvStyles();
  state.cvs = await store.all();
  if (!state.cvs.length) {
    const first = { id: uid(), name: 'Mon CV', updatedAt: Date.now(), data: emptyProfile() };
    await store.put(first);
    state.cvs = [first];
  }
  state.activeId = localStorage.getItem('crispcv.active');
  if (!state.cvs.some((c) => c.id === state.activeId)) state.activeId = state.cvs[0].id;

  /* barre */
  $('#cvName').addEventListener('input', (e) => { cv().name = e.target.value; scheduleSave(); refreshBarTitle(); });
  const refreshBarTitle = () => {
    const opt = $('#cvVersions').querySelector(`option[value="${state.activeId}"]`);
    if (opt) opt.textContent = cv().name;
  };
  $('#cvVersions').addEventListener('change', (e) => switchCV(e.target.value));
  $('#btnNew').addEventListener('click', () => addCV('Nouveau CV'));
  $('#btnDup').addEventListener('click', async () => {
    const copy = JSON.parse(JSON.stringify(cv().data));
    await addCV(cv().name + ' (copie)', copy);
    toast(B('duplicated'));
  });
  $('#btnDel').addEventListener('click', async () => {
    if (!(await confirmDlg({ title: B('bar_delete'), msg: B('confirm_delete'), okLabel: B('dlg_delete'), cancelLabel: B('dlg_cancel') }))) return;
    await store.remove(state.activeId);
    state.cvs = state.cvs.filter((c) => c.id !== state.activeId);
    if (!state.cvs.length) await addCV('Mon CV');
    else await switchCV(state.cvs[0].id);
    toast(B('deleted'));
  });
  $('#btnExample').addEventListener('click', () => {
    cv().data = exampleProfile();
    scheduleSave(); refreshBar(); renderCustomizer(); renderEditor(); renderPreview(); renderAts();
    toast(B('example_loaded'));
  });
  document.querySelectorAll('.view-tab').forEach((b) =>
    b.addEventListener('click', () => { view = b.dataset.view; refreshBar(); renderEditor(); }));

  /* personnalisation */
  $('#fontSel').addEventListener('change', (e) => { p().prefs.font = e.target.value; scheduleSave(); renderPreview(); });
  $('#densitySel').addEventListener('change', (e) => { p().prefs.density = e.target.value; scheduleSave(); renderPreview(); });

  /* fenêtre d'export — modale clairement visible : voile sombre, titre,
     fermeture croix / Échap / clic dehors. Jamais « ratée ». */
  function openExportMenu() {
    if (document.querySelector('.export-modal')) return;
    const o = el(`<div class="export-modal" role="dialog" aria-modal="true" aria-label="${esc(B('bar_export'))}">
      <div class="card export-sheet card-doc" style="--ear:16px">
        <div class="export-head"><b>${esc(B('bar_export'))}</b>
          <button type="button" class="icon-btn ex-x" aria-label="${esc(B('tpl_close'))}">✕</button></div>
        <button type="button" class="filter-btn ex-it ex-main" id="expPdf"><b>PDF</b><small>${esc(B('exp_pdf_sub'))}</small></button>
        <button type="button" class="filter-btn ex-it ex-main" id="expDocx"><b>Word (.docx)</b><small>${esc(B('exp_docx_sub'))}</small></button>
      </div></div>`);
    document.body.appendChild(o);
    document.documentElement.style.overflow = 'hidden';
    const close = () => { o.remove(); document.documentElement.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    o.addEventListener('pointerdown', (e) => { if (e.target === o) close(); });
    o.querySelector('.ex-x').addEventListener('click', close);
    o.querySelectorAll('.ex-it').forEach((b) => b.addEventListener('click', () => {
      close();
      if (b.id === 'expPdf') { printSheet($('#previewBox .cv-sheet')); toast(B('exp_pdf_toast')); }
      if (b.id === 'expDocx') { download(profileToDOCXBlob(p()), safeName(p()) + '.docx'); toast(B('exp_file_toast')); }
    }));
    requestAnimationFrame(() => o.classList.add('open'));
  }
  $('#btnExport').addEventListener('click', openExportMenu);
  $('#impJson').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const obj = JSON.parse(await f.text());
      if (!obj || !obj.data || !obj.data.contact || !Array.isArray(obj.data.sections)) throw 0;
      await addCV(obj.name || 'CV importé', obj.data);
      toast(B('imported'));
    } catch { toast(B('import_err'), false); }
    e.target.value = '';
  });


  /* bascule Éditer / Aperçu (mobile) + mode guidé */
  document.querySelectorAll('.pane-btn').forEach((b) =>
    b.addEventListener('click', () => setPane(b.dataset.pane)));
  $('#btnGuided')?.addEventListener('click', () => (guided.on ? exitGuided() : startGuided()));

  document.addEventListener('crispcv:lang', () => { refreshBar(); renderCustomizer(); renderEditor(); renderPreview(); renderAts(); });

  buildFab();
  armGlobalFit();
  refreshBar(); renderCustomizer(); renderEditor(); renderPreview(); renderAts();
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
