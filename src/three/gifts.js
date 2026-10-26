// Construtores compartilhados: caixa de presente procedural (papel + fita + laço) e poeira dourada.
import * as THREE from 'three';

const texCache = new Map();

/** Textura de papel: ruído fino + listras sutis, gerada em canvas. */
export function paperTexture(hex, { stripes = false } = {}) {
  const key = hex + stripes;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = hex;
  g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  if (stripes) {
    g.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 14, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  texCache.set(key, t);
  return t;
}

function ribbonMat(color) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0.15, sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color('#fff2d6') });
}

/** Laço: duas alças (toro achatado), nó e duas pontas. */
export function makeBow(color, size = 1) {
  const bow = new THREE.Group();
  const mat = ribbonMat(color);
  const loopGeo = new THREE.TorusGeometry(0.32 * size, 0.07 * size, 12, 40);
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(loopGeo, mat);
    loop.scale.set(1, 0.62, 0.55);
    loop.position.set(0.3 * size * side, 0.12 * size, 0);
    loop.rotation.set(Math.PI / 2.4, 0, side * 0.35);
    bow.add(loop);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.13 * size, 0.02 * size, 0.55 * size), mat);
    tail.position.set(0.16 * size * side, 0.02 * size, 0.22 * size);
    tail.rotation.set(0.2, side * 0.6, 0);
    bow.add(tail);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.11 * size, 20, 16), mat);
  knot.scale.set(1, 0.8, 0.9);
  knot.position.y = 0.08 * size;
  bow.add(knot);
  bow.traverse((o) => { o.castShadow = true; });
  return bow;
}

/**
 * Caixa de presente com tampa separada.
 * Retorna { group, body, lid, bow, ribbons } para animar tampa e laço.
 */
export function makeGift({ w = 1, h = 0.8, d = 1, paper = '#752f3b', ribbon = '#d8c193', stripes = false, hollow = false } = {}) {
  const group = new THREE.Group();
  const paperMat = new THREE.MeshStandardMaterial({ map: paperTexture(paper, { stripes }), roughness: 0.82, metalness: 0 });
  const rMat = ribbonMat(ribbon);
  const rw = Math.min(w, d) * 0.16;

  const body = new THREE.Group();
  if (hollow) {
    // caixa aberta por cima (5 faces) para a cena de "abrir o presente"
    const t = 0.03;
    const inner = new THREE.MeshStandardMaterial({ color: new THREE.Color(paper).multiplyScalar(0.55), roughness: 0.9, side: THREE.DoubleSide });
    const parts = [
      [w, t, d, 0, -h / 2 + t / 2, 0],
      [w, h, t, 0, 0, d / 2 - t / 2],
      [w, h, t, 0, 0, -d / 2 + t / 2],
      [t, h, d, w / 2 - t / 2, 0, 0],
      [t, h, d, -w / 2 + t / 2, 0, 0],
    ];
    for (const [a, b, c, x, y, z] of parts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), [paperMat, paperMat, inner, paperMat, paperMat, paperMat]);
      m.position.set(x, y, z);
      body.add(m);
    }
  } else {
    body.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), paperMat));
  }
  // fitas verticais no corpo
  const bandA = new THREE.Mesh(new THREE.BoxGeometry(rw, h + 0.004, d + 0.012), rMat);
  const bandB = new THREE.Mesh(new THREE.BoxGeometry(w + 0.012, h + 0.004, rw), rMat);
  if (hollow) { bandA.scale.y = bandB.scale.y = 1; }
  body.add(bandA, bandB);
  group.add(body);

  const lid = new THREE.Group();
  const lh = h * 0.22;
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, lh, d * 1.05), paperMat);
  const lidA = new THREE.Mesh(new THREE.BoxGeometry(rw, lh + 0.006, d * 1.05 + 0.012), rMat);
  const lidB = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05 + 0.012, lh + 0.006, rw), rMat);
  lid.add(lidMesh, lidA, lidB);
  const bow = makeBow(ribbon, Math.min(w, d) * 0.9);
  bow.position.y = lh / 2;
  lid.add(bow);
  lid.position.y = h / 2 + lh / 2 - 0.02;
  group.add(lid);

  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group, body, lid, bow, lidHeight: lh };
}

/** Poeira dourada cintilante (Points com shader aditivo). */
export function makeSparkles(count = 400, spread = [14, 9, 6], color = '#e8cf98') {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * spread[0];
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    seed[i] = Math.random() * 100;
    size[i] = 0.4 + Math.random() * 1.4;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uPixel: { value: Math.min(window.devicePixelRatio, 1.75) }, uOpacity: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float aSeed; attribute float aSize;
      uniform float uTime; uniform float uPixel;
      varying float vTw;
      void main(){
        vec3 p = position;
        p.y += sin(uTime*0.25 + aSeed)*0.25 + mod(uTime*0.06 + aSeed*0.13, 1.0)*0.6 - 0.3;
        p.x += cos(uTime*0.2 + aSeed*1.7)*0.18;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_Position = projectionMatrix * mv;
        vTw = 0.45 + 0.55*sin(uTime*2.2 + aSeed*6.0);
        gl_PointSize = aSize * 34.0 * uPixel / -mv.z;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uOpacity; varying float vTw;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float core = smoothstep(0.5, 0.0, d);
        float cross = max(smoothstep(0.06,0.0,abs(uv.x))*smoothstep(0.5,0.0,abs(uv.y)), smoothstep(0.06,0.0,abs(uv.y))*smoothstep(0.5,0.0,abs(uv.x)));
        float a = (pow(core, 3.0) + cross*0.7) * vTw * uOpacity;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  return { points, mat };
}

export function makeRenderer(canvas, { alpha = true, preserveDrawingBuffer = false } = {}) {
  let r;
  try {
    r = new THREE.WebGLRenderer({ canvas, alpha, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer });
  } catch (error) {
    console.warn('Visualização 3D indisponível; usando fotos.', error);
    return null;
  }
  r.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  return r;
}

export function warmLights(scene, { shadow = false } = {}) {
  scene.add(new THREE.HemisphereLight('#fff4e2', '#6b3a3a', 1.25));
  const key = new THREE.DirectionalLight('#ffe7c4', 2.4);
  key.position.set(-4, 6, 5);
  if (shadow) {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1; key.shadow.camera.far = 20;
    key.shadow.radius = 6;
  }
  scene.add(key);
  const rim = new THREE.DirectionalLight('#f3c6a0', 1.1);
  rim.position.set(5, 2, -4);
  scene.add(rim);
  return key;
}
