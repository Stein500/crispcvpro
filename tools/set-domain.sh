#!/usr/bin/env bash
# Remplace le domaine actuel du site (détecté automatiquement dans index.html)
# par VOTRE vrai domaine, dans : sitemap, robots, canoniques et Open Graph.
# Usage :  bash tools/set-domain.sh mon-site.vercel.app
set -e
DOM="${1:-}"
if [ -z "$DOM" ]; then
  echo "Usage : bash tools/set-domain.sh votre-domaine.vercel.app"
  exit 1
fi
DOM="${DOM#https://}"; DOM="${DOM#http://}"; DOM="${DOM%/}"
cd "$(dirname "$0")/.."
OLD=$(grep -oP 'rel="canonical" href="\Khttps://[^/"]+' index.html | head -1)
if [ -z "$OLD" ]; then echo "Domaine actuel introuvable dans index.html."; exit 1; fi
if [ "$OLD" = "https://$DOM" ]; then echo "Déjà configuré pour https://$DOM"; exit 0; fi
FILES=$(grep -rl "$OLD" --include="*.html" --include="*.xml" --include="*.txt" --include="*.webmanifest" . || true)
[ -z "$FILES" ] && { echo "Rien à remplacer."; exit 0; }
echo "$FILES" | while read -r f; do
  sed -i "s#$OLD#https://$DOM#g" "$f"
  echo "  ✓ $f"
done
echo ""
echo "Domaine mis à jour : $OLD → https://$DOM"
