/* Stockage local des CV — IndexedDB, sauvegarde automatique, zéro serveur.
   Export/import JSON pour changer d'appareil sans compte. */
const DB = 'crispcv';
const STORE = 'cvs';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const res = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(res && res.result !== undefined ? res.result : res);
    t.onerror = () => reject(t.error);
  });
}
const reqP = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

export const store = {
  async all() {
    const db = await openDB();
    return reqP(db.transaction(STORE).objectStore(STORE).getAll());
  },
  async put(cv) {
    const db = await openDB();
    await reqP(db.transaction(STORE, 'readwrite').objectStore(STORE).put(cv));
    return cv;
  },
  async remove(id) {
    const db = await openDB();
    await reqP(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
  },
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- profil par défaut ---------- */
export function emptyProfile() {
  return {
    prefs: { template: 'essentiel', accent: '', font: 'grotesk', density: '' },
    contact: { fullName: '', title: '', email: '', phone: '', city: '', link: '', photo: '' },
    summary: '',
    experiences: [], education: [], skills: [], languages: [],
    certs: [], projects: [], volunteering: [], interests: [], custom: [],
    sections: [
      { id: 'summary', visible: true }, { id: 'experience', visible: true },
      { id: 'education', visible: true }, { id: 'skills', visible: true },
      { id: 'languages', visible: true }, { id: 'certifications', visible: false },
      { id: 'projects', visible: false }, { id: 'volunteering', visible: false },
      { id: 'interests', visible: false }, { id: 'custom', visible: false },
    ],
  };
}

/* ---------- exemple démonstratif (bouton « Charger un exemple ») ---------- */
export function exampleProfile() {
  const p = emptyProfile();
  p.contact = {
    fullName: 'Awa Mensah', title: 'Commerciale B2B — responsable de secteur',
    email: 'awa.mensah@exemple.com', phone: '+229 01 40 00 00 00',
    city: 'Cotonou', link: 'linkedin.com/in/awa-mensah', photo: '',
  };
  p.summary = "Commerciale avec 4 ans d'expérience dans la distribution. +30 % de chiffre d'affaires sur mon portefeuille en 2025. Rigoureuse, autonome, à l'aise avec les outils numériques. Je cherche un poste de responsable de secteur.";
  p.experiences = [
    { id: uid(), role: 'Responsable de rayon', org: 'Supermarché du Lac', city: 'Cotonou', start: 'Jan. 2023', end: '', current: true,
      points: ['Géré une équipe de 6 vendeurs au quotidien', 'Augmenté les ventes du rayon de 18 % en un an', 'Formé 4 nouvelles recrues aux procédures de caisse'] },
    { id: uid(), role: 'Vendeuse itinérante', org: 'Distribo', city: 'Porto-Novo', start: 'Fév. 2021', end: 'Déc. 2022', current: false,
      points: ['Développé un portefeuille de 120 boutiques clientes', 'Négocié des conditions de paiement à 30 jours avec 15 grossistes'] },
  ];
  p.education = [
    { id: uid(), degree: 'Licence en Gestion commerciale', school: 'Université d\u2019Abomey-Calavi', city: '', start: '2017', end: '2020', details: '' },
  ];
  p.skills = ['Négociation', 'Gestion d\u2019équipe', 'Excel', 'CRM', 'Prospection', 'Merchandising'];
  p.languages = [
    { id: uid(), name: 'Français', level: 'Courant' },
    { id: uid(), name: 'Fon', level: 'Langue maternelle' },
    { id: uid(), name: 'Anglais', level: 'Intermédiaire' },
  ];
  p.certs = [{ id: uid(), name: 'Certificat Google Ateliers Numériques', org: 'Google', year: '2022' }];
  p.interests = ['Lecture', 'Football', 'Couture'];
  p.sections.forEach((s) => { if (['certifications', 'interests'].includes(s.id)) s.visible = true; });
  return p;
}
