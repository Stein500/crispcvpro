# Carte de la leçon « Le Bénin en Afrique » — vérifications

Carte A4, réalisée à partir de la photographie du tableau transmise pour une classe de CM2. Faits revérifiés le **28 septembre 2026**. Supports : `le_benin_en_afrique_lecon_CM2_Dsky.png` (A4, 300 ppp) et `le_benin_en_afrique_lecon_CM2_Dsky.pdf` (PDF vectoriel, une page). La signature est inscrite en bas de la carte.

## Correspondance avec la leçon

| Repère du tableau | Traitement dans la carte |
|---|---|
| Afrique de l’Ouest, zone intertropicale | Localisation dans l’encart continental ; le gouvernement place le pays entre l’équateur et le tropique du Cancer [1](https://www.gouv.bj/pages/la-geographie/). |
| Togo, Burkina Faso, Niger, Nigeria et Atlantique | Pays et océan identifiés sur la carte [1](https://www.gouv.bj/pages/la-geographie/) [2](https://ign.bj/webmap/village.php). |
| Fleuve Niger au nord | Cours réellement tracé par Natural Earth ; **seule une partie** de la frontière avec le Niger suit ce fleuve (environ 120 km sur 277 km d’après le gouvernement) [1](https://www.gouv.bj/pages/la-geographie/). |
| Limites « nord et sud naturelles, les autres artificielles » | Formulation **trop absolue** : le fleuve Mono suit également un tronçon de la frontière ouest avec le Togo ; plusieurs autres tronçons sont des frontières terrestres définies par accord. Le Mono est mentionné, mais **aucun trait de cours d’eau n’est inventé** faute de géométrie vérifiée dans le fond utilisé [1](https://www.gouv.bj/pages/la-geographie/). |
| Superficie 114 763 km² | Conservée, conformément à l’IGN Bénin [2](https://ign.bj/webmap/village.php). |
| 13,75 millions (2024), 122 hab./km² au tableau | Chiffres **non repris tels quels** : la Banque mondiale indique **14 462 724 habitants en 2024** [3](https://data.worldbank.org/?locations=1W-JP-BJ-CY-BA-FI) et **14 814 460 en 2025** [4](https://data.worldbank.org/country/benin). La carte affiche 2025. Sa densité d’environ **129 hab./km²** est le quotient arrondi `14 814 460 ÷ 114 763`. C’est une densité indicative calculée avec la superficie totale de l’IGN, non la série de densité publiée par la Banque mondiale, qui peut employer une autre surface de référence. |
| Porto-Novo et Cotonou | Capitale et siège du gouvernement distingués sur la carte [5](https://www.cia.gov/the-world-factbook/countries/benin/). |
| 12 départements | Les douze sont représentés et nommés ; 77 communes selon l’IGN [2](https://ign.bj/webmap/village.php). |

**Fond géographique :** pays de Natural Earth à 1:50m, départements du Bénin et fleuves de Natural Earth à 1:10m, extraits dans `../data/` [6](https://github.com/nvkelso/natural-earth-vector). Les contours sont généralisés et ne remplacent pas les documents officiels de délimitation. Les positions de Porto-Novo et Cotonou sont des repères cartographiques approximatifs [7](https://www.geodatos.net/en/coordinates/benin).

**Pour régénérer :** depuis la racine du dépôt, exécuter `.venv/bin/python cartes-benin/carte_lecon.py` après avoir installé `geopandas`, `matplotlib` et `shapely`. Les fichiers générés ne doivent pas être confondus avec une carte cadastrale.
