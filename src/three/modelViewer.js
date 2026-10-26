import { fallbackScene } from './fallback.js';
// Modelos 3D prontos (GLB feitos no Blender — frascos, vela): carregar, normalizar e mostrar numa vitrine que gira.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { makeRenderer, roomEnvironment } from './gifts.js';

const loader = new GLTFLoader();
const cache = new Map();

/** Carrega o GLB uma vez; devolve uma cópia em pé, com a base em y=0 e a altura pedida. */
export function loadModel(url, height = 2) {
  if (!cache.has(url)) {
    cache.set(url, loader.loadAsync(url).then((g) => {
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = true;
        const m = o.material;
        // rótulo: recorte por alpha (onde o rótulo acaba aparece o vidro), sem ordenar transparência
        if (m.name === 'rotulo' || m.transparent) { m.transparent = false; m.alphaTest = 0.5; m.depthWrite = true; }
        if (m.map) m.map.anisotropy = 8;
      });
      return g.scene;
    }));
  }
  return cache.get(url).then((src) => {
    const obj = src.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const s = height / size.y;
    obj.scale.setScalar(s);
    const c = box.getCenter(new THREE.Vector3());
    obj.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    const g = new THREE.Group(); g.add(obj);
    return g;
  });
}

/** Vitrine de um modelo: arrasta para girar (inércia), gira devagar parado, só desenha quando visível. */
export function initModelViewer(canvas, url, { reduced = false } = {}) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return fallbackScene(canvas, { photo: url.replace('/models/', '/kits/').replace('.glb', '.webp') });
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  scene.environment = roomEnvironment(renderer).texture;
  scene.environmentIntensity = 0.7;
  scene.add(new THREE.HemisphereLight('#fff6e6', '#6b4a3a', 0.5));
  const key = new THREE.DirectionalLight('#fff0dc', 1.6); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#f3d29c', 1.4); rim.position.set(4, 2, -4); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 40);
  const pivot = new THREE.Group(); scene.add(pivot);
  const H = 2;

  // sombra de contato
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(60,30,25,.42)'); gr.addColorStop(1, 'rgba(60,30,25,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);

  let width = 1;
  loadModel(url, H).then((m) => {
    pivot.add(m);
    const b = new THREE.Box3().setFromObject(m); width = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
    shadow.scale.set(width * 1.1, width * 1.1, 1);
    resize(); if (!running) renderer.render(scene, camera);
  });

  const rot = { y: -0.25, vy: 0 };
  let dragging = false, last = 0, idle = 2;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; last = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!dragging) return; rot.vy = (e.clientX - last) * 0.014; last = e.clientX; rot.y += rot.vy; idle = 0; });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => { const s = { ArrowLeft: -0.3, ArrowRight: 0.3 }[e.key]; if (s) { e.preventDefault(); rot.vy = s * 0.3; idle = 0; } });

  const clock = new THREE.Clock();
  let raf = 0, running = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fovV = (camera.fov * Math.PI) / 180;
    const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
    // deixa o terço de baixo livre para o nome do item
    const dist = Math.max((H * 1.95) / 2 / Math.tan(fovV / 2), (width * 1.9) / 2 / Math.tan(fovH / 2));
    camera.position.set(0, H * 0.75 + dist * 0.16, dist);
    camera.lookAt(0, H * 0.3, 0);
    camera.updateProjectionMatrix();
  }
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!dragging) {
      rot.vy *= 0.94; rot.y += rot.vy; idle += dt;
      if (idle > 1.5 && !reduced) rot.y += dt * 0.4;
    }
    pivot.rotation.y = rot.y;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }
  resize();
  addEventListener('resize', resize);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; clock.getDelta(); resize(); raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0.05 }).observe(canvas);
  if (reduced) setTimeout(() => renderer.render(scene, camera), 400);
  return { rot };
}
