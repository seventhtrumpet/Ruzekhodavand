/* Runtime bugfixes — auth, media sync, language */
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

  function boot() {
    bindLang();
    fixAuthVisibility();
    refreshMediaFromCloud();

    // Firebase auth state
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
