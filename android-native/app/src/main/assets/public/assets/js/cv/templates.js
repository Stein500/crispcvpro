/* CrispCV Studio — modèles de CV.
   Chaque modèle = CONFIG JSON + moteur de rendu commun (voir render.js).
   10 modèles réellement distincts, 3 familles : ats / moderne / creatif. */
export const FAMILIES = ['ats', 'moderne', 'creatif'];

export const TEMPLATES = [
  {
    id: 'essentiel', name: 'Essentiel', family: 'ats',
    desc: 'Colonne unique, hiérarchie franche. Le plus sûr pour les logiciels de tri.',
    layout: 'single', accent: '#0A0A0A', header: 'left', sec: 'rule',
    photo: 'none', density: 'normal',
  },
  {
    id: 'structure', name: 'Structuré', family: 'ats',
    desc: 'En-tête centré, titres simples, espaces généreux. Très lisible.',
    layout: 'single', accent: '#0A0A0A', header: 'center', sec: 'plain',
    photo: 'none', density: 'air',
  },
  {
    id: 'monochrome', name: 'Monochrome', family: 'ats',
    desc: 'Noir et blanc strict, compact, filets fins. Une page, dense et nette.',
    layout: 'single', accent: '#0A0A0A', header: 'left', sec: 'leftbar',
    photo: 'none', density: 'compact',
  },
  {
    id: 'latitude', name: 'Latitude', family: 'moderne',
    desc: 'Colonne latérale grise pour compétences et langues, accent rouge sceau.',
    layout: 'sidebar-left', accent: '#B23A2E', header: 'left', sec: 'rule',
    photo: 'square', density: 'normal', sideBg: '#F2F2EF',
    side: ['skills', 'languages', 'certifications', 'interests'],
  },
  {
    id: 'capitale', name: 'Capitale', family: 'moderne',
    desc: 'Bandeau d\u2019en-tête foncé, corps en colonne unique. Présence forte.',
    layout: 'header-band', accent: '#A98B4E', header: 'band', sec: 'rule',
    photo: 'square', density: 'normal',
  },
  {
    id: 'signature', name: 'Signature', family: 'moderne',
    desc: 'Colonne latérale à droite, photo ronde optionnelle, titre élégant.',
    layout: 'sidebar-right', accent: '#0A0A0A', header: 'left', sec: 'plain',
    photo: 'round', density: 'normal', sideBg: '#F2F2EF',
    side: ['skills', 'languages', 'interests', 'certifications'],
  },
  {
    id: 'metrique', name: 'Métrique', family: 'moderne',
    desc: 'Deux colonnes équilibrées, sections numérotées, dates en monospace.',
    layout: 'two-col', accent: '#2F6E4F', header: 'left', sec: 'numbered',
    photo: 'none', density: 'normal',
    side: ['education', 'skills', 'languages', 'certifications'],
  },
  {
    id: 'atelier', name: 'Atelier', family: 'creatif',
    desc: 'Latérale teintée or mat, gros titre, pour les métiers de création.',
    layout: 'sidebar-left', accent: '#A98B4E', header: 'left', sec: 'plain',
    photo: 'round', density: 'normal', sideBg: '#F4EFE4',
    side: ['skills', 'languages', 'interests', 'projects'],
  },
  {
    id: 'studio', name: 'Studio', family: 'creatif',
    desc: 'Nom très affiché, sections numérotées, rouge sceau assumé.',
    layout: 'single', accent: '#B23A2E', header: 'split', sec: 'numbered',
    photo: 'none', density: 'normal',
  },
  {
    id: 'plume', name: 'Plume', family: 'creatif',
    desc: 'Frise chronologique pour l\u2019expérience, vert discret, rythme aéré.',
    layout: 'single', accent: '#2F6E4F', header: 'left', sec: 'timeline',
    photo: 'none', density: 'air',
  },
];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
