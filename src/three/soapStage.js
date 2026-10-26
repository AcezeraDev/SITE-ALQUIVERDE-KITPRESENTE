import { fallbackScene } from './fallback.js';
// Vitrine 3D dos sabonetes: arrasta para girar (com inércia), gira sozinho quando parado,
// troca de sabonete com giro de carta, flutua sobre uma sombra suave.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeRenderer, makeSparkles } from './gifts.js';
import { makeSoap, SOAP_SIZE } from './soap3d.js';

export function initSoapStage(canvas, { initial = 'aroeira', reduced = false } = {}) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return fallbackScene(canvas, { soap: initial });
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  scene.add(new THREE.HemisphereLight('#fff6e6', '#6b4a3a', 0.6));
  const key = new THREE.DirectionalLight('#fff0dc', 1.5);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#f3d29c', 1.2);
  rim.position.set(4, 1.5, -4);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
  camera.position.set(0, 0.25, 6.2);

  // sombra de contato
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(60,30,25,.42)'); gr.addColorStop(1, 'rgba(60,30,25,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.85;
  scene.add(shadow);

  const dust = makeSparkles(90, [5, 3, 2], '#e8cf98');
  scene.add(dust.points);

  // pivô: o giro do usuário fica no pivô; a troca anima o "holder"
  const pivot = new THREE.Group();
  const holder = new THREE.Group();
  pivot.add(holder);
  scene.add(pivot);
  const soaps = new Map();
  const get = (k) => { if (!soaps.has(k)) soaps.set(k, makeSoap(k, renderer)); return soaps.get(k); };
  let current = get(initial);
  holder.add(current);

  /* ---- arrastar com inércia ---- */
  const rot = { x: -0.22, y: -0.42, vx: 0, vy: 0 };
  let dragging = false, last = null, idle = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; last = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-grabbing'); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    rot.vy = dx * 0.012; rot.vx = dy * 0.008;
    rot.y += rot.vy; rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -0.9, 0.9);
    idle = 0;
  });
  const end = () => { dragging = false; canvas.classList.remove('is-grabbing'); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  // teclado: setas giram (alternativa ao arrasto)
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: [0, -0.3], ArrowRight: [0, 0.3], ArrowUp: [-0.2, 0], ArrowDown: [0.2, 0] }[e.key];
    if (!step) return;
    e.preventDefault();
    gsap.to(rot, { x: THREE.MathUtils.clamp(rot.x + step[0], -0.9, 0.9), y: rot.y + step[1], duration: 0.5, ease: 'power3.out' });
    idle = 0;
  });

  let scrollSpin = 0;
  const clock = new THREE.Clock();
  let raf = 0, running = false;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // garante que o sabonete inteiro caiba girando (diagonal da caixa)
    const need = Math.hypot(SOAP_SIZE.w, SOAP_SIZE.d) * 1.3;
    const fovH = 2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
    camera.position.z = Math.max(4.6, need / 2 / Math.tan(fovH / 2) + 0.4);
    camera.updateProjectionMatrix();
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (!dragging) {
      rot.vy *= 0.94; rot.vx *= 0.9;
      rot.y += rot.vy; rot.x = THREE.MathUtils.clamp(rot.x + rot.vx, -0.9, 0.9);
      idle += dt;
      if (idle > 1.6 && !reduced) rot.y += dt * 0.35 * Math.min(1, (idle - 1.6) / 1.5);
      if (idle > 1.6) rot.x += (-0.18 - rot.x) * 0.02;
    }
    pivot.rotation.set(rot.x, rot.y + scrollSpin, 0);
    pivot.position.y = 0.3;
    holder.position.y = reduced ? 0 : Math.sin(t * 1.2) * 0.06;
    shadow.scale.setScalar(1 - holder.position.y * 0.6);
    dust.mat.uniforms.uTime.value = t;
    dust.mat.uniforms.uOpacity.value = 0.55;
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);

  return {
    start() { if (!running) { running = true; clock.getDelta(); raf = requestAnimationFrame(frame); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { frame(); },
    set scrollSpin(v) { scrollSpin = v; },
    /** Troca o sabonete com giro de carta: sai girando para um lado, entra pelo outro. */
    show(k) {
      const next = get(k);
      if (next === current) return;
      const prev = current;
      current = next;
      idle = 0;
      if (reduced) { holder.remove(prev); holder.add(next); frame(); return; }
      gsap.timeline({ overwrite: true })
        .to(holder.rotation, { y: Math.PI / 2, duration: 0.28, ease: 'power3.in' })
        .to(holder.scale, { x: 0.86, y: 0.86, z: 0.86, duration: 0.28, ease: 'power3.in' }, '<')
        .add(() => { holder.remove(prev); holder.add(next); holder.rotation.y = -Math.PI / 2; })
        .to(holder.rotation, { y: 0, duration: 0.8, ease: 'expo.out' })
        .to(holder.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'expo.out' }, '<');
    },
    preload(keys) { keys.forEach(get); },
  };
}
