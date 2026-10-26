# Uso: python tools/cinco_oleos_rotulos.py <foto do kit com os 5 frascos lado a lado>
# Recorta o rótulo de cada frasco (Lavanda, Capim Limão, Alecrim, Cravo, Tangerina) e junta num atlas
# public/kit3d/cinco-oleos-rotulos.webp (5 colunas iguais), usado pelos frascos 3D do kit Aromas do Jardim.
import os, sys
from PIL import Image

src = Image.open(sys.argv[1]).convert('RGB')
# x esquerdo/direito de cada frasco na foto 1254 x 1254; o rótulo vai de y 676 a 983
COLS = [(44, 262), (283, 498), (518, 733), (753, 968), (991, 1209)]
Y0, Y1, W, H = 676, 983, 220, 320
atlas = Image.new('RGB', (W * len(COLS), H))
for i, (x0, x1) in enumerate(COLS):
    atlas.paste(src.crop((x0, Y0, x1, Y1)).resize((W, H), Image.LANCZOS), (i * W, 0))
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'kit3d', 'cinco-oleos-rotulos.webp')
atlas.save(out, 'WEBP', quality=85, method=6)
print(os.path.relpath(out), atlas.size, os.path.getsize(out) // 1024, 'KB')
