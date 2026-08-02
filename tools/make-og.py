#!/usr/bin/env python3
# Génère assets/img/og-image.jpg — aperçu de partage 1200x630 (WhatsApp, X, LinkedIn)
from PIL import Image, ImageDraw, ImageFont, ImageFilter

S = 2                      # supersampling
W, H = 1200 * S, 630 * S
INK, PAPER = '#0B0B0A', '#FAFAF8'
RED = '#C2452F'            # rouge sceau légèrement éclairci pour fond sombre
G1, G2 = '#8F8C85', '#33322F'
GREEN = '#3DBE8B'

FD = '/home/user/crispcv/tools/fonts'
def f(name, size): return ImageFont.truetype(f'{FD}/{name}.ttf', size * S)

img = Image.new('RGB', (W, H), INK)
d = ImageDraw.Draw(img)

# --- grille pointillée subtile ---
for x in range(0, W, 40 * S):
    for y in range(0, H, 40 * S):
        d.ellipse([x - S, y - S, x + S, y + S], fill='#191918')

# halo rouge très doux en haut à droite
halo = Image.new('RGB', (W, H), INK)
hd = ImageDraw.Draw(halo)
hd.ellipse([W - 520 * S, -300 * S, W + 200 * S, 220 * S], fill='#2A1410')
halo = halo.filter(ImageFilter.GaussianBlur(120 * S))
img = Image.blend(img, halo, 0.55)
d = ImageDraw.Draw(img)

# --- logo + wordmark ---
def logo(d, x, y, s):
    # s = taille (la page dog-eared + coche)
    d.rounded_rectangle([x, y, x + s * .86 + s * .14 * 0, y + s], radius=s * .09, fill='#141413', outline='#3C3B38', width=int(2 * S))
    # on dessine la page en chemin simple : rect + coin plié
    w = s
    d.polygon([(x, y), (x + w * .62, y), (x + w, y + w * .30), (x + w, y + w), (x, y + w)], fill='#FAFAF8')
    fold = [(x + w * .62, y), (x + w, y + w * .30), (x + w * .62, y + w * .30)]
    d.polygon(fold, fill=RED)
    # coche
    lw = max(2, int(w * .09))
    d.line([(x + w * .20, y + w * .58), (x + w * .40, y + w * .76), (x + w * .82, y + w * .30)],
           fill='#101010', width=lw, joint='curve')

lx, ly, ls = 70 * S, 58 * S, 46 * S
logo(d, lx, ly, ls)
d.text((lx + ls + 16 * S, ly + 4 * S), 'CrispCV', font=f('grotesk700', 40), fill='#F5F4F1')

# --- kicker ---
d.text((70 * S, 165 * S), 'GRATUIT  ·  SANS COMPTE  ·  100 % LOCAL', font=f('mono400', 23), fill=RED)
d.line([(70 * S, 152 * S), (110 * S, 152 * S)], fill=RED, width=3 * S)

# --- headline ---
hl = f('grotesk700', 92)
d.text((66 * S, 200 * S), 'Un CV net.', font=hl, fill='#F5F4F1')
d.text((66 * S, 315 * S), 'Le bon format.', font=hl, fill='#F5F4F1')
# soulignement rouge sous « net. »
tw = d.textlength('Un CV net.', font=hl)
tw2 = d.textlength('Un CV ', font=hl)
d.line([(66 * S + tw2, 200 * S + 100 * S), (66 * S + tw, 200 * S + 100 * S)], fill=RED, width=6 * S)

# --- sous-titre ---
sub = f('inter400', 28)
d.text((70 * S, 470 * S), 'Créateur de CV et convertisseur de fichiers —', font=sub, fill='#C9C6BE')
d.text((70 * S, 512 * S), 'vos documents ne quittent jamais votre appareil.', font=sub, fill='#C9C6BE')

def vcheck(d, x, y, s, color, w=None):
    w = w or max(2, int(s * .18))
    d.line([(x, y + s * .55), (x + s * .35, y + s), (x + s, y)], fill=color, width=w, joint='curve')

def narrow(d, x, y, s, color):
    d.line([(x, y), (x + s * .8, y)], fill=color, width=max(2, int(s * .14)))
    d.polygon([(x + s * .8, y), (x + s * .45, y - s * .22), (x + s * .45, y + s * .22)], fill=color)

# --- chips confiance ---
def chip(d, x, y, txt):
    t = f('mono400', 20)
    w = d.textlength(txt, font=t) + 56 * S
    h = 44 * S
    d.rounded_rectangle([x, y, x + w, y + h], radius=h // 2, outline='#3C3B38', width=2 * S, fill='#121211')
    vcheck(d, x + 18 * S, y + h / 2 - 7 * S, 14 * S, GREEN)
    d.text((x + 40 * S, y + h / 2 - 13 * S), txt, font=t, fill='#E8E6E1')
    return x + w

cx = 70 * S
for t_ in ['Aucune inscription', 'Aucun filigrane', 'Données 100 % locales']:
    cx = chip(d, cx, 565 * S, t_) + 14 * S

# ============  CARTE CV A4 à droite  ============
def cv_card():
    cw, ch = 300 * S, 424 * S
    card = Image.new('RGBA', (cw + 80 * S, ch + 80 * S), (0, 0, 0, 0))
    cd = ImageDraw.Draw(card)
    x0, y0 = 40 * S, 40 * S
    # ombre
    sh = Image.new('RGBA', card.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).polygon([(x0, y0), (x0 + cw * .63, y0), (x0 + cw, y0 + cw * .25),
                                 (x0 + cw, y0 + ch), (x0, y0 + ch)], fill=(0, 0, 0, 160))
    sh = sh.filter(ImageFilter.GaussianBlur(18 * S))
    card.paste(sh, (10 * S, 16 * S), sh)
    # page + coin plié
    cd.polygon([(x0, y0), (x0 + cw * .63, y0), (x0 + cw, y0 + cw * .25),
                (x0 + cw, y0 + ch), (x0, y0 + ch)], fill='#FAFAF8')
    cd.polygon([(x0 + cw * .63, y0), (x0 + cw, y0 + cw * .25), (x0 + cw * .63, y0 + cw * .25)], fill=RED)
    # bandeau tête
    cd.rectangle([x0, y0 + ch - ch, x0 + cw, y0 + 78 * S], fill='#111110')  # bandeau haut
    cd.polygon([(x0 + cw * .63, y0), (x0 + cw, y0 + cw * .25), (x0 + cw * .63, y0 + cw * .25)], fill=RED)
    # photo
    cd.ellipse([x0 + 22 * S, y0 + 18 * S, x0 + 66 * S, y0 + 62 * S], fill='#3A3936')
    cd.ellipse([x0 + 34 * S, y0 + 26 * S, x0 + 54 * S, y0 + 46 * S], fill='#6E6C66')
    # nom + titre
    cd.rectangle([x0 + 80 * S, y0 + 22 * S, x0 + 210 * S, y0 + 36 * S], fill='#EDEDEA')
    cd.rectangle([x0 + 80 * S, y0 + 46 * S, x0 + 170 * S, y0 + 56 * S], fill='#8F8C85')
    # ligne accent
    cd.rectangle([x0, y0 + 78 * S, x0 + cw, y0 + 86 * S], fill=RED)
    # lignes de contenu
    yy = y0 + 110 * S
    for sec in range(3):
        cd.rectangle([x0 + 22 * S, yy, x0 + 120 * S, yy + 10 * S], fill='#232220')
        yy += 22 * S
        for ln in range(3):
            wln = cw - 44 * S - (ln * 26 * S) - sec * 10 * S
            cd.rectangle([x0 + 22 * S, yy, x0 + 22 * S + wln, yy + 7 * S], fill='#C9C6BE')
            yy += 16 * S
        yy += 14 * S
    # coche verte bas
    cd.ellipse([x0 + cw - 54 * S, y0 + ch - 54 * S, x0 + cw - 18 * S, y0 + ch - 18 * S], fill=GREEN)
    cd.line([(x0 + cw - 46 * S, y0 + ch - 36 * S), (x0 + cw - 39 * S, y0 + ch - 29 * S),
             (x0 + cw - 26 * S, y0 + ch - 44 * S)], fill='#0B0B0A', width=5 * S, joint='curve')
    return card

card = cv_card().rotate(-6, resample=Image.BICUBIC, expand=True)
img.paste(card, (int(820 * S), int(105 * S)), card)

# mini-carte convert derrière (profondeur)
mini = Image.new('RGBA', (170 * S, 120 * S), (0, 0, 0, 0))
md = ImageDraw.Draw(mini)
md.rounded_rectangle([0, 0, 170 * S, 120 * S], radius=16 * S, fill='#161615', outline='#3C3B38', width=2 * S)
mt = f('mono400', 19)
md.text((18 * S, 26 * S), 'HEIC', font=mt, fill='#E8E6E1')
narrow(md, 18 * S + md.textlength('HEIC', font=mt) + 10 * S, 39 * S, 26 * S, RED)
md.text((18 * S + md.textlength('HEIC', font=mt) + 48 * S, 26 * S), 'JPG', font=mt, fill='#E8E6E1')
md.text((18 * S, 66 * S), 'PDF', font=mt, fill='#8F8C85')
narrow(md, 18 * S + md.textlength('PDF', font=mt) + 10 * S, 79 * S, 26 * S, '#55534E')
md.text((18 * S + md.textlength('PDF', font=mt) + 48 * S, 66 * S), 'DOCX', font=mt, fill='#8F8C85')
mini = mini.rotate(7, resample=Image.BICUBIC, expand=True)
img.paste(mini, (int(755 * S), int(430 * S)), mini)

d = ImageDraw.Draw(img)
d.text((930 * S, 588 * S), 'crispcvpro.vercel.app', font=f('mono400', 20), fill='#8F8C85')

img = img.resize((1200, 630), Image.LANCZOS)
img.save('/home/user/crispcv/assets/img/og-image.jpg', quality=88, optimize=True, progressive=True)
print('ok')
