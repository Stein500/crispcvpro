#!/usr/bin/env python3
"""Icônes PWA any/maskable + screenshots (rich install UI) pour CrispCV."""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
IMG = os.path.abspath(os.path.join(ROOT, 'assets/img'))
FONTS = os.path.abspath(os.path.join(ROOT, 'tools/fonts'))
INK = (10, 10, 10); PAPER2 = (250, 250, 248); ACCENT = (178, 58, 46)
G1 = (107, 107, 107); G3 = (229, 229, 229); WHITE = (255, 255, 255)

def font(name, size):
    try: return ImageFont.truetype(os.path.join(FONTS, name), size)
    except Exception: return ImageFont.load_default()

def draw_logo(size):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = S / 64.0
    d.polygon([(13*u,4*u),(41*u,4*u),(55*u,18*u),(55*u,60*u),(13*u,60*u)], fill=INK)
    d.polygon([(41*u,4*u),(55*u,18*u),(41*u,18*u)], fill=ACCENT)
    d.line([(21*u,33.5*u),(28*u,40.5*u),(44*u,24.5*u)], fill=WHITE, width=int(5.9*u), joint='curve')
    return im.resize((size, size), Image.LANCZOS)

# any : icône seule sur fond papier plein (coins francs, Android découpe)
for s in (192, 512):
    im = Image.new('RGB', (s, s), PAPER2)
    ic = draw_logo(s)
    im.paste(ic, (0, 0), ic)
    im.save(os.path.join(IMG, f'icon-{s}.png'))
    # maskable : zone de sécurité 72 % centré
    icon = draw_logo(int(s * 0.72))
    im2 = Image.new('RGB', (s, s), PAPER2)
    im2.paste(icon, ((s - icon.width)//2, (s - icon.height)//2), icon)
    im2.save(os.path.join(IMG, f'icon-{s}-maskable.png'))
print('icons any/maskable ok')

# ---------- screenshots ----------
def cv_card(x, y, w, h, accent=ACCENT):
    """Petit CV stylisé : en-tête + lignes, colonnes."""
    d = ImageDraw.Draw(S)
    d.rectangle([x, y, x+w, y+h], fill=WHITE, outline=G3, width=2)
    d.rectangle([x+18, y+20, x+int(w*0.45), y+36], fill=INK)
    d.rectangle([x+18, y+44, x+int(w*0.28), y+54], fill=accent)
    yy = y + 70
    for r, frac in [(WHITE, 0.8), (WHITE, 0.55), (WHITE, 0.9), (WHITE, 0.4)]:
        d.rectangle([x+18, yy, x+int(w*frac), yy+9], fill=G3); yy += 20
    d.line([x+18, yy+6, x+w-18, yy+6], fill=G3, width=1)
    yy += 20
    for frac in (0.85, 0.7, 0.6):
        d.rectangle([x+18, yy, x+int(w*frac), yy+8], fill=(245,245,243)); yy += 17

# wide 1280×720 (accueil)
S = Image.new('RGB', (1280, 720), PAPER2)
d = ImageDraw.Draw(S)
d.rectangle([0, 0, 1280, 64], fill=WHITE)
d.line([0, 64, 1280, 64], fill=G3)
lg = draw_logo(38); S.paste(lg, (32, 13), lg)
d.text((82, 18), 'Crisp', font=font('grotesk700.ttf', 26), fill=INK)
d.text((82 + d.textlength('Crisp', font=font('grotesk700.ttf', 26)), 18), 'CV',
       font=font('grotesk500.ttf', 26), fill=G1)
for i, t in enumerate(['Créer mon CV', 'Convertisseur', 'Guides']):
    d.text((720 + i*130, 24), t, font=font('inter400.ttf', 16), fill=G1)
d.text((60, 130), 'Un CV net.', font=font('grotesk700.ttf', 60), fill=INK)
d.text((60, 200), 'Le bon format.', font=font('grotesk700.ttf', 60), fill=INK)
d.text((60, 270), 'Les bonnes adresses.', font=font('grotesk700.ttf', 60), fill=G1)
d.text((62, 365), 'Gratuit, sans compte, sans filigrane — vos documents', font=font('inter400.ttf', 22), fill=G1)
d.text((62, 395), 'ne quittent jamais votre appareil.', font=font('inter400.ttf', 22), fill=G1)
d.rounded_rectangle([62, 445, 262, 497], radius=6, fill=ACCENT)
d.text((100, 459), 'Créer mon CV', font=font('inter400.ttf', 20), fill=WHITE)
d.rounded_rectangle([278, 445, 488, 497], radius=6, outline=INK, width=2)
d.text((306, 459), 'Convertir un fichier', font=font('inter400.ttf', 20), fill=INK)
cv_card(760, 130, 400, 460)
d.rectangle([0, 672, 260, 720], fill=ACCENT); d.rectangle([260, 672, 1280, 720], fill=INK)
d.text((62, 690), 'crispcv.app', font=font('mono400.ttf', 20), fill=WHITE)
S.save(os.path.join(IMG, 'screenshot-wide.png'), optimize=True)

# narrow 720×1280 (éditeur)
S = Image.new('RGB', (720, 1280), PAPER2)
d = ImageDraw.Draw(S)
d.rectangle([0, 0, 720, 56], fill=WHITE); d.line([0, 56, 720, 56], fill=G3)
lg = draw_logo(32); S.paste(lg, (20, 12), lg)
d.text((62, 15), 'CrispCV Studio', font=font('grotesk700.ttf', 22), fill=INK)
d.rounded_rectangle([520, 12, 696, 44], radius=5, fill=ACCENT)
d.text((560, 19), 'Exporter', font=font('inter400.ttf', 16), fill=WHITE)
cv_card(40, 90, 640, 560)
yy = 700
for t, w in [('Coordonnées', 0.5), ('Accroche', 0.42), ('Expérience', 0.46), ('Compétences', 0.44)]:
    d.rounded_rectangle([40, yy, 680, yy+64], radius=6, fill=WHITE, outline=G3)
    d.text((64, yy+20), t, font=font('grotesk700.ttf' if t else 'inter400.ttf', 18), fill=INK)
    d.ellipse([636, yy+24, 660, yy+48], outline=ACCENT, width=2)
    yy += 80
d.rectangle([0, 1232, 180, 1280], fill=ACCENT); d.rectangle([180, 1232, 720, 1280], fill=INK)
S.save(os.path.join(IMG, 'screenshot-narrow.png'), optimize=True)
print('screenshots ok')
