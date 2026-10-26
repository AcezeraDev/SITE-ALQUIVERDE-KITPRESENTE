import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeKitBox, KIT_MODELS } from '../src/three/kit3d.js';

// Um único contexto para a coleção inteira; os objetos são os mesmos modelos da loja.
export function createStage(canvas, { concept, items, reduced, onSelect }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'default' });
  } catch {
    canvas.hidden = true;
    canvas.dataset.renderer = 'photo';
    return { available: false, setProgress() {}, setModel() {}, reset() {} };
  }
  canvas.dataset.renderer = 'webgl';
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = concept === 'orbita' ? 0.8 : 0.65;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff9ed', concept === 'orbita' ? '#722939' : '#a5a699', 0.55));
  const key = new THREE.DirectionalLight('#fff4df', 1.7); key.position.set(-4, 5, 7); scene.add(key);
  const rim = new THREE.DirectionalLight('#ffedc9', 1.1); rim.position.set(5, 4, 1); scene.add(rim);

  function calibrate(group) {
    group.traverse((node) => {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.filter(Boolean).forEach((material) => {
        if (material.transparent && material.opacity < 0.2) material.opacity = 0.035;
      });
    });
    return group;
  }
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(25,12,7,.35)'); gradient.addColorStop(1, 'rgba(25,12,7,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  function cornersFor(model) {
    const bounds = new THREE.Box3().setFromObject(model);
    return Array.from({ length: 8 }, (_, n) => new THREE.Vector3(n & 1 ? bounds.max.x : bounds.min.x, n & 2 ? bounds.max.y : bounds.min.y, n & 4 ? bounds.max.z : bounds.min.z));
  }
  const objects = items.map((item) => {
    const pivot = new THREE.Group();
    const model = calibrate(makeKitBox(item.model, renderer));
    pivot.add(model); scene.add(pivot);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.5), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
    return { pivot, model, shadow, corners: cornersFor(model), modelKey: item.model };
  });

  let position = 0, active = 0, visible = true, raf = 0, lastTime = 0;
  let inspection = { chapter: 0, turn: 0, travel: 0, progress: 0 };
  let width = 1, height = 1, mobile = false;
  let cameraDistance = 8;
  let drag = null, yaw = 0, pitch = 0, dragUntil = 0;
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const projected = new THREE.Vector3(), center = new THREE.Vector3();
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    if (!width || !height) return;
    mobile = innerWidth < 760;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Enquadramento em unidades do mundo; o objeto fica inteiro também no celular.
    const worldWidth = concept === 'capitulos' ? (mobile ? 4.6 : 5.1) : mobile ? 5.4 : 10.5;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(15));
    const minimumHeight = concept === 'capitulos' ? 4.6 : 3.4;
    cameraDistance = Math.max(5.5, minimumHeight / (2 * halfFov), worldWidth / (2 * halfFov * camera.aspect));
    camera.position.set(0, 0.12, cameraDistance);
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); draw(performance.now()); }); ro.observe(canvas);
  const wrap = (value) => ((value + items.length * 1.5) % items.length) - items.length / 2;
  function draw(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.05); lastTime = time;
    parallax.x += (parallax.tx - parallax.x) * Math.min(1, dt * 4);
    parallax.y += (parallax.ty - parallax.y) * Math.min(1, dt * 4);
    camera.position.x = parallax.x * 0.24;
    const inspectionArc = reduced ? 0 : Math.sin(inspection.turn * Math.PI);
    const travelArc = reduced ? 0 : Math.sin(inspection.travel * Math.PI);
    camera.position.y = 0.12 + parallax.y * 0.14 + inspectionArc * 0.08;
    camera.position.z = cameraDistance + inspectionArc * 0.3 + travelArc * 0.3;
    camera.lookAt(parallax.x * 0.04, parallax.y * 0.025, 0);
    camera.rotation.z += travelArc * 0.006;
    camera.updateMatrixWorld();
    if (!drag && time > dragUntil) { yaw *= Math.exp(-dt * 2.5); pitch *= Math.exp(-dt * 2.5); }
    objects.forEach((object, i) => {
      const distance = wrap(i - position);
      const a = Math.abs(distance);
      const focus = Math.max(0, 1 - a);
      const heroTurn = i === inspection.chapter ? inspection.turn : i < inspection.chapter ? 1 : 0;
      const lift = Math.sin(heroTurn * Math.PI) * focus;
      const rotation = reduced ? 0 : heroTurn * Math.PI * 2;
      let x, y, z, scale, rx, ry, rz;
      if (concept === 'galeria') {
        x = mobile ? distance * 4.8 : (distance >= 0 ? -1.4 + 3.5 * distance - 0.45 * distance * distance : distance * 4.3 - 1.4);
        y = (mobile ? -0.05 : -0.15 + a * 0.06) + lift * 0.08 + travelArc * 0.12 * focus;
        z = -a * 2.1;
        scale = mobile ? 1.12 - Math.min(a, 2) * 0.14 : 1.35 - Math.min(a, 2) * 0.2;
        rx = -0.035 + Math.sin(heroTurn * Math.PI * 2) * 0.055 * focus;
        ry = -0.12 + rotation - distance * 0.2;
        rz = Math.sin(distance * Math.PI) * 0.035;
      } else if (concept === 'orbita') {
        x = mobile ? distance * 4 : Math.sin(distance * 0.7) * 4.7;
        y = -0.05 + a * 0.1 + lift * 0.12;
        z = mobile ? -a * 1.6 : (Math.cos(distance * 0.7) - 1) * 4.5;
        scale = 1.33 - Math.min(a, 2) * 0.17;
        rx = 0.025 + Math.sin(heroTurn * Math.PI * 2) * 0.11 * focus;
        ry = -0.08 - rotation - distance * 0.3;
        rz = -distance * 0.025 + travelArc * focus * 0.035;
      } else {
        x = distance * 3.5;
        y = distance * -2.8 + lift * 0.1;
        z = -a * 1.8;
        const m = KIT_MODELS[object.modelKey];
        scale = (m.w > 2 ? 1.12 : 1.8) * (1 - Math.min(a, 2) * 0.12);
        rx = 0.06 + Math.sin(heroTurn * Math.PI * 2) * 0.1 * focus;
        ry = -0.14 + rotation - distance * 0.25;
        rz = -0.12 + distance * 0.2;
      }
      object.pivot.position.set(x, y, z);
      // Folga para os cantos da caixa quando a rotação os aproxima da câmera.
      // A frente recupera sua escala original ao completar a volta.
      scale *= 1 - lift * 0.11;
      object.pivot.scale.setScalar(Math.max(0.4, scale));
      // O scroll é a fonte da rotação. Sem rolagem ou gesto, a peça permanece imóvel.
      // Vizinhos respondem só com uma pequena contrarrotação, em outra profundidade.
      const counterTurn = reduced ? 0 : Math.sin(inspection.progress * 0.7 + i) * 0.055 * (1 - focus);
      object.pivot.rotation.set(rx + pitch * focus, ry + yaw * focus + counterTurn, rz);
      if (a < 0.05) {
        // Mede a projeção dos oito cantos, incluindo a parte do laço que sai da caixa.
        // Corrige só o enquadramento do destaque; os vizinhos podem entrar pelas bordas.
        for (let pass = 0; pass < 2; pass++) {
          object.pivot.updateMatrixWorld(true);
          center.copy(object.pivot.position).project(camera);
          let fit = 1;
          for (const corner of object.corners) {
            projected.copy(corner).applyMatrix4(object.pivot.matrixWorld).project(camera);
            for (const axis of ['x', 'y']) {
              const extent = projected[axis] - center[axis];
              if (Math.abs(extent) > 0.001) fit = Math.min(fit, (0.96 - Math.sign(extent) * center[axis]) / Math.abs(extent));
            }
          }
          scale *= Math.max(0.1, fit);
          object.pivot.scale.setScalar(scale);
        }
      }
      object.pivot.visible = a < (concept === 'capitulos' ? 1.2 : 2.5) && (concept !== 'galeria' || mobile || distance > -0.9) && (concept !== 'capitulos' || distance > -0.85);
      object.shadow.position.set(x, y - 1.05 * scale - 0.04, z);
      object.shadow.scale.setScalar(scale * (1 - lift * 0.06)); object.shadow.visible = object.pivot.visible;
      object.shadow.material.opacity = 0.9 - Math.min(a, 2) * 0.22 - lift * 0.12;
    });
    renderer.render(scene, camera);
  }
  function frame(time) { draw(time); if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame); }
  function start() { cancelAnimationFrame(raf); if (visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame); else draw(performance.now()); }
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }); io.observe(canvas);
  const previousLoad = THREE.DefaultLoadingManager.onLoad;
  THREE.DefaultLoadingManager.onLoad = () => { previousLoad?.(); if (reduced) draw(performance.now()); };
  document.addEventListener('visibilitychange', start);
  canvas.addEventListener('pointerdown', (event) => {
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: event.clientX, originY: event.clientY };
    canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) {
      if (!reduced && !mobile && event.pointerType === 'mouse') {
        const rect = canvas.getBoundingClientRect();
        parallax.tx = (event.clientX - rect.left) / rect.width - 0.5;
        parallax.ty = 0.5 - (event.clientY - rect.top) / rect.height;
      }
      return;
    }
    if (event.pointerId !== drag.id) return;
    yaw += (event.clientX - drag.x) * 0.012;
    pitch = THREE.MathUtils.clamp(pitch + (event.clientY - drag.y) * 0.004, -0.45, 0.45);
    drag.x = event.clientX; drag.y = event.clientY; dragUntil = performance.now() + 2200;
    if (reduced) draw(performance.now());
  });
  canvas.addEventListener('pointerleave', () => { parallax.tx = parallax.ty = 0; });
  function endDrag(event) {
    if (!drag) return;
    if (event.type === 'pointerup' && Math.hypot(event.clientX - drag.originX, event.clientY - drag.originY) < 8) {
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(objects.map((o) => o.pivot), true)[0];
      if (hit) { const index = objects.findIndex((o) => { let n = hit.object; while (n) { if (n === o.pivot) return true; n = n.parent; } return false; }); if (index >= 0 && index !== active) onSelect(index); }
    }
    drag = null; canvas.classList.remove('is-dragging');
  }
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); yaw += event.key === 'ArrowRight' ? 0.35 : -0.35; dragUntil = performance.now() + 2500;
      if (reduced) draw(performance.now());
    }
  });
  canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); visible = false; cancelAnimationFrame(raf); canvas.hidden = true; canvas.dispatchEvent(new Event('stageunavailable')); });
  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', start);
    THREE.DefaultLoadingManager.onLoad = previousLoad;
    scene.traverse((node) => { node.geometry?.dispose(); const materials = Array.isArray(node.material) ? node.material : [node.material]; materials.filter(Boolean).forEach((m) => { m.map?.dispose(); m.dispose(); }); });
    environment.dispose(); renderer.dispose();
  }, { once: true });
  resize(); start();
  return {
    available: true,
    setProgress(value, motion) { position = value; inspection = motion; active = Math.round(value) % items.length; canvas.dataset.activeModel = objects[active].modelKey; if (reduced) draw(performance.now()); },
    setModel(index, key) {
      const item = objects[index]; if (item.modelKey === key) return;
      item.pivot.remove(item.model);
      item.model.traverse((node) => { node.geometry?.dispose(); const mats = Array.isArray(node.material) ? node.material : [node.material]; mats.filter(Boolean).forEach((m) => { m.map?.dispose(); m.dispose(); }); });
      item.model = calibrate(makeKitBox(key, renderer)); item.modelKey = key; item.corners = cornersFor(item.model); item.pivot.add(item.model); if (reduced) draw(performance.now());
      if (index === active) canvas.dataset.activeModel = key;
    },
    reset() { yaw = pitch = 0; if (reduced) draw(performance.now()); },
  };
}
