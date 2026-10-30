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
      '<a href="live.html" data-i18n="live">\u067e\u062e\u0634 \u0632\u0646\u062f\u0647</a>' +
      '<a href="questions.html" data-i18n="questionsNav">\u0633\u0648\u0627\u0644\u0627\u062a</a>' +
      '<a href="feedback.html" data-i18n="feedbackNav">\u0628\u0627\u0632\u062e\u0648\u0631\u062f</a>' +
      '<a href="about.html" data-i18n="about">\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627</a>' +
      '<a href="contact.html" data-i18n="contact">\u062a\u0645\u0627\u0633</a>' +
      '<a href="privacy.html" data-i18n="privacyNav">\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc</a>' +
      '</nav>' +
      '<div class="menu-social">' +
      '<div class="menu-social-title" data-i18n="followUs">Follow us</div>' +
      '<div class="menu-social-icons">' +
      '<a href="https://youtube.com/@seventhtrumpetmedia" target="_blank" rel="noopener" aria-label="YouTube" title="YouTube">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.84.56 9.38.56 9.38.56s7.54 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.52V8.48L15.82 12l-6.07 3.52z"/></svg></a>' +
      '<a href="https://www.instagram.com/seventhtrumpet.media" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.56a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg></a>' +
      '<a href="https://www.tiktok.com/@seventhtrumpet.me" target="_blank" rel="noopener" aria-label="TikTok" title="TikTok">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.8a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z"/></svg></a>' +
      '<a href="https://www.facebook.com/share/1Ev7nyyXVu/" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg></a>' +
      '<a href="https://wa.me/442081333076" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-.14l-.36-.13-3.73.98 1-3.64-.24-.37a9.78 9.78 0 0 1-1.5-5.23C2.2 6.56 6.62 2.15 12.06 2.15c2.62 0 5.08 1.02 6.93 2.87a9.73 9.73 0 0 1 2.86 6.93c-.01 5.44-4.43 9.85-9.8 9.85zm0-17.96C7.43 3.84 3.7 7.56 3.7 12.15c0 1.67.44 3.3 1.27 4.73L3.6 20.6l3.83-1a9.75 9.75 0 0 0 4.62 1.17h.01c4.58 0 8.31-3.72 8.32-8.31 0-2.22-.86-4.3-2.43-5.87a8.3 8.3 0 0 0-5.9-2.45z"/></svg></a>' +
      '</div>' +
      '<div class="menu-contact">' +
      '<a href="https://wa.me/442081333076" dir="ltr">WhatsApp +44 208 133 3076</a>' +
      '<a href="tel:+37433222450" dir="ltr">Phone +374 33 222 450</a>' +
      '<a href="mailto:info.seventhtrumpet@gmail.com">info.seventhtrumpet@gmail.com</a>' +
      '<a href="mailto:seventh.trumpet@yahoo.com">seventh.trumpet@yahoo.com</a>' +
      '</div>' +
      '</div>';

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

  function loadScript(src, attr) {
    try {
      if (document.querySelector('script[' + attr + ']')) return;
      var s = document.createElement('script');
      s.src = src;
      s.setAttribute(attr, '1');
      document.body.appendChild(s);
    } catch (e) {}
  }
  function loadCss(href, attr) {
    try {
      if (document.querySelector('link[' + attr + ']')) return;
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = href;
      l.setAttribute(attr, '1');
      document.head.appendChild(l);
    } catch (e) {}
  }

  loadScript('js/ads.js', 'data-ads-js');
  loadScript('js/menu_overlay_fix.js', 'data-menu-overlay-fix');
  loadScript('js/bugfixes.js', 'data-bugfixes');
  loadScript('js/footer_legal.js', 'data-footer-legal');
  loadScript('js/privacy_banner.js', 'data-privacy-banner');
  loadScript('js/logo_data.js', 'data-logo-data');
  loadScript('js/visits.js', 'data-visits');
  loadScript('js/text_size.js', 'data-text-size');
  loadScript('js/share.js', 'data-share');
  loadScript('js/loading.js', 'data-loading');
  loadCss('css/mobile_header.css', 'data-mobile-header');
  loadCss('css/social.css', 'data-social-css');
  loadScript('js/social.js', 'data-social-js');
})();
