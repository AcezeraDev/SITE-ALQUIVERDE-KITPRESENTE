import { fallbackScene } from './fallback.js';
// Cena do hero: caixas de presente 3D flutuando nas bordas + poeira dourada, com parallax do ponteiro.
import * as THREE from 'three';
import { makeGift, makeSparkles, makeRenderer, warmLights } from './gifts.js';
import { makeSoap } from './soap3d.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const HERO_SOAPS = { 1: 'aroeira', 3: 'calendula', 5: 'barbatimao', 6: 'coco' };

const PALETTE = [
  { paper: '#752f3b', ribbon: '#d8c193' },
  { paper: '#284a31', ribbon: '#efe2c4' },
  { paper: '#f1e6cc', ribbon: '#752f3b', stripes: true },
  { paper: '#b39360', ribbon: '#fffcf5' },
  { paper: '#8d3a46', ribbon: '#284a31' },
  { paper: '#e9dcc0', ribbon: '#284a31', stripes: true },
];

// [x, y, z, escala] — posicionadas nas laterais e no alto para não cobrir o título
const SLOTS = [
  [-5.2, 2.1, -1.0, 0.85], [5.0, 2.4, -1.4, 0.75], [-3.6, -0.6, -2.5, 0.55],
  [4.2, -0.2, -0.6, 0.95], [-6.3, -1.4, -3.5, 0.7], [6.6, 0.9, -3.8, 0.6],
  [-7.4, 3.4, -5.5, 0.55], [7.6, -2.0, -4.5, 0.6],
];

export function initHero(canvas) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return fallbackScene(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 11);
  warmLights(scene);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;

  const world = new THREE.Group();
  scene.add(world);
  const gifts = SLOTS.map(([x, y, z, s], i) => {
    const p = PALETTE[i % PALETTE.length];
    let g;
    if (HERO_SOAPS[i]) {
      const group = new THREE.Group();
      const soap = makeSoap(HERO_SOAPS[i], renderer);
      soap.scale.setScalar(0.85);
      group.add(soap);
      g = { group, lid: new THREE.Object3D() };
    } else {
      g = makeGift({ w: 1, h: 0.75 + (i % 3) * 0.15, d: 1, ...p });
    }
    g.group.position.set(x, y, z);
    g.group.scale.setScalar(s);
    g.group.rotation.set(Math.random() * 0.6 - 0.3, Math.random() * Math.PI, Math.random() * 0.5 - 0.25);
    g.base = { x, y, z, s, phase: Math.random() * Math.PI * 2, spin: (Math.random() * 0.5 + 0.2) * (i % 2 ? 1 : -1) };
    g.lidY = g.lid.position.y;
    world.add(g.group);
    return g;
  });

  const dust = makeSparkles(420, [18, 10, 8]);
  scene.add(dust.points);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; };
  addEventListener('pointermove', onMove, { passive: true });

  const layout = { xf: 1, sf: 1 };
  let scrollP = 0;
  let intro = 0; // 0→1 animado pelo GSAP na entrada
  const clock = new THREE.Clock();
  let raf = 0, running = false;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // em telas estreitas, aproxima as caixas do centro
    // mantém as caixas nas bordas visíveis, longe do texto central
    const halfW = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z * camera.aspect;
    layout.xf = Math.min(1, (halfW * 0.95) / 6.6);
    layout.sf = w < 760 ? 0.42 : w < 1100 ? 0.8 : 1;
    camera.updateProjectionMatrix();
  }

  function frame() {
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    camera.position.x = mouse.x * 0.7;
    camera.position.y = -mouse.y * 0.45 - scrollP * 1.5;
    camera.lookAt(0, -scrollP * 1.5, 0);

    gifts.forEach((g, i) => {
      const b = g.base;
      const k = Math.min(1, Math.max(0, intro * 1.6 - i * 0.08));
      const ease = 1 - Math.pow(1 - k, 3);
      g.group.position.x = b.x * layout.xf * (0.6 + 0.4 * ease) * (1 + scrollP * 0.35);
      g.group.position.y = b.y + Math.sin(t * 0.8 + b.phase) * 0.18 - (1 - ease) * 4 + scrollP * (2 + i * 0.3);
      g.group.position.z = b.z;
      g.group.rotation.y += 0.0035 * b.spin;
      g.group.rotation.x = Math.sin(t * 0.5 + b.phase) * 0.15;
      g.group.scale.setScalar(b.s * layout.sf * ease);
      g.lid.position.y = g.lidY + Math.max(0, Math.sin(t * 1.3 + b.phase)) * 0.04;
    });
    dust.mat.uniforms.uTime.value = t;
    dust.mat.uniforms.uOpacity.value = Math.min(1, intro * 1.4) * (1 - scrollP * 0.6);
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);

  return {
    start() { if (!running) { running = true; clock.start(); raf = requestAnimationFrame(frame); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { frame(); },
    setScroll(p) { scrollP = p; },
    get intro() { return intro; },
    set intro(v) { intro = v; },
  };
}
