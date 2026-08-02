/* CrispCV — dictionnaires FR/EN. Le français est la langue principale ;
   l'anglais est traité au même niveau pour tout le chrome du site et les
   interfaces des outils. Les corps d'articles des guides restent FR en MVP
   (voir README, section "Limites"). */
export const LANGS = ['fr', 'en'];

export const dict = {
  fr: {
    'nav.home': 'Accueil', 'nav.builder': 'Créer mon CV', 'nav.converter': 'Convertisseur',
    'nav.resources': 'Ressources', 'nav.guides': 'Guides',
    'footer.tag': 'Boîte à outils gratuite pour chercheurs d\'emploi. Sans compte, sans filigrane, sans piège — vos fichiers restent sur votre appareil.',
    'footer.modules': 'Modules', 'footer.site': 'Le site', 'footer.legal': 'Légal',
    'footer.about': 'À propos', 'footer.privacy': 'Confidentialité',
    'footer.studio': 'CrispCV Studio — créer un CV', 'footer.convert': 'CrispCV Convert — convertir',
    'footer.res': 'CrispCV Ressources — liens utiles',
    'footer.copy': 'Gratuit, pour toujours.', 'footer.local': '100 % local — vos données restent sur votre appareil.',
    'footer.contact': 'UNE QUESTION ?',
    'install.btn': 'Installer l\u2019application', 'install.done': 'Application installée',
    'install.hint': 'Sur Chrome : menu ⋮ → « Ajouter à l\u2019écran d\u2019accueil ».',
    'notif.title': 'Notifications', 'notif.sub': 'Vos actions importantes, gardées sur cet appareil.',
    'notif.clear_ask': 'Toutes les notifications enregistrées sur cet appareil seront effacées définitivement.', 'dlg.cancel': 'Annuler',
    'notif.empty': 'Aucune notification pour l\u2019instant. Les actions (exports, partages…) apparaîtront ici.',
    'notif.clear': 'Tout effacer', 'notif.cleared': 'Notifications effacées',
    'theme.light': 'Passer en mode clair', 'theme.dark': 'Passer en mode sombre',
    'common.close': 'Fermer', 'common.loading': 'Chargement…', 'common.download': 'Télécharger',
    'common.required_net': 'Cette conversion charge une bibliothèque externe au premier usage — une connexion est requise une fois, puis elle est conservée en cache sur votre appareil.',
    'common.local_ok': 'Conversion locale : rien n\'est envoyé sur un serveur.',
    'home.kicker': 'Gratuit · Sans compte · 100 % local',
    'home.title': 'Un CV net. Le bon format. Les bonnes adresses.',
    'home.lead': 'CrispCV réunit les deux outils qui débloquent le plus souvent une candidature : un CV bien fait et un fichier dans le bon format. Gratuit, sans piège, et vos documents ne quittent jamais votre appareil.',
    'home.cta_cv': 'Créer mon CV', 'home.cta_convert': 'Convertir un fichier',
    'home.trust1': 'Aucune inscription', 'home.trust2': 'Aucun filigrane', 'home.trust3': 'Données sur votre appareil',
    'home.pillars_k': 'Les outils',
    'home.pillars_t': 'Tout ce qu\'il faut pour candidater, en un seul endroit',
    'home.p1_t': 'Créez un CV professionnel', 'home.p1_d': 'Modèles sobres, modernes ou créatifs, aperçu en direct à chaque frappe, alertes si votre CV déborde, vérification ATS. Export PDF sans filigrane.',
    'home.p1_go': 'Ouvrir le Studio',
    'home.p2_t': 'Convertissez vos fichiers', 'home.p2_d': 'PDF, images, photo iPhone (HEIC) : convertissez, compressez, fusionnez directement dans votre navigateur. Aucun envoi de fichier.',
    'home.p2_go': 'Ouvrir le Convert',
    'home.p3_t': 'Trouvez où chercher', 'home.p3_d': 'Un répertoire curé de ressources gratuites : offres d\'emploi, formations, aide à la lettre de motivation, préparation d\'entretien.',
    'home.p3_go': 'Parcourir les ressources',
    'home.why_k': 'Nos engagements',
    'home.why_t': 'Gratuit ne doit pas vouloir dire piégé',
    'home.w1_t': 'Gratuit, vraiment', 'home.w1_d': 'Pas de palier payant surprise au moment de l\'export, pas de filigrane, pas de compte obligatoire. Jamais.',
    'home.w2_t': 'Confidentiel par défaut', 'home.w2_d': 'Votre CV contient vos données personnelles : il est traité et stocké localement, sur votre appareil. Rien ne transite par un serveur.',
    'home.w3_t': 'Pensé pour les connexions fragiles', 'home.w3_d': 'Site léger, installable sur votre téléphone, aucun envoi de données.',
    'home.w4_t': 'Vivant, pas statique', 'home.w4_d': 'Aperçu en temps réel, retours immédiats, aucune sensation de formulaire administratif.',
    'home.cta_t': 'Prêt à candidater ?',
    'home.cta_d': 'Commencez par le CV — c\'est ce qui bloque le plus souvent.',
    'builder.title': 'CrispCV Studio', 'builder.sub': 'Créez, personnalisez et exportez votre CV — sauvegarde automatique sur votre appareil.',
    'converter.title': 'CrispCV Convert', 'converter.sub': 'Convertissez et compressez vos fichiers directement dans votre navigateur. Gratuit, sans inscription, sans filigrane.',
    'resources.title': 'CrispCV Ressources', 'resources.sub': 'Un répertoire curé de liens utiles pour votre recherche d\'emploi — avec la mention gratuit/freemium affichée clairement.',
    'guides.title': 'Guides & aide', 'guides.sub': 'Des checklists courtes et actionnables, pas des murs de texte.',
    'about.title': 'À propos de CrispCV', 'privacy.title': 'Confidentialité',
    'en_notice': 'English version coming soon — the French version below is complete.',
  },
  en: {
    'nav.home': 'Home', 'nav.builder': 'Build my CV', 'nav.converter': 'Converter',
    'nav.resources': 'Resources', 'nav.guides': 'Guides',
    'footer.tag': 'A free toolbox for job seekers. No account, no watermark, no catch — your files stay on your device.',
    'footer.modules': 'Modules', 'footer.site': 'The site', 'footer.legal': 'Legal',
    'footer.about': 'About', 'footer.privacy': 'Privacy',
    'footer.studio': 'CrispCV Studio — CV builder', 'footer.convert': 'CrispCV Convert — file converter',
    'footer.res': 'CrispCV Resources — useful links',
    'footer.copy': 'Free, forever.', 'footer.local': '100% local — your data stays on your device.',
    'footer.contact': 'QUESTIONS?',
    'install.btn': 'Install the app', 'install.done': 'App installed',
    'install.hint': 'In Chrome: menu ⋮ → “Add to Home screen”.',
    'notif.title': 'Notifications', 'notif.sub': 'Your important actions, kept on this device.',
    'notif.clear_ask': 'All notifications stored on this device will be permanently deleted.', 'dlg.cancel': 'Cancel',
    'notif.empty': 'No notifications yet. Actions (exports, shares…) will appear here.',
    'notif.clear': 'Clear all', 'notif.cleared': 'Notifications cleared',
    'theme.light': 'Switch to light mode', 'theme.dark': 'Switch to dark mode',
    'common.close': 'Close', 'common.loading': 'Loading…', 'common.download': 'Download',
    'common.required_net': 'This conversion loads an external library on first use — a connection is required once, then it is cached on your device.',
    'common.local_ok': 'Local conversion: nothing is sent to a server.',
    'home.kicker': 'Free · No account · 100% local',
    'home.title': 'A crisp CV. The right format. The right places.',
    'home.lead': 'CrispCV brings together the two tools that most often unblock a job application: a well-made CV and a file in the right format. Free, with no catch — and your documents never leave your device.',
    'home.cta_cv': 'Build my CV', 'home.cta_convert': 'Convert a file',
    'home.trust1': 'No sign-up', 'home.trust2': 'No watermark', 'home.trust3': 'Data stays on your device',
    'home.pillars_k': 'The tools',
    'home.pillars_t': 'The two essential tools for applying, in one place',
    'home.p1_t': 'Build a professional CV', 'home.p1_d': 'Sober, modern or creative templates, live preview as you type, overflow alerts, ATS check. Watermark-free PDF export.',
    'home.p1_go': 'Open Studio',
    'home.p2_t': 'Convert your files', 'home.p2_d': 'PDF, images, iPhone photos (HEIC): convert, compress, merge right in your browser. No file upload, ever.',
    'home.p2_go': 'Open Convert',
    'home.p3_t': 'Find where to look', 'home.p3_d': 'A curated directory of free resources: job boards, training, cover-letter help, interview prep.',
    'home.p3_go': 'Browse resources',
    'home.why_k': 'Our commitments',
    'home.why_t': 'Free should never mean trapped',
    'home.w1_t': 'Free, really', 'home.w1_d': 'No surprise paywall at export time, no watermark, no forced account. Ever.',
    'home.w2_t': 'Private by default', 'home.w2_d': 'Your CV holds personal data: it is processed and stored locally, on your device. Nothing goes through a server.',
    'home.w3_t': 'Built for fragile connections', 'home.w3_d': 'Lightweight site, installable on your phone, nothing ever uploaded.',
    'home.w4_t': 'Alive, not static', 'home.w4_d': 'Real-time preview, instant feedback — never a frozen admin form.',
    'home.cta_t': 'Ready to apply?',
    'home.cta_d': 'Start with the CV — that\'s what blocks most applications.',
    'builder.title': 'CrispCV Studio', 'builder.sub': 'Create, customize and export your CV — autosaved on your device.',
    'converter.title': 'CrispCV Convert', 'converter.sub': 'Convert and compress your files right in your browser. Free, no sign-up, no watermark.',
    'resources.title': 'CrispCV Resources', 'resources.sub': 'A curated directory of useful job-search links — with free/freemium clearly labelled.',
    'guides.title': 'Guides & help', 'guides.sub': 'Short, actionable checklists — no walls of text.',
    'about.title': 'About CrispCV', 'privacy.title': 'Privacy',
    'en_notice': 'English version coming soon — the French version below is complete.',
  },
};

export function getLang() {
  const l = localStorage.getItem('crispcv.lang');
  return LANGS.includes(l) ? l : 'fr';
}
export function setLang(l) {
  localStorage.setItem('crispcv.lang', LANGS.includes(l) ? l : 'fr');
  applyLang();
}
export function t(key) {
  const l = getLang();
  return (dict[l] && dict[l][key]) || dict.fr[key] || key;
}
export function applyLang() {
  const l = getLang();
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = dict[l][el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const v = dict[l][el.dataset.i18nAria];
    if (v != null) el.setAttribute('aria-label', v);
  });
  document.querySelectorAll('.lang-toggle').forEach((b) => (b.textContent = l === 'fr' ? 'EN' : 'FR'));
  document.dispatchEvent(new CustomEvent('crispcv:lang'));
}
