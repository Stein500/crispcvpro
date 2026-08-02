#!/usr/bin/env python3
"""Génère les assets raster CrispCV : favicons, icônes PWA/maskables, apple-touch-icon, og-image."""
import io, os, urllib.request
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), '..')
IMG = os.path.abspath(os.path.join(ROOT, 'assets/img'))
FONTS = os.path.abspath(os.path.join(ROOT, 'tools/fonts'))
os.makedirs(IMG, exist_ok=True)
os.makedirs(FONTS, exist_ok=True)

INK = (10, 10, 10); PAPER2 = (250, 250, 248); ACCENT = (178, 58, 46); G1 = (107, 107, 107); WHITE = (255, 255, 255)

FONT_URLS = {
    'grotesk700.ttf': 'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.ttf',
    'grotesk500.ttf': 'https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-500-normal.ttf',
    'inter400.ttf': 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
    'mono400.ttf': 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf',
}
for name, url in FONT_URLS.items():
    p = os.path.join(FONTS, name)
    if not os.path.exists(p):
        try:
            urllib.request.urlretrieve(url, p)
            print('font ok:', name)
        except Exception as e:
            print('font KO:', name, e)

def font(name, size):
    try:
        return ImageFont.truetype(os.path.join(FONTS, name), size)
    except Exception:
        return ImageFont.load_default()

def draw_logo(size, bg=None, supersample=4):
    """Dessine le monogramme page-cornée + coche. size = px finaux (fond transparent si bg=None)."""
    S = size * supersample
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    u = S / 64.0  # unité viewBox
    P = [(x * u, y * u) for x, y in [(13, 4), (41, 4), (55, 18), (55, 60), (13, 60)]]
    d.polygon(P, fill=INK)
    F = [(x * u, y * u) for x, y in [(41, 4), (55, 18), (41, 18)]]
    d.polygon(F, fill=ACCENT)
    d.line([(21 * u, 33.5 * u), (28 * u, 40.5 * u), (44 * u, 24.5 * u)],
           fill=WHITE, width=int(5.9 * u), joint='curve')
    im = im.resize((size, size), Image.LANCZOS)
    if bg is not None:
        base = Image.new('RGBA', (size, size), bg + (255,))
        base.alpha_composite(im)
        return base.convert('RGB')
    return im

def maskable(size):
    """Zone de sécurité 80 % pour icônes maskables, fond plein."""
    im = Image.new('RGB', (size, size), PAPER2)
    icon = draw_logo(int(size * 0.78))
    im.paste(icon, ((size - icon.width) // 2, (size - icon.height) // 2), icon)
    return im

# icônes
maskable(192).save(os.path.join(IMG, 'icon-192.png'))
maskable(512).save(os.path.join(IMG, 'icon-512.png'))
apple = Image.new('RGB', (180, 180), WHITE)
ic = draw_logo(150)
apple.paste(ic, (15, 15), ic)
apple.save(os.path.join(IMG, 'apple-touch-icon.png'))
draw_logo(48, bg=(255, 255, 255)).save(os.path.join(IMG, 'favicon.ico'),
                                        sizes=[(16, 16), (32, 32), (48, 48)])
print('icons ok')

# og-image 1200×630
W, H = 1200, 630
og = Image.new('RGB', (W, H), PAPER2)
d = ImageDraw.Draw(og)
logo = draw_logo(200)
og.paste(logo, (90, 205), logo)
g700 = font('grotesk700.ttf', 92); g500 = font('grotesk500.ttf', 92)
inter = font('inter400.ttf', 33); inter_s = font('inter400.ttf', 24); mono = font('mono400.ttf', 21)
x = 340
d.text((x, 210), 'Crisp', font=g700, fill=INK)
w_crisp = d.textlength('Crisp', font=g700)
d.text((x + w_crisp, 210), 'CV', font=g500, fill=G1)
d.text((x, 330), 'Un CV net. Le bon format. Les bonnes adresses.', font=inter, fill=G1)
pills = ['STUDIO', 'CONVERT', 'RESSOURCES']
px = x
for label in pills:
    w = d.textlength(label, font=mono)
    d.rounded_rectangle([px, 400, px + w + 40, 446], radius=4, outline=(176, 176, 176), width=2)
    d.text((px + 20, 411), label, font=mono, fill=INK)
    px += w + 40 + 18
d.text((x, 500), 'Gratuit · Sans compte · 100 % local', font=inter_s, fill=ACCENT)
d.rectangle([0, H - 28, 300, H], fill=ACCENT)
d.rectangle([300, H - 28, W, H], fill=INK)
og.save(os.path.join(IMG, 'og-image.png'), optimize=True)
print('og-image ok')
