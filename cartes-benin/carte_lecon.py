#!/usr/bin/env python3
"""Carte A4 de la leçon « Le Bénin en Afrique » (CM2).

Géométries : Natural Earth extraites dans ./data. Faits : IGN, gouv.bj,
Banque mondiale. Les sources complètes sont dans ./lecon/NOTES_DE_VERIFICATION.md.
Exécution : .venv/bin/python cartes-benin/carte_lecon.py
"""
from pathlib import Path
import geopandas as gpd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch
from matplotlib import patheffects
from shapely.geometry import shape

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'lecon'
OUT.mkdir(exist_ok=True)
world=gpd.read_file(ROOT/'data/countries_world.geojson')
region=gpd.read_file(ROOT/'data/countries_region.geojson')
depts=gpd.read_file(ROOT/'data/benin_departments.geojson')
rivers=gpd.read_file(ROOT/'data/rivers_region.geojson')
assert len(depts)==12 and set(depts.name)=={'Alibori','Atakora','Atlantique','Borgou','Collines','Donga','Kouffo','Littoral','Mono','Ouémé','Plateau','Zou'}

INK='#183932'; GREEN='#08774D'; GREEN2='#0A6544'; TURQUOISE='#32829D'; SKY='#E6F4F4'
MUTED='#677970'; BG='#F7F5EE'; WHITE='#FFFFFF'; GOLD='#F7C852'; RED='#DC594A'
plt.rcParams.update({'font.family':'DejaVu Sans','savefig.facecolor':BG,'axes.unicode_minus':False})
fig=plt.figure(figsize=(8.27,11.69),facecolor=BG)

def text(x,y,s,sz=10,weight='normal',color=INK,ha='left',**kwargs):
    return fig.text(x,y,s,fontsize=sz,weight=weight,color=color,ha=ha,
                    va='center',transform=fig.transFigure,**kwargs)

def box(x,y,w,h,fc=WHITE,rad=.013,ec='none'):
    p=FancyBboxPatch((x,y),w,h,boxstyle=f'round,pad=0,rounding_size={rad}',
        facecolor=fc,edgecolor=ec,linewidth=1,transform=fig.transFigure,zorder=0)
    fig.add_artist(p)

# Header
fig.add_artist(Rectangle((0,.984),1,.016,color=GREEN,transform=fig.transFigure))
text(.054,.960,'GÉOGRAPHIE  /  CM2',11,'bold',GREEN)
text(.944,.960,'FICHE 01  •  BÉNIN',9.5,'bold',MUTED,ha='right')
text(.054,.917,'LE BÉNIN EN AFRIQUE',26,'bold')
text(.055,.882,'Situer le pays, lire ses limites et reconnaître ses 12 départements.',10.8,color=MUTED)
fig.add_artist(Rectangle((.055,.850),.89,.005,color=GOLD,transform=fig.transFigure))

# MAIN MAP (country contours, departments, international context)
ax=fig.add_axes([.073,.271,.616,.560],facecolor=SKY)
ax.set_xlim(-.78,4.85); ax.set_ylim(5.48,13.32); ax.set_aspect('equal',adjustable='box')
ax.set_axisbelow(True)
ax.set_xticks([0,1,2,3,4]); ax.set_yticks([6,8,10,12])
ax.set_xticklabels(['0°','1° E','2° E','3° E','4° E'],fontsize=6.8,color=MUTED)
ax.set_yticklabels(['6° N','8° N','10° N','12° N'],fontsize=6.8,color=MUTED)
ax.tick_params(axis='both',length=0,pad=4)
for spine in ax.spines.values():spine.set_visible(False)
ax.grid(lw=.55,ls=(0,(3,4)),color='#B9D4CE',alpha=.7,zorder=.2)
region.plot(ax=ax,color='#E7E7D9',edgecolor=WHITE,linewidth=.7,zorder=1)
# Muted alternating department fills. Coast and country edge match the department layer.
colors=['#CEE9D3','#DCEBCD','#F2E3B5','#BEDFD7','#E8DCBC','#D4E8D7',
        '#F4DDC3','#C7DECE','#EBD6B9','#D8E9CF','#F0DEBA','#BBDCCF']
for i,(_,r) in enumerate(depts.iterrows()):
    gpd.GeoSeries([r.geometry],crs=depts.crs).plot(ax=ax,color=colors[i],
        edgecolor=WHITE,linewidth=1.6,zorder=4)
country=depts.geometry.union_all()
gpd.GeoSeries([country],crs=depts.crs).plot(ax=ax,facecolor='none',edgecolor=GREEN,
    linewidth=2.45,zorder=5)
# Real mapped Niger River, restricted to a buffer around the border; not an invented line.
for _,r in rivers[rivers.name=='Niger'].iterrows():
    line=r.geometry.intersection(country.buffer(.065))
    if not line.is_empty:
        gpd.GeoSeries([line],crs=rivers.crs).plot(ax=ax,color=TURQUOISE,lw=3,zorder=7)
# Neighbours, drawn with separate names from the river.
for x,y,s in [(-.37,8.45,'TOGO'),(.47,12.15,'BURKINA\nFASO'),(3.52,12.90,'NIGER'),(4.40,9.40,'NIGERIA')]:
    ax.text(x,y,s,fontsize=9.1,color=INK,weight='bold',ha='center',va='center',
        linespacing=1.3,zorder=11)
ax.text(1.86,5.69,'GOLFE DE GUINÉE  ·  OCÉAN ATLANTIQUE',fontsize=8.2,color=TURQUOISE,
        weight='bold',ha='center',va='center',zorder=11)
# All 12 administrative names; southern miniature departments also get a leader.
coords={'Alibori':(2.90,11.38),'Atakora':(1.45,10.47),'Borgou':(2.91,9.68),
        'Donga':(1.72,9.19),'Collines':(2.16,8.13),'Zou':(2.10,7.29),
        'Couffo':(1.76,7.06),'Plateau':(2.63,7.26), 'Mono':(1.75,6.55)}
for name,(x,y) in coords.items():
    ax.text(x,y,name.upper(),fontsize=7.2 if y<7.4 else 8,weight='bold',
        color=INK,ha='center',va='center',zorder=10,
        bbox={'boxstyle':'round,pad=.16','facecolor':WHITE,'edgecolor':'none','alpha':.83})
# In the dense south, leader lines prevent labels from obscuring tiny departments.
for nm,point,target in [
    ('ATLANTIQUE',(2.20,6.63),(.40,6.82)),
    ('OUÉMÉ',(2.55,6.72),(4.05,7.30)),
    ('LITTORAL',(2.421,6.367),(3.72,6.58))]:
    ax.annotate(nm,xy=point,xytext=target,fontsize=7.5,color=INK,weight='bold',
        bbox=dict(boxstyle='round,pad=.17',fc=WHITE,ec='none'),
        arrowprops=dict(arrowstyle='-',lw=1,color=INK),zorder=12)
# Country capital and seat of government have distinct map symbols.
ax.scatter([2.6036],[6.4965],marker='*',s=190,facecolor=GOLD,edgecolor=INK,lw=1.1,zorder=14)
ax.scatter([2.4183],[6.3654],marker='o',s=50,facecolor=RED,edgecolor=WHITE,lw=1,zorder=14)
ax.annotate('PORTO-NOVO',xy=(2.6036,6.4965),xytext=(3.55,6.98),fontsize=7.7,
            color=GREEN2,weight='bold',bbox=dict(boxstyle='round,pad=.22',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1,color=GREEN2),zorder=15)
ax.annotate('COTONOU',xy=(2.4183,6.3654),xytext=(3.72,6.11),fontsize=7.7,
            color=INK,weight='bold',bbox=dict(boxstyle='round,pad=.22',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1,color=INK),zorder=15)
ax.annotate('FLEUVE NIGER',xy=(3.35,12.05),xytext=(3.95,11.92),fontsize=7.3,
            color='#146582',weight='bold',ha='center',
            bbox=dict(boxstyle='round,pad=.22',fc=WHITE,ec='none'),
            arrowprops=dict(arrowstyle='-',lw=1,color=TURQUOISE),zorder=15)
# North arrow
ax.annotate('',xy=(-.60,12.91),xytext=(-.60,12.51),
            arrowprops=dict(arrowstyle='-|>',lw=2,color=GREEN2,mutation_scale=13),zorder=11)
ax.text(-.60,12.99,'N',fontsize=9,weight='bold',color=GREEN2,ha='center')

# RIGHT COLUMN / AFRICA INSET
box(.719,.652,.226,.177)
text(.738,.809,'OÙ EST LE BÉNIN ?',9.3,'bold',GREEN)
mini=fig.add_axes([.743,.668,.172,.130],facecolor=SKY)
world.plot(ax=mini,color='#DEE2D8',edgecolor=WHITE,linewidth=.22,zorder=1)
mini.scatter([2.35],[9.49],color=RED,s=45,edgecolor=WHITE,lw=1.4,zorder=7)
mini.set_xlim(-23,55);mini.set_ylim(-37,39);mini.set_xticks([]);mini.set_yticks([])
for sp in mini.spines.values():sp.set_visible(False)
text(.832,.653,'AFRIQUE DE L’OUEST',7.7,'bold',GREEN2,ha='center')

# RIGHT COLUMN / LEGEND
box(.719,.466,.226,.170)
text(.738,.610,'LIRE LA CARTE',9.2,'bold',GREEN)
fig.add_artist(Rectangle((.737,.572),.018,.014,facecolor='#CEE9D3',edgecolor=GREEN,
                         transform=fig.transFigure))
text(.764,.579,'Départements',8)
fig.add_artist(Rectangle((.737,.544),.018,.014,facecolor=TURQUOISE,
                         transform=fig.transFigure))
text(.764,.551,'Fleuve Niger',8)
text(.738,.518,'★  Porto-Novo : capitale',8.2,'bold',GREEN2)
text(.738,.490,'●  Cotonou : gouvernement',7.9,color=INK)

# RIGHT COLUMN / PRECISION ABOUT BORDER TYPES
box(.719,.269,.226,.181,fc='#F4EECF')
text(.738,.427,'ATTENTION AUX LIMITES',8.7,'bold',GREEN2)
for i,s in enumerate(['Le Niger suit une partie','de la frontière nord.','Le Mono suit un tronçon','de la frontière ouest.','Toutes les limites ne sont','pas uniquement naturelles.']):
    text(.738,.399-i*.0214,s,7.9,weight='bold' if i in (0,2) else 'normal')

# BOTTOM RECAP: three data blocks, one double place block, and teaching note.
box(.052,.087,.896,.163)
text(.075,.230,'À RETENIR  •  REPÈRES CHIFFRÉS ET ADMINISTRATIFS',9.6,'bold',GREEN)
for i,(x,label,value,detail) in enumerate([
        (.075,'SUPERFICIE','114 763 km²','IGN Bénin'),
        (.367,'POPULATION','14,81 millions','Banque mondiale, 2025'),
        (.668,'DENSITÉ','≈ 129 hab./km²','calcul pour 2025')]):
    text(x,.197,label,8.2,'bold',MUTED)
    text(x,.174,value,16 if i<2 else 13.8,'bold',GREEN2)
    text(x,.151,detail,7.3,color=MUTED)
fig.add_artist(Rectangle((.071,.133),.857,.0013,color='#DCE6DD',transform=fig.transFigure))
text(.076,.115,'12 départements  •  77 communes  •  Porto-Novo, capitale  •  Cotonou, siège du gouvernement',8.3,'bold')
text(.056,.065,'Densité indicative : 14 814 460 habitants ÷ 114 763 km². Les chiffres de population du tableau sont anciens.',7.9,color=MUTED)
text(.056,.047,'Sources : IGN Bénin, gouvernement du Bénin, Banque mondiale ; fonds Natural Earth (détails dans les notes).',7.5,color=MUTED)
text(.056,.028,'Carte pédagogique générale, non utilisable pour le bornage.  •  28 septembre 2026',7.4,color=MUTED)
text(.863,.027,'Dsky',13,'bold',GREEN2,ha='right')
fig.add_artist(Rectangle((.871,.015),.054,.027,color=GREEN,transform=fig.transFigure))
fig.add_artist(Rectangle((.889,.0285),.036,.0135,color=GOLD,transform=fig.transFigure))
fig.add_artist(Rectangle((.889,.015),.036,.0135,color=RED,transform=fig.transFigure))

png=OUT/'le_benin_en_afrique_lecon_CM2_Dsky.png'
pdf=OUT/'le_benin_en_afrique_lecon_CM2_Dsky.pdf'
fig.savefig(png,dpi=300,facecolor=BG,pad_inches=0)
fig.savefig(pdf,facecolor=BG,pad_inches=0)
plt.close(fig)
print(png, pdf)
