/* Sign in at top; Google/Email only after click */
(function () {
  function applySignInLabels() {
    var fa = true;
    try {
      fa = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('cog_lang') || 'fa') !== 'en';
    } catch (e) {}
    function set(sel, faT, enT) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.textContent = fa ? faT : enT;
      });
    }
    set('[data-i18n-signin]', '\u0648\u0631\u0648\u062F', 'Sign in');
    set('[data-i18n-signout]', '\u062E\u0631\u0648\u062C', 'Sign out');
    set('[data-i18n-signin-title]', '\u0648\u0631\u0648\u062F', 'Sign in');
    set('[data-i18n-signin-google]', '\u0648\u0631\u0648\u062F \u0628\u0627 \u06AF\u0648\u06AF\u0644', 'Sign in with Google');
    set('[data-i18n-signin-email]', '\u0648\u0631\u0648\u062F \u0628\u0627 \u0627\u06CC\u0645\u06CC\u0644', 'Sign in with Email');
  }
  window.applySignInLabels = applySignInLabels;

  function closeSignInModal() {
    var m = document.getElementById('signin-modal');
    if (m) m.classList.remove('open');
  }
  window.closeSignInModal = closeSignInModal;

  function openSignInModal() {
    ensureAuthUI();
    var m = document.getElementById('signin-modal');
    if (m) m.classList.add('open');
    applySignInLabels();
  }
  window.openSignInModal = openSignInModal;

  function ensureAuthUI() {
    var bar = document.getElementById('user-bar');
    if (bar) bar.style.display = 'none';

    if (!document.getElementById('signin-modal')) {
      var modal = document.createElement('div');
      modal.id = 'signin-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML =
        '<div class="modal" style="max-width:380px;text-align:center;">' +
        '<button type="button" class="modal-close" id="signin-modal-close">&times;</button>' +
        '<h2 style="margin-bottom:1.2rem;color:var(--primary)" data-i18n-signin-title>\u0648\u0631\u0648\u062F</h2>' +
        '<button type="button" id="btn-google" class="btn btn-primary" style="width:100%;margin-bottom:0.7rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">' +
        '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="">' +
        '<span data-i18n-signin-google>\u0648\u0631\u0648\u062F \u0628\u0627 \u06AF\u0648\u06AF\u0644</span></button>' +
        '<button type="button" id="btn-email" class="btn btn-outline" style="width:100%;" data-i18n-signin-email>\u0648\u0631\u0648\u062F \u0628\u0627 \u0627\u06CC\u0645\u06CC\u0644</button>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeSignInModal();
      });
      document.getElementById('signin-modal-close').addEventListener('click', closeSignInModal);
    }

    var actions = document.querySelector('.header-actions');
    if (!actions) {
      var inner = document.querySelector('.header-inner');
      if (inner) {
        actions = document.createElement('div');
        actions.className = 'header-actions';
        actions.style.cssText = 'display:flex;align-items:center;gap:0.4rem;margin-inline-start:auto;';
        inner.appendChild(actions);
      }
    }
    if (actions && !document.getElementById('btn-signin-top')) {
      var wrap = document.createElement('div');
      wrap.id = 'auth-header-wrap';
      wrap.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
      wrap.innerHTML =
        '<button type="button" id="btn-signin-top" class="btn btn-primary btn-sm" data-i18n-signin>\u0648\u0631\u0648\u062F</button>' +
        '<div id="auth-header-user" class="hidden" style="display:none;align-items:center;gap:0.5rem;">' +
        '<span id="user-display-top" style="font-size:0.85rem;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;"></span>' +
        '<button type="button" id="btn-signout-top" class="btn btn-outline btn-sm" data-i18n-signout>\u062E\u0631\u0648\u062C</button></div>';
      actions.insertBefore(wrap, actions.firstChild);
    }
    applySignInLabels();
  }

  function updateAuthUITop() {
    var btnSignIn = document.getElementById('btn-signin-top');
    var userWrap = document.getElementById('auth-header-user');
    var display = document.getElementById('user-display-top');
    var bar = document.getElementById('user-bar');
    if (bar) bar.style.display = 'none';
    var user = null;
    try { user = typeof currentUser !== 'undefined' ? currentUser : null; } catch (e) {}
    var t = { welcome: 'Welcome' };
    try {
      if (typeof T !== 'undefined' && typeof currentLang !== 'undefined' && T[currentLang]) t = T[currentLang];
    } catch (e2) {}
    if (user) {
      if (btnSignIn) btnSignIn.style.display = 'none';
      if (userWrap) {
        userWrap.style.display = 'flex';
        userWrap.classList.remove('hidden');
      }
      if (display) {
        var name = user.displayName || user.email || 'User';
        var esc = typeof escapeHtml === 'function' ? escapeHtml(name) : name;
        display.innerHTML = (t.welcome || '') + ', <strong>' + esc + '</strong>';
      }
      closeSignInModal();
    } else {
      if (btnSignIn) btnSignIn.style.display = '';
      if (userWrap) {
        userWrap.style.display = 'none';
        userWrap.classList.add('hidden');
      }
    }
    applySignInLabels();
  }

  function googleSignIn() {
    if (typeof auth === 'undefined' || !auth || typeof firebase === 'undefined') {
      alert('Auth not ready. Please refresh.');
      return;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function (err) {
      // Fallback to redirect if popup blocked
      if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user')) {
        auth.signInWithRedirect(provider).catch(function (e2) {
          console.log(e2);
          alert(e2.message || 'Sign-in failed');
        });
      } else {
        console.log(err);
        alert((err && err.message) || 'Sign-in failed');
      }
    });
  }

  function bindAuth() {
    ensureAuthUI();
    var top = document.getElementById('btn-signin-top');
    if (top && !top._bound) {
      top._bound = true;
      top.addEventListener('click', openSignInModal);
    }

    var g = document.getElementById('btn-google');
    if (g && !g._bound) {
      g._bound = true;
      g.addEventListener('click', googleSignIn);
    }

    var e = document.getElementById('btn-email');
    if (e && !e._bound) {
      e._bound = true;
      e.addEventListener('click', function () {
        closeSignInModal();
        var em = document.getElementById('email-modal');
        if (em) em.classList.add('open');
      });
    }

    var so = document.getElementById('btn-signout-top');
    if (so && !so._bound) {
      so._bound = true;
      so.addEventListener('click', function () {
        if (typeof auth !== 'undefined') auth.signOut();
      });
    }

    if (typeof auth !== 'undefined') {
      auth.onAuthStateChanged(function (user) {
        try { currentUser = user; } catch (err) {}
        updateAuthUITop();
      });
    }
    document.getElementById('lang-toggle') &&
      document.getElementById('lang-toggle').addEventListener('click', function () {
        setTimeout(applySignInLabels, 80);
      });
    updateAuthUITop();
  }

  function boot() {
    setTimeout(bindAuth, 100);
    setTimeout(bindAuth, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
