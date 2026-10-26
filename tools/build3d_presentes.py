# Uso: python tools/build3d_presentes.py <pasta do zip recortes-3d-velas-e-caixas extraido>
# Gera as faces 3D das caixas douradas (Presente Variado e Óleo de Uva) em public/kit3d
# e as fotos da vitrine (caixas e as duas velas) em public/kits. Precisa do Pillow.
import os, sys
from PIL import Image

Z = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')

def cut(group, n, inset=(0, 0, 0, 0)):
    im = Image.open(os.path.join(Z, group, f'{n}-vista.png')).convert('RGBA')
    x0, y0, x1, y1 = im.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox()
    l, t, r, b = inset
    return im.crop((x0 + l, y0 + t, x1 - r, y1 - b))

def save(im, path, max_side, alpha=True):
    s = min(1, max_side / max(im.size))
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    if not alpha: im = im.convert('RGB')
    im.save(path, 'WEBP', quality=86, method=6)
    print(os.path.relpath(path, ROOT), im.size, os.path.getsize(path) // 1024, 'KB')

def faces(key, group, spec):
    for face, (n, inset, side) in spec.items():
        save(cut(group, n, inset), os.path.join(ROOT, 'kit3d', f'{key}-{face}.webp'), side, alpha=False)

# Kit Presente Variado: luva dourada com visor; o verso é a bandeja branca (abas recortadas)
faces('presente-variado', 'caixa-sabonetes', {
  'front': ('14', (0, 0, 0, 0), 1100),
  'back': ('13', (42, 18, 42, 18), 900),
  'right': ('12', (0, 0, 0, 0), 1024),
  'left': ('18', (0, 0, 0, 0), 1024),
  'top': ('15', (0, 0, 0, 0), 640),
  'bottom': ('16', (0, 0, 0, 0), 640),
})
# Óleo de Semente de Uva: caixa dourada com tampa de acetato
faces('oleo-uva-dourado', 'caixa-oleo-uva', {
  'front': ('17', (0, 0, 0, 0), 1100),
  'back': ('19', (0, 0, 0, 0), 900),
  'right': ('20', (0, 0, 0, 0), 1024),
  'left': ('23', (0, 0, 0, 0), 1024),
  'top': ('21', (0, 0, 0, 0), 640),
  'bottom': ('22', (0, 0, 0, 0), 640),
})

# Fotos da vitrine (recorte transparente)
for name, (group, n) in {
  'presente-variado-frente': ('caixa-sabonetes', '14'),
  'oleo-uva-frente': ('caixa-oleo-uva', '17'),
  'vela-biscoitos-frente': ('vela-vermelha', '02'),
  'vela-biscoitos-angulo': ('vela-vermelha', '07'),
  'vela-natalina-frente': ('vela-botanica', '06'),
  'vela-natalina-angulo': ('vela-botanica', '08'),
}.items():
    save(cut(group, n), os.path.join(ROOT, 'kits', f'{name}.webp'), 1100)
