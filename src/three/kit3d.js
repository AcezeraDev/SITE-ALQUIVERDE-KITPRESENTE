import { makeOilGift } from './oilGift.js';
import { createKitViewer } from './productViewer.js';
// Kits em 3D a partir das fotos ortogonais (frente, verso, laterais) + vitrine giratória leve.
// Proporções medidas nas próprias fotos (altura = 2.1 unidades).
import * as THREE from 'three';

export const KIT_MODELS = {
  // window: retângulo da janela de acetato na frente [x0, y0, x1, y1] em fração da face
  'trio-branco': { w: 1.08, h: 2.1, d: 0.33, faces: { front: 'front', back: 'back', right: 'side', left: 'side2' }, window: [0.07, 0.035, 0.93, 0.965], edge: '#f4f2ee' },
  // bandeja aberta (foto real de frente; laterais, verso, topo e base reconstruídos por IA) — sem acetato
  'feliz-natal': { w: 3.17, h: 2.1, d: 0.38, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, window: null, edge: '#b3121c' },
  // Laço de Natal: caixa com visor e laço; a frente é um plano maior (recortado por alpha) para o laço passar da borda.
  // frontFull: retângulo da caixa e da imagem inteira, em px da foto da frente (vistas do zip produtos-31-pngs-para-3d)
  laco: { w: 2.92, h: 2.1, d: 0.53, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, window: [0.04, 0.05, 0.96, 0.95], edge: '#c8141c',
    frontFull: { img: 'frontfull', box: [40, 148, 1326, 1072], full: [40, 22, 1365, 1072] } },
  // outras combinações do Feliz Natal: mesma caixa, só a frente muda
  'feliz-aroeira-coco': { w: 3.21, h: 2.1, d: 0.38, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, shared: 'feliz-natal', window: null, edge: '#b3121c' },
  'feliz-barbatimao-propolis': { w: 3.25, h: 2.1, d: 0.38, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, shared: 'feliz-natal', window: null, edge: '#b3121c' },
  // mesma caixa vermelha do Feliz Natal; só a frente é a foto do Especiarias (`shared` = de onde vêm as outras faces)
  'especiarias': { w: 3.25, h: 2.1, d: 0.38, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, shared: 'feliz-natal', window: null, edge: '#b3121c' },
  // opção 4 Coco: frente é uma montagem provisória (Coco copiado sobre a Calêndula) até chegar a foto real
  'especiarias-coco': { w: 3.25, h: 2.1, d: 0.38, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, shared: 'feliz-natal', window: null, edge: '#b3121c' },
  // Laço Tropical: mesma caixa vermelha com laço do Laço de Natal; só a frente é a foto deste kit (frontFull em px da foto original 1536×1024)
  'laco-tropical': { w: 3.49, h: 2.1, d: 0.53, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, shared: 'laco', window: [0.04, 0.05, 0.96, 0.95], edge: '#c8141c',
    frontFull: { img: 'frontfull', box: [73, 168, 1345, 934], full: [72, 10, 1521, 936] } },
  // Quarteto de Aromas: caixa vermelha com visor e laço dourado (frente = foto; demais faces reconstruídas por IA, zip kits-20-outubro-19-pngs)
  quarteto: { w: 3.9, h: 2.1, d: 0.75, faces: { front: 'front', back: 'back', right: 'right', left: 'right', top: 'top', bottom: 'bottom' }, window: [0.07, 0.14, 0.93, 0.89], edge: '#a8121c',
    frontFull: { img: 'frontfull', box: [178, 238, 1420, 906], full: [178, 22, 1614, 926] } },
  // Aroma Dourado: caixa dourada deitada com tampa de acetato (8 recortes do zip kit-dourado-8-recortes; frente = vista de cima,
  // topo/base = laterais compridas, lados = extremidades giradas). frontFull em px do 03-frente-v1.png
  'aroma-dourado': { w: 3.54, h: 2.1, d: 1.05, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, window: [0.06, 0.12, 0.94, 0.9], edge: '#d4b04a', gold: true,
    frontFull: { img: 'frontfull', box: [365, 225, 1335, 800], full: [365, 15, 1583, 828] } },
  // Raio de Sol: caixa dourada em pé com visor (zip kit-barbatimao-laranja-6-recortes; topo e base não fotografados = dourado liso)
  'raio-de-sol': { w: 1.22, h: 2.1, d: 0.6, faces: { front: 'front', back: 'back', right: 'side', left: 'side' }, window: [0.1, 0.06, 0.9, 0.95], edge: '#cdb36a', gold: true },
  // Caixa Prata: caixa prata com visor e laço verde (mesmo zip); `gold` dá o brilho metálico
  'caixa-prata': { w: 1.07, h: 2.1, d: 0.6, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, window: [0.15, 0.08, 0.85, 0.92], edge: '#bdbdbd', gold: true,
    frontFull: { img: 'frontfull', box: [182, 120, 860, 1446], full: [94, 120, 960, 1450] } },
  // Presente Variado e Óleo de Uva: zip recortes-3d-velas-e-caixas (tools/build3d_presentes.py); o verso do variado é a bandeja branca
  'presente-variado': { w: 1.04, h: 2.1, d: 0.47, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, window: [0.147, 0.063, 0.859, 0.96], edge: '#cdb36a', gold: true },
  // Aromas do Jardim (5 óleos): caixa dourada cúbica com tampa, 6 x 6 x 6,3 cm. Modelada (não é foto colada):
  // corpo + tampa em metal dourado com o relevo do papel tirado das fotos (tools/gold_weave.py). lid = altura da tampa
  // A tampa abre sozinha (userData.setOpen) e mostra os 5 frascos; openExtra = altura a mais que a câmera precisa abraçar
  'cinco-oleos': { w: 2.0, h: 2.1, d: 2.0, build: 'lidbox', lid: 0.52, color: '#f1d598', openExtra: 1.5, openShift: 0.45 },
  'oleo-uva-dourado': { w: 1.17, h: 2.1, d: 0.53, faces: { front: 'front', back: 'back', right: 'right', left: 'left', top: 'top', bottom: 'bottom' }, window: [0.04, 0.02, 0.96, 0.98], edge: '#cdb36a', gold: true },
};

const loader = new THREE.TextureLoader();
function tex(url, renderer, mirror = false) {
  // envia para a placa de vídeo assim que a imagem chega (evita o soluço no 1º quadro da caixa)
  const t = loader.load(url, () => { if (!t.userData.disposed) renderer.initTexture(t); });
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
  return t;
}

function labelTex(text, mirror) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#ddd'; g.fillRect(0, 0, 512, 1024);
  g.fillStyle = '#c00'; g.fillRect(0, 0, 60, 1024); // faixa vermelha = lado esquerdo da imagem
  g.fillStyle = '#000'; g.font = 'bold 90px sans-serif'; g.textAlign = 'center';
  g.fillText(text, 256, 300); g.fillText('TOPO', 256, 120);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  if (mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
  return t;
}

// Estúdio de luz só para o metal: softboxes quentes que viram faixas de brilho correndo pelo dourado ao girar
const studios = new WeakMap();
function studioEnv(renderer) {
  if (studios.has(renderer)) return studios.get(renderer).texture;
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: '#77746a', side: THREE.BackSide })));
  const panel = (w, h, k, color, x, y, z) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    p.position.set(x, y, z); p.lookAt(0, 0, 0); s.add(p);
  };
  panel(7, 3.5, 5, '#fff2dc', -2.5, 5, 2.5); // principal: em cima, à esquerda
  panel(1.2, 7, 4, '#ffe4bc', 5.5, 0.5, 1.5); // tira vertical à direita: risca de luz nas quinas
  panel(9, 6, 1.15, '#ffe9c6', 0, 0.5, 5.95); // rebatedor largo: nenhum ângulo fica sem brilho
  panel(2.2, 7, 3.2, '#fff6ea', -1.9, 0.8, 5.6); // frente (atrás da câmera): faixas verticais que varrem a face ao girar
  panel(1.2, 5, 1.8, '#ffe8c4', 2.6, 1.5, 5.2);
  panel(7, 1.4, 2.4, '#ffd29a', -1, -1, -5.8); // contraluz quente
  panel(10, 10, 0.8, '#b08e62', 0, -5.9, 0); // chão: rebate quente embaixo
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromScene(s, 0.08);
  generator.dispose();
  s.traverse((object) => { object.geometry?.dispose(); object.material?.dispose(); });
  studios.set(renderer, target);
  return target.texture;
}

function releaseStudio(renderer) {
  studios.get(renderer)?.dispose();
  studios.delete(renderer);
}

export function makeKitBox(key, renderer) {
  const m = KIT_MODELS[key];
  if (m.build === 'lidbox') return makeOilGift(m, renderer, studioEnv(renderer));
  const debug = new URLSearchParams(location.search).has('faces');
  const src = (name) => (m.shared && name !== 'front' ? m.shared : key);
  const f = (name, mirror) => (debug ? labelTex(name.toUpperCase(), mirror) : tex(`/kit3d/${src(name)}-${name}.webp`, renderer, mirror));
  const card = (map, gold = false) => new THREE.MeshPhysicalMaterial({
    map, roughness: gold ? 0.35 : 0.7, metalness: gold ? 0.35 : 0, clearcoat: 0.15, clearcoatRoughness: 0.5, envMapIntensity: gold ? 1.2 : 0.6,
  });
  const plain = new THREE.MeshPhysicalMaterial({ color: m.edge, roughness: 0.75, clearcoat: 0.1 });
  // grupos: +x (direita), -x (esquerda, espelhada), +y, -y, +z frente, -z verso
  const mats = [
    card(f(m.faces.right), m.gold),
    card(f(m.faces.left, m.faces.left === m.faces.right), m.gold),
    m.faces.top ? card(f(m.faces.top), m.gold) : plain,
    m.faces.bottom ? card(f(m.faces.bottom), m.gold) : plain,
    card(f(m.faces.front), m.gold),
    card(f(m.faces.back)),
  ];
  const group = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(m.w, m.h, m.d), mats);
  group.add(box);
  if (m.frontFull) {
    // plano da frente inteira (caixa + laço que sobra), alinhado ao retângulo da caixa
    const { box: [bx0, by0, bx1, by1], full: [fx0, fy0, fx1, fy1] } = m.frontFull;
    const sx = m.w / (bx1 - bx0), sy = m.h / (by1 - by0);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry((fx1 - fx0) * sx, (fy1 - fy0) * sy), new THREE.MeshPhysicalMaterial({
      map: debug ? labelTex('FRENTE', false) : tex(`/kit3d/${key}-${m.frontFull.img}.webp`, renderer), alphaTest: 0.5, side: THREE.DoubleSide,
      roughness: 0.6, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.7,
    }));
    plane.position.set((((fx0 + fx1) / 2) - ((bx0 + bx1) / 2)) * sx, (((by0 + by1) / 2) - ((fy0 + fy1) / 2)) * sy, m.d / 2 + 0.003);
    group.add(plane);
  }
  if (!m.window) return group;
  // acetato da janela: reflexo que corre quando a caixa gira
  const [x0, y0, x1, y1] = m.window;
  const ww = (x1 - x0) * m.w, wh = (y1 - y0) * m.h;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshPhysicalMaterial({
    color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, depthWrite: false,
  }));
  glass.position.set(((x0 + x1) / 2 - 0.5) * m.w, (0.5 - (y0 + y1) / 2) * m.h, m.d / 2 + 0.004);
  group.add(glass);
  return group;
}

/** Vitrine compartilhada: movimento físico, arraste e enquadramento responsivo. */
export function initKitViewer(canvas, key, options = {}) {
  return createKitViewer(canvas, key, options, KIT_MODELS, makeKitBox, releaseStudio);
}
