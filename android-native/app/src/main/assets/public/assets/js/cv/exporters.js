/* Exports du CV : PDF vectoriel (impression navigateur) et Word .docx
   éditable, généré localement via mini-zip — aucun envoi : tout se passe sur l'appareil. */
import { makeZip } from '../mini-zip.js';
import { B } from './labels.js';

const has = (s) => s && String(s).trim().length > 0;
const xe = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- aplatissement du profil en lignes logiques ---------- */
function flatten(p) {
  const out = [];
  const sec = (t) => out.push({ h: B('sec_' + t) });
  const line = (t) => has(t) && out.push({ t });
  const strong = (t) => has(t) && out.push({ s: t });
  const bullet = (t) => has(t) && out.push({ b: t });
  const gap = () => out.push({ g: 1 });

  strong(p.contact.fullName);
  line(p.contact.title);
  line([p.contact.email, p.contact.phone, p.contact.city, p.contact.link].filter(has).join('  ·  '));
  gap();

  for (const s of p.sections) {
    if (!s.visible) continue;
    switch (s.id) {
      case 'summary': if (has(p.summary)) { sec('summary'); line(p.summary); gap(); } break;
      case 'experience':
        if (p.experiences.length) {
          sec('experience');
          p.experiences.forEach((e) => {
            strong(`${e.role || ''}${has(e.role) && has(e.org) ? ' — ' : ''}${e.org || ''}`);
            line([e.start, e.current ? B('present') : e.end].filter(has).join(' – ') + (has(e.city) ? ` · ${e.city}` : ''));
            (e.points || []).forEach(bullet); gap();
          });
        } break;
      case 'education':
        if (p.education.length) {
          sec('education');
          p.education.forEach((e) => {
            strong(`${e.degree || ''}${has(e.degree) && has(e.school) ? ' — ' : ''}${e.school || ''}`);
            line([e.start, e.end].filter(has).join(' – '));
            line(e.details); gap();
          });
        } break;
      case 'skills': if (p.skills.length) { sec('skills'); line(p.skills.join(' · ')); gap(); } break;
      case 'languages': if (p.languages.length) { sec('languages'); p.languages.forEach((l) => line(`${l.name}${has(l.level) ? ` — ${l.level}` : ''}`)); gap(); } break;
      case 'certifications': if (p.certs.length) { sec('certifications'); p.certs.forEach((c) => line([c.name, c.org, c.year].filter(has).join(' — '))); gap(); } break;
      case 'projects': if (p.projects.length) { sec('projects'); p.projects.forEach((x) => { strong(x.name); line(x.link); line(x.desc); gap(); }); } break;
      case 'volunteering': if (p.volunteering.length) { sec('volunteering'); p.volunteering.forEach((v) => { strong(`${v.role || ''}${has(v.org) ? ' — ' + v.org : ''}`); line(v.period); line(v.desc); gap(); }); } break;
      case 'interests': if (p.interests.length) { sec('interests'); line(p.interests.join(' · ')); gap(); } break;
      case 'custom': p.custom.forEach((c) => { if (has(c.title) || (c.lines || []).some(has)) { sec('custom'); strong(c.title); (c.lines || []).forEach(bullet); gap(); } }); break;
    }
  }
  return out;
}

/* ---------- DOCX éditable (OOXML, stocké sans compression) ----------
   Pensé pour Word mobile / WPS Android, plus exigeants que Word desktop :
   - styles.xml déclaré via word/_rels/document.xml.rels ;
   - docProps core + app ;
   - polices explicites (Calibri) et langue fr-FR ;
   - type MIME .docx exact (sinon Android propose d'ouvrir une « archive »). */
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function profileToDOCXBlob(p) {
  const rpr = (bold, size, color) =>
    `<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>`
    + (bold ? '<w:b/><w:bCs/>' : '')
    + (color ? `<w:color w:val="${color}"/>` : '')
    + `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/><w:lang w:val="fr-FR"/></w:rPr>`;
  const p_xml = (text, { bold = false, size = 22, color = null, before = 0, after = 80 } = {}) => {
    const ppr = `<w:pPr><w:spacing w:before="${before}" w:after="${after}"/></w:pPr>`;
    if (!text) return `<w:p>${ppr}</w:p>`;
    return `<w:p>${ppr}<w:r>${rpr(bold, size, color)}<w:t xml:space="preserve">${xe(text)}</w:t></w:r></w:p>`;
  };

  const rows = flatten(p);
  let firstStrong = true;
  const body = rows.map((r) => {
    if (r.h) return p_xml(r.h.toUpperCase(), { bold: true, size: 26, color: 'B23A2E', before: 240, after: 100 });
    if (r.s) {
      const accent = firstStrong; firstStrong = false;
      return p_xml(r.s, accent
        ? { bold: true, size: 36, color: '111111', after: 40 }
        : { bold: true, size: 23, before: 120, after: 60 });
    }
    if (r.b) return p_xml('\u2022  ' + r.b, { size: 21, after: 40 });
    if (r.g) return p_xml('', { after: 60 });
    return p_xml(r.t, { size: 21, after: 60 });
  }).join('');

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`;
  const types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xe(p.contact.fullName || 'CV')} — CV</dc:title><dc:creator>CrispCV</dc:creator><cp:lastModifiedBy>CrispCV</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created></cp:coreProperties>`;
  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>CrispCV</Application></Properties>`;

  return makeZip([
    { name: '[Content_Types].xml', data: types },
    { name: '_rels/.rels', data: rels },
    { name: 'docProps/core.xml', data: core },
    { name: 'docProps/app.xml', data: app },
    { name: 'word/document.xml', data: document },
    { name: 'word/styles.xml', data: styles },
    { name: 'word/_rels/document.xml.rels', data: docRels },
  ], DOCX_MIME);
}

/* ---------- PDF vectoriel via impression navigateur ---------- */
export function printSheet(sheetEl) {
  let pr = document.querySelector('.print-root');
  if (!pr) {
    pr = document.createElement('div');
    pr.className = 'print-root';
    document.body.appendChild(pr);
  }
  pr.innerHTML = '<div class="sheet-wrap"></div>';
  const clone = sheetEl.cloneNode(true);
  clone.style.transform = ''; // l'aperçu est mis à l'échelle, pas l'impression
  clone.style.transformOrigin = '';
  pr.firstElementChild.appendChild(clone);
  window.print();
}

export const safeName = (p) =>
  ('cv-' + (p.contact.fullName || 'crispcv')).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cv-crispcv';
