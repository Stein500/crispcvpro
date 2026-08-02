# Prompt — Finition UX mobile CrispCV (à copier-coller dans une IA)

> Contexte : site web statique multi-pages (HTML/CSS/JS vanilla, aucun framework) nommé **CrispCV** — créateur de CV + convertisseur de fichiers, 100 % local. L'utilisateur principal est sur **smartphone Android** (connexion parfois instable). Ce prompt décrit les règles de finition UX à respecter pour toute évolution.

## Mission pour l'IA

Tu es un duo designer + intégrateur senior. Tu reprends le site CrispCV existant. Ta priorité absolue : **une expérience mobile (360–420 px) irréprochable, aérée, sans aucun débordement**, tout en gardant l'identité noir/blanc + rouge sceau `#B23A2E`. Ne casse aucune fonctionnalité existante.

## Problèmes observés sur mobile (à ne JAMAIS reproduire)

1. Défilement horizontal de toute la page (contenu coupé à gauche) causé par des éléments plus larges que le viewport.
2. Barre d'outils du studio qui s'empile en hauteur et occupe la moitié de l'écran.
3. Menu «Exporter» (position absolute) qui sort de l'écran sur mobile.
4. En-têtes d'accordéons dont le contenu s'aligne à droite (chevron avec `margin-left:auto` placé en premier enfant).
5. Densité excessive : paddings/boutons trop petits, tout est serré.

## Règles non négociables

### A. Zéro débordement
- `body{overflow-x:hidden}` systématique + `min-width:0` sur les enfants de grilles/flex.
- Aucun élément ne dépasse `100vw` ; les menus déroulants passent en `position:fixed` ancré bas-écran sur mobile (jamais d'`absolute` de plus de ~200 px sans repli mobile).
- Toute feuille A4 ou canvas large passe par un `transform: scale()` calculé en JS, jamais par un débordement natif.

### B. Bottom nav mobile (pattern application)
- Barre fixe basse visible seulement ≤ 820 px, 4 destinations (Accueil / CV / Convertir / Guides), icône + label ≤ 12 px, état actif accentué rouge.
- `env(safe-area-inset-bottom)` respecté ; `body` reçoit un padding-bottom équivalent ; `display:none` à l'impression.
- Les éléments flottants (bouton installer, toast, bulle progression) se décalent au-dessus de cette barre sur mobile.

### C. Bulle de progression façon Messenger (Studio)
- FAB circulaire 58 px, coin bas-droite, avec **anneau de progression SVG** (vert ≥ 80 %, rouge sceau sinon) et % au centre.
- Au clic : panneau avec le %, la checklist des rubriques remplies/manquantes, une **miniature réelle du CV** (rendu du moteur, mise à l'échelle en JS), et un bouton « Voir l'aperçu ».
- Le score est calculé par pondérations (identité 30, accroche 16, expérience 24, formation 10, compétences 8, langues 6, réalisations 6) — à faire évoluer avec le produit.

### D. Aération & touch targets
- Mobile : containers 16 px, sections 52 px, cartes 19 px, accordéons 13–15 px, boutons ≥ 40 px de haut, grille modèles 2 colonnes.
- Rien ne se colle : marges minimales 12–16 px entre blocs empilés.

### E. Contacts en icônes pures
- Footer : icône enveloppe (mailto) + icône WhatsApp (wa.me), 40 px, bordure fine, survol accent. Libellés uniquement en `aria-label`/`title` — jamais de texte visible.
- Le numéro reste **WhatsApp uniquement** : lien `https://wa.me/<numéro>`, aucun `tel:`.

## Vérification avant de livrer

- Tester en émulation 360×800 : aucune scrollbar horizontale sur AUCUNE page ; la bottom nav ne masque pas le contenu ; la bulle n'écrase pas le dernier champ du formulaire ; le menu Exporter est entièrement visible ; `prefers-reduced-motion` désactive les animations non essentielles.
