# Modela um frasco de 10 ml (vidro âmbar + tampa canelada + rótulo) no Blender a partir do perfil medido nas fotos
# (tools/frasco_rotulo.py), exporta GLB para o site e renderiza prévias.
# Uso: "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P tools/blender_frasco.py -- \
#        perfil.json rotulo.png saida.glb previa_prefixo [altura_m]
import bpy, bmesh, json, math, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
prof_json, label_png, out_glb, preview = argv[:4]
HT = float(argv[4]) if len(argv) > 4 else 0.058  # altura total real (m)
ART = float(argv[5]) if len(argv) > 5 else 0  # >0: rótulo é a arte original (largura/altura); cobre só o arco certo
FRONT_U = float(argv[6]) if len(argv) > 6 else 0.5  # posição (0..1) do logo na largura da arte: fica de frente
meta = json.load(open(prof_json))
prof = meta['profile']  # [raio/altura, y/altura], de baixo para cima
L0, L1 = meta['label']
CAP = meta['cap_bottom']
SEG = 192

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def radius_at(t):
    """Raio (m) na altura relativa t, interpolado no perfil."""
    for (r0, y0), (r1, y1) in zip(prof, prof[1:]):
        if y0 <= t <= y1:
            k = (t - y0) / (y1 - y0 or 1)
            return (r0 + (r1 - r0) * k) * HT
    return prof[-1][0] * HT


def lathe(name, t0, t1, rows, rfun, mat, uv=False, close_bottom=False, close_top=False, SEG=96, arc=None):
    """Sólido de revolução entre as alturas relativas t0..t1. θ vai de π a 3π: a emenda fica atrás."""
    me = bpy.data.meshes.new(name); ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new('UVMap') if uv else None
    grid = []
    for i in range(rows + 1):
        t = t0 + (t1 - t0) * i / rows
        ring = []
        for s in range(SEG + 1):
            # arc: (θ inicial, θ final) — sem arc, a volta inteira com a emenda atrás
            th = (arc[0] + (arc[1] - arc[0]) * s / SEG) if arc else math.pi + 2 * math.pi * s / SEG
            r = rfun(t, th)
            # frente do frasco virada para −Y (no glTF vira +Z, de frente para a câmera)
            ring.append(bm.verts.new((r * math.sin(th), -r * math.cos(th), t * HT)))
        grid.append(ring)
    for i in range(rows):
        for s in range(SEG):
            f = bm.faces.new((grid[i][s], grid[i][s + 1], grid[i + 1][s + 1], grid[i + 1][s]))
            f.smooth = True
            if uv:
                for lp, (uu, vv) in zip(f.loops, ((s, i), (s + 1, i), (s + 1, i + 1), (s, i + 1))):
                    lp[uvl].uv = ((uu / SEG) if arc else 0.5 + uu / SEG, vv / rows)  # arc: arte 0..1; volta inteira: u 0,5..1,5
    if not arc: bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    if close_bottom:
        e = [v for v in bm.verts if abs(v.co.z - t0 * HT) < 1e-6]
        if len(e) > 2: bmesh.ops.contextual_create(bm, geom=[ed for ed in bm.edges if all(v in e for v in ed.verts)])
    if close_top:
        e = [v for v in bm.verts if abs(v.co.z - t1 * HT) < 1e-6]
        if len(e) > 2: bmesh.ops.contextual_create(bm, geom=[ed for ed in bm.edges if all(v in e for v in ed.verts)])
    bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    return ob


def principled(name, color, rough, coat=0.0, alpha_img=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    n = m.node_tree.nodes; b = n['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    if 'Coat Weight' in b.inputs: b.inputs['Coat Weight'].default_value = coat
    if 'Coat Roughness' in b.inputs: b.inputs['Coat Roughness'].default_value = 0.08
    if alpha_img:
        tex = n.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(alpha_img)
        tex.extension = 'REPEAT'
        m.node_tree.links.new(tex.outputs['Color'], b.inputs['Base Color'])
        m.node_tree.links.new(tex.outputs['Alpha'], b.inputs['Alpha'])
        for attr, val in (('blend_method', 'CLIP'), ('surface_render_method', 'DITHERED')):
            if hasattr(m, attr):
                try: setattr(m, attr, val)
                except Exception: pass
    return m


glass = principled('vidro_ambar', (0.055, 0.018, 0.004), 0.04, coat=0.9)
plastic = principled('tampa_preta', (0.01, 0.01, 0.011), 0.38, coat=0.1)
paper = principled('rotulo', (1, 1, 1), 0.42, coat=0.12, alpha_img=label_png)

# vidro: da base até o início da parte preta (lacre)
lathe('vidro', 0.0, CAP + 0.004, 64, lambda t, th: radius_at(t), glass, close_bottom=True)
# parte preta: lacre liso e tampa com caneluras (48 sulcos) do topo do lacre até perto do topo
cap_rib0 = CAP + (1 - CAP) * 0.28
def black_r(t, th):
    r = radius_at(min(t, 0.999))
    if cap_rib0 < t < 0.985:
        r *= 1 + 0.011 * math.cos(64 * th)
    return r
lathe('tampa', CAP, 1.0, 48, black_r, plastic, close_top=True, SEG=256)  # 256 divisões: 4 por canelura
# rótulo: cilindro um pouco mais largo que o vidro (papel colado)
body_r = max(radius_at(L0 + (L1 - L0) * k / 20) for k in range(21))
if ART:
    arc = min(2 * math.pi * 0.97, (L1 - L0) * HT * ART / (body_r * 1.006))  # comprimento do rótulo / raio
    print('rótulo cobre', round(math.degrees(arc)), 'graus')
    c = 2 * math.pi - (FRONT_U - 0.5) * arc  # gira o rótulo para o logo ficar de frente
    lathe('rotulo', L0, L1, 2, lambda t, th: body_r * 1.006, paper, uv=True, SEG=160, arc=(c - arc / 2, c + arc / 2))
else:
    lathe('rotulo', L0, L1, 2, lambda t, th: body_r * 1.006, paper, uv=True)

# ---- exporta GLB (texturas em WebP) ----
for ob in scene.collection.objects: ob.select_set(True)
kw = dict(filepath=out_glb, export_format='GLB', use_selection=True, export_apply=True)
try:
    bpy.ops.export_scene.gltf(**kw, export_image_format='WEBP', export_image_quality=82)
except TypeError:
    bpy.ops.export_scene.gltf(**kw)

# ---- prévias ----
cam_data = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', cam_data)
scene.collection.objects.link(cam); scene.camera = cam
cam_data.lens = 85
def light(name, kind, loc, energy, size=0.2):
    d = bpy.data.lights.new(name, kind); d.energy = energy
    if kind == 'AREA': d.size = size
    o = bpy.data.objects.new(name, d); o.location = loc; scene.collection.objects.link(o)
    o.rotation_euler = (Vector((0, 0, HT / 2)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light('chave', 'AREA', (-0.2, -0.24, 0.22), 4.0, 0.45)
light('preench', 'AREA', (0.24, -0.16, 0.06), 1.2, 0.5)
light('recorte', 'AREA', (0.06, 0.26, 0.18), 3.5, 0.3)
light('topo', 'AREA', (0, -0.02, 0.3), 1.5, 0.3)
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.9, 0.86, 0.8, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
scene.view_settings.view_transform = 'Standard'  # sem o AgX, que lava as cores
scene.view_settings.exposure = -1.1
scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
floor = bpy.data.objects.new('chao', bpy.data.meshes.new('chao')); scene.collection.objects.link(floor)
bmf = bmesh.new(); bmesh.ops.create_grid(bmf, x_segments=1, y_segments=1, size=0.4); bmf.to_mesh(floor.data); bmf.free()
floor.is_shadow_catcher = True
scene.render.film_transparent = True
scene.render.resolution_x, scene.render.resolution_y = 900, 1200
for i, ang in enumerate((0, 75)):
    a = math.radians(ang)
    d = 0.2
    cam.location = (d * math.sin(a), -d * math.cos(a), HT * 0.78)
    cam.rotation_euler = (Vector((0, 0, HT * 0.5)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = f'{preview}-{i}.png'
    bpy.ops.render.render(write_still=True)
print('OK', out_glb)
