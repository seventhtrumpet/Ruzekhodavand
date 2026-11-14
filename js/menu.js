/* Header hamburger menu + theme + load shared scripts */
(function () {
  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function refreshThemeBtn() {
    try {
      var btn = document.getElementById('theme-toggle');
      if (!btn) return;
      var dark = document.body.classList.contains('dark');
      btn.textContent = dark ? '\u2600' : '\u263E';
      btn.setAttribute('aria-label', dark ? 'Light' : 'Dark');
    } catch (e) {}
  }

  function refreshMenuLabels() {
    try {
      var lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
      var Tref = typeof T !== 'undefined' ? T[lang] : null;
      if (!Tref) return;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var k = el.getAttribute('data-i18n');
        if (k && Tref[k]) el.textContent = Tref[k];
      });
    } catch (e) {}
  }

  function boot() {
    var header = document.querySelector('.header-inner') || document.querySelector('.header');
    if (!header) return;
    if (document.getElementById('nav-burger')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'nav-burger';
    btn.className = 'nav-burger';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span></span><span></span><span></span>';

    var overlay = document.createElement('div');
    overlay.id = 'nav-overlay';
    overlay.className = 'nav-overlay';

    var panel = document.createElement('div');
    panel.id = 'nav-panel';
    panel.className = 'nav-panel';
    panel.innerHTML =
      '<div class="nav-panel-head">' +
      '<span class="nav-panel-title" data-i18n="menuTitle">\u0645\u0646\u0648</span>' +
      '<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Theme">\u263E</button>' +
      '<button type="button" id="nav-close" class="nav-close" aria-label="Close">\u00d7</button>' +
      '</div>' +
      '<nav class="nav-panel-links"></nav>';

    var nav = header.querySelector('.nav-main') || header.querySelector('nav');
    var linksHost = panel.querySelector('.nav-panel-links');
    if (nav) {
      nav.querySelectorAll('a').forEach(function (a) {
        var c = a.cloneNode(true);
        linksHost.appendChild(c);
      });
    }

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    if (header.firstChild) header.insertBefore(btn, header.firstChild);
    else header.appendChild(btn);

    function openMenu() {
      document.body.classList.add('nav-open');
      overlay.classList.add('open');
      panel.classList.add('open');
    }
    function closeMenu() {
      document.body.classList.remove('nav-open');
      overlay.classList.remove('open');
      panel.classList.remove('open');
    }

    btn.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
    document.getElementById('nav-close').addEventListener('click', closeMenu);
    linksHost.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.getElementById('theme-toggle').addEventListener('click', function () {
      document.body.classList.toggle('dark');
      try {
        localStorage.setItem('cog_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
      } catch (e) {}
      refreshThemeBtn();
    });

    try {
      if (localStorage.getItem('cog_theme') === 'dark') document.body.classList.add('dark');
    } catch (e) {}
    refreshThemeBtn();
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

  loadScript('js/lang_flags.js', 'data-lang-flags');
  loadScript('js/ads.js', 'data-ads-js');
  loadScript('js/menu_overlay_fix.js', 'data-menu-overlay-fix');
  loadScript('js/bugfixes.js', 'data-bugfixes');
  loadScript('js/footer_legal.js', 'data-footer-legal');
  loadScript('js/privacy_banner.js', 'data-privacy-banner');
  loadScript('js/logo_data.js', 'data-logo-data');
  loadScript('js/visits.js', 'data-visits');
  loadScript('js/text_size.js', 'data-text-size');
  loadScript('js/profile_bg.js', 'data-profile-bg');
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
  loadCss('css/about_fix.css', 'data-about-fix');
  loadCss('css/mobile_header.css', 'data-mobile-header');
  loadCss('css/social.css', 'data-social-css');
  loadCss('css/quality.css', 'data-quality-css');
  loadCss('css/player_expand.css', 'data-player-expand-css');
  loadScript('js/social.js', 'data-social-js');
})();
