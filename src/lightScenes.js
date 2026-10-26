import { setImageSource } from './imageSizes.js';
import { fallbackScene } from './three/fallback.js';
import { INGREDIENTS } from './kits.js';

export const SOAP_KEYS = INGREDIENTS.map((item) => item.img);
export const RITUAL_KITS = [];
export const initSilk = (canvas) => fallbackScene(canvas);
export const initKitViewer = (canvas) => fallbackScene(canvas);
export const initUnbox = (canvas) => fallbackScene(canvas, { photo: '/photos/celebracao.webp' });
export const initSoapStage = (canvas, { initial }) => fallbackScene(canvas, { soap: initial });
export const initModelViewer = (canvas, url) => fallbackScene(canvas, { photo: url.replace('/models/', '/kits/').replace('.glb', '.webp') });

// A mesma composição do montador, apresentada como uma caixa de fotos.
export function initBuilder(canvas) {
  const scene = fallbackScene(canvas);
  const preview = document.createElement('div');
  preview.className = 'light-box';
  preview.setAttribute('role', 'group');
  preview.setAttribute('aria-label', 'Prévia do seu presente');
  canvas.after(preview);
  scene.update = ({ size, soaps, extras }) => {
    preview.classList.remove('is-wrapped');
    preview.replaceChildren();
    const title = document.createElement('p');
    title.className = 'light-box__title';
    title.textContent = 'Um presente com a sua escolha';
    const grid = document.createElement('div');
    grid.className = 'light-box__grid';
    for (let i = 0; i < size; i++) {
      const cell = document.createElement('div');
      cell.className = 'light-box__cell';
      if (soaps[i]) {
        const ingredient = INGREDIENTS.find((item) => item.img === soaps[i]);
        const img = document.createElement('img');
        setImageSource(img, `/soaps/${ingredient.img}.webp`);
        img.alt = ingredient.name;
        cell.append(img);
      } else { cell.textContent = '✧'; cell.setAttribute('aria-label', 'Espaço para um sabonete'); }
      grid.append(cell);
    }
    const extraRow = document.createElement('div');
    extraRow.className = 'light-box__extras';
    extras.forEach((extra) => {
      const img = document.createElement('img');
      setImageSource(img, extra.photo);
      img.alt = extra.name;
      extraRow.append(img);
    });
    preview.append(title, grid, extraRow);
  };
  scene.close = () => preview.classList.add('is-wrapped');
  scene.open = () => preview.classList.remove('is-wrapped');
  scene.snapshot = () => {
    const photo = document.createElement('canvas');
    photo.width = 480; photo.height = 480;
    const ctx = photo.getContext('2d');
    if (!ctx) return '/logo-alquiverde.webp';
    ctx.fillStyle = '#f7f0e3'; ctx.fillRect(0, 0, 480, 480);
    ctx.fillStyle = '#752f3b'; ctx.font = '500 24px Fraunces';
    ctx.textAlign = 'center'; ctx.fillText('Seu presente AlquiVerde', 240, 40);
    const cells = [...preview.querySelectorAll('.light-box__cell')];
    const cellSize = cells.length > 6 ? 105 : 135;
    cells.forEach((cell, i) => {
      const img = cell.querySelector('img');
      if (!img) return;
      const x = 30 + (i % 3) * 140, y = 66 + Math.floor(i / 3) * cellSize;
      if (img.complete && img.naturalWidth) ctx.drawImage(img, x, y, 130, cellSize - 10);
      else { ctx.font = '14px "Bricolage Grotesque"'; ctx.fillText(img.alt, x + 65, y + cellSize / 2, 128); }
    });
    const extras = [...preview.querySelectorAll('.light-box__extras img')];
    extras.forEach((img, i) => {
      if (img.complete && img.naturalWidth) ctx.drawImage(img, 80 + i * 80, 400, 60, 65);
    });
    return photo.toDataURL('image/webp', 0.8);
  };
  return scene;
}
