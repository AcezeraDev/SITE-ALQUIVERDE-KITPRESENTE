# Uso: python tools/gold_weave.py <pasta do zip caixa-dourada-15-recortes extraido>
# Gera public/kit3d/gold-weave.webp: só o relevo do papel dourado texturizado (sem os reflexos da foto),
# em tons de cinza e emendável (tile), usado como bumpMap/roughnessMap das caixas douradas modeladas.
import os, sys
from PIL import Image, ImageChops, ImageFilter, ImageMath

src = os.path.join(sys.argv[1], 'caixa-dourada', '10-face-v1.png')
rgba = Image.open(src)
x0, y0, x1, y1 = rgba.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox()
w, h = x1 - x0, y1 - y0
S = int(min(w, h) * 0.62)  # recorte central plano (~3,7 cm da caixa)
cx, cy = x0 + w // 2, y0 + h // 2
im = rgba.convert('L').crop((cx - S // 2, cy - S // 2, cx - S // 2 + S, cy - S // 2 + S))

# passa-alta: tira as manchas grandes de luz e deixa só a trama
hp = ImageChops.subtract(im, im.filter(ImageFilter.GaussianBlur(10)), scale=1, offset=128)
# contraste local uniforme: a foto mostra a trama forte nas partes escuras e fraca nas claras
amp = ImageChops.difference(hp, Image.new('L', hp.size, 128)).filter(ImageFilter.GaussianBlur(22))
hp = ImageMath.lambda_eval(lambda e: (e['a'] - 128) * 34 / (e['b'] + 3) + 128, a=hp, b=amp).convert('L')
hp = hp.filter(ImageFilter.GaussianBlur(0.6))

# emendável: mistura com a própria imagem deslocada meia volta (peso maior no centro)
rolled = ImageChops.offset(hp, S // 2, S // 2)
edge = [min(1, (1 - abs(2 * i / (S - 1) - 1)) * 3) for i in range(S)]
mask = Image.new('L', (S, S))
mask.putdata([int(255 * min(edge[x], edge[y])) for y in range(S) for x in range(S)])
out = Image.composite(hp, rolled, mask).resize((512, 512), Image.LANCZOS)

dst = os.path.join(os.path.dirname(__file__), '..', 'public', 'kit3d', 'gold-weave.webp')
out.save(dst, 'WEBP', quality=82, method=6)
print(dst, out.size, os.path.getsize(dst) // 1024, 'KB', 'tile =', round(S / max(w, h) * 6, 2), 'cm')
