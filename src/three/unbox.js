import { fallbackScene } from './fallback.js';
// Cena "O ritual de presentear", guiada pela rolagem (p: 0 → 1): só as embalagens, flutuando sobre o pedestal.
//  I.  Escolher   — os kits reais se revezam (giram como cartas)
//  II. Embrulhar  — o escolhido segue girando com a rolagem
//  III. Sorrir    — ele sobe um pouco e cresce, com luz e poeira dourada
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { paperTexture, makeSparkles, makeRenderer, makeGift } from './gifts.js';
import { makeSoap, SOAP_SIZE } from './soap3d.js';
import { makeKitBox, KIT_MODELS } from './kit3d.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const eOut = (t) => 1 - Math.pow(1 - t, 3);
const lerp = (a, b, t) => a + (b - a) * t;

export const RITUAL_KITS = [
  { type: 'soap', key: 'aroeira', name: 'Sabonete Aroeira' },
  { type: 'kit', key: 'raio-de-sol', name: 'Raio de Sol' },
  { type: 'kit', key: 'presente-variado', name: 'Presente Variado' },
];

// Tempos dos atos (frações da rolagem)
const T = { choose: 0.24, pop: [0.68, 0.8], rise: [0.7, 0.9] };

/* ---------- fita de cetim: tira plana seguindo uma curva ---------- */
function ribbonStrip(points, width, closed = false, segments = 80) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, 'centripetal');
  const pos = [], uv = [], idx = [];
  const Z = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const p = curve.getPointAt(u);
    const t = curve.getTangentAt(u);
    const side = Z.clone().sub(t.clone().multiplyScalar(t.dot(Z))).normalize().multiplyScalar(width / 2);
    // leve torção para o cetim pegar luz
    side.applyAxisAngle(t, Math.sin(u * Math.PI * 2) * 0.25);
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
    uv.push(u, 0, u, 1);
    if (i < segments) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function satin(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.1, sheen: 1, sheenRoughness: 0.25, sheenColor: new THREE.Color('#fff4dc'), clearcoat: 0.35, clearcoatRoughness: 0.4, side: THREE.DoubleSide, envMapIntensity: 0.9 });
}

export function satinBow(color, s = 1) {
  const bow = new THREE.Group();
  const m = satin(color);
  const W = 0.2 * s;
  const loop = [[0, 0, 0], [0.18, 0.2, 0.04], [0.5, 0.36, 0.02], [0.78, 0.22, -0.02], [0.74, 0.02, 0], [0.42, -0.02, 0.02], [0.12, 0.02, 0]].map(([x, y, z]) => [x * s, y * s, z * s]);
  const tail = [[0, 0, 0], [0.1, -0.05, 0.12], [0.24, -0.1, 0.36], [0.36, -0.12, 0.62], [0.44, -0.13, 0.82]].map(([x, y, z]) => [x * s, y * s, z * s]);
  for (const side of [1, -1]) {
    const l = new THREE.Mesh(ribbonStrip(loop, W, true), m);
    l.scale.x = side;
    l.rotation.y = side * 0.18;
    bow.add(l);
    const tl = new THREE.Mesh(ribbonStrip(tail, W * 0.85), m);
    tl.scale.x = side;
    bow.add(tl);
  }
  const knot = new THREE.Mesh(new RoundedBoxGeometry(0.2 * s, 0.17 * s, 0.22 * s, 3, 0.06 * s), m);
  knot.position.y = 0.03 * s;
  bow.add(knot);
  bow.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return bow;
}

/* ---------- textura radial para sombra de contato e brilho ---------- */
function radialTex(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function initUnbox(canvas, { onChoice } = {}) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return fallbackScene(canvas, { photo: '/kits/feliz-aroeira-calendula-frente.webp' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  // luzes: chave quente suave, preenchimento e contraluz dourada
  scene.add(new THREE.HemisphereLight('#fff6e8', '#5b3434', 0.7));
  const key = new THREE.DirectionalLight('#ffe9c9', 2.2);
  key.position.set(-3.5, 7, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 12; key.shadow.blurSamples = 16;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#f1c98e', 1.6);
  rim.position.set(4, 3, -5);
  scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);

  /* pedestal de travertino */
  const stoneMat = new THREE.MeshStandardMaterial({ map: paperTexture('#e9dfcc'), roughness: 0.92 });
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.15, 0.42, 96), stoneMat);
  plinth.position.y = -0.21;
  plinth.receiveShadow = true;
  root.add(plinth);
  const plinthTop = new THREE.Mesh(new THREE.CircleGeometry(2.05, 96), new THREE.ShadowMaterial({ opacity: 0.22 }));
  plinthTop.rotation.x = -Math.PI / 2; plinthTop.position.y = 0.002; plinthTop.receiveShadow = true;
  root.add(plinthTop);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: radialTex('rgba(40,18,18,0.45)', 'rgba(40,18,18,0)'), transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2; contact.position.y = 0.006;
  root.add(contact);

  /* luz quente atrás do kit no ato final */
  const glow = new THREE.PointLight('#ffcf8a', 0, 7, 1.4);
  glow.position.set(0, 1.3, 0);
  root.add(glow);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: radialTex('rgba(255,214,150,0.85)', 'rgba(255,214,150,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  halo.position.set(0, 2.2, -0.6);
  root.add(halo);

  /* kits reais (planos recortados) */
  const loader = new THREE.TextureLoader();
  const models = RITUAL_KITS.map((k) => {
    const obj = k.type === 'soap' ? makeSoap(k.key, renderer) : makeKitBox(k.key, renderer);
    const h = k.type === 'soap' ? SOAP_SIZE.w * 1.15 : KIT_MODELS[k.key].h; // sabonete deitado: normaliza pela largura
    const wrap = new THREE.Group();
    obj.scale.setScalar(1 / h);
    obj.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    wrap.add(obj);
    wrap.visible = false;
    return wrap;
  });
  const kitHolder = new THREE.Group();
  models.forEach((m) => kitHolder.add(m));
  root.add(kitHolder);
  // sombra do kit no pedestal (falsa, barata)
  const kitShadow = contact.clone();
  kitShadow.material = contact.material.clone();
  kitShadow.scale.setScalar(0.5);
  kitShadow.position.y = 0.008;
  root.add(kitShadow);

  /* decoração: presentinhos no pedestal, bolas de Natal em órbita lenta e anéis dourados atrás do kit */
  const deco = new THREE.Group();
  root.add(deco);
  [
    { w: 0.62, h: 0.5, d: 0.62, paper: '#752f3b', ribbon: '#d6b97c', at: [-1.38, 0.62], ry: 0.5 },
    { w: 0.46, h: 0.36, d: 0.46, paper: '#284a31', ribbon: '#e9cf95', stripes: true, at: [1.32, 0.78], ry: -0.4 },
    { w: 0.4, h: 0.62, d: 0.4, paper: '#d6b97c', ribbon: '#752f3b', at: [1.15, -1.05], ry: 0.25 },
  ].forEach(({ at, ry, ...o }) => {
    const g = makeGift(o).group;
    g.position.set(at[0], o.h / 2, at[1]);
    g.rotation.y = ry;
    deco.add(g);
  });
  const goldMat = new THREE.MeshPhysicalMaterial({ color: '#d6b97c', metalness: 1, roughness: 0.22, clearcoat: 0.6 });
  const rings = [1.62, 1.86].map((r, i) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, i ? 0.009 : 0.016, 12, 160), goldMat);
    m.position.set(0, 1.55, -0.55);
    deco.add(m);
    return m;
  });
  const baubleCols = ['#d6b97c', '#752f3b', '#284a31', '#e9cf95', '#a8323e', '#d6b97c'];
  const capGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16);
  const baubles = baubleCols.map((c, i) => {
    const r = 0.11 + (i % 3) * 0.035;
    const b = new THREE.Group();
    const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.75, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 }));
    const cap = new THREE.Mesh(capGeo, goldMat);
    cap.position.y = r + 0.015;
    b.add(ball, cap);
    b.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    deco.add(b);
    return { b, a: (i / baubleCols.length) * Math.PI * 2, rad: 1.75 + (i % 2) * 0.35, y: 1.1 + ((i * 7) % 5) * 0.42, sp: 0.18 + (i % 3) * 0.04 };
  });

  const dust = makeSparkles(320, [9, 6, 5], '#f3dfb0');
  dust.points.position.y = 2.2;
  root.add(dust.points);

  let p = 0, choice = -1;
  let layout = { x: 1.4, y: -0.9, s: 1 };
  const clock = new THREE.Clock();
  let raf = 0, running = false;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w < 760) layout = { x: 0, y: -1.15, s: 0.74 };
    else if (w < 1100) layout = { x: 1.5, y: -0.2, s: 0.86 };
    else layout = { x: 2.2, y: -0.35, s: 1.18 };
  }

  function frame() {
    const time = clock.getElapsedTime();
    camera.position.set(0, 3.2, 13.5);
    camera.lookAt(0, 1.35, 0);
    root.position.set(layout.x, layout.y, 0);
    root.scale.setScalar(layout.s);
    root.rotation.y = -0.42 + p * 0.55 + Math.sin(time * 0.35) * 0.03;

    /* ---- ATO I: escolher ---- */
    const tc = clamp01(p / T.choose) * 3;
    const idx = Math.min(2, Math.floor(tc));
    const local = tc - idx;
    if (idx !== choice) { choice = idx; models.forEach((m, i) => { m.visible = i === idx; }); onChoice?.(idx); }
    let flip = 1;
    if (p < T.choose) {
      if (idx < 2) flip = Math.min(flip, clamp01((1 - local) / 0.16));
      if (idx > 0) flip = Math.min(flip, clamp01(local / 0.16));
    }

    /* ---- ATO III: subir iluminado ---- */
    const pop = seg(p, ...T.pop);
    const rise = eOut(seg(p, ...T.rise));

    // kit: flutua sobre o pedestal → sobe um pouco e cresce no fim
    const hover = Math.sin(time * 1.4) * 0.08;
    const kitS = lerp(2.5, 2.85, rise);
    const ky = lerp(0.25 + kitS / 2, 0.55 + kitS / 2, rise) + hover;
    // giro de carta na troca + leve vaivém para mostrar que é 3D
    kitHolder.scale.set(kitS * Math.max(0.001, flip), kitS, kitS);
    kitHolder.position.y = ky;
    // giro ligado à rolagem:
    //  ato I  — cada kit gira meia volta e fica de frente no meio do seu trecho
    //  depois — continua girando com a rolagem até parar de frente no fim (p = 1 → 4π)
    const scrollSpin = p < T.choose
      ? (local - 0.5) * Math.PI
      : Math.PI / 2 + ((p - T.choose) / (1 - T.choose)) * (Math.PI * 4 - Math.PI / 2);
    kitHolder.rotation.y = -root.rotation.y + scrollSpin + (1 - flip) * 1.2 + Math.sin(time * 0.7) * 0.06;
    kitShadow.material.opacity = 0.75 - rise * 0.35 - hover * 1.5;
    kitShadow.scale.setScalar(0.5 + kitS * 0.08);

    // decoração: bolas em órbita lenta (balançando), anéis girando devagar
    for (const o of baubles) {
      const a = o.a + time * o.sp;
      o.b.position.set(Math.cos(a) * o.rad, o.y + Math.sin(time * 0.9 + o.a * 3) * 0.12, Math.sin(a) * o.rad * 0.7);
      o.b.rotation.z = Math.sin(time * 0.8 + o.a) * 0.12;
    }
    rings[0].rotation.set(Math.sin(time * 0.3) * 0.25, -root.rotation.y + time * 0.15, 0);
    rings[1].rotation.set(0.5 + Math.cos(time * 0.25) * 0.2, -root.rotation.y - time * 0.12, 0.3);
    rings.forEach((r) => { r.position.y = ky; });

    // luz, halo, poeira
    glow.intensity = pop * 9;
    halo.material.opacity = eOut(pop) * 0.9;
    halo.scale.setScalar(0.8 + pop * 0.5 + Math.sin(time * 1.3) * 0.03);
    dust.mat.uniforms.uTime.value = time;
    dust.mat.uniforms.uOpacity.value = 0.25 + pop * 0.75;

    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);

  return {
    start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { frame(); },
    set progress(v) { p = v; },
    get progress() { return p; },
  };
}
