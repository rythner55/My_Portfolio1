(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Mobile menu
  const toggle = $('#navToggle'), menu = $('#navMenu');
  const setMenu = open => { menu.classList.toggle('open', open); toggle.setAttribute('aria-expanded', open); };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); toggle.focus(); } });

  // Active link highlighting
  const links = $$('.nav__menu a:not(.btn)');
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  // Reveal on scroll
  const reveal = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); } }), { threshold: .12 });
  $$('.reveal').forEach(el => reveal.observe(el));

  // Theme (white by default)
  const root = document.documentElement;
  try { if (localStorage.getItem('theme') === 'dark') root.dataset.theme = 'dark'; } catch (e) {}
  $('#themeToggle').addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  });

  // Back to top
  $('#toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  // Hide unconfigured links
  $$('[data-contact]').forEach(a => { if (/\[.*\]/.test(a.getAttribute('href'))) a.closest('li').hidden = true; });
  $$('[data-todo]').forEach(a => { if (a.getAttribute('href') === '#') { a.classList.add('disabled'); a.setAttribute('aria-disabled', 'true'); a.tabIndex = -1; } });

  // Form validation
  // Set FORM_ENDPOINT to a form service URL (e.g. Formspree) to enable real delivery.
  const FORM_ENDPOINT = '';
  const form = $('#contactForm'), status = $('#formStatus');
  const rules = {
    name: v => v.trim() ? '' : 'Enter your full name.',
    email: v => !v.trim() ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email, like name@example.com.',
    subject: v => v.trim() ? '' : 'Enter a subject.',
    message: v => v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'
  };
  const check = el => {
    const msg = rules[el.name](el.value);
    el.setAttribute('aria-invalid', !!msg);
    el.nextElementSibling.textContent = msg;
    return !msg;
  };
  $$('input, textarea', form).forEach(el => el.addEventListener('blur', () => check(el)));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'small';
    const fields = $$('input, textarea', form);
    if (!fields.map(check).every(Boolean)) { status.textContent = 'Fix the highlighted fields and try again.'; status.classList.add('error'); fields.find(f => f.getAttribute('aria-invalid') === 'true').focus(); return; }
    if (!FORM_ENDPOINT) { status.textContent = 'This form is not connected to an email service yet, so nothing was sent. See the README to set it up.'; status.classList.add('error'); return; }
    try {
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!res.ok) throw new Error();
      form.reset(); status.textContent = 'Message sent. Thank you!';
    } catch { status.textContent = 'The message could not be sent. Try again later.'; status.classList.add('error'); }
  });
})();
