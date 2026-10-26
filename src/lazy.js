// Cenas 3D sob demanda, sem travar a rolagem.
// Montar uma cena (contexto WebGL, iluminação, texturas) custa um "soluço" na tela. Para não acontecer no meio
// da rolagem: (1) quando a seção está a ~2 telas, a cena é preparada num momento ocioso do navegador, uma por vez;
// (2) depois que a página abre e fica parada, as cenas restantes são aquecidas em segundo plano;
// (3) só se a pessoa chegar na seção antes disso a cena é montada na hora.
// Devolve um "procurador": dá para chamar start/stop/show/... e definir propriedades antes de a cena existir.

const idle = window.requestIdleCallback
  ? (cb) => window.requestIdleCallback(cb, { timeout: 2000 })
  : (cb) => setTimeout(cb, 80);
const queue = [];
let busy = false;
/** Fila de tarefas pesadas: uma por momento ocioso, com folga entre elas. */
export function idleTask(fn) {
  queue.push(fn);
  pump();
}
function pump() {
  if (busy || !queue.length) return;
  busy = true;
  idle(() => {
    const fn = queue.shift();
    try { fn(); } finally { busy = false; setTimeout(pump, 150); }
  });
}

const pending = new Set(); // cenas ainda não criadas (para o aquecimento)

export function lazyScene(el, create, { rootMargin = '400px 0px', warm = true } = {}) {
  let real = null;
  let running = false;
  const props = {};
  const calls = new Map(); // último argumento de cada método chamado antes de a cena existir

  const make = () => {
    if (real) return;
    pending.delete(make);
    real = create();
    if (!real) return;
    for (const [k, v] of Object.entries(props)) real[k] = v;
    for (const [k, args] of calls) real[k]?.(...args);
    if (running) real.start?.();
  };
  make.el = el;
  make.warm = warm;

  const proxy = new Proxy({}, {
    get(_, k) {
      if (k === 'ready') return !!real;
      if (k === 'create') return make;
      if (real) { const v = real[k]; return typeof v === 'function' ? v.bind(real) : v; }
      if (k === 'start') return () => { running = true; };
      if (k === 'stop') return () => { running = false; };
      if (k in props) return props[k];
      return (...args) => { calls.set(k, args); };
    },
    set(_, k, v) {
      if (real) real[k] = v; else props[k] = v;
      return true;
    },
  });

  if (!el || !('IntersectionObserver' in window)) { make(); return proxy; }
  pending.add(make);
  // longe (≈2 telas): prepara no próximo momento ocioso
  const far = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { far.disconnect(); idleTask(make); }
  }, { rootMargin });
  far.observe(el);
  // chegou na tela e ainda não existe: monta na hora
  const near = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { near.disconnect(); make(); }
  }, { rootMargin: '0px' });
  near.observe(el);
  return proxy;
}

/** Depois que a página abre e fica parada, prepara as cenas restantes em segundo plano (na ordem da página). */
export function warmUpScenes(delay = 2500) {
  const start = () => setTimeout(() => {
    [...pending]
      .filter((m) => m.warm)
      .sort((a, b) => (a.el && b.el ? (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1) : 0))
      .forEach((m) => idleTask(m));
  }, delay);
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}
