import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { advanceSpring, resetSpring, spring } from './productMotion.js';

// The five original labels are photographed in this atlas. No generated branding.
// from: slot inside the box; to: where the bottle lands, in a crescent in front of the box.
// open: opening progress at which the bottle leaves (front row first, back row last); spin: label sweep direction.
const BOTTLES = [
  { from: [.52, .52], to: [.82, 1.42], open: .5, label: 4, spin: 1 },
  { from: [-.52, .52], to: [-.82, 1.42], open: .62, label: 3, spin: -1 },
  { from: [0, 0], to: [0, 1.66], open: .74, label: 2, spin: 1 },
  { from: [.52, -.52], to: [1.62, .72], open: .84, label: 1, spin: 1 },
  { from: [-.52, -.52], to: [-1.62, .72], open: .93, label: 0, spin: -1 },
];
const HOP = 1.7; // bottom of a bottle clears the box rim at the top of its hop
const SPARKS = 90, SPARK_LIFE = 2.2;

function projectedUV(geo, scale) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = Math.abs(n.getX(i)), y = Math.abs(n.getY(i)), z = Math.abs(n.getZ(i));
    uv.setXY(i, (x >= y && x >= z ? p.getZ(i) : p.getX(i)) * scale, (y >= x && y >= z ? p.getZ(i) : p.getY(i)) * scale);
  }
  return geo;
}

function oilBottle(index, atlas) {
  const group = new THREE.Group(), radius = .29;
  const amber = new THREE.MeshPhysicalMaterial({ color: '#5c2a0b', roughness: .16, clearcoat: 1, clearcoatRoughness: .06, specularIntensity: .9, envMapIntensity: 1.1 });
  const capMat = new THREE.MeshPhysicalMaterial({ color: '#171816', roughness: .48, clearcoat: .25, clearcoatRoughness: .4, envMapIntensity: .6 });
  const paper = new THREE.MeshStandardMaterial({ color: '#f7f5ed', roughness: .86 });
  const label = new THREE.MeshPhysicalMaterial({ map: atlas, roughness: .62, clearcoat: .35, clearcoatRoughness: .35, envMapIntensity: .55 });
  const add = (geometry, material, y) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = y; mesh.castShadow = mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  const profile = [[0, .025], [.23, .025], [.275, .045], [radius, .085], [radius, 1.0], [.285, 1.04], [.268, 1.1], [.235, 1.17], [.20, 1.21], [.19, 1.24], [.19, 1.33], [0, 1.33]];
  add(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 48), amber, 0);
  const front = new THREE.CylinderGeometry(radius + .002, radius + .002, .86, 48, 1, true, -Math.PI / 2, Math.PI);
  const uv = front.attributes.uv, pos = front.attributes.position;
  // Keep atlas sampling inside its column, including mipmapped edges.
  for (let i = 0; i < uv.count; i++) uv.setX(i, (index + .012 + (pos.getX(i) / (2 * (radius + .002)) + .5) * .976) / 5);
  add(front, label, .57);
  add(new THREE.CylinderGeometry(radius + .002, radius + .002, .86, 48, 1, true, Math.PI / 2, Math.PI), paper, .57);
  add(new THREE.CylinderGeometry(.257, .265, .105, 64), capMat, 1.275);
  const cap = new THREE.CylinderGeometry(.244, .25, .35, 144);
  const p = cap.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), f = 1 + .012 * Math.cos(Math.atan2(x, z) * 48);
    p.setX(i, x * f); p.setZ(i, z * f);
  }
  cap.computeVertexNormals();
  add(cap, capMat, 1.485);
  add(new THREE.CylinderGeometry(.235, .244, .022, 64), capMat, 1.671);
  return group;
}

// Gold dust released when the lid pops: analytic motion in the vertex shader, no per-frame CPU work.
function goldDust(width, depth, rimY) {
  const start = new Float32Array(SPARKS * 3), velocity = new Float32Array(SPARKS * 3), seed = new Float32Array(SPARKS);
  for (let i = 0; i < SPARKS; i++) {
    const x = (Math.random() - .5) * width * .8, z = (Math.random() - .5) * depth * .8;
    start.set([x, rimY - Math.random() * .3, z], i * 3);
    velocity.set([x * .55 + (Math.random() - .5) * .5, 1.1 + Math.random() * 1.5, z * .55 + (Math.random() - .5) * .5], i * 3);
    seed[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(start, 3));
  geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocity, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
    // Normal blending: additive glow turns grey over the transparent canvas and the cream page.
    transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime, uScale;
      attribute vec3 aVelocity;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        float t = max(uTime - aSeed * .25, 0.);
        float life = clamp(t / ${SPARK_LIFE.toFixed(1)}, 0., 1.);
        // Fast burst that slows down like dust in warm air, with a gentle sideways drift.
        vec3 p = position + aVelocity * (1. - exp(-2.2 * t)) / 2.2;
        p.x += sin(t * 2.3 + aSeed * 30.) * .06 * t;
        p.y -= .05 * t * t;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        float twinkle = .55 + .45 * sin(t * 14. + aSeed * 60.);
        vAlpha = smoothstep(0., .08, life) * (1. - smoothstep(.45, 1., life)) * twinkle * step(.001, t);
        gl_PointSize = uScale * (8. + 12. * aSeed) / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - .5);
        float glow = pow(max(1. - d * 2., 0.), 1.6);
        // Warm gold rim with a pale core, like foil glitter catching the light.
        vec3 color = mix(vec3(.78, .55, .2), vec3(1., .93, .72), smoothstep(.15, .9, glow));
        gl_FragColor = vec4(color, glow * vAlpha);
      }`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false; points.visible = false;
  return points;
}

export function makeOilGift(model, renderer, environment) {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();
  const pending = [];
  const load = (url, color = false) => {
    let texture;
    pending.push(new Promise((resolve, reject) => {
      texture = loader.load(url, () => { if (!texture.userData.disposed) renderer.initTexture(texture); resolve(); }, undefined, reject);
    }));
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };
  const weave = load('/kit3d/gold-weave.webp');
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  // Champagne foil like the real box: mostly metal, with the paper weave breaking up the reflections.
  const gold = new THREE.MeshPhysicalMaterial({
    color: '#e3c27c', metalness: .88, roughness: .5, roughnessMap: weave, bumpMap: weave, bumpScale: 1.4,
    clearcoat: .3, clearcoatRoughness: .3, envMap: environment, envMapIntensity: 1.15,
  });
  const liner = new THREE.MeshStandardMaterial({ color: '#f1eee7', roughness: .92 });
  const edge = new THREE.MeshPhysicalMaterial({ color: '#d8bd7c', metalness: .8, roughness: .34, envMap: environment, envMapIntensity: 1 });
  const width = model.w - .07, depth = model.d - .07, base = -model.h / 2, bodyH = model.h - model.lid + .1;
  const part = (parent, w, h, d, x, y, z, materials) => {
    // Build from a unit cube before resizing. In the installed r178 addon,
    // non-unit dimensions distort the face normals and create diagonal shading.
    const geometry = new RoundedBoxGeometry(1, 1, 1, 3, Math.min(.018, w / 3, h / 3, d / 3));
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
      p.setXYZ(i, px + Math.sign(px) * (w - 1) / 2, py + Math.sign(py) * (h - 1) / 2, pz + Math.sign(pz) * (d - 1) / 2);
    }
    projectedUV(geometry, 1.5);
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const walls = (parent, w, h, d, centerY, material, inside) => {
    const t = .045;
    part(parent, t, h, d, (w - t) / 2, centerY, 0, [material, inside, edge, edge, material, material]);
    part(parent, t, h, d, -(w - t) / 2, centerY, 0, [inside, material, edge, edge, material, material]);
    part(parent, w - 2 * t, h, t, 0, centerY, (d - t) / 2, [edge, edge, edge, edge, material, inside]);
    part(parent, w - 2 * t, h, t, 0, centerY, -(d - t) / 2, [edge, edge, edge, edge, inside, material]);
  };
  // The body squashes a touch when the lid pops (anticipation), so it is its own group.
  const body = new THREE.Group(); group.add(body);
  walls(body, width, bodyH, depth, base + bodyH / 2, gold, liner);
  part(body, width, .07, depth, 0, base + .035, 0, [gold, gold, liner, gold, gold, gold]);

  // A hollow lid has a visible paper lining and a fine folded rim when lifted.
  const lid = new THREE.Group(), lidY = model.h / 2 - model.lid / 2;
  walls(lid, model.w, model.lid, model.d, 0, gold, liner);
  part(lid, model.w - .07, .045, model.d - .07, 0, (model.lid - .045) / 2, 0, [gold, gold, gold, liner, gold, gold]);
  lid.position.y = lidY; group.add(lid);

  const dust = goldDust(width, depth, base + bodyH);
  group.add(dust);

  const atlas = load('/kit3d/cinco-oleos-rotulos.webp', true);
  const bottles = BOTTLES.map((config) => {
    // holder: position + lean in the travel direction; mesh: spin around its own axis.
    const holder = new THREE.Group(), mesh = oilBottle(config.label, atlas);
    holder.add(mesh); group.add(holder);
    const [fx, fz] = config.from, [tx, tz] = config.to, len = Math.hypot(tx - fx, tz - fz);
    return { ...config, holder, mesh, dir: [(tx - fx) / len, (tz - fz) / len], face: -tx * .1, motion: spring() };
  });
  const lidMotion = spring(), squash = spring();
  let time = 0, dustTime = -1, lastOpen = 0;

  group.userData.openable = true;
  group.userData.ready = Promise.all(pending);
  // Callers can still use the photographic fallback if a required asset fails.
  group.userData.ready.catch(() => {});
  group.userData.setDustScale = (scale) => { dust.material.uniforms.uScale.value = scale; };
  // How spread out the scene still is (bottles outside, lid up): the camera frames this, not the button state.
  group.userData.extent = () => THREE.MathUtils.clamp(lidMotion.value, 0, 1);
  group.userData.setOpen = (progress, dt = 1 / 60, immediate = false) => {
    const o = THREE.MathUtils.clamp(progress, 0, 1.025);
    time += dt;
    bottles.forEach((b) => {
      // Each bottle leaves on its own beat and comes back last-out, first-in.
      const target = o >= b.open ? 1 : 0;
      if (immediate) resetSpring(b.motion, target);
      const u = immediate ? target : advanceSpring(b.motion, target, dt, 62, 11.5);
      const c = THREE.MathUtils.clamp(u, 0, 1);
      const rise = THREE.MathUtils.smoothstep(c, 0, .42), travel = THREE.MathUtils.smoothstep(c, .25, .8), land = THREE.MathUtils.smoothstep(c, .68, 1);
      const x = THREE.MathUtils.lerp(b.from[0], b.to[0], travel), z = THREE.MathUtils.lerp(b.from[1], b.to[1], travel);
      b.holder.position.set(x, base + .07 + HOP * rise - (HOP + .07) * land, z);
      const lean = Math.sin(Math.PI * travel) * .2;
      b.holder.rotation.set(b.dir[1] * lean, 0, -b.dir[0] * lean);
      b.mesh.rotation.y = b.face + b.spin * (1 - travel) * 2.6;
      // Overshooting the landing reads as a soft squash on the table.
      const s = Math.max(0, u - 1) * 2.2;
      b.mesh.scale.set(1 + s * .5, 1 - s, 1 + s * .5);
    });
    // On closing, keep the lid out of the way until the bottles have returned.
    const lidTarget = Math.max(o, Math.min(1, Math.max(...bottles.map((b) => b.motion.value))));
    if (immediate) resetSpring(lidMotion, lidTarget);
    const l = immediate ? lidTarget : advanceSpring(lidMotion, lidTarget, dt, 70, 12);
    const pop = THREE.MathUtils.smoothstep(l, 0, .3), sweep = THREE.MathUtils.smoothstep(l, .2, 1);
    const hover = immediate ? 0 : Math.sin(time * 1.3) * .035 * sweep;
    // Pops straight up, then glides back and hovers tilted toward the camera, inside the frame.
    lid.position.set(.3 * sweep, lidY + .42 * pop + .55 * sweep + hover, -1.15 * sweep);
    lid.rotation.set(.62 * sweep + Math.sin(Math.PI * pop) * .05, -.32 * sweep, -.1 * sweep + Math.sin(Math.PI * pop) * .04);
    // Anticipation: the body dips as the lid lets go, then springs back.
    const kick = !immediate && o > .02 && lastOpen <= .02 ? -1 : 0;
    if (kick) squash.velocity += -1.6;
    const q = immediate ? 0 : advanceSpring(squash, 0, dt, 260, 14);
    body.scale.set(1 - q * .25, 1 + q, 1 - q * .25);
    body.position.y = base * -q;
    if (kick && (dustTime < 0 || dustTime > SPARK_LIFE)) dustTime = 0;
    if (dustTime >= 0) {
      dustTime += dt;
      dust.material.uniforms.uTime.value = dustTime;
      dust.visible = !immediate && dustTime < SPARK_LIFE + .3;
    }
    lastOpen = o;
  };
  return group;
}
