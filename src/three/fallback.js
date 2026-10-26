import { setImageSource } from '../imageSizes.js';
// Mantém a interface das cenas para que a loja funcione sem um contexto WebGL.
export function fallbackScene(canvas, { photo, soap, builder = false } = {}) {
  const host = canvas.parentElement;
  canvas.dataset.webglFailed = 'true';
  canvas.hidden = true;
  host.classList.add('webgl-fallback');
  let image;
  if (photo || soap) {
    image = document.createElement('img');
    image.className = 'webgl-fallback__image';
    if (canvas.dataset.layer && !soap) {
      image.classList.add('kp-layer');
      image.dataset.layer = canvas.dataset.layer;
    }
    image.alt = canvas.getAttribute('aria-label')?.split(' em 3D')[0] || 'Kit de presente';
    setImageSource(image, photo || `/soaps/${soap}.webp`);
    canvas.after(image);
  }
  if (builder) {
    const note = document.createElement('p');
    note.className = 'webgl-fallback__note';
    note.textContent = 'Continue escolhendo os produtos. A composição do seu kit aparece no resumo.';
    canvas.after(note);
  }
  const noop = () => {};
  return {
    available: false, intro: 1, progress: 1,
    start: noop, stop: noop, renderOnce: noop, setScroll: noop,
    preload: noop, replayIntro: noop, setIdle: noop,
    setModel: noop, update: noop, close: noop, open: noop,
    show(key) { if (image && soap) setImageSource(image, `/soaps/${key}.webp`); },
    snapshot: () => '/kits/raio-de-sol-frente.webp',
  };
}
