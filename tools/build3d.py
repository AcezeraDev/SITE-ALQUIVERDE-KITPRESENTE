# Uso: python -I tools/build3d.py <pasta do zip extraido> public/kit3d <pasta temporaria>  (precisa do ffmpeg no PATH)
# Depois copie os perfis impressos para src/three/itemProfiles.js (a vela tem o topo ajustado à mão: raio não diminui acima do ponto mais largo).
# Gera texturas 3D a partir das vistas: faces da caixa do laço e panoramas + perfis (copo, frascos).
import subprocess, json, os, sys
Z = sys.argv[1]            # pasta do zip extraído
OUT = sys.argv[2]          # site/public/kit3d
TMP = sys.argv[3]
os.makedirs(TMP, exist_ok=True)
def ff(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)
def size(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip()
    return tuple(map(int, o.split(',')))
def alpha(p):
    w, h = size(p)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-vf', 'alphaextract', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    return w, h, raw
def bbox(p):
    w, h, b = alpha(p)
    ys = [y for y in range(0, h) if any(b[y*w + x] > 128 for x in range(0, w, 3))]
    xs = [x for x in range(0, w) if any(b[y*w + x] > 128 for y in range(ys[0], ys[-1], 3))]
    return xs[0], ys[0], xs[-1] + 1, ys[-1] + 1
webp = ['-c:v', 'libwebp', '-quality', '88', '-pix_fmt', 'yuva420p']

# ---- Caixa com laço ----
L = os.path.join(Z, 'kit-com-laco')
faces = {
  'front': ('01-frente.png', (40, 148, 1326, 1072)),
  'back': ('02-verso-estimado.png', (123, 183, 1323, 1086)),
  'left': ('03-esquerda-estimada.png', (535, 86, 774, 1092)),
  'right': ('04-direita-estimada.png', (547, 120, 835, 1307)),
  'top': ('05-cima-estimada.png', (47, 189, 1892, 576)),
  'bottom': ('06-baixo-estimado.png', (67, 285, 1902, 557)),
}
for name, (f, (x0, y0, x1, y1)) in faces.items():
    ff('-i', os.path.join(L, f), '-vf', f'crop={x1-x0}:{y1-y0}:{x0}:{y0}', *webp, os.path.join(OUT, f'laco-{name}.webp'))
# frente inteira com o laço que passa da borda (plano recortado por alpha)
ff('-i', os.path.join(L, '01-frente.png'), '-vf', 'crop=1325:1050:40:22', *webp, os.path.join(OUT, 'laco-frontfull.webp'))

# ---- Objetos de giro (panorama das vistas + perfil da silhueta) ----
def turntable(key, folder, views, top=None, bottom=None, H=1024):
    strips = []
    N = len(views)
    import math
    k = math.sin(math.pi / N)  # corda do arco de cada vista, em diâmetros
    prof = None
    for i, v in enumerate(views):
        p = os.path.join(Z, folder, v)
        x0, y0, x1, y1 = bbox(p)
        nw = round((x1 - x0) * H / (y1 - y0))
        norm = os.path.join(TMP, f'{key}-n{i}.png')
        ff('-i', p, '-vf', f'crop={x1-x0}:{y1-y0}:{x0}:{y0},scale={nw}:{H}', norm)
        w, h, b = alpha(norm)
        # diâmetro na altura do meio do corpo (70% da altura, abaixo de tampa/ombro)
        ym = int(h * 0.7)
        row = [x for x in range(w) if b[ym*w + x] > 128]
        cx = (row[0] + row[-1]) / 2; D = row[-1] - row[0]
        sw = round(D * k)
        st = os.path.join(TMP, f'{key}-s{i}.png')
        ff('-i', norm, '-vf', f'crop={sw}:{H}:{round(cx - sw/2)}:0', st)
        strips.append(st)
        if i == 0:
            # perfil: raio (fração da altura) por linha, de baixo para cima
            pts = []
            for j in range(0, 65):
                y = min(h - 1, round((h - 1) * (1 - j / 64)))
                r = [x for x in range(w) if b[y*w + x] > 128]
                rad = ((r[-1] - r[0]) / 2) / h if r else 0
                pts.append([round(rad, 4), round(j / 64, 4)])
            prof = pts
    args = []
    for s in strips: args += ['-i', s]
    ff(*args, '-filter_complex', ''.join(f'[{i}]' for i in range(N)) + f'hstack={N}', *webp, os.path.join(OUT, f'{key}-wrap.webp'))
    for tag, f in (('top', top), ('bottom', bottom)):
        if not f: continue
        p = os.path.join(Z, folder, f)
        x0, y0, x1, y1 = bbox(p)
        s = max(x1 - x0, y1 - y0); cx = (x0 + x1) // 2; cy = (y0 + y1) // 2
        ff('-i', p, '-vf', f'crop={s}:{s}:{cx - s//2}:{cy - s//2},scale=512:512', *webp, os.path.join(OUT, f'{key}-{tag}.webp'))
    return prof

profiles = {
  'vela': turntable('vela', 'copo-natal', ['01-biscoito.png', '02-feliz-natal.png', '03-arvore.png', '04-emenda.png', '05-bengala.png', '06-coracao-biscoito.png'], bottom='08-baixo-estimada.png'),
  'oleo-canela': turntable('oleo-canela', 'canela', ['01-frente.png', '02-lateral-instrucoes.png', '03-verso-codigo.png', '04-lateral-fabricante.png'], '06-cima-estimada.png', '07-baixo-estimada.png'),
  'oleo-cravo': turntable('oleo-cravo', 'cravo', ['01-frente.png', '02-lateral-instrucoes.png', '03-verso-codigo.png', '05-lateral-fabricante.png'], '08-cima-estimada.png', '09-baixo-estimada.png'),
}
print(json.dumps(profiles))
