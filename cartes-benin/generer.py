#!/usr/bin/env python3
"""10 cartes pédagogiques du Bénin, à partir des géométries Natural Earth.

Dépendances : pip install matplotlib geopandas shapely pillow
Lancer depuis la racine : python cartes-benin/generer.py
Les sources et les limites de précision figurent dans cartes-benin/README.md.
"""
from pathlib import Path
import math
import geopandas as gpd
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle, FancyArrowPatch
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
OUT = ROOT / 'images'
OUT.mkdir(exist_ok=True)
world = gpd.read_file(DATA / 'countries_world.geojson')
region = gpd.read_file(DATA / 'countries_region.geojson')
depts = gpd.read_file(DATA / 'benin_departments.geojson')
rivers = gpd.read_file(DATA / 'rivers_region.geojson')
lakes = gpd.read_file(DATA / 'lakes_region.geojson')
ben = region[region.iso == 'BEN']
assert len(ben) == 1 and len(depts) == 12

BG = '#F7F5EF'; WHITE = '#FFFFFF'; INK = '#183630'; MUTED = '#61746E'
GREEN = '#087A50'; DARK = '#084F3B'; MINT = '#D5EBDC'; SUN = '#F5C84C'
RED = '#D95142'; SEA = '#E2F1F2'; BLUE = '#2A85AA'; LAND = '#E6E7DB'
BORDER = '#A9BDB4'; PALE = '#F0EFE7'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 12,
                     'savefig.facecolor': BG, 'axes.unicode_minus': False})


def txt(fig, x, y, s, size=12, color=INK, weight='normal', ha='left', **kw):
    return fig.text(x, y, s, fontsize=size, color=color, weight=weight, ha=ha,
                    va='center', transform=fig.transFigure, **kw)


def pill(fig, x, y, w, h, face=WHITE, edge='none', rounding=.018):
    patch = FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={rounding}',
                           facecolor=face,edgecolor=edge,linewidth=1,
                           transform=fig.transFigure,zorder=0)
    fig.add_artist(patch)


def frame(number, title, subtitle, lead, fact, source):
    fig = plt.figure(figsize=(9,12), facecolor=BG)
    fig.add_artist(Rectangle((0,.987),1,.013,color=GREEN,transform=fig.transFigure))
    txt(fig,.075,.951,'ATLAS DU BÉNIN',12,GREEN,'bold')
    txt(fig,.925,.951,f'CARTE {number:02d} / 10',11,MUTED,'bold',ha='right')
    txt(fig,.075,.897,title,27,INK,'bold')
    txt(fig,.075,.855,subtitle,11.5,MUTED)
    # Teaching panel, beneath the map.
    pill(fig,.065,.100,.87,.119,WHITE,rounding=.017)
    fig.add_artist(Rectangle((.065,.119),.007,.080,color=SUN,transform=fig.transFigure))
    txt(fig,.095,.190,lead.upper(),10,GREEN,'bold')
    for k,line in enumerate(fact.split('\n')):
        txt(fig,.095,.156-k*.026,line,12.4,INK,weight='bold' if k == 0 else 'normal')
    txt(fig,.067,.068,source,8.3,MUTED)
    txt(fig,.067,.045,'Carte pédagogique simplifiée • vérifiée en septembre 2026 • pas un document de bornage',8.2,MUTED)
    txt(fig,.822,.036,'Dsky',15,DARK,'bold',ha='right')
    # Painted flag icon in place of unsupported emoji fonts: 🇧🇯
    fig.add_artist(Rectangle((.835,.021),.045,.029,color=GREEN,transform=fig.transFigure))
    fig.add_artist(Rectangle((.851,.036),.029,.014,color=SUN,transform=fig.transFigure))
    fig.add_artist(Rectangle((.851,.021),.029,.015,color=RED,transform=fig.transFigure))
    return fig


def mapax(fig, pos=(.075,.265,.85,.555), limits=(-.35,4.65,5.7,12.9)):
    ax = fig.add_axes(pos, facecolor=SEA)
    ax.set_xlim(limits[0], limits[1]); ax.set_ylim(limits[2], limits[3])
    ax.set_aspect('equal',adjustable='box'); ax.set_xticks([]);ax.set_yticks([])
    for sp in ax.spines.values():sp.set_visible(False)
    return ax


def land(ax, data=region, color=LAND, edge=WHITE, lw=.65):
    data.plot(ax=ax,color=color,edgecolor=edge,linewidth=lw,zorder=1)


def outline(ax, color=GREEN, fill=MINT, lw=2.4, gdf=ben):
    gdf.plot(ax=ax,color=fill,edgecolor=color,linewidth=lw,zorder=4)


def point(ax, x,y,label, color=RED, dx=.1,dy=.1, fontsize=11, align='left', marker='o'):
    ax.scatter([x],[y],s=48,c=color,edgecolors=WHITE,linewidths=1.4,zorder=12,marker=marker)
    ax.text(x+dx,y+dy,label,fontsize=fontsize,weight='bold',color=INK,zorder=13,
            ha=align,va='center',bbox=dict(boxstyle='round,pad=.23',fc=WHITE,ec='none',alpha=.94))


def direction(ax, x,y, scale=.22):
    ax.annotate('',xy=(x,y+scale),xytext=(x,y-.03),arrowprops=dict(arrowstyle='-|>',
                fc=DARK,ec=DARK,lw=2,mutation_scale=15),zorder=13)
    ax.text(x,y+scale+.05,'N',ha='center',fontsize=11,color=DARK,weight='bold')


def label(ax,x,y,s,fontsize=13, rotation=0, color=INK, **kwargs):
    ax.text(x,y,s,fontsize=fontsize,weight='bold',color=color,ha='center',va='center',
            rotation=rotation,zorder=11,**kwargs)


def save(fig, name):
    path=OUT/name
    fig.savefig(path,dpi=170,pad_inches=0,facecolor=BG)
    plt.close(fig)
    print(path.name,round(path.stat().st_size/1024),'KiB')

# 01 · WORLD
fig=frame(1,'Le Bénin dans le monde','Une petite place sur la carte du monde, en Afrique de l’Ouest.',
          'Je retiens','Le Bénin se trouve en Afrique, sur la façade atlantique.\nSa capitale est Porto-Novo.',
          'Fond cartographique : Natural Earth 1:110m · capitale : CIA World Factbook')
ax=mapax(fig,(.065,.37,.87,.39),(-180,180,-60,88))
world.plot(ax=ax,color=LAND,edgecolor=WHITE,linewidth=.22,zorder=1)
world[world.iso=='BEN'].plot(ax=ax,color=RED,edgecolor=RED,zorder=3)
ax.scatter([2.3],[9.5],s=120,c=RED,ec=WHITE,lw=2,zorder=5)
ax.annotate('BÉNIN',xy=(2.3,9.5),xytext=(45,43),fontsize=15,weight='bold',color=DARK,
            bbox=dict(boxstyle='round,pad=.5',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',color=RED,lw=2,connectionstyle='arc3,rad=.15'),zorder=10)
label(ax,-87,66,'AMÉRIQUES',12,color=MUTED); label(ax,94,-46,'OCÉAN INDIEN',11,color=BLUE)
label(ax,50,2,'AFRIQUE',15,color=DARK)
# Explicit country silhouette zoom below the overview.
ax2=mapax(fig,(.37,.235,.27,.15),(.45,4.2,5.9,12.6));outline(ax2,lw=2)
fig.text(.64,.284,'ZOOM',fontsize=10,color=GREEN,weight='bold')
save(fig,'01_benin_dans_le_monde.png')

# 02 · AFRICA
fig=frame(2,'Le Bénin en Afrique','Repérer le pays sur son continent.',
          'Je retiens','Le Bénin appartient à l’Afrique de l’Ouest.\nIl se situe au nord du golfe de Guinée.',
          'Fond cartographique : Natural Earth 1:50m · IGN Bénin')
ax=mapax(fig,(.08,.245,.84,.575),(-22,55,-37,39))
land(ax)
outline(ax,color=RED,fill=RED,lw=1.2)
ax.scatter([2.3],[9.5],s=85,c=RED,ec=WHITE,lw=1.8,zorder=7)
ax.annotate('BÉNIN',xy=(2.3,9.5),xytext=(-19,21),fontsize=17,weight='bold',color=DARK,
            bbox=dict(boxstyle='round,pad=.4',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',color=RED,lw=2),zorder=10)
label(ax,33,-30,'OCÉAN INDIEN',12,color=BLUE);label(ax,-13,-27,'ATLANTIQUE',12,color=BLUE)
save(fig,'02_benin_en_afrique.png')

# 03 · WEST AFRICA
fig=frame(3,'Le Bénin en Afrique de l’Ouest','Un pays de la région ouest-africaine.',
          'Je retiens','Le Bénin est entre le Togo et le Nigeria.\nLe golfe de Guinée borde le sud du pays.',
          'Fond cartographique : Natural Earth 1:50m · IGN Bénin')
ax=mapax(fig,(.075,.255,.85,.565),(-19,17,3.8,22))
land(ax);outline(ax,fill=GREEN,lw=1.5)
for x,y,s in [(-5,8.2,'CÔTE D’IVOIRE'),(-1.4,12,'BURKINA FASO'),(9,10,'NIGERIA'),
              (8,18,'NIGER'),(-8,13,'MALI'),(-10,18,'MAURITANIE'),(0.45,7.0,'TOGO'),
              (-1.1,7.6,'GHANA')]:
    label(ax,x,y,s,9.5,color=MUTED)
ax.annotate('BÉNIN',xy=(2.4,9.5),xytext=(6,16),fontsize=16,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.36',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',color=GREEN,lw=2),zorder=10)
label(ax,-4.5,4.8,'GOLFE DE GUINÉE',12,color=BLUE)
save(fig,'03_afrique_de_louest.png')

# 04 · NEIGHBOURS
fig=frame(4,'Quatre pays voisins','Les frontières terrestres du Bénin.',
          'Je retiens','Ouest : Togo · Nord-ouest : Burkina Faso.\nNord : Niger · Est : Nigeria · Sud : Atlantique.',
          'Frontières : Natural Earth 1:50m · directions : IGN Bénin')
ax=mapax(fig,limits=(-2.6,6.6,4.8,14.1))
land(ax);outline(ax,fill=MINT,lw=3.1)
for x,y,s in [(-.15,8.65,'TOGO'),(-.6,12,'BURKINA\nFASO'),(3.25,13.25,'NIGER'),(5.5,9.6,'NIGERIA')]:
    label(ax,x,y,s,13,color=DARK,linespacing=1.5)
label(ax,2.45,9.5,'BÉNIN',17,color=GREEN)
label(ax,2.1,5.08,'OCÉAN ATLANTIQUE',11,color=BLUE)
direction(ax,-2.1,12.6,.42)
save(fig,'04_quatre_pays_voisins.png')

# 05 · CARDINAL DIRECTIONS AND LIMITS
fig=frame(5,'Les limites du Bénin','Lire une carte grâce aux points cardinaux.',
          'Je retiens','Une frontière sépare deux pays sur la terre.\nAu sud, le Bénin s’ouvre sur l’océan Atlantique.',
          'Fond cartographique : Natural Earth 1:50m · IGN Bénin')
ax=mapax(fig,limits=(-1.5,5.9,5.15,13.55))
land(ax);outline(ax,fill=GREEN,lw=2.7)
label(ax,2.32,9.35,'BÉNIN',15,color=WHITE)
for x,y,s in [(-.43,8.4,'TOGO\nOUEST'),(.24,12.15,'BURKINA FASO\nNORD-OUEST'),
              (3.35,12.89,'NIGER\nNORD'),(5,8.7,'NIGERIA\nEST'),(2.05,5.56,'ATLANTIQUE\nSUD')]:
    label(ax,x,y,s,11,color=BLUE if 'ATLANTIQUE' in s else DARK,linespacing=1.6,
          bbox=dict(boxstyle='round,pad=.35',fc=WHITE,ec='none',alpha=.93))
direction(ax,-1.04,12.8,.34)
save(fig,'05_limites_et_points_cardinaux.png')

# 06 · SURFACE AREA
fig=frame(6,'La superficie du Bénin','La superficie mesure l’étendue d’un territoire.',
          'Je retiens','Superficie de référence : 114 763 km² (IGN Bénin).\nLa Banque mondiale publie aussi 114 760 km².',
          'Superficie : IGN Bénin · Banque mondiale, indicateur AG.SRF.TOTL.K2')
ax=mapax(fig,limits=(-.65,8.0,5.8,12.9))
outline(ax,fill=GREEN,lw=2)
ax.text(5.75,10.25,'114 763',fontsize=28,fontweight='bold',color=DARK,ha='center',zorder=12)
ax.text(5.75,9.55,'km²',fontsize=22,fontweight='bold',color=GREEN,ha='center',zorder=12)
ax.text(5.75,8.65,'surface totale',fontsize=12,color=MUTED,ha='center',zorder=12)
ax.text(5.75,7.2,'Du fleuve Niger\nà l’Atlantique',fontsize=13,color=INK,ha='center',linespacing=1.7,zorder=12)
ax.annotate('',xy=(2.45,11.78),xytext=(2.45,6.37),arrowprops=dict(arrowstyle='<->',lw=1.6,color=SUN),zorder=13)
ax.text(2.75,8.93,'NORD → SUD',rotation=90,color=SUN,weight='bold',fontsize=10,zorder=13)
save(fig,'06_superficie_du_benin.png')

# 07 · DEPARTMENTS
fig=frame(7,'Les 12 départements','Le territoire est divisé en 12 départements.',
          'Je retiens','12 départements forment le Bénin.\nIls regroupent 77 communes.',
          'Limites ADM1 : Natural Earth 1:10m · 12 départements / 77 communes : IGN Bénin')
ax=mapax(fig,limits=(.15,4.65,5.95,12.7))
palette=['#D9ECD6','#BCDDBF','#F4DF9D','#B4D8D8','#D4E5BD','#EDCEBA',
         '#F4DEA9','#CAE6DC','#F1D2BF','#D9E7C8','#EAD8B2','#B7DACC']
for i,(_, row) in enumerate(depts.iterrows()):
    gpd.GeoSeries([row.geometry],crs=depts.crs).plot(ax=ax,color=palette[i],edgecolor=WHITE,linewidth=1.9,zorder=4)
ben.plot(ax=ax,color='none',edgecolor=GREEN,linewidth=2.3,zorder=5)
positions={'Alibori':(2.96,11.5),'Atakora':(1.35,10.55),'Borgou':(2.98,9.6),
           'Donga':(1.7,9.18),'Collines':(2.15,8.1),'Zou':(2.12,7.32),
           'Plateau':(2.67,7.05),'Kouffo':(1.77,7.04),'Mono':(1.73,6.54),
           'Atlantique':(2.22,6.67),'Ouémé':(2.57,6.75)}
for name,(x,y) in positions.items():
    label(ax,x,y,name.upper(),8.2,color=DARK,
          bbox=dict(boxstyle='round,pad=.12',fc=WHITE,ec='none',alpha=.7))
ax.annotate('LITTORAL',xy=(2.41,6.365),xytext=(3.25,6.27),fontsize=9,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.17',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1,color=DARK),zorder=12)
save(fig,'07_douze_departements.png')

# 08 · CITIES
fig=frame(8,'Villes et capitale','Deux repères à ne pas confondre.',
          'Je retiens','Porto-Novo est la capitale officielle.\nCotonou est le siège du gouvernement.',
          'Capitales : CIA World Factbook · contours : Natural Earth 1:50m')
ax=mapax(fig,limits=(-.45,5.3,5.8,12.9))
outline(ax,fill=MINT,lw=2.5)
point(ax,2.939,11.134,'Kandi',dx=-.17,dy=.16,align='right')
point(ax,1.380,10.304,'Natitingou',dx=-.12,dy=.17,align='right')
point(ax,2.630,9.337,'Parakou',dx=.16,dy=.14)
point(ax,1.666,9.709,'Djougou',dx=-.10,dy=-.17,align='right')
point(ax,1.991,7.183,'Abomey',dx=-.15,dy=.20,align='right')
ax.scatter([2.604],[6.496],s=140,c=SUN,edgecolors=DARK,linewidths=1.6,marker='*',zorder=15)
ax.annotate('PORTO-NOVO\ncapitale',xy=(2.604,6.496),xytext=(3.35,6.8),fontsize=10.3,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.33',fc=WHITE,ec='none'),arrowprops=dict(arrowstyle='-',color=DARK),zorder=15)
ax.scatter([2.418],[6.365],s=48,c=RED,edgecolors=WHITE,linewidths=1.4,zorder=15)
ax.annotate('COTONOU\ngouvernement',xy=(2.418,6.365),xytext=(3.27,5.97),fontsize=10.3,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.33',fc=WHITE,ec='none'),arrowprops=dict(arrowstyle='-',color=DARK),zorder=15)
save(fig,'08_villes_et_capitale.png')

# 09 · HYDROGRAPHY: ONLY VERIFIED GEOMETRIES ARE TRACED
fig=frame(9,'Fleuves et rivières','Les cours d’eau relient l’intérieur du pays à d’autres bassins.',
          'Je retiens','L’Ouémé coule vers le sud ; le Niger borde le nord.\nLa Pendjari appartient au bassin de la Volta.',
          'Tracés : Natural Earth 1:10m (Ouémé, Niger, Oti/Pendjari) · FAO')
ax=mapax(fig,limits=(-.8,6.2,5.7,12.95))
outline(ax,fill='#F1EEE5',lw=2)
for _,row in lakes.iterrows():
    if pd.isna(row['name']) and row.geometry.centroid.x > 2:
        gpd.GeoSeries([row.geometry],crs=lakes.crs).plot(ax=ax,color=BLUE,edgecolor=BLUE,zorder=8)
for _,row in rivers.iterrows():
    if row['name'] in ('Ouémé','Niger','Oti'):
        # Oti/Pendjari and Niger extend beyond the map country: retain only nearby reaches.
        near_benin = row.geometry.intersection(ben.geometry.iloc[0].buffer(.075))
        if not near_benin.is_empty:
            gpd.GeoSeries([near_benin],crs=rivers.crs).plot(ax=ax,color=BLUE,linewidth=3.1 if row['name']!='Ouémé' else 2.7,zorder=9)
for x,y,s,rot in [(2.3,8.6,'OUÉMÉ',77),(3.32,12.2,'NIGER',-10),(.88,11.0,'PENDJARI¹',-10)]:
    label(ax,x,y,s,11,rotation=rot,color='#095D83',
          bbox=dict(boxstyle='round,pad=.2',fc=WHITE,ec='none',alpha=.91))
ax.text(4.55,10.1,'AUTRES COURS\nD’EAU IMPORTANTS',fontsize=11.5,weight='bold',color=DARK,ha='center')
ax.text(4.55,8.55,'Mono · Couffo\nMékrou · Alibori\nSota · Zou',fontsize=13,color=INK,
        ha='center',va='center',linespacing=1.8)
ax.text(4.55,6.9,'¹ Cours supérieur\nde l’Oti',fontsize=9.8,color=MUTED,ha='center',linespacing=1.4)
save(fig,'09_fleuves_et_rivieres.png')

# 10 · COASTAL WATER / zoom
fig=frame(10,'Lacs et littoral','Zoom sur la côte et les eaux du Sud.',
          'Je retiens','L’Ouémé rejoint la zone du lac Nokoué.\nLe Couffo alimente le lac Ahémé.',
          'Contours et Ouémé : Natural Earth 1:10m · lacs et bassins : FAO')
ax=mapax(fig,limits=(1.05,3.45,5.98,7.7))
land(ax);outline(ax,fill=MINT,lw=2.2)
for _,row in lakes.iterrows():
    if pd.isna(row['name']) and row.geometry.centroid.x > 2:
        gpd.GeoSeries([row.geometry],crs=lakes.crs).plot(ax=ax,color=BLUE,edgecolor=BLUE,zorder=8)
for _,row in rivers[rivers['name']=='Ouémé'].iterrows():
    gpd.GeoSeries([row.geometry],crs=rivers.crs).plot(ax=ax,color=BLUE,linewidth=3.2,zorder=9)
label(ax,2.59,7.15,'OUÉMÉ',12,rotation=75,color='#095D83')
ax.annotate('LAC NOKOUÉ',xy=(2.46,6.43),xytext=(2.96,6.87),fontsize=11,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.25',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1.5,color=BLUE),zorder=12)
# Ahémé omitted from Natural Earth; a dot is a location marker, not an invented lake outline.
ax.scatter([1.975],[6.495],s=65,color=BLUE,edgecolors=WHITE,linewidths=1.3,zorder=12)
ax.annotate('LAC AHÉMÉ\n(repère)',xy=(1.975,6.495),xytext=(1.18,6.78),fontsize=10,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.25',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1.5,color=BLUE),zorder=12)
ax.scatter([2.418],[6.365],s=42,color=RED,edgecolors=WHITE,zorder=13)
ax.annotate('Cotonou',xy=(2.418,6.365),xytext=(2.76,6.18),fontsize=10,color=DARK,weight='bold',
            bbox=dict(boxstyle='round,pad=.2',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1,color=DARK),zorder=13)
label(ax,2.17,6.06,'GOLFE DE GUINÉE  ·  OCÉAN ATLANTIQUE',9.5,color=BLUE)
save(fig,'10_lacs_et_littoral.png')

# Lightweight single-sheet preview; originals remain 1530 × 2040 px.
files=sorted(OUT.glob('*.png'))
thumbs=[]
for path in files:
    im=Image.open(path).convert('RGB')
    im.thumbnail((360,480))
    thumbs.append(im)
canvas=Image.new('RGB',(360*5+24*6,480*2+24*3),(230,236,230))
for i,im in enumerate(thumbs):
    x=24+(i%5)*384;y=24+(i//5)*504
    canvas.paste(im,(x,y))
canvas.save(ROOT/'apercu_des_10_cartes.jpg',quality=88,optimize=True)
print('Aperçu créé.')
