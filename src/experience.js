export const lightMode = document.documentElement.classList.contains('is-light');

const button = document.createElement('button');
button.type = 'button';
button.className = 'experience-toggle';
button.setAttribute('aria-pressed', String(lightMode));
button.setAttribute('aria-label', 'Modo leve');
button.title = lightMode ? 'Voltar à experiência com movimento e 3D' : 'Navegar com fotos, sem 3D e com menos movimento';
button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4C9 3 3 8 5 15c6 4 13 0 14-11ZM5 20 15 9"/></svg><span>Modo leve${lightMode ? ' · ativo' : ''}</span>`;
document.body.append(button);
button.addEventListener('click', () => {
  const next = !lightMode;
  window.dispatchEvent(new Event('experiencechange'));
  try {
    localStorage.setItem('alquiverde:modo-leve', String(next));
  } catch { /* A URL mantém a escolha quando o armazenamento está bloqueado. */ }
  const url = new URL(location.href);
  url.searchParams.set('leve', next ? '1' : '0');
  location.replace(url);
});

// Leva a preferência entre páginas mesmo sem acesso ao localStorage.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || link.getAttribute('href').startsWith('#')) return;
  const url = new URL(link.href, location.href);
  if (url.origin === location.origin && (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.startsWith('/kits/'))) {
    url.searchParams.set('leve', lightMode ? '1' : '0');
    link.href = url.href;
  }
});
