/* Seventh Trumpet - UX enhancements */
(function () {
  const THEME_KEY = 'cog_theme';

  // Keep Latin digits even when locale is Persian
  (function () {
    const orig = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = function (locale, options) {
      if (locale === 'fa-IR') locale = 'fa-IR-u-nu-latn';
      return orig.call(this, locale, options);
    };
  })();

  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    const icon = document.getElementById('theme-icon');
    const btn = document.getElementById('theme-toggle');
    const emoji = theme === 'dark' ? '☀️' : '🌙';
    if (icon) icon.textContent = emoji;
    else if (btn && !btn.querySelector('#theme-icon')) btn.textContent = emoji;
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  function boot() {
    initTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 30));
  } else {
    setTimeout(boot, 30);
  }

  // Side menu (hamburger)
  var _ms = document.createElement('script');
  _ms.src = 'js/menu.js';
  document.body.appendChild(_ms);
})();
