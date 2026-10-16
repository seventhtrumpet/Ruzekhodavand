/* Seventh Trumpet - UX enhancements */
(function () {
  const THEME_KEY = 'cog_theme';

  (function () {
    const orig = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = function (locale, options) {
      if (locale === 'fa-IR') locale = 'fa-IR-u-nu-latn';
      return orig.call(this, locale, options);
    };
  })();

  function lang() {
    return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
  }

  function dayIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000) % ((window.DAILY_VERSES || []).length || 1);
  }

  function showVerse(idx) {
    const list = window.DAILY_VERSES || [];
    if (!list.length) return;
    const v = list[idx % list.length];
    const textEl = document.getElementById('verse-text');
    const refEl = document.getElementById('verse-ref');
    if (!textEl || !refEl) return;
    const fa = lang() === 'fa';
    textEl.textContent = fa ? v.fa : v.en;
    refEl.textContent = '— ' + (fa ? v.ref_fa : v.ref_en);
    window._verseIdx = idx % list.length;
  }

  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    const icon = document.getElementById('theme-icon');
    const btn = document.getElementById('theme-toggle');
    const emoji = theme === 'dark' ? '☀️' : '🌙';
    if (icon) icon.textContent = emoji;
    else if (btn) btn.textContent = emoji;
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

  function initVerse() {
    if (!(window.DAILY_VERSES || []).length) {
      setTimeout(initVerse, 80);
      return;
    }
    showVerse(dayIndex());
    document.getElementById('verse-refresh')?.addEventListener('click', () => {
      showVerse(((window._verseIdx ?? dayIndex()) + 1) % window.DAILY_VERSES.length);
    });
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      setTimeout(() => showVerse(window._verseIdx ?? dayIndex()), 50);
    });
  }

  function boot() {
    initTheme();
    initVerse();
  }

  // daily verses data
  var _dv = document.createElement('script');
  _dv.src = 'js/daily_verses.js';
  _dv.onload = function () { setTimeout(boot, 20); };
  document.head.appendChild(_dv);

  // hamburger menu
  var _ms = document.createElement('script');
  _ms.src = 'js/menu.js';
  document.body.appendChild(_ms);
})();
