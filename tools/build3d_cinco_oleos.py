# Uso: python tools/build3d_cinco_oleos.py <pasta do zip caixa-dourada-15-recortes extraido>
# Gera as fotos da vitrine do kit 5 Óleos Essenciais (Aromas do Jardim) em public/kits. Precisa do Pillow.
import os, sys
from PIL import Image

Z = os.path.join(sys.argv[1], 'caixa-dourada')
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')

def cut(name):
    im = Image.open(os.path.join(Z, f'{name}-v1.png')).convert('RGBA')
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox())

def save(im, path, max_side, alpha=True):
    s = min(1, max_side / max(im.size))
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    if not alpha: im = im.convert('RGB')
    im.save(path, 'WEBP', quality=80, method=6)
    print(os.path.relpath(path, ROOT), im.size, os.path.getsize(path) // 1024, 'KB')

# a caixa 3D é modelada em kit3d.js (makeLidBox); o relevo dourado sai de tools/gold_weave.py

# vitrine: caixa fechada e caixa aberta com os 5 frascos
save(cut('01-caixa'), os.path.join(ROOT, 'kits', 'cinco-oleos-frente.webp'), 800)
save(cut('14-kit-frascos'), os.path.join(ROOT, 'kits', 'cinco-oleos-aberta.webp'), 900)
