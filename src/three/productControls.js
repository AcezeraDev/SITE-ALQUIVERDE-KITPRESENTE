import './productControls.css';

// Compact controls inspired by Magic UI's Interactive Hover Button, adapted to
// the site's vanilla JS and warm paper palette (no React/Tailwind dependency).
export function productControls(canvas, actions) {
  const host = canvas.parentElement;
  const wrap = document.createElement('div');
  wrap.className = 'product-controls';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', 'Controles da caixa 3D');
  wrap.innerHTML = `<span class="product-controls__hint">Arraste para explorar · 360°</span>
    <div class="product-controls__buttons">
      <button type="button" data-product="open" aria-expanded="false"><span class="product-controls__dot" aria-hidden="true"></span><span data-label>Abrir caixa</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 8 5-4 5 4M10 4v12"/></svg></button>
      <button type="button" data-product="replay" aria-label="Repetir abertura da caixa" title="Repetir abertura"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8a6 6 0 1 1 0 4M4 3v5h5"/></svg></button>
    </div>`;
  wrap.hidden = true;
  host.append(wrap);
  const toggle = wrap.querySelector('[data-product="open"]');
  toggle.addEventListener('click', () => actions.toggle());
  wrap.querySelector('[data-product="replay"]').addEventListener('click', () => actions.replay());
  // Never let UI controls initiate a drag or the global "GIRAR" cursor.
  wrap.addEventListener('pointerdown', (e) => e.stopPropagation());
  wrap.addEventListener('pointermove', (e) => e.stopPropagation());
  let previous = '';
  return {
    update(openable, open) {
      const state = `${openable}:${open}`;
      if (state === previous) return;
      previous = state;
      wrap.hidden = !openable;
      host.classList.toggle('has-product-controls', openable);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('[data-label]').textContent = open ? 'Fechar caixa' : 'Abrir caixa';
    },
    destroy() { wrap.remove(); host.classList.remove('has-product-controls'); },
  };
}
