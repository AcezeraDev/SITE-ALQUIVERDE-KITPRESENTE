import { fallbackScene } from './fallback.js';
// "Monte o seu kit": caixa aberta em 3D que recebe os sabonetes escolhidos (caem no encaixe) e os extras
// (fotos em pé, enfileiradas no fundo). Ao fechar, a tampa desce, a fita cruza e o laço aparece.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { paperTexture, makeRenderer } from './gifts.js';
import { makeSoap, SOAP_SIZE } from './soap3d.js';
import { satin, satinBow } from './unbox.js';

// sabonete deitado (frente para cima): ocupa w × h no chão da caixa, d de altura
const SW = SOAP_SIZE.w, SD = SOAP_SIZE.h, ST = SOAP_SIZE.d;
const GAP = 0.14, WALL = 0.07, WALL_H = 0.78, EXTRA_ROW = 1.15, COLS = 3;

/** Medidas internas da caixa para n sabonetes (fileiras de 3) e se há extras. */
function dims(size, hasExtras) {
  const rows = Math.ceil(size / COLS);
  const w = COLS * SW + (COLS + 1) * GAP;
  const d = rows * SD + (rows + 1) * GAP + (hasExtras ? EXTRA_ROW : 0);
  return { w, d, rows };
}
/** Centro do encaixe i (fileira de cima para baixo = de trás para frente). */
function slotPos(i, size, hasExtras) {
  const { w, d } = dims(size, hasExtras);
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = -w / 2 + GAP + SW / 2 + col * (SW + GAP);
  const z = -d / 2 + (hasExtras ? EXTRA_ROW : 0) + GAP + SD / 2 + row * (SD + GAP);
  return new THREE.Vector3(x, WALL + ST / 2 + 0.002, z);
}

function radialTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function initBuilder(canvas, { reduced = false } = {}) {
  // preserveDrawingBuffer: mantém o último quadro para a foto da sacola (snapshot)
  const renderer = makeRenderer(canvas, { preserveDrawingBuffer: true });
  if (!renderer) return fallbackScene(canvas, { builder: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  scene.add(new THREE.HemisphereLight('#fff6e8', '#5b3434', 0.7));
  const key = new THREE.DirectionalLight('#ffe9c9', 2.1);
  key.position.set(-4, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 8; key.shadow.blurSamples = 12;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#f1c98e', 1.2); rim.position.set(5, 4, -6); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const root = new THREE.Group(); scene.add(root);

  // sombra de contato no chão
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: radialTex('rgba(40,18,18,.42)', 'rgba(40,18,18,0)'), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.003;
  root.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ map: paperTexture('#752f3b', { stripes: true }), roughness: 0.72, envMapIntensity: 0.6 });
  const liningMat = new THREE.MeshStandardMaterial({ map: paperTexture('#efe2c4'), roughness: 0.95 });
  const slotMat = new THREE.MeshStandardMaterial({ map: paperTexture('#e4d2ae'), roughness: 1 });
  const gold = satin('#d6b97c');

  let box = null, lid = null;
  const state = { size: 6, soaps: [], extras: [], closed: false, hasExtras: false };
  const soapObjs = []; // por encaixe: { key, mesh }
  const extraObjs = new Map(); // id -> grupo
  const view = { yaw: 0, vy: 0, dist: 14, idle: 2 };

  /** Caixa aberta (paredes, forro e encaixes) para as medidas atuais. */
  function buildBox() {
    const { w, d } = dims(state.size, state.hasExtras);
    const g = new THREE.Group();
    const W = w + 2 * WALL, D = d + 2 * WALL;
    const parts = [[W, WALL, D, 0, WALL / 2, 0], [W, WALL_H, WALL, 0, WALL_H / 2, D / 2 - WALL / 2], [W, WALL_H, WALL, 0, WALL_H / 2, -D / 2 + WALL / 2],
      [WALL, WALL_H, D, W / 2 - WALL / 2, WALL_H / 2, 0], [WALL, WALL_H, D, -W / 2 + WALL / 2, WALL_H / 2, 0]];
    parts.forEach(([a, b, c, x, y, z]) => {
      const m = new THREE.Mesh(new RoundedBoxGeometry(a, b, c, 2, 0.02), wallMat);
      m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m);
    });
    // forro creme por dentro
    const lining = new THREE.Mesh(new THREE.PlaneGeometry(w, d), liningMat);
    lining.rotation.x = -Math.PI / 2; lining.position.y = WALL + 0.001; lining.receiveShadow = true; g.add(lining);
    // encaixes marcados no fundo
    for (let i = 0; i < state.size; i++) {
      const p = slotPos(i, state.size, state.hasExtras);
      const s = new THREE.Mesh(new RoundedBoxGeometry(SW + 0.06, 0.02, SD + 0.06, 2, 0.01), slotMat);
      s.position.set(p.x, WALL + 0.01, p.z); s.receiveShadow = true; g.add(s);
    }
    // divisória entre os extras (fundo) e os sabonetes
    if (state.hasExtras) {
      const div = new THREE.Mesh(new RoundedBoxGeometry(w, WALL_H * 0.6, 0.05, 2, 0.015), wallMat);
      div.position.set(0, WALL_H * 0.3, -d / 2 + EXTRA_ROW); div.castShadow = div.receiveShadow = true; g.add(div);
    }
    // fita dourada contornando a caixa
    const bandF = new THREE.Mesh(new THREE.BoxGeometry(0.22, WALL_H + 0.004, 0.012), gold); bandF.position.set(0, WALL_H / 2, D / 2 + 0.004);
    const bandB = bandF.clone(); bandB.position.z = -D / 2 - 0.004;
    const bandL = new THREE.Mesh(new THREE.BoxGeometry(0.012, WALL_H + 0.004, 0.22), gold); bandL.position.set(-W / 2 - 0.004, WALL_H / 2, 0);
    const bandR = bandL.clone(); bandR.position.x = W / 2 + 0.004;
    g.add(bandF, bandB, bandL, bandR);
    floor.scale.set(W * 1.7, D * 1.7, 1);
    return g;
  }

  /** Tampa com fita cruzada e laço (fica guardada acima até fechar). */
  function buildLid() {
    const { w, d } = dims(state.size, state.hasExtras);
    const W = w + 2 * WALL + 0.1, D = d + 2 * WALL + 0.1, LH = 0.32;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(W, LH, D, 3, 0.04), wallMat); body.castShadow = true;
    const a = new THREE.Mesh(new RoundedBoxGeometry(0.3, LH + 0.012, D + 0.012, 2, 0.01), gold);
    const b = new THREE.Mesh(new RoundedBoxGeometry(W + 0.012, LH + 0.012, 0.3, 2, 0.01), gold);
    const bow = satinBow('#d6b97c', Math.min(2.2, 1.2 + w * 0.12));
    bow.position.y = LH / 2 + 0.08; bow.name = 'bow';
    g.add(body, a, b, bow);
    g.userData.rest = WALL_H + LH / 2 + 0.02;
    g.position.y = g.userData.rest + 6;
    g.visible = false;
    return g;
  }

  function rebuild(animate) {
    const prev = box ? dims(box.userData.size, box.userData.hasExtras) : null;
    if (box) { root.remove(box); box.traverse((o) => o.geometry?.dispose()); }
    if (lid) { root.remove(lid); lid.traverse((o) => o.geometry?.dispose()); }
    box = buildBox(); box.userData = { size: state.size, hasExtras: state.hasExtras };
    lid = buildLid();
    root.add(box, lid);
    const now = dims(state.size, state.hasExtras);
    if (animate && prev && !reduced) gsap.from(box.scale, { x: prev.w / now.w, z: prev.d / now.d, duration: 0.7, ease: 'expo.out' });
    frameCamera(animate);
  }

  function frameCamera(animate) {
    const { w, d } = dims(state.size, state.hasExtras);
    const fov = (camera.fov * Math.PI) / 180;
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
    const span = Math.max(w + 1.4, (d + 2.2) * 0.85);
    const dist = Math.max(span / 2 / Math.tan(fovH / 2), (d + 2.6) / 2 / Math.tan(fov / 2)) * 1.08;
    if (animate && !reduced) gsap.to(view, { dist, duration: 0.8, ease: 'expo.out' }); else view.dist = dist;
  }

  /* ---------- sabonetes ---------- */
  function dropSoap(i, k) {
    const mesh = makeSoap(k, renderer);
    mesh.rotation.x = -Math.PI / 2; // deitado, frente para cima
    const p = slotPos(i, state.size, state.hasExtras);
    mesh.position.copy(p);
    root.add(mesh);
    if (!reduced) {
      gsap.from(mesh.position, { y: p.y + 3.2, duration: 0.75, ease: 'power3.in' });
      gsap.from(mesh.rotation, { z: (Math.random() - 0.5) * 0.9, duration: 0.75, ease: 'power2.out' });
      gsap.fromTo(mesh.scale, { x: 1, y: 1, z: 1 }, { keyframes: [{ x: 1.04, y: 1.04, z: 0.92, duration: 0.09, delay: 0.72 }, { x: 1, y: 1, z: 1, duration: 0.25, ease: 'power2.out' }] });
    }
    return { key: k, mesh };
  }
  function liftSoap(o) {
    if (reduced) { root.remove(o.mesh); return; }
    gsap.to(o.mesh.position, { y: o.mesh.position.y + 2.2, duration: 0.45, ease: 'power3.in' });
    gsap.to(o.mesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.45, ease: 'power3.in', onComplete: () => root.remove(o.mesh) });
  }
  function syncSoaps(moveAll) {
    for (let i = 0; i < Math.max(soapObjs.length, state.size); i++) {
      const want = i < state.size ? state.soaps[i] : undefined;
      const have = soapObjs[i];
      if (have && have.key === want) {
        if (moveAll) {
          const p = slotPos(i, state.size, state.hasExtras);
          if (reduced) have.mesh.position.copy(p); else gsap.to(have.mesh.position, { x: p.x, y: p.y, z: p.z, duration: 0.6, ease: 'expo.out' });
        }
        continue;
      }
      if (have) liftSoap(have);
      soapObjs[i] = want ? dropSoap(i, want) : undefined;
    }
    soapObjs.length = state.size;
  }

  /* ---------- extras (fotos em pé, no fundo da caixa) ---------- */
  const loader = new THREE.TextureLoader();
  const texByUrl = new Map();
  function photoTex(url) {
    if (texByUrl.has(url)) return texByUrl.get(url);
    let t;
    const ready = new Promise((res) => { t = loader.load(url, (tt) => { renderer.initTexture(tt); res(tt); }); });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    texByUrl.set(url, { t, ready });
    return texByUrl.get(url);
  }
  function makeExtra(item) {
    const g = new THREE.Group();
    const { t, ready } = photoTex(item.photo);
    const h = item.height || 1.15;
    const mat = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35, roughness: 0.55, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    plane.castShadow = true;
    // pé no chão: origem na base, inclinado para a câmera (a vista é de cima)
    plane.geometry.translate(0, 0.5, 0);
    g.add(plane);
    ready.then((tx) => { const a = tx.image.width / tx.image.height; plane.scale.set(h * a, h, 1); });
    plane.scale.set(h * 0.5, h, 1);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.4), new THREE.MeshBasicMaterial({ map: radialTex('rgba(40,18,18,.35)', 'rgba(40,18,18,0)'), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.004; sh.scale.set(h * 0.9, h * 0.9, 1);
    g.add(sh);
    g.userData.plane = plane;
    return g;
  }
  function extraPos(j, n) {
    const { w, d } = dims(state.size, state.hasExtras);
    const step = Math.min(1.25, (w - 0.4) / Math.max(n, 1));
    return new THREE.Vector3(-((n - 1) * step) / 2 + j * step, WALL + 0.002, -d / 2 + EXTRA_ROW * 0.52);
  }
  function syncExtras(items, moveAll) {
    const ids = items.map((x) => x.id);
    for (const [id, g] of extraObjs) {
      if (ids.includes(id)) continue;
      extraObjs.delete(id);
      if (reduced) root.remove(g);
      else gsap.to(g.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.35, ease: 'power3.in', onComplete: () => root.remove(g) });
    }
    items.forEach((it, j) => {
      const p = extraPos(j, items.length);
      let g = extraObjs.get(it.id);
      if (!g) {
        g = makeExtra(it); g.position.copy(p); root.add(g); extraObjs.set(it.id, g);
        if (!reduced) gsap.from(g.position, { y: p.y + 2.6, duration: 0.7, ease: 'power3.in' });
      } else if (reduced) g.position.copy(p);
      else gsap.to(g.position, { x: p.x, y: p.y, z: p.z, duration: 0.6, ease: 'expo.out' });
    });
  }

  /* ---------- interação: arrastar para girar ---------- */
  let dragging = false, last = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; last = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!dragging) return; view.vy = (e.clientX - last) * 0.008; last = e.clientX; view.yaw = THREE.MathUtils.clamp(view.yaw + view.vy, -1.1, 1.1); view.idle = 0; });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => { const s = { ArrowLeft: -0.2, ArrowRight: 0.2 }[e.key]; if (s) { e.preventDefault(); view.yaw = THREE.MathUtils.clamp(view.yaw + s, -1.1, 1.1); view.idle = 0; } });

  const clock = new THREE.Clock();
  let raf = 0, running = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    frameCamera(false);
  }
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (!dragging) {
      view.vy *= 0.92; view.yaw = THREE.MathUtils.clamp(view.yaw + view.vy, -1.1, 1.1); view.idle += dt;
      if (view.idle > 2.5 && !reduced) view.yaw += (Math.sin(t * 0.35) * 0.18 - view.yaw) * Math.min(1, dt * 0.8); // balanço suave de vitrine
    }
    root.rotation.y = view.yaw;
    // câmera ~50° acima, olhando para dentro da caixa
    const el = 0.9;
    camera.position.set(0, Math.sin(el) * view.dist, Math.cos(el) * view.dist);
    camera.lookAt(0, 0.2, 0.15);
    // fotos dos extras sempre de frente para a câmera e um pouco inclinadas para trás
    for (const g of extraObjs.values()) { g.rotation.y = -root.rotation.y; g.userData.plane.rotation.x = -0.32; }
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  rebuild(false);
  resize();
  addEventListener('resize', resize);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; clock.getDelta(); resize(); raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0.02 }).observe(canvas);

  return {
    /** size = 3 | 6 | 9; soaps = chaves por encaixe; extras = [{ id, photo, height }] */
    update({ size, soaps, extras }) {
      if (state.closed) this.open(true);
      const hasExtras = extras.length > 0;
      const resized = size !== state.size || hasExtras !== state.hasExtras;
      Object.assign(state, { size, soaps: soaps.slice(0, size), extras, hasExtras });
      if (resized) rebuild(true);
      syncSoaps(resized);
      syncExtras(extras, resized);
      if (reduced && !running) frame();
    },
    /** Fecha a caixa: tampa desce, laço aparece. */
    close() {
      if (state.closed) return;
      state.closed = true;
      lid.visible = true;
      const bow = lid.getObjectByName('bow');
      // os extras em pé são mais altos que a caixa: recolhem para dentro antes de a tampa descer
      const ex = [...extraObjs.values()];
      if (reduced) { ex.forEach((g) => { g.visible = false; }); lid.position.y = lid.userData.rest; frame(); return; }
      gsap.timeline()
        .to(ex.map((g) => g.scale), { y: 0.01, duration: 0.35, ease: 'power3.in', onComplete: () => ex.forEach((g) => { g.visible = false; }) }, 0)
        .fromTo(lid.position, { y: lid.userData.rest + 6 }, { y: lid.userData.rest, duration: 0.9, ease: 'power3.in' })
        .fromTo(lid.scale, { x: 1, y: 1, z: 1 }, { keyframes: [{ x: 1.02, y: 0.9, z: 1.02, duration: 0.08 }, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'power2.out' }] })
        .fromTo(bow.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1, 0.35)' }, '-=0.2')
        .to(view, { yaw: 0.35, duration: 1.4, ease: 'power2.inOut' }, 0.4);
    },
    open(instant = false) {
      if (!state.closed) return;
      state.closed = false;
      const ex = [...extraObjs.values()];
      ex.forEach((g) => { g.visible = true; });
      if (reduced || instant) { ex.forEach((g) => g.scale.set(1, 1, 1)); lid.visible = false; lid.position.y = lid.userData.rest + 6; return; }
      gsap.to(lid.position, { y: lid.userData.rest + 6, duration: 0.6, ease: 'power3.in', onComplete: () => { lid.visible = false; } });
      gsap.to(ex.map((g) => g.scale), { y: 1, duration: 0.6, delay: 0.35, ease: 'expo.out' });
    },
    get closed() { return state.closed; },
    /** Foto da cena atual (para a sacola). */
    snapshot(width = 360) {
      renderer.render(scene, camera);
      const c = document.createElement('canvas');
      const s = width / canvas.width;
      c.width = width; c.height = Math.round(canvas.height * s);
      c.getContext('2d').drawImage(renderer.domElement, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', 0.82);
    },
    preload(keys) { keys.forEach((k) => makeSoap(k, renderer)); },
  };
}
