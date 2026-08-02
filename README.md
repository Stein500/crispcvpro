# CrispCV

> Boîte à outils gratuite pour chercheurs d'emploi : **Studio** (créateur de CV) et **Convert** (convertisseur de fichiers). Gratuit sans piège, confidentiel par défaut, utilisable en local.

## Démarrage

Aucune étape de build : c'est un site statique.

```bash
# Servir en local (au choix)
python3 -m http.server 8000      # depuis ce dossier
npx serve .
```

Puis ouvrez http://localhost:8000. Pour utiliser le mode en local (service worker), le site doit être servi en http(s) — pas ouvert en `file://`.

## Déploiement

### Vercel (recommandé, `vercel.json` inclus)

**Guide pas à pas complet (ordinateur ET téléphone/Termux) : voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md).**

1. Créez un compte sur vercel.com puis « Add New → Project ».
2. Glissez-déposez le dossier `crispcv/` **ou** connectez le dépôt Git :
   - Framework Preset : **Other** · Build Command : *(vide)* · Output Directory : *(vide / racine)*.
3. Déployez. Le `vercel.json` fourni configure : URLs propres avec slash final (cohérent avec les liens internes), cache navigateur raisonnable (1 h sur `/assets`, revalidation sur le HTML — les mises à jour sont visibles immédiatement, sans service worker), en-têtes de sécurité (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`).
4. Remplacez le domaine d'exemple : `bash tools/set-domain.sh votre-url.vercel.app` (met à jour sitemap, robots, canoniques et Open Graph).
5. Ajoutez votre domaine dans **Settings → Domains** si vous en avez un.

### Autres hébergeurs

Netlify, GitHub Pages, Cloudflare Pages, S3 : publiez la racine du dossier, aucune commande de build.

Après déploiement, remplacez `https://crispcv.app` par votre domaine dans :
`sitemap.xml`, `robots.txt`, et les balises `canonical`/`og:*` des pages HTML.

## Architecture

```
index.html                  Accueil — 3 piliers, engagements, CTA
creer-mon-cv/               CrispCV Studio (créateur de CV)
convertisseur/              CrispCV Convert (convertisseur)
guides/                     Guides checklist + captures réelles + FAQ (données structurées FAQPage)
DEPLOIEMENT.md              Mise en ligne Vercel pas à pas (+ tools/set-domain.sh)
a-propos/  confidentialite/ Pages légales
assets/
  css/app.css               Tokens de design + tous les composants (1 fichier organisé)
  js/
    i18n.js                 Dictionnaires FR/EN + bascule de langue
    ui.js                   Thème clair/sombre, nav mobile, bottom nav, splash, toast
    mini-zip.js             Archiveur ZIP « store » (~60 lignes, 0 dépendance)
    cv/
      templates.js          10 modèles = config JSON (pas 10 composants dupliqués)
      render.js             Moteur de rendu commun → feuille A4 (.cv-sheet)
      builder.js            Éditeur : sections, aperçu live, multi-versions, zoom modèles,
                            bascule Éditer/Aperçu (mobile), mode guidé, partage, lignes de coupe
      store.js              IndexedDB : sauvegarde auto + export/import JSON
      ats.js                Vérificateur ATS (heuristiques transparentes)
      exporters.js          PDF (impression vectorielle) · DOCX (généré) · TXT · JSON
      labels.js             Libellés FR/EN de l'éditeur
      fit.js                Mise à l'échelle fidèle des feuilles A4 (transform, jamais de re-flux)
      photo-crop.js         Recadrage photo intégré (canvas, glisser + zoom, 0 dépendance)
    convert/
      mini-pdf.js           Générateur PDF local (JPEG → A4, 0 dépendance)
      converter.js          10 conversions, chargement CDN à la demande
  img/                      Logo SVG maître, variantes, icônes PWA, og-image
manifest.webmanifest        PWA : raccourcis (Studio/Convert), catégories, screenshots
vercel.json                 Config Vercel : URLs propres, cache, en-têtes sécurité
sitemap.xml  robots.txt     SEO
tools/make_icons.py         Icônes PNG + og-image (Pillow)
tools/make_pwa_assets.py    Icônes any/maskable + screenshots d'installation
```

**Compartimentage** : chaque module vit dans son dossier avec son point d'entrée (`builder.js`, `converter.js`) ; les scripts ne sont chargés que sur la page concernée. Chaque route est un vrai fichier HTML — le « prérendu » est structurel.

## Choix techniques justifiés (vs. cahier des charges §6)

Le cahier proposait Angular ou Next.js. **Choix retenu : modules ES natifs statiques, sans build**, pour trois raisons liées au public cible (connexions instables, appareils modestes) :

1. **SEO garanti sans infrastructure** : chaque route est un vrai document HTML — pas de SSR à configurer, le problème n°2 de la V1 (100 % client) est structurellement impossible ici.
2. **Légèreté maximale** : aucune dépendance de framework ; le poids transféré est le code réel des outils, rien d'autre. Les bibliothèques lourdes (pdf-lib, pdf.js, heic2any) ne sont chargées qu'à la demande, une fois, puis mises en cache.
3. **Déployable partout** (y compris hébergement gratuit basique), zéro coût, zéro maintenance de build.

Les autres exigences du cahier sont respectées : traitement **100 % local**, PDF du CV **vectoriel** (impression navigateur = vrai texte, correction du défaut n°4 de la V1), **PWA complète** (manifest avec raccourcis d'app + screenshots d'installation, icônes any/maskable séparées, bouton « Installer l'application » sur `beforeinstallprompt`, service worker v2 avec page en local dédiée et reconnexion automatique, splash de lancement, CDN de conversion mis en cache pour usage en local), **i18n FR/EN**, **WCAG** (focus visibles, contrastes AA, `prefers-reduced-motion`, skip-link), ton UX §13.

## Design system (§7)

Tokens dans `assets/css/app.css` (`:root` + `[data-theme="dark"]`) :

| Rôle | Valeur | Usage |
|---|---|---|
| Encre | `#0A0A0A` | texte, titres |
| Papier | `#FFFFFF` / `#FAFAF8` | fonds |
| Gris | `#6B6B6B` `#B0B0B0` `#E5E5E5` | hiérarchie, filets |
| Rouge sceau | `#B23A2E` (`#D95F50` en sombre) | CTA, accents — jamais en fond plein |
| Vert | `#2F6E4F` | succès export/conversion |
| Or mat | `#A98B4E` | petites touches, notices |

Typographies : **Space Grotesk** (titres/marque), **Inter** (corps/formulaires), **JetBrains Mono** (labels/données). Angles 6 px max. **Élément signature : le coin de page corné** (`.card-doc`) sur les cartes de modèles, outils et documents — une piste, appliquée partout. Mode sombre complet via la bascule d'en-tête ; le blanc reste le défaut.

## Limites assumées et points [À COMPLÉTER] (exigé par §14.6)

- **Stack ≠ Angular/Next** : voir justification ci-dessus. Migration possible module par module, la logique métier est déjà isolée.
- **Guides/pages légales en FR uniquement** en MVP : tout le chrome et les outils sont bilingues FR/EN ; la traduction EN des articles est la phase 2 prévue (§12 du cahier).
- La section **Ressources** a été retirée du produit (décision produit) : le périmètre est désormais Studio + Convert.
- **Analytics** : aucune mesure active. Emplacement prévu pour Plausible/Umami (§10) ; à documenter en page Confidentialité si activé.
- **Contacts configurés** : techsteinsecureway@gmail.com · +229 01 49 11 49 51 (**WhatsApp uniquement**, lien wa.me — footer de toutes les pages, formulaire de suggestion, pages légales).
- **Splash** : écran de lancement affichant de vrais CV rendus par le moteur du site (une fois par session, désactivé si `prefers-reduced-motion`) ; le hero de l'accueil affiche également un CV réellement généré.
- **Routes SEO par conversion** (`/convertisseur/pdf-vers-word`…, §4) : en site statique pur, la page Convert couvre les 10 outils via cartes ancrées ; créer une page statique par conversion est possible plus tard (génération au déploiement) — non bloquant.
- **PDF → DOCX** : extraction de texte propre (la mise en page complexe n'est pas reconstruite) — annoncé à l'utilisateur *avant* conversion, comme demandé.
- **Phase 2/3 non livrées** (cahier §15) : scan photo→PDF avec recadrage auto, compteurs publics, lettre de motivation guidée, suivi de candidatures.

## Régénérer les icônes

```bash
python3 tools/make_icons.py   # nécessite Pillow ; télécharge les TTF Space Grotesk/Inter/JetBrains Mono
```

## Licence / contact

[À COMPLÉTER]
