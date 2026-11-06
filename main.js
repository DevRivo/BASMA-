(() => {
  'use strict';

  /* ---------- 1. Auth navigation guard ----------
     FRONTEND CONVENIENCE ONLY – this is NOT security. Anyone can bypass client-side checks.
     Real protection must be enforced on the server: gallery, artists, communities and
     notifications routes must verify the session/token server-side and redirect to login.
     Replace isAuthenticated() with a real session check (e.g. GET /api/auth/me). */
  const AUTH_KEY = 'basma_auth_token';
  const LOGIN_URL = 'login.html';

  const isAuthenticated = () => {
    try { return Boolean(localStorage.getItem(AUTH_KEY)); }
    catch { return false; }
  };

  document.querySelectorAll('[data-protected]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (isAuthenticated()) return;
      event.preventDefault();
      const target = link.getAttribute('href');
      window.location.href = `${LOGIN_URL}?redirect=${encodeURIComponent(target)}`;
    });
  });

  /* ---------- 2. Image placeholders (logo / hero) ---------- */
  const showPlaceholder = (img) => {
    const box = document.createElement('div');
    box.className = 'placeholder';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', img.alt);
    box.textContent = img.dataset.fallback || '';
    img.replaceWith(box);
  };

  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) showPlaceholder(img);
    else img.addEventListener('error', () => showPlaceholder(img), { once: true });
  });

  /* ---------- 3. FAQ accordion (single open item) ---------- */
  const accordion = document.querySelector('[data-accordion]');
  if (!accordion) return;
  const buttons = [...accordion.querySelectorAll('.acc-btn')];

  const setState = (button, open) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', String(open));
    button.closest('.acc-item').classList.toggle('is-open', open);
    panel.classList.toggle('is-visible', open);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const willOpen = button.getAttribute('aria-expanded') !== 'true';
      buttons.forEach((b) => setState(b, false));
      if (willOpen) setState(button, true);
    });

    // Arrow keys / Home / End move between questions
    button.addEventListener('keydown', (event) => {
      const i = buttons.indexOf(button);
      const moves = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: buttons.length - 1 };
      if (!(event.key in moves)) return;
      event.preventDefault();
      buttons[(moves[event.key] + buttons.length) % buttons.length].focus();
    });
  });
})();
