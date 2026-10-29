/* Header hamburger menu + theme + load shared scripts */
(function () {
  var THEME_KEY = 'cog_theme';

  function applyThemeIcon(theme) {
    try {
      if (theme === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
      localStorage.setItem(THEME_KEY, theme);
      var btn = document.getElementById('theme-toggle');
      if (btn) btn.textContent = theme === 'dark' ? '\u2600' : '\u263E';
    } catch (e) {}
  }

  function refreshMenuLabels() {
    try {
      var lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
      var Tref = typeof T !== 'undefined' ? T[lang] : null;
      if (!Tref) return;
      document.querySelectorAll('#menu-panel [data-i18n], .menu-panel [data-i18n]').forEach(function (el) {
        var k = el.getAttribute('data-i18n');
        if (Tref[k]) el.textContent = Tref[k];
      });
    } catch (e) {}
  }

  function ensureMenu() {
    if (document.getElementById('menu-btn')) return;
    var headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    var btn = document.createElement('button');
    btn.id = 'menu-btn';
    btn.className = 'menu-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    var overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.className = 'menu-overlay';
    overlay.setAttribute('hidden', '');

    var panel = document.createElement('div');
    panel.id = 'menu-panel';
    panel.className = 'menu-panel';
    panel.innerHTML =
      '<div class="menu-panel-head">' +
      '<button type="button" id="menu-close" class="menu-close" aria-label="Close">&times;</button>' +
      '<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Theme">\u263E</button>' +
      '</div>' +
      '<nav class="menu-nav">' +
      '<a href="index.html" data-i18n="home">\u062e\u0627\u0646\u0647</a>' +
      '<a href="media.html" data-i18n="media">\u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627</a>' +
      '<a href="bible.html" data-i18n="bibleNav">\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633</a>' +
      '<a href="teachings.html" data-i18n="teachingsNav">\u0622\u0645\u0648\u0632\u0634\u200c\u0647\u0627</a>' +
      '<a href="live.html" data-i18n="live">\u067e\u062e\u0634 \u0632\u0646\u062f\u0647</a>' +
      '<a href="questions.html" data-i18n="questionsNav">\u0633\u0648\u0627\u0644\u0627\u062a</a>' +
      '<a href="feedback.html" data-i18n="feedbackNav">\u0628\u0627\u0632\u062e\u0648\u0631\u062f</a>' +
      '<a href="about.html" data-i18n="about">\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627</a>' +
      '<a href="contact.html" data-i18n="contact">\u062a\u0645\u0627\u0633</a>' +
      '<a href="privacy.html" data-i18n="privacyNav">\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc</a>' +
      '<a href="admin.html" data-i18n="admin">\u0645\u062f\u06cc\u0631\u06cc\u062a</a>' +
      '</nav>';

    headerInner.insertBefore(btn, headerInner.firstChild);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    function openMenu() {
      panel.classList.add('open');
      overlay.classList.add('open');
      overlay.removeAttribute('hidden');
      overlay.style.display = 'block';
      overlay.style.pointerEvents = 'auto';
      document.body.classList.add('menu-open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      overlay.setAttribute('hidden', '');
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      document.body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function () {
      if (panel.classList.contains('open')) closeMenu();
      else openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    document.getElementById('menu-close').addEventListener('click', closeMenu);
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var next = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyThemeIcon(next);
    });
  }

  function boot() {
    try {
      var saved = localStorage.getItem(THEME_KEY) || 'light';
      applyThemeIcon(saved);
    } catch (e) {}
    ensureMenu();
    refreshMenuLabels();
    document.getElementById('lang-toggle') && document.getElementById('lang-toggle').addEventListener('click', function () {
      setTimeout(refreshMenuLabels, 80);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  try {
    if (!document.querySelector('script[data-ads-js]')) {
      var ads = document.createElement('script');
      ads.src = 'js/ads.js';
      ads.setAttribute('data-ads-js', '1');
      ads.async = true;
      document.body.appendChild(ads);
    }
  } catch (e) {}

  try {
    var fx = document.createElement('script');
    fx.src = 'js/menu_overlay_fix.js';
    document.body.appendChild(fx);
  } catch (e) {}

  try {
    if (!document.querySelector('script[data-bugfixes]')) {
      var bf = document.createElement('script');
      bf.src = 'js/bugfixes.js';
      bf.setAttribute('data-bugfixes', '1');
      document.body.appendChild(bf);
    }
  } catch (e) {}

  try {
    if (!document.querySelector('script[data-footer-legal]')) {
      var fl = document.createElement('script');
      fl.src = 'js/footer_legal.js';
      fl.setAttribute('data-footer-legal', '1');
      document.body.appendChild(fl);
    }
  } catch (e) {}

  try {
    if (!document.querySelector('script[data-privacy-banner]')) {
      var pb = document.createElement('script');
      pb.src = 'js/privacy_banner.js';
      pb.setAttribute('data-privacy-banner', '1');
      document.body.appendChild(pb);
    }
  } catch (e) {}

  try {
    if (!document.querySelector('script[data-visits]')) {
      var vs = document.createElement('script');
      vs.src = 'js/visits.js';
      vs.setAttribute('data-visits', '1');
      document.body.appendChild(vs);
    }
  } catch (e) {}

  try {
    if (!document.querySelector('link[data-mobile-header]')) {
      var mh = document.createElement('link');
      mh.rel = 'stylesheet';
      mh.href = 'css/mobile_header.css';
      mh.setAttribute('data-mobile-header', '1');
      document.head.appendChild(mh);
    }
  } catch (e) {}

  (function loadSocial() {
    if (!document.querySelector('link[data-social-css]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/social.css';
      l.setAttribute('data-social-css', '1');
      document.head.appendChild(l);
    }
    if (!document.querySelector('script[data-social-js]')) {
      var s = document.createElement('script');
      s.src = 'js/social.js';
      s.setAttribute('data-social-js', '1');
      document.body.appendChild(s);
    }
  })();
})();
