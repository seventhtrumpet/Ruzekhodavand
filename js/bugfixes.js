/* Runtime bugfixes — auth, media sync, language, footer icons */
(function () {
  window.escapeHtml = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  };
  try {
    escapeHtml = window.escapeHtml;
  } catch (e) {}

  function refreshMediaFromCloud() {
    if (typeof window.pullMediaFromCloud !== 'function') return;
    window.pullMediaFromCloud().then(function (merged) {
      if (!merged || !merged.length) return;
      try {
        posts = merged;
      } catch (e) {}
      try {
        window.posts = merged;
      } catch (e2) {}
      try {
        if (typeof renderMedia === 'function') renderMedia();
      } catch (e3) {}
      try {
        if (typeof window.refreshMediaRotator === 'function') window.refreshMediaRotator();
      } catch (e4) {}
    });
  }

  function fixAuthVisibility() {
    try {
      var user = null;
      if (typeof currentUser !== 'undefined') user = currentUser;
      if (!user && typeof firebase !== 'undefined' && firebase.auth) {
        try {
          user = firebase.auth().currentUser;
        } catch (e) {}
      }
      var signIn = document.getElementById('btn-signin-top');
      var userBox = document.getElementById('auth-header-user');
      if (user) {
        if (signIn) signIn.style.display = 'none';
        if (userBox) {
          userBox.style.display = 'flex';
          userBox.classList.remove('hidden');
        }
      } else {
        if (signIn) signIn.style.display = '';
        if (userBox) {
          userBox.style.display = 'none';
          userBox.classList.add('hidden');
        }
      }
    } catch (e) {}
  }

  function bindLang() {
    document.querySelectorAll('#lang-toggle, [data-lang-toggle], button.lang-toggle').forEach(function (btn) {
      if (btn._bfLangBound) return;
      btn._bfLangBound = true;
      btn.addEventListener(
        'click',
        function () {
          setTimeout(function () {
            try {
              if (typeof window.applyLanguage === 'function') window.applyLanguage();
            } catch (e) {}
            try {
              if (typeof renderMedia === 'function') renderMedia();
            } catch (e2) {}
            try {
              if (typeof applySignInLabels === 'function') applySignInLabels();
            } catch (e3) {}
            fixAuthVisibility();
          }, 80);
        },
        false
      );
    });
  }

  /* Force small footer social icons even if old social.js is cached */
  function forceReadableFooterIcons() {
    var id = 'st-footer-icons-force';
    var old = document.getElementById(id);
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = id;
    st.textContent =
      '#footer-social, .footer-social {' +
      'display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;' +
      'justify-content:center!important;align-items:center!important;' +
      'gap:6px!important;padding:8px 0!important;margin:8px auto 0!important;}' +
      '#footer-social a, .footer-social a, #footer-social a.social-yt, #footer-social a.social-ig,' +
      '#footer-social a.social-tt, #footer-social a.social-fb, #footer-social a.social-wa {' +
      'width:32px!important;height:32px!important;min-width:32px!important;min-height:32px!important;' +
      'max-width:32px!important;max-height:32px!important;border-radius:50%!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'padding:0!important;margin:0!important;flex:0 0 32px!important;box-sizing:border-box!important;}' +
      '#footer-social a svg, .footer-social a svg {' +
      'width:19px!important;height:19px!important;max-width:19px!important;max-height:19px!important;display:block!important;}' +
      '#footer-social a.social-yt svg, .footer-social a.social-yt svg { fill:#fff!important; }' +
      '#footer-social a.social-ig { background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)!important; }' +
      '#footer-social a.social-ig svg, .footer-social a.social-ig svg { fill:#fff!important; }' +
      '#footer-social a.social-fb svg, .footer-social a.social-fb svg { fill:#fff!important; }' +
      '#footer-social a.social-wa { background:#25D366!important; }' +
      '#footer-social a.social-wa svg, .footer-social a.social-wa svg { fill:#fff!important; }' +
      '#footer-social a.social-tt svg, .footer-social a.social-tt svg { fill:#fff!important; }';
    document.head.appendChild(st);

    // Also set inline styles as last resort
    var host = document.getElementById('footer-social');
    if (host) {
      host.style.cssText = 'display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;justify-content:center!important;align-items:center!important;gap:6px!important;';
      Array.prototype.forEach.call(host.querySelectorAll('a'), function (a) {
        a.style.setProperty('width', '32px', 'important');
        a.style.setProperty('height', '32px', 'important');
        a.style.setProperty('min-width', '32px', 'important');
        a.style.setProperty('min-height', '32px', 'important');
        a.style.setProperty('max-width', '32px', 'important');
        a.style.setProperty('max-height', '32px', 'important');
        a.style.borderRadius = '50%';
        a.style.padding = '0';
        a.style.margin = '0';
        a.style.display = 'inline-flex';
        a.style.alignItems = 'center';
        a.style.justifyContent = 'center';
        var svg = a.querySelector('svg');
        if (svg) {
          svg.style.setProperty('width', '19px', 'important');
          svg.style.setProperty('height', '19px', 'important');
          svg.style.setProperty('max-width', '19px', 'important');
          svg.style.setProperty('max-height', '19px', 'important');
        }
      });
    }
  }

  function boot() {
    bindLang();
    fixAuthVisibility();
    refreshMediaFromCloud();

    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function () {
          fixAuthVisibility();
        });
      }
    } catch (e) {}

    setTimeout(bindLang, 500);
    setTimeout(fixAuthVisibility, 600);
    setTimeout(refreshMediaFromCloud, 2000);
    setTimeout(refreshMediaFromCloud, 5000);

    // Run after social.js has injected its (possibly cached) styles
    setTimeout(forceReadableFooterIcons, 100);
    setTimeout(forceReadableFooterIcons, 500);
    setTimeout(forceReadableFooterIcons, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
