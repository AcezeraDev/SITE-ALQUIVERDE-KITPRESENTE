// Sabonete AlquiVerde em 3D com a arte real em todas as faces.
// Proporção medida nas fotos de estúdio: frente 1,57 : 1 e espessura ≈ 45 % da altura.
// Faces: frente, verso, lateral do QR (direita), lateral do código de barras (esquerda),
// topo (frase) e base (lote/validade).
import * as THREE from 'three';

export const SOAP_KEYS = ['aroeira', 'barbatimao', 'calendula', 'propolis', 'coco', 'acafrao', 'barbatimao-aroeira'];
export const SOAP_SIZE = { w: 1.8, h: 1.15, d: 0.52 };
const FULL = new Set(['aroeira', 'barbatimao', 'calendula', 'propolis', 'acafrao', 'barbatimao-aroeira', 'coco']);

const loader = new THREE.TextureLoader();
const cache = new Map();

function tex(url, anisotropy) {
  if (cache.has(url)) return cache.get(url);
  let t;
  const ready = new Promise((res) => { t = loader.load(url, res); });
  t.userData.ready = ready;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  cache.set(url, t);
  return t;
}

let sharedGeo = null;

/** Cria a malha do sabonete. renderer é usado só para a anisotropia máxima. */
export function makeSoap(key, renderer) {
  const an = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  const t = (face) => tex(`/soap3d/${key}-${face}.webp`, an);
  const full = FULL.has(key);
  const front = t('front');
  // todos os sabonetes têm as 6 faces; o fallback (frente no verso, QR nos dois lados) fica para novos sem foto
  const back = full ? t('back') : front;
  const right = t('right');
  const left = full ? t('left') : right;
  const top = t('top');
  const bottom = t('bottom');
  const paper = (map) => new THREE.MeshPhysicalMaterial({
    map, roughness: 0.62, metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.55, sheen: 0.1, sheenColor: new THREE.Color('#fff7e8'),
  });
  // ordem dos grupos da BoxGeometry: +x, -x, +y, -y, +z (frente), -z (verso)
  const mats = [paper(right), paper(left), paper(top), paper(bottom), paper(front), paper(back)];
  if (!sharedGeo) sharedGeo = new THREE.BoxGeometry(SOAP_SIZE.w, SOAP_SIZE.h, SOAP_SIZE.d);
  const mesh = new THREE.Mesh(sharedGeo, mats);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = `soap-${key}`;
  // envia cada textura para a placa de vídeo assim que a imagem chega (e não no 1º quadro em que o sabonete aparece)
  if (renderer) new Set([front, back, right, left, top, bottom]).forEach((tx) => tx.userData.ready?.then(() => renderer.initTexture(tx)));
  return mesh;
}
