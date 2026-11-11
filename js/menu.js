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
      '<a href="https://youtube.com/@seventhtrumpetmedia" target="_blank" rel="noopener" aria-label="YouTube" title="YouTube">YT</a>' +
      '<a href="https://www.instagram.com/seventhtrumpet.media" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">IG</a>' +
      '<a href="https://www.tiktok.com/@seventhtrumpet.me" target="_blank" rel="noopener" aria-label="TikTok" title="TikTok">TT</a>' +
      '<a href="https://www.facebook.com/share/1Ev7nyyXVu/" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">FB</a>' +
      '<a href="https://wa.me/442081333076" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">WA</a>' +
      '</div>' +
      '<div class="menu-contact">' +
      '<a href="https://wa.me/442081333076" dir="ltr">WhatsApp +44 208 133 3076</a>' +
      '<a href="tel:+37433222450" dir="ltr">Phone +374 33 222 450</a>' +
      '<a href="mailto:info.seventhtrumpet@gmail.com">info.seventhtrumpet@gmail.com</a>' +
      '<a href="mailto:seventh.trumpet@yahoo.com">seventh.trumpet@yahoo.com</a>' +
      '</div></div>';

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
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(refreshMenuLabels, 80); });
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
  /* Profile photo pieces MUST load before share_card */
  loadScript('js/share_pe1.js', 'data-share-pe1');
  loadScript('js/share_pe2.js', 'data-share-pe2');
  loadScript('js/share_card.js', 'data-share-card');
  loadScript('js/share.js', 'data-share');
  loadScript('js/bible-share.js', 'data-bible-share');
  loadScript('js/page_back.js', 'data-page-back');
  loadScript('js/fixed_header.js', 'data-fixed-header');
  loadScript('js/bible_bar_fix.js', 'data-bible-bar-fix');
  loadScript('js/bible_search.js', 'data-bible-search');
  loadScript('js/home_polish.js', 'data-home-polish');
  loadScript('js/welcome_tip.js', 'data-welcome-tip');
  loadScript('js/loading.js', 'data-loading');
  loadScript('js/cloud_sync.js', 'data-cloud-sync');
  loadScript('js/media_public_fix.js', 'data-media-public-fix');
  loadScript('js/user_playlists.js', 'data-user-playlists');
  loadScript('js/player_expand.js', 'data-player-expand');
  loadScript('js/app_media.js', 'data-app-media');
  loadCss('css/mobile_header.css', 'data-mobile-header');
  loadCss('css/social.css', 'data-social-css');
  loadCss('css/quality.css', 'data-quality-css');
  loadCss('css/player_expand.css', 'data-player-expand-css');
  loadScript('js/social.js', 'data-social-js');
})();
