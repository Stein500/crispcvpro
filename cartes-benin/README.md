# Atlas pédagogique du Bénin — salve 1 • 10 cartes (CM2)

**10 cartes PNG** de 1 530 × 2 040 pixels, avec signature « Dsky 🇧🇯 » représentée par le nom et un petit drapeau dessiné en bas de chaque planche. Consultation et vérification des faits : **28 septembre 2026**. Les tracés sont **généralisés et pédagogiques** : ils ne servent ni à borner un terrain ni à établir une limite juridique précise. « Actualisé » signifie que les faits ont été revérifiés à cette date ; cela ne signifie pas que chaque trait du jeu de données a été levé en 2026.

| N° | Fichier | Sujet |
|---:|---|---|
| 01 | `images/01_benin_dans_le_monde.png` | Localisation dans le monde |
| 02 | `images/02_benin_en_afrique.png` | Situation en Afrique |
| 03 | `images/03_afrique_de_louest.png` | Afrique de l’Ouest |
| 04 | `images/04_quatre_pays_voisins.png` | Frontières et pays voisins |
| 05 | `images/05_limites_et_points_cardinaux.png` | Limites et points cardinaux |
| 06 | `images/06_superficie_du_benin.png` | Superficie |
| 07 | `images/07_douze_departements.png` | Départements |
| 08 | `images/08_villes_et_capitale.png` | Capitale et villes |
| 09 | `images/09_fleuves_et_rivieres.png` | Principaux cours d’eau |
| 10 | `images/10_lacs_et_littoral.png` | Littoral et lacs du sud |

`apercu_des_10_cartes.jpg` montre les 10 planches ensemble. `atlas_benin_cm2.pdf` permet l’impression en 10 pages. Le ZIP regroupe les 10 PNG, ce document et le PDF.

## Ce qui a été vérifié

- **Voisinage et divisions** : quatre voisins terrestres — Togo, Burkina Faso, Niger et Nigeria —, océan Atlantique au sud, 12 départements et 77 communes, d’après l’Institut géographique national du Bénin [1](https://ign.bj/webmap/village.php).
- **Superficie** : l’IGN Bénin affiche **114 763 km²** [1](https://ign.bj/webmap/village.php). L’indicateur de superficie totale de la Banque mondiale affiche **114 760 km²** pour 2023 [2](https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=BJ). Les cartes précisent la source au lieu de présenter ces chiffres légèrement différents comme interchangeables. Il ne s’agit **pas** d’une superficie calculée à partir de l’image.
- **Capitale** : Porto-Novo est la capitale ; Cotonou abrite le siège du gouvernement [3](https://www.cia.gov/the-world-factbook/countries/benin/). Repères approximatifs des autres villes recoupés avec des coordonnées publiées [4](https://www.geodatos.net/en/coordinates/benin).
- **Hydrographie** : Ouémé et Niger, Pendjari / cours supérieur de l’Oti, ainsi que Mono, Couffo, Mékrou, Alibori, Sota et Zou sont documentés pour le Bénin [5](https://www.fao.org/4/T0360E/T0360E02.htm) [6](https://orbi.uliege.be/bitstream/2268/315042/3/chap2.pdf). **Seuls les tracés disponibles et identifiés (Ouémé, Niger, Oti/Pendjari) sont dessinés** sur la carte 09 ; les autres cours d’eau sont cités dans l’encart, sans inventer de tracé. Le lac Ahémé est marqué par un **point de localisation**, pas par un contour imaginaire [5](https://www.fao.org/4/T0360E/T0360E02.htm) [7](https://mapcarta.com/17137138). Le contour du lac Nokoué provient d’un polygone non nommé de Natural Earth, identifié à l’aide de sa position [8](https://mapcarta.com/17130640).

## Données et reproduction

Les géométries viennent des couches **Natural Earth** [9](https://github.com/nvkelso/natural-earth-vector) (domaine public) : pays à 1:110m et 1:50m, départements ADM1 à 1:10m, cours d’eau et lacs à 1:10m. Les cinq fichiers GeoJSON du dossier `data/` en sont des extraits réduits : sélection des attributs et découpage du voisinage du Bénin. Natural Earth est une représentation généralisée à petite échelle, non une carte d’arpentage ; sa couche de rivières ne comporte pas tous les petits affluents.

Pour régénérer les images : `pip install matplotlib geopandas shapely pillow pandas`, puis `python cartes-benin/generer.py` depuis la racine du dépôt. Les PNG générés peuvent être utilisés comme supports de classe, mais contrôler les sources avant toute nouvelle édition.
