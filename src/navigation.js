// Navegação compartilhada pelas três páginas.
const header = document.querySelector('.header');
const nav = header?.querySelector('.nav');
if (nav) {
  nav.id = 'mainNav';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-toggle';
  toggle.textContent = 'Menu';
  toggle.setAttribute('aria-controls', nav.id);
  toggle.setAttribute('aria-expanded', 'false');
  header.insertBefore(toggle, nav);
  const close = (restoreFocus = false) => {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Fechar' : 'Menu';
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) close(true);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) close(true);
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) close();
  });
  header.addEventListener('focusout', (event) => {
    if (!header.contains(event.relatedTarget)) close();
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', () => close());
}
