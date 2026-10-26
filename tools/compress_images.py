# Recomprime as imagens WebP de public/ (qualidade 80) e limita o tamanho das faces 3D pouco vistas.
# Só substitui quando o resultado fica menor. Uso: python -I tools/compress_images.py
import os, subprocess, tempfile
ROOT = 'public'
def dims(p):
    o = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout
    return tuple(map(int, o.strip().split(',')))
before = after = 0
for d, _, fs in os.walk(ROOT):
    for f in fs:
        if not f.endswith('.webp'): continue
        p = os.path.join(d, f); s0 = os.path.getsize(p)
        if s0 < 40_000: continue
        w, h = dims(p)
        # faces de trás/lado/cima/baixo das caixas e sabonetes: até 1024 px; o resto até 1600 px
        side = any(t in f for t in ('-back', '-left', '-right', '-side', '-top', '-bottom'))
        lim = 1024 if side else 1600
        vf = f"scale='min({lim},iw)':-2" if w >= h else f"scale=-2:'min({lim},ih)'"
        tmp = os.path.join(tempfile.gettempdir(), 'cmp_' + f)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-vf', vf, '-c:v', 'libwebp', '-quality', '80', '-pix_fmt', 'yuva420p', tmp], check=True)
        s1 = os.path.getsize(tmp)
        before += s0
        if s1 < s0 * 0.95:
            os.replace(tmp, p); after += s1
        else:
            os.remove(tmp); after += s0
print(f'{before//1024} KB -> {after//1024} KB')
