// Sacola guardada no navegador (localStorage), para o kit montado em /monte.html aparecer na sacola da loja.
// Se o armazenamento estiver bloqueado (janela anônima, etc.), a sacola funciona só na página atual.
const KEY = 'alquiverde:sacola';

export function loadBag() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export function saveBag(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* sem armazenamento: segue só na memória */ }
}

export function addToBag(item) {
  const items = loadBag();
  items.push(item);
  saveBag(items);
  return items.length;
}
