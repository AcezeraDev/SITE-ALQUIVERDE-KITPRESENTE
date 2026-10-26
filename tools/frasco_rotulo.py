# Desenrola o rótulo de um frasco cilíndrico a partir de N fotos tiradas em volta dele e mede o perfil.
# - Cada coluna da textura (ângulo θ) vem do pixel x = cx + R·sen(θ − centro da vista): sem "espremido" nas bordas.
# - O ângulo real de cada vista é descoberto comparando as faixas que se sobrepõem entre vistas vizinhas
#   (as fotos geradas por IA não ficam exatamente a 360/N graus uma da outra).
# - A altura do rótulo é alinhada em cada vista pela borda clara de cima e de baixo.
# Uso: python -I tools/frasco_rotulo.py <pasta> v1.png v2.png ... <saida.png> <perfil.json>
import json, math, subprocess, sys

folder, *views = sys.argv[1:-2]
out_png, out_json = sys.argv[-2:]
DEG = math.pi / 180


def load(p):
    w, h = map(int, subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip().split(','))
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], capture_output=True).stdout
    return {'w': w, 'h': h, 'b': raw}


def alpha(v, x, y): return v['b'][(y * v['w'] + x) * 4 + 3]


def bbox(v):
    w, h = v['w'], v['h']
    ys = [y for y in range(h) if any(alpha(v, x, y) > 128 for x in range(0, w, 3))]
    xs = [x for x in range(w) if any(alpha(v, x, y) > 128 for y in range(ys[0], ys[-1], 3))]
    return xs[0], ys[0], xs[-1] + 1, ys[-1] + 1


def edges(v, y):
    c = v.setdefault('_e', {})
    if y not in c:
        xs = [x for x in range(v['w']) if alpha(v, x, y) > 128]
        c[y] = (xs[0], xs[-1]) if xs else None
    return c[y]


def center_rgb(v, y, half=40):
    e = edges(v, y); cx = (e[0] + e[1]) // 2; b = v['b']; w = v['w']
    return [b[(y * w + x) * 4:(y * w + x) * 4 + 3] for x in range(cx - half, cx + half, 4)]


def bright(v, y): s = center_rgb(v, y); return sum(sum(p) / 3 for p in s) / len(s)
def amber(v, y): s = center_rgb(v, y, 20); return sum(1 for p in s if p[0] - p[2] > 35 and p[0] > 40) > len(s) * 0.6
def dark(v, y): s = center_rgb(v, y); return sum(1 for p in s if max(p) < 80) > len(s) * 0.7


def label_rows(v):
    """Topo e base do rótulo nesta vista (linhas)."""
    x0, y0, x1, y1 = bbox(v); H = y1 - y0
    top = next(y for y in range(y0 + int(H * 0.45), y1) if bright(v, y) > 185)
    bot = next(y for y in range(y1 - 1, top, -1) if bright(v, y) > 150)
    while bot < y1 - 4 and not dark(v, bot + 2): bot += 1   # a faixa estampada de baixo também é rótulo
    return top, bot


V = [load(f'{folder}/{n}') for n in views]
front = V[0]
x0, y0, x1, y1 = bbox(front)
H = y1 - y0

# ---- perfil (raio por altura) e regiões, na vista da frente ----
prof = []
for j in range(0, 161):
    y = min(y1 - 1, round(y1 - 1 - (H - 1) * j / 160))
    e = edges(front, y)
    prof.append([round((e[1] - e[0] + 1) / 2 / H, 5) if e else 0, round(j / 160, 5)])
lab = [label_rows(v) for v in V]
neck = next(y for y in range(y0 + int(H * 0.2), y0 + int(H * 0.7)) if amber(front, y))  # 1º vidro âmbar abaixo da tampa/lacre
meta = {'height_px': H, 'label': [round((y1 - lab[0][1]) / H, 4), round((y1 - lab[0][0]) / H, 4)], 'cap_bottom': round((y1 - neck) / H, 4)}

LH = lab[0][1] - lab[0][0]
mid = (lab[0][0] + lab[0][1]) // 2
e = edges(front, mid); R0 = (e[1] - e[0]) / 2
TW = round(2 * math.pi * R0)


def sample(vi, row, phi):
    """Cor do rótulo na vista vi, linha relativa row (0..LH), ângulo phi em relação ao centro da vista."""
    v = V[vi]; t, b = lab[vi]
    y = round(t + row * (b - t) / LH)
    e = edges(v, y)
    if not e: return None
    cx = (e[0] + e[1]) / 2; R = (e[1] - e[0]) / 2
    x = int(cx + R * math.sin(phi) * 0.985)
    i = (y * v['w'] + x) * 4
    if v['b'][i + 3] < 128: return None
    return v['b'][i:i + 3]


# ---- alinhamento angular entre vistas vizinhas ----
ROWS = [round(LH * f) for f in (0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68)]
cache = {}
def gray(vi, phi_deg):
    k = (vi, phi_deg)
    if k not in cache:
        vals = []
        for r in ROWS:
            p = sample(vi, r, phi_deg * DEG)
            vals.append(sum(p) / 3 if p else None)
        cache[k] = vals
    return cache[k]


def best_offset(a, b, nominal):
    """Ângulo d (graus) tal que o conteúdo de a em φ aparece em b em φ − d."""
    best = (1e9, nominal)
    for d in range(int(nominal - 40), int(nominal + 41)):
        err = n = 0
        for phi in range(-62, 63, 2):
            q = phi - d
            if q < -62 or q > 62: continue
            ga, gb = gray(a, phi), gray(b, q)
            for u, w in zip(ga, gb):
                if u is None or w is None: continue
                err += abs(u - w); n += 1
        if n > 40 and err / n < best[0]: best = (err / n, d)
    return best[1], best[0]


N = len(V)
nominal = 360 / N
offs = []
for i in range(N):
    d, err = best_offset(i, (i + 1) % N, nominal)
    offs.append(d)
# fecha a volta em 360°: distribui a diferença
fix = (360 - sum(offs)) / N
offs = [d + fix for d in offs]
centers = [0.0]
for d in offs[:-1]: centers.append(centers[-1] + d)
meta['view_angles'] = [round(c, 1) for c in centers]

# ---- emendas: entre duas vistas vizinhas, troca onde há menos "tinta" (espaço entre colunas de texto) ----
def ink(vi, phi_deg):
    g = gray(vi, phi_deg)
    vals = [255 - x for x in g if x is not None]
    return sum(vals) / len(vals) if vals else 255

seams = []
for i in range(N):
    a, b = centers[i], centers[(i + 1) % N] + (360 if i == N - 1 else 0)
    midp = (a + b) / 2
    best = (1e9, midp)
    for t in range(int(midp - 22), int(midp + 23)):
        da, db = t - a, t - b
        if abs(da) > 62 or abs(db) > 62: continue
        cost = sum(ink(i, round(da + o)) + ink((i + 1) % N, round(db + o)) for o in (-2, 0, 2))
        cost += abs(t - midp) * 2  # prefere perto do meio
        if cost < best[0]: best = (cost, t)
    seams.append(best[1] % 360)
meta['seams'] = [round(x, 1) for x in seams]

def owner(theta):
    """Vista dona do ângulo theta e distância (graus) até a emenda mais próxima."""
    for i in range(N):
        lo = seams[i - 1]; hi = seams[i]
        span = (hi - lo) % 360
        d = (theta - lo) % 360
        if d < span: return i, min(d, span - d), (i - 1) % N if d < span - d else (i + 1) % N
    return 0, 99, 1

# ---- monta a textura: cada coluna usa a vista dona; perto da emenda, transição curta ----
out = bytearray(TW * LH * 4)
for col in range(TW):
    theta = col / TW * 360  # ângulo absoluto (0 = frente)
    v1, m, v2 = owner(theta)
    rel = lambda vi: (theta - centers[vi] + 540) % 360 - 180
    w1 = 1.0 if m >= 2.5 else 0.5 + m / 5
    ws = [(v1, rel(v1), w1)] + ([(v2, rel(v2), 1 - w1)] if w1 < 1 and abs(rel(v2)) <= 64 else [])
    for row in range(LH):
        acc = [0.0, 0.0, 0.0]; tot = 0.0
        for vi, dphi, wgt in ws:
            p = sample(vi, row, dphi * DEG)
            if not p: continue
            acc[0] += p[0] * wgt; acc[1] += p[1] * wgt; acc[2] += p[2] * wgt; tot += wgt
        if tot:
            o = (row * TW + col) * 4
            out[o] = round(acc[0] / tot); out[o + 1] = round(acc[1] / tot); out[o + 2] = round(acc[2] / tot); out[o + 3] = 255

# coluna onde a parte clara do rótulo é escura = vidro (o rótulo não dá a volta toda): fica transparente
for col in range(TW):
    px = [out[(r * TW + col) * 4:(r * TW + col) * 4 + 3] for r in range(int(LH * 0.08), int(LH * 0.6), 6)]
    # vidro: maioria dos pixels escura E âmbar (R bem maior que B); barras do código de barras são preto neutro
    glass = sum(1 for p in px if sum(p) / 3 < 95 and p[0] - p[2] > 18)
    if glass > len(px) * 0.6:
        for r in range(LH): out[(r * TW + col) * 4 + 3] = 0

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{TW}x{LH}', '-i', '-', out_png], input=bytes(out), check=True)
meta['profile'] = prof
meta['label_px'] = [TW, LH]
json.dump(meta, open(out_json, 'w'))
print(json.dumps({k: v for k, v in meta.items() if k != 'profile'}))
