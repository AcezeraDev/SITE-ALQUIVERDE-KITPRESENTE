// Fotos 3D para o catálogo em PDF: as mesmas caixas, sabonetes e frasco do site, renderizados parados
// em fundo transparente com sombra de contato. Uso: tools/pdf/build-catalogo.mjs abre esta página e salva os PNGs.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeKitBox, KIT_MODELS } from '../../src/three/kit3d.js';
import { makeSoap } from '../../src/three/soap3d.js';
import { loadModel } from '../../src/three/modelViewer.js';

const SIZE = 1400;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(SIZE, SIZE);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const manager = THREE.DefaultLoadingManager;
let pending = 0;
manager.onStart = () => { pending++; };
manager.onLoad = () => { pending = 0; };
const idle = async () => {
  for (let i = 0; i < 200; i++) {
    await new Promise((r) => setTimeout(r, 60));
    if (!manager.isLoading && pending === 0) break;
  }
  await new Promise((r) => setTimeout(r, 400));
};
// TextureLoader não expõe isLoading: conta pelos eventos do gerenciador
let active = 0;
manager.onProgress = (_u, loaded, total) => { active = total - loaded; };
Object.defineProperty(manager, 'isLoading', { get: () => active > 0 });

function stage() {
  const scene = new THREE.Scene();
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight('#fffaf0', '#93836b', 0.8));
  const key = new THREE.DirectionalLight('#fff7e9', 2.2);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.1, far: 30 });
  key.shadow.radius = 8; key.shadow.normalBias = 0.02;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#f0f3ff', 0.7); fill.position.set(4, 2, 4); scene.add(fill);
  const rim = new THREE.DirectionalLight('#fff0cf', 1.3); rim.position.set(1, 4, -4); scene.add(rim);
  return scene;
}

async function shot(obj, { rx = -0.12, ry = -0.5, pad = 1.12, fov = 24 } = {}) {
  const scene = stage();
  const pivot = new THREE.Group();
  pivot.add(obj);
  pivot.rotation.set(0, ry, 0);
  scene.add(pivot);
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  await idle();
  if (obj.userData.ready) await obj.userData.ready.catch(() => {});
  pivot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(pivot);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = box.min.y - 0.002; ground.receiveShadow = true;
  scene.add(ground);
  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  const dist = (sphere.radius * pad) / Math.sin(THREE.MathUtils.degToRad(fov / 2));
  camera.position.set(center.x, center.y + Math.sin(-rx) * dist, center.z + Math.cos(rx) * dist);
  camera.lookAt(center);
  renderer.render(scene, camera);
  await new Promise((r) => setTimeout(r, 50));
  renderer.render(scene, camera);
  return canvas.toDataURL('image/png');
}

const JOBS = [
  ...['caixa-prata', 'laco', 'feliz-natal', 'feliz-aroeira-coco', 'feliz-barbatimao-propolis', 'laco-tropical', 'especiarias',
    'quarteto', 'aroma-dourado', 'raio-de-sol', 'presente-variado', 'oleo-uva-dourado'].map((k) => ({
    name: `kit-${k}`, make: () => makeKitBox(k, renderer), opt: { ry: KIT_MODELS[k].w > 2.5 ? -0.42 : -0.55 },
  })),
  { name: 'kit-feliz-natal-hero', make: () => makeKitBox('feliz-natal', renderer), opt: { ry: 0.38, rx: -0.2 } },
  { name: 'kit-cinco-oleos', make: () => { const g = makeKitBox('cinco-oleos', renderer); return g; }, open: true, opt: { ry: -0.6, rx: -0.32, pad: 1.05 } },
  ...['aroeira', 'barbatimao', 'calendula', 'propolis', 'coco', 'acafrao', 'barbatimao-aroeira'].map((k) => ({
    name: `sabonete-${k}`, make: () => makeSoap(k, renderer), opt: { ry: -0.55, rx: -0.3, pad: 1.0 },
  })),
  { name: 'frasco-canela', make: () => loadModel('/models/oleo-canela.glb', 2), opt: { ry: -0.3, rx: -0.08, pad: 1.0 } },
];

// Seda do site (src/three/silk.js) com as cores como uniform, parada num instante, no formato A4 (fundos das páginas escuras)
const SILK = `precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uDeep; uniform vec3 uMid;
float h(vec2 uv, float t){
  float v = 0.0;
  v += sin(uv.x*2.2 + uv.y*1.3 + t*0.35)*0.55;
  v += sin(uv.x*3.7 - uv.y*2.1 - t*0.27 + sin(uv.y*1.5 + t*0.2)*1.6)*0.32;
  v += sin(uv.x*6.1 + uv.y*4.3 + t*0.5 + sin(uv.x*2.0)*2.0)*0.12;
  vec2 m = uv - uMouse;
  v += exp(-dot(m,m)*1.6)*0.45*sin(length(m)*7.0 - t*1.4);
  return v;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y * 2.2;
  uv = mat2(0.86,-0.5,0.5,0.86)*uv;
  float e = 0.004; float c = h(uv,uTime);
  vec3 n = normalize(vec3(h(uv+vec2(e,0.),uTime)-c, h(uv+vec2(0.,e),uTime)-c, e*1.6));
  vec3 L = normalize(vec3(-0.4,0.6,0.7));
  float diff = clamp(dot(n,L),0.,1.);
  float spec = pow(clamp(dot(reflect(-L,n), vec3(0.,0.,1.)),0.,1.), 24.0);
  vec3 col = mix(uDeep, uMid, diff);
  col += vec3(0.85,0.72,0.47) * spec * 0.55;
  col += vec3(0.85,0.72,0.47) * smoothstep(0.85,1.0,diff) * 0.08;
  vec2 q = gl_FragCoord.xy/uRes;
  col *= 0.75 + 0.35*smoothstep(1.1,0.2,length(q-vec2(0.35,0.5)));
  gl_FragColor = vec4(col,1.0);
}`;
function silk(deep, mid, t, mouse = [0.6, 0.4], w = 1654, hgt = 2339) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true });
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, SILK));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  gl.viewport(0, 0, w, hgt);
  gl.uniform2f(u('uRes'), w, hgt); gl.uniform1f(u('uTime'), t); gl.uniform2f(u('uMouse'), ...mouse);
  gl.uniform3f(u('uDeep'), ...deep); gl.uniform3f(u('uMid'), ...mid);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return cv.toDataURL('image/jpeg', 0.9);
}
// Veludo liso (fundo das páginas escuras): degradê suave, brilho dourado largo e trama fina de tecido, sem dobras
const VELUDO = `precision highp float;
uniform vec2 uRes; uniform vec3 uDeep; uniform vec3 uMid; uniform vec2 uLight; uniform float uSeed;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y;
  vec2 q = (uv - uLight) * vec2(asp, 1.0);
  float d = length(q);
  vec3 col = mix(uMid, uDeep, smoothstep(0.0, 1.05, d));
  // pelo do veludo: variação larga e suave, como tecido que pega luz
  float nap = noise(uv * vec2(3.0, 4.0) + 2.0) * 0.6 + noise(uv * vec2(7.0, 9.0)) * 0.4;
  col *= 0.94 + 0.1 * nap;
  // brilho dourado, uma faixa larga e macia na diagonal
  float band = exp(-pow((uv.x * 0.75 + uv.y * 0.55 - (uLight.x * 0.75 + uLight.y * 0.55)) * 2.4, 2.0));
  col += vec3(0.85, 0.68, 0.42) * band * 0.07 * (1.0 - smoothstep(0.2, 1.1, d));
  // trama fina
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.022;
  col *= 1.0 - 0.28 * smoothstep(0.55, 1.35, length((uv - 0.5) * vec2(asp, 1.0)) * 1.4);
  gl_FragColor = vec4(col, 1.0);
}`;
function veludo(deep, mid, light, seed, w = 1654, hgt = 2339) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = hgt;
  const gl = cv.getContext('webgl', { preserveDrawingBuffer: true });
  const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return x; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }'));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, VELUDO));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  gl.viewport(0, 0, w, hgt);
  gl.uniform2f(u('uRes'), w, hgt); gl.uniform3f(u('uDeep'), ...deep); gl.uniform3f(u('uMid'), ...mid);
  gl.uniform2f(u('uLight'), ...light); gl.uniform1f(u('uSeed'), seed);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return cv.toDataURL('image/jpeg', 0.92);
}
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

window.__renders = {
  // luz: ponto mais claro do veludo, em fração da página (0,0 = canto de baixo à esquerda)
  'veludo-vinho': veludo(rgb('#2a0d14'), rgb('#7a3341'), [0.5, 0.62], 1),
  'veludo-floresta': veludo(rgb('#0d1f13'), rgb('#2f5a3b'), [0.35, 0.7], 2),
  'veludo-vinho-2': veludo(rgb('#2a0d14'), rgb('#74303d'), [0.62, 0.55], 3),
  'seda-vinho': silk(rgb('#2e0f16'), rgb('#752f3b'), 3.2, [0.7, 0.5]),
  'seda-floresta': silk(rgb('#102316'), rgb('#284a31'), 7.5, [-0.4, -0.6]),
  'seda-vinho-2': silk(rgb('#2e0f16'), rgb('#6a2833'), 12.1, [0.2, -0.8]),
};
window.__done = (async () => {
  for (const job of JOBS) {
    try {
      const obj = await job.make();
      if (job.open && obj.userData.setOpen) {
        await obj.userData.ready?.catch(() => {});
        for (let i = 0; i < 400; i++) obj.userData.setOpen(1, 1 / 30, true);
      }
      window.__renders[job.name] = await shot(obj, job.opt);
    } catch (e) {
      console.error(job.name, e);
    }
  }
  return Object.keys(window.__renders);
})();
