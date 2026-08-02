# Journal des versions — CrispCV

## v12 — 2 août 2026

1. **Mode hors-ligne supprimé** (cause des versions figées) : service worker et page offline retirés, et ui.js désinscrit automatiquement tout ancien service worker + purge les caches des versions précédentes à chaque visite. Le site se recharge toujours à jour — seuls vos CV (IndexedDB) et vos notifications (localStorage) restent sauvegardés sur l'appareil. `vercel.json` : fini le cache « immutable » d'un an, revalidation normale.
2. **Boîtes de dialogue maison** : les vilaines boîtes natives du navigateur (`confirm()`) sont remplacées par une belle modale CrispCV (suppression d'un CV, effacement des notifications) — coin plié, Échap/clic dehors pour annuler.
3. **Redimensionner réparé et convertisseur vivant** : avant, la conversion partait avant même que vous tapiez les dimensions, et rien ne se relançait ensuite. Maintenant toute modification d'un réglage (largeur, hauteur, qualité, format, pages) relance la conversion automatiquement (450 ms), et l'écran affiche les dimensions réelles de votre image (« 900 × 1200 px — vide = taille d'origine »).
4. **Textes obsolètes retirés** : plus aucune mention « hors-ligne » (accueil, pieds de page, convertisseur, guides, à propos, og-image, docs). FAQ remplacée par « Mes fichiers sont-ils envoyés sur un serveur ? » (réponse : non, jamais).

## v11 — 2 août 2026

1. **Exports simplifiés : PDF + Word, point.** La fenêtre « Exporter » ne propose plus que les deux formats qui comptent, en grands boutons avec description (TXT, JSON et Partage retirés comme demandé).
2. **Word (.docx) réparé sur mobile** : le fichier était emballé avec le type MIME `application/zip` → Android le proposait comme « archive » au lieu de l'ouvrir dans Word/WPS. Le .docx embarque maintenant le bon type MIME, `styles.xml`, `docProps`, polices Calibri explicites et langue fr-FR — ouverture propre dans Word mobile, WPS Office et Google Docs.
3. **Téléchargement durci** : l'URL du fichier reste valide 5 s (au lieu de 0,8 s) pour les téléphones lents, et le toast confirme : « Fichier Word téléchargé — regardez le dossier Téléchargements ».

## v10 — 2 août 2026

1. **Aperçu de partage (og:image) réparé et refait** : nouvelle image 1200×630 en **JPEG** (`assets/img/og-image.jpg`, ~87 Ko) — WhatsApp/Facebook/X ignorent les WebP et le fichier .png référencé n'existait pas. Les 7 pages pointent maintenant vers l'URL absolue réelle avec dimensions et texte alternatif (`og:image:width/height/type/alt`, `twitter:image`).
2. **Domaine configuré** : `crispcvpro.vercel.app` remplace le domaine d'exemple partout (canoniques, Open Graph, sitemap, robots). `tools/set-domain.sh` détecte désormais le domaine actuel automatiquement pour le changer à nouveau en une commande.
3. **Barre système assortie au thème** : `theme-color` passe au noir profond `#0B0B0A` en thème sombre et revient au papier `#FAFAF8` en clair (mise à jour instantanée au basculement, toutes pages).
4. `tools/make-og.py` régénère l'image de partage à volonté (marque, polices et couleurs du site).

## v9 — 2 août 2026
- **Centre de notifications** 🔔 : cloche dans le header (badge non-lus) + page « Notifications » — chaque action (export, partage…) est enregistrée sur votre appareil.
- **Toasts rapides** : disparition en 2 secondes.
- **Bouton « Installer l'application »** : revient via le **menu ⋮ (burger)**, toujours visible, jamais flottant au-dessus de la navigation.
- **Fenêtre Exporter détectable** : vraie modale avec voile sombre + titre (ferme ✕ / Échap / clic dehors).
- **Bottom navigation statique** : écrite directement dans les pages — plus aucun clignotement entre Accueil et Créer mon CV.

## v8 — 2 août 2026
- **Notifications compactes** : toasts en fine pastille, bouton « Installer » réduit et déplacé à gauche sur mobile (ne gêne plus la bulle FAB ni la navigation).
- **Accent couleur corrigé** : la couleur choisie repeint désormais aussi le bandeau du modèle « Capitale ».
- **Impression renforcée** : largeur A4 explicite + centrage automatique — marges strictement égales même quand la boîte d'impression d'Android re-margine la page.

## v7 — 1er août 2026 (tout nouveau !)
- **Zoom sur les modèles** : loupe 🔍 sur chaque miniature → aperçu plein écran, bouton « Utiliser ce modèle ».
- **Bascule Éditer / Aperçu** sur mobile : barre segmentée collante, l'aperçu A4 prend tout l'écran, parfaitement centré. La bulle « Voir l'aperçu » bascule automatiquement.
- **Lignes de coupe multi-pages** dans l'aperçu (« Page 2 », façon Word) + sauts de page propres à l'impression.
- **Recadrage photo intégré** : glisser + zoom + aperçu rond/carré (canvas local, zéro dépendance). Forme au choix : ronde, carré ou selon le modèle.
- **Partage direct** : « Partager en DOCX / TXT » via WhatsApp, mail… (Web Share API, repli téléchargement).
- **Mode guidé ✦** : remplissage section par section avec progression (1/6…), la bulle FAB s'efface pendant le guidage pour ne pas gêner.
- **Guides illustrés** : 8 captures réelles dans la page Guides.
- **Badge de version** visible en bas de toutes les pages.
- Correctifs : centrage exact de l'aperçu réduit (±2 px testés), mesure fiable des pages, superpositions FAB/overlays.
- Documentation : `PRISE-EN-MAIN.md`, `DEPLOIEMENT.md` (Vercel pas à pas + `tools/set-domain.sh`).

## v6 — 1er août 2026
- 10 modèles de CV en miniatures fidèles (mise à l'échelle transform, plus de re-flux).
- Hero d'accueil, FAB et splash conformes ; filtres de modèles en ligne scrollable sur mobile.

## v4 — 31 juillet 2026
- Bottom navigation corrigée, menu Exporter fixe sur mobile, splash, PWA installable.
- Contacts en icônes (WhatsApp + e-mail), section Ressources retirée.
