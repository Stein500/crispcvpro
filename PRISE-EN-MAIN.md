# 📱 CrispCV — Prise en main en 3 minutes

## 1. Installer (sur votre téléphone, avec Termux)

1. Téléchargez le fichier **`crispcv-v12.zip`** (depuis cette conversation).
2. Ouvrez **Termux** et collez cette commande :

```bash
pkg install unzip -y && termux-setup-storage && mkdir -p "/storage/emulated/0/Web+" && rm -rf "/storage/emulated/0/Web+/crispcv" && unzip -o "/storage/emulated/0/Download/crispcv-v12.zip" -d "/storage/emulated/0/Web+" && ls "/storage/emulated/0/Web+/crispcv"
```

> ⚠️ **Important** : chaque version a un nom de zip différent (v8, v9, v10…).
> Utilisez toujours **le zip le plus récent** — Android renomme les doublons
> en `crispcv(1).zip` et c'est facile d'installer l'ancien sans le vouloir.

## 2. Lancer le site

```bash
cd "/storage/emulated/0/Web+/crispcv"
python -m http.server 8000
```

Puis ouvrez Chrome : **http://localhost:8000**

> Premier réflexe : ouvrez la page en **navigation privée**, ou videz le cache
> (Chrome → ⋮ → Historique → Effacer). Ensuite le site se mettra à jour tout seul.

## 3. Vérifier que vous avez la bonne version

Descendez tout en bas de n'importe quelle page : vous devez voir **« v9 »**
en petit gris à côté de « © 2026 CrispCV ». Si ce n'est pas là → ancienne version.

## 4. Créer votre premier CV

1. **Créer mon CV** → touchez **« Exemple »** pour voir un CV rempli.
2. Remplacez les infos par les vôtres (ou touchez **✦ Guidé** : une section à la fois).
3. **Modèles** → touchez la **loupe 🔍** d'un modèle pour l'agrandir avant de choisir.
4. Sur téléphone, la barre **Éditer | Aperçu** (juste sous la barre d'outils) alterne
   entre le formulaire et le rendu A4.
5. **Exporter** → PDF (sans filigrane) ou **Partager en DOCX** → WhatsApp directement.

La bulle ronde en bas à droite (style Messenger) affiche la progression de votre CV :
visez l'anneau vert (≥ 80 %).

## 5. Convertir des fichiers

**Convertisseur** : HEIC → JPG, images → PDF, compresser un PDF, fusionner,
scinder, Word → PDF (aperçu), extraire les images d'un PDF… Tout est traité
**sur votre téléphone**, rien ne part sur internet.

## 6. Installer l'appli (optionnel)

Chrome → ⋮ → **« Ajouter à l'écran d'accueil »** → icône CrispCV comme une vraie app.
Elle fonctionne ensuite **en local**.

## Dépannage express

| Symptôme | Solution |
|---|---|
| Pas de bouton « Aperçu », aperçu tout en bas | Vous êtes sur une vieille version → refaites l'étape 1 avec le zip **v9**, puis navigation privée. |
| Site bizarre après une mise à jour | Navigation privée une fois, ou Chrome → ⋮ → Historique → Effacer le cache. |
| Serveur Termux coupé | Rouvrez Termux, `cd "/storage/emulated/0/Web+/crispcv"` puis `python -m http.server 8000`. |
| Publier en ligne (gratuit) | Suivez **`DEPLOIEMENT.md`**. |

Contact : techsteinsecureway@gmail.com — WhatsApp : +229 01 49 11 49 51.
