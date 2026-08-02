/* Vérificateur ATS basique — heuristiques transparentes (cahier §3.B).
   Score indicatif volontairement non anxiogène : Solide / Correct / À renforcer. */
import { getTemplate } from './templates.js';
import { B } from './labels.js';
import { getLang } from '../i18n.js';

const ACTION_VERBS = ['géré', 'geré', 'développé', 'developpé', 'lancé', 'piloté', 'conçu', 'optimisé',
  'coordonné', 'réalisé', 'realisé', 'dirigé', 'amélioré', 'négocié', 'negocié', 'formé', 'créé', 'cree',
  'mis en place', 'augmenté', 'augmente', 'réduit', 'reduit', 'analysé', 'organisé', 'accompagné', 'vendu',
  'managed', 'led', 'launched', 'developed', 'improved', 'created', 'built', 'increased', 'reduced',
  'negotiated', 'trained', 'designed', 'delivered', 'organized', 'sold', 'coordinated'];

const has = (s) => s && String(s).trim().length > 0;

export function checkATS(p) {
  const fr = getLang() !== 'en';
  const checks = [];
  const ok = (m) => checks.push({ level: 'ok', msg: m });
  const warn = (m) => checks.push({ level: 'warn', msg: m });
  const info = (m) => checks.push({ level: 'info', msg: m });

  // Identité & contact (critères de coeur)
  const core = [];
  if (has(p.contact.fullName)) { core.push(1); ok(fr ? 'Nom complet présent' : 'Full name present'); }
  else { core.push(0); warn(fr ? 'Nom complet manquant' : 'Full name missing'); }
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.contact.email || '')) { core.push(1); ok(fr ? 'E-mail valide' : 'Valid email'); }
  else { core.push(0); warn(fr ? 'E-mail manquant ou invalide' : 'Email missing or invalid'); }
  if (has(p.contact.phone)) { core.push(1); ok(fr ? 'Téléphone présent' : 'Phone present'); }
  else { core.push(0); warn(fr ? 'Téléphone manquant' : 'Phone missing'); }
  if (has(p.contact.city)) { core.push(1); ok(fr ? 'Ville indiquée' : 'City provided'); }
  else { core.push(0); warn(fr ? 'Ville non indiquée' : 'City not provided'); }

  // Accroche
  const len = (p.summary || '').trim().length;
  if (len >= 40 && len <= 600) { core.push(1); ok(fr ? `Accroche de bonne longueur (${len} caractères)` : `Summary length looks right (${len} chars)`); }
  else if (len === 0) { core.push(0); warn(fr ? 'Accroche absente — 2 à 4 phrases recommandées' : 'No summary — 2 to 4 sentences recommended'); }
  else { core.push(0.5); warn(fr ? `Accroche ${len < 40 ? 'très courte' : 'trop longue'} (${len} caractères, viser 40–600)` : `Summary ${len < 40 ? 'very short' : 'too long'} (${len} chars, aim for 40–600)`); }

  // Expérience
  const dated = p.experiences.filter((e) => has(e.start)).length;
  if (p.experiences.length === 0) { core.push(0); warn(fr ? 'Aucune expérience — ajoutez-en au moins une' : 'No experience — add at least one'); }
  else {
    core.push(1); ok(fr ? `${p.experiences.length} expérience(s)` : `${p.experiences.length} experience(s)`);
    if (dated === p.experiences.length) { core.push(1); ok(fr ? 'Dates renseignées sur toutes les expériences' : 'All experiences have dates'); }
    else { core.push(0.5); warn(fr ? 'Certaines expériences n\u2019ont pas de date de début' : 'Some experiences lack a start date'); }
    const firstPoint = p.experiences.flatMap((e) => e.points || []).find(has) || '';
    const startsWithVerb = ACTION_VERBS.some((v) => firstPoint.toLowerCase().startsWith(v));
    if (startsWithVerb) { core.push(1); ok(fr ? 'Réalisations introduites par des verbes d\u2019action' : 'Achievements start with action verbs'); }
    else if (has(firstPoint)) { core.push(0.5); info(fr ? 'Commencez vos réalisations par un verbe d\u2019action (« Géré », « Lancé »…)' : 'Start achievements with action verbs (“Led”, “Launched”…)'); }
  }

  // Compétences (texte, pas de barres graphiques — lisible par les ATS)
  if (p.skills.length >= 4) { core.push(1); ok(fr ? `${p.skills.length} compétences en texte lisible` : `${p.skills.length} plain-text skills`); }
  else if (p.skills.length > 0) { core.push(0.5); warn(fr ? 'Peu de compétences — visez 4 à 10' : 'Few skills — aim for 4 to 10'); }
  else { core.push(0); warn(fr ? 'Aucune compétence renseignée' : 'No skills provided'); }

  // Formation
  if (p.education.length > 0) { core.push(1); ok(fr ? 'Formation renseignée' : 'Education provided'); }
  else { core.push(0); warn(fr ? 'Formation absente' : 'Education missing'); }

  // Photo & mise en page (informatif)
  if (has(p.contact.photo)) {
    info(fr ? 'Photo présente : certains pays/recruteurs la déconseillent — à adapter selon la cible' : 'Photo present: some countries/recruiters advise against it — adapt to your target');
  }
  const tpl = getTemplate(p.prefs.template);
  if (tpl.family === 'ats' || tpl.layout === 'single' || tpl.layout === 'header-band') {
    core.push(1); ok(fr ? 'Mise en page à lecture simple (compatible ATS)' : 'Simple-reading layout (ATS compatible)');
  } else {
    core.push(0.5); info(fr ? 'Colonnes latérales : certains ATS lisent mal les colonnes — la version texte (export ATS-safe) reste une sécurité' : 'Side columns: some ATS misread columns — the plain-text export (ATS-safe) stays a safe fallback');
  }

  const total = core.reduce((a, b) => a + b, 0);
  const score = Math.round((total / core.length) * 100);
  const level = score >= 85 ? { key: 'ats_solid', cls: 'pill-ok' }
    : score >= 60 ? { key: 'ats_ok', cls: '' }
    : { key: 'ats_weak', cls: 'pill-accent' };
  return { score, level, label: B(level.key), cls: level.cls, checks };
}
