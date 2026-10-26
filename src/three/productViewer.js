import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeRenderer } from './gifts.js';
import { fallbackScene } from './fallback.js';
import { advanceSpring, resetSpring, spring } from './productMotion.js';
import { productControls } from './productControls.js';

export function createKitViewer(canvas, key, { reduced = false } = {}, models, makeKit, releaseEnvironment) {
  const renderer = makeRenderer(canvas);
  if (!renderer) return fallbackScene(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  scene.environmentIntensity = .5;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fffaf0', '#93836b', .8));
  const keyLight = new THREE.DirectionalLight('#fff7e9', 2.1);
  keyLight.position.set(-3, 6, 5);
  keyLight.shadow.mapSize.set(1024, 1024);
  Object.assign(keyLight.shadow.camera, { left: -4, right: 4, top: 5, bottom: -4, near: .1, far: 20 });
  keyLight.shadow.normalBias = .025; keyLight.shadow.bias = -.0002;
  keyLight.shadow.radius = 5;
  scene.add(keyLight);
  const fill = new THREE.DirectionalLight('#f0f3ff', .7); fill.position.set(4, 2, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight('#fff0cf', 1.3); rim.position.set(1, 4, -4); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 60);
  const pivot = new THREE.Group(); scene.add(pivot);
  let kit = makeKit(key, renderer); pivot.add(kit);
  let openable = !!kit.userData.openable;
  let disposed = false, running = false, visible = false, raf = 0;
  let dragging = false, pointer = null, last = null, idle = 2, shown = 0;
  let manual = null, replayAt = null;
  let assetsReady = !openable, assetsFailed = false, loadToken = 0;
  let ready = Promise.resolve();
  const opening = spring(reduced && openable ? 1 : 0), entrance = spring(reduced ? 1 : 0);
  const rot = { x: -.08, y: -.38, vx: 0, vy: 0 };
  const rotationX = spring(rot.x), rotationY = spring(rot.y);
  const clock = new THREE.Clock();
  let camZ = 7, camZOpen = 10;
  const framing = spring(0); // 0 = closed shot, 1 = open shot
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: .09, depthWrite: false }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.13; ground.receiveShadow = true; scene.add(ground);

  const controls = productControls(canvas, {
    toggle() {
      manual = !(manual ?? (reduced || shown > .85)); replayAt = null;
      idle = 0; controls.update(openable, manual);
      requestRender();
    },
    replay() {
      manual = reduced; replayAt = reduced ? null : clock.elapsedTime + 1.05; idle = 0;
      rot.x = -.08; rot.y = Math.round(rot.y / (2 * Math.PI)) * 2 * Math.PI - .25;
      rot.vx = rot.vy = 0; controls.update(openable, false);
      requestRender();
    },
  });
  function setupModel() {
    openable = !!kit.userData.openable;
    renderer.shadowMap.enabled = openable;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    keyLight.castShadow = openable; ground.visible = openable;
    ground.position.y = openable ? -models[key].h / 2 - .002 : -1.13;
    ground.material.opacity = openable ? .16 : .09;
    canvas.dataset.productModel = key;
    canvas.dataset.productState = openable ? 'loading' : 'ready';
    // Native cursor stays outside the product, so labels remain unobstructed.
    const host = canvas.parentElement;
    if (openable) host.removeAttribute('data-cursor');
    else host.setAttribute('data-cursor', 'girar');
    controls.update(false, false);
    assetsReady = !openable; assetsFailed = false;
    const token = ++loadToken;
    ready = (kit.userData.ready || Promise.resolve()).then(() => {
      if (token !== loadToken || disposed) return;
      assetsReady = true; shown = 0;
      controls.update(openable, reduced && openable);
      canvas.dataset.productState = 'closed';
      canvas.dispatchEvent(new CustomEvent('productready'));
      requestRender();
    }).catch(() => {
      if (token !== loadToken || disposed) return;
      assetsFailed = true; controls.update(false, false);
      canvas.dataset.productState = 'unavailable';
      canvas.dispatchEvent(new CustomEvent('producterror'));
      return false;
    });
  }
  setupModel();

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tanH = tanV * camera.aspect;
    const m = models[key];
    camZ = Math.max(m.h * (openable ? 1.5 : 1.2) / (2 * tanV), Math.hypot(m.w, m.d) * 1.25 / (2 * tanH)) + .5;
    // Both axes account for the hovering lid, the crescent of bottles and bottom controls.
    camZOpen = openable ? Math.max(4.7 / (2 * tanV), 4.5 / (2 * tanH)) + 1.4 : camZ;
    // Gold dust is sized in world units, so it keeps its look at any canvas size.
    kit.userData.setDustScale?.(.0075 * h * renderer.getPixelRatio() / (2 * tanV));
    if (!running) resetSpring(framing, opening.value);
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);

  const listeners = new AbortController(), signal = listeners.signal;
  canvas.style.touchAction = 'pan-y'; canvas.tabIndex = 0;
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || dragging) return;
    dragging = true; pointer = e.pointerId; last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    rot.vx = rot.vy = 0; idle = 0;
    canvas.setPointerCapture(pointer);
  }, { signal });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== pointer) return;
    const dx = e.clientX - last.x, dy = e.clientY - last.y;
    const elapsed = Math.max(8, e.timeStamp - last.t) / 1000;
    rot.y += dx * .008; rot.x = THREE.MathUtils.clamp(rot.x + dy * .004, -.45, .55);
    rot.vy = THREE.MathUtils.clamp(dx * .008 / elapsed, -3, 3);
    rot.vx = THREE.MathUtils.clamp(dy * .004 / elapsed, -1, 1);
    last = { x: e.clientX, y: e.clientY, t: e.timeStamp }; idle = 0;
    requestRender();
  }, { signal });
  const end = (e) => {
    if (e.pointerId !== pointer) return;
    dragging = false; idle = 0;
    if (e.type === 'pointercancel' || e.timeStamp - last.t > 100 || reduced) rot.vx = rot.vy = 0;
    pointer = null;
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, end, { signal });
  canvas.addEventListener('keydown', (e) => {
    const delta = { ArrowLeft: -.3, ArrowRight: .3, ArrowUp: -.1, ArrowDown: .1 }[e.key];
    if (!delta) return;
    e.preventDefault(); idle = 0; rot.vx = rot.vy = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') rot.x = THREE.MathUtils.clamp(rot.x + delta, -.45, .55);
    else rot.y += delta;
    requestRender();
  }, { signal });

  const tick = () => frame();
  function frame(forcedDt) {
    if (disposed) return;
    const dt = typeof forcedDt === 'number' ? forcedDt : Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    if (assetsReady) shown += dt;
    if (replayAt !== null && t >= replayAt) { manual = true; replayAt = null; }
    const wantsOpen = openable && (manual ?? (reduced || shown > .85));
    const open = reduced ? (resetSpring(opening, wantsOpen ? 1 : 0), opening.value) : advanceSpring(opening, wantsOpen ? 1 : 0, dt, 100, 17);
    if (openable) {
      kit.userData.setOpen(open, dt, reduced);
      controls.update(assetsReady && !assetsFailed, !!wantsOpen);
      if (assetsReady && !assetsFailed) canvas.dataset.productState = Math.abs(open - (wantsOpen ? 1 : 0)) < .005 ? (wantsOpen ? 'open' : 'closed') : (wantsOpen ? 'opening' : 'closing');
    }
    if (!dragging) {
      rot.vy *= Math.exp(-5 * dt); rot.vx *= Math.exp(-7 * dt);
      rot.y += rot.vy * dt; rot.x = THREE.MathUtils.clamp(rot.x + rot.vx * dt, -.45, .55); idle += dt;
      if (!reduced && idle > 3) {
        const base = Math.round(rot.y / (2 * Math.PI)) * 2 * Math.PI;
        const target = base - .22 + Math.sin(t * .28) * (openable ? .13 : .42);
        rot.y = THREE.MathUtils.damp(rot.y, target, 1.4, dt);
        rot.x = THREE.MathUtils.damp(rot.x, openable ? .06 * open : -.08, 1.4, dt);
      }
    }
    const intro = reduced ? 1 : advanceSpring(entrance, 1, dt, 100, 17);
    const rx = reduced ? rot.x : advanceSpring(rotationX, rot.x, dt, 300, 30);
    const ry = reduced ? rot.y : advanceSpring(rotationY, rot.y, dt, 300, 30);
    pivot.rotation.set(rx, ry - (1 - intro) * .65, 0);
    pivot.scale.setScalar(.92 + .08 * intro);
    // An openable box sits on the table (no float); the camera rises to look into it and over the bottles.
    pivot.position.y = reduced || openable ? 0 : Math.sin(t * .8) * .018;
    // Frame what is actually out of the box: on closing the bottles return after the button flips.
    // Opening: start pulling back on the click, so the first bottles never leave the frame.
    const spread = openable ? Math.max(wantsOpen ? 1 : 0, kit.userData.extent?.() ?? 0) : 0;
    const f = reduced ? spread : advanceSpring(framing, spread, dt, 110, 20);
    camera.position.set(0, .2 + 1.6 * f, camZ + (camZOpen - camZ) * f);
    camera.lookAt(0, openable ? -.1 + .12 * f : 0, 0);
    renderer.render(scene, camera);
    if (running && !reduced) raf = requestAnimationFrame(tick);
  }
  function requestRender() {
    if (!reduced || !visible || document.hidden || disposed) return;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function syncVisibility() {
    const shouldRun = visible && !document.hidden && !canvas.hidden && !disposed;
    if (shouldRun && !running) { running = true; clock.getDelta(); resize(); raf = requestAnimationFrame(tick); }
    else if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
  }
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncVisibility(); }, { threshold: .05 });
  intersection.observe(canvas);
  document.addEventListener('visibilitychange', syncVisibility, { signal });
  const hiddenObserver = new MutationObserver(syncVisibility); hiddenObserver.observe(canvas, { attributes: true, attributeFilter: ['hidden'] });
  resize();

  function disposeKit(object) {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    object.traverse((mesh) => {
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh.material) for (const mat of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(mat);
    });
    materials.forEach((mat) => { for (const k of ['map', 'bumpMap']) if (mat[k]) textures.add(mat[k]); mat.dispose(); });
    textures.forEach((texture) => { texture.userData.disposed = true; texture.dispose(); }); geometries.forEach((geo) => geo.dispose());
  }
  const api = {
    get ready() { return ready; },
    get available() { return !assetsFailed; },
    rot, setIdle(value) { idle = value; },
    replayIntro() {
      if (reduced) return;
      resetSpring(entrance, 0); shown = 0; manual = null; replayAt = null;
      resetSpring(opening, 0); resetSpring(framing, 0); kit.userData.setOpen?.(0, 0, true);
    },
    setModel(next) {
      if (next === key || !models[next]) return ready;
      const previous = kit;
      pivot.remove(previous); key = next; kit = makeKit(key, renderer); pivot.add(kit);
      disposeKit(previous);
      shown = 0; manual = null; replayAt = null;
      resetSpring(opening, reduced && kit.userData.openable ? 1 : 0); resetSpring(framing, opening.value);
      resetSpring(entrance, reduced ? 1 : 0);
      setupModel(); resize();
      if (!running) { clock.getDelta(); frame(); }
      return ready;
    },
    destroy() {
      if (disposed) return;
      disposed = true; running = false; cancelAnimationFrame(raf);
      listeners.abort(); resizeObserver.disconnect(); intersection.disconnect(); hiddenObserver.disconnect();
      controls.destroy(); disposeKit(kit); environment.dispose(); releaseEnvironment?.(renderer); keyLight.shadow.dispose(); ground.geometry.dispose(); ground.material.dispose(); renderer.dispose();
    },
  };
  if (import.meta.env.DEV) {
    // Dev only: advance the animation deterministically (screenshots of a hidden or throttled tab).
    canvas.__productStep = (seconds, open = manual) => {
      const wasRunning = running; running = false; cancelAnimationFrame(raf);
      if (open !== undefined) manual = open;
      for (let i = 0; i < Math.round(seconds * 60); i++) frame(1 / 60);
      running = wasRunning; if (running) raf = requestAnimationFrame(tick);
      return canvas.dataset.productState;
    };
  }
  window.addEventListener('pagehide', (event) => { if (!event.persisted) api.destroy(); }, { signal });
  window.addEventListener('experiencechange', () => api.destroy(), { signal, once: true });
  return api;
}
