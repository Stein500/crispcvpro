# 🚀 Déployer CrispCV sur Vercel — pas à pas

Votre site est **100 % statique** (HTML/CSS/JS) : aucun serveur à gérer, hébergement **gratuit** sur Vercel.

---

## Étape 0 — Ce dont vous avez besoin

- Un compte **Vercel** (gratuit) : allez sur [vercel.com/signup](https://vercel.com/signup) → « Continue with GitHub » ou avec votre e-mail.
- Le dossier **`crispcv/`** décompressé (celui de ce zip).

---

## Option A — La plus simple : glisser-déposer (sur ordinateur)

1. Allez sur [vercel.com/new](https://vercel.com/new).
2. Faites **glisser le dossier `crispcv`** dans la zone de dépôt.
3. Laissez tout par défaut (le fichier `vercel.json` du projet configure déjà les en-têtes de sécurité et le cache).
4. Cliquez **Deploy**. ⏳ 30 secondes plus tard : votre site est en ligne sur `https://crispcv-xxxxx.vercel.app`.

## Option B — Depuis votre téléphone (Termux)

```bash
pkg install nodejs -y
npm install -g vercel
cd "/storage/emulated/0/Web+/crispcv"
vercel login        # choisissez votre méthode, suivez le lien affiché
vercel --prod       # confirmez chaque question par Entrée
```

À la fin, Vercel vous donne l'URL de production.

---

## Étape 1 — Remplacer le domaine d'exemple (important pour le SEO)

Le site utilise `https://crispcv.app` comme domaine fictif (sitemap, robots, liens canoniques).
Remplacez-le par votre vraie URL **avec le script fourni** :

```bash
# Dans Termux, depuis le dossier crispcv :
bash tools/set-domain.sh crispcv-xxxxx.vercel.app
```

Le script corrige automatiquement : `sitemap.xml`, `robots.txt`, toutes les balises
`canonical` et `og:` des 7 pages. Puis redéployez (`vercel --prod` ou nouveau drag & drop).

---

## Étape 2 — Vérifier que tout est en place ✅

1. **Ouvrez votre URL** → la page d'accueil s'affiche avec le splash.
2. **Testez le en local** : refaites un tour sur le site, puis coupez la 4G et rechargez → tout doit s'afficher grâce au Service Worker.
3. **Installez l'app** : Chrome Android → menu ⋮ → « Ajouter à l'écran d'accueil » → l'icône CrispCV apparaît comme une vraie app.
4. **Testez le Studio** : créez un CV, changez de modèle (loupe 🔍 = zoom plein écran), exportez en PDF.
5. **SEO** : visitez `https://votre-url/sitemap.xml` et `/robots.txt` → ils doivent contenir **votre** domaine.

---

## Étape 3 (optionnel) — Votre propre nom de domaine

1. Achetez un domaine (ex. `crispcv.com`) chez un registrar.
2. Vercel → votre projet → **Settings → Domains** → ajoutez le domaine et suivez les instructions DNS.
3. Relancez `bash tools/set-domain.sh crispcv.com`.

---

## Dépannage

| Problème | Solution |
|---|---|
| Page blanche après déploiement | Videz le cache du navigateur (le Service Worker garde parfois une vieille version). |
| « 404 » sur les sous-pages | Rien à faire : le `vercel.json` inclut `cleanUrls` — les URLs `/creer-mon-cv/` fonctionnent nativement. |
| Les polices ne s'affichent pas en local | C'est normal au tout premier chargement sans réseau ; elles sont mises en cache dès la première visite en ligne. |
| Modifier le site puis publier une nouvelle version | Refaites un drag & drop ou `vercel --prod`. Il n'y a plus de service worker : le site se recharge toujours frais, vos visiteurs voient la nouvelle version immédiatement. |

Besoin d'aide ? techsteinsecureway@gmail.com — WhatsApp : +229 01 49 11 49 51.
