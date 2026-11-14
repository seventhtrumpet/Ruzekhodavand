/* Sign-in UI — unique IDs, works on mobile + desktop */
(function () {
  function isFa() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') !== 'en';
    } catch (e) {
      return true;
    }
  }

  function applySignInLabels() {
    function set(sel, fa, en) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.textContent = isFa() ? fa : en;
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
    ensureHeaderAuth();
    bindModalButtons();
    var m = document.getElementById('signin-modal');
    if (m) m.classList.add('open');
    applySignInLabels();
  }
  window.openSignInModal = openSignInModal;

  function ensureHeaderAuth() {
    // Hide the old full-width user bar (we use header button instead)
    var bar = document.getElementById('user-bar');
    if (bar) bar.style.display = 'none';

    if (!document.getElementById('signin-modal')) {
      var modal = document.createElement('div');
      modal.id = 'signin-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML =
        '<div class="modal" style="max-width:380px;text-align:center;">' +
        '<button type="button" class="modal-close" id="signin-modal-close" aria-label="Close">&times;</button>' +
        '<h2 style="margin-bottom:1.2rem;color:var(--primary)" data-i18n-signin-title>\u0648\u0631\u0648\u062F</h2>' +
        '<p id="signin-error" style="color:#c62828;font-size:0.9rem;margin-bottom:0.8rem;display:none;"></p>' +
        '<button type="button" id="btn-google-modal" class="btn btn-primary" style="width:100%;margin-bottom:0.7rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">' +
        '<span style="font-size:1.1rem;">G</span> ' +
        '<span data-i18n-signin-google>\u0648\u0631\u0648\u062F \u0628\u0627 \u06AF\u0648\u06AF\u0644</span></button>' +
        '<button type="button" id="btn-email-modal" class="btn btn-outline" style="width:100%;" data-i18n-signin-email>\u0648\u0631\u0648\u062F \u0628\u0627 \u0627\u06CC\u0645\u06CC\u0644</button>' +
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
        '<button type="button" id="btn-signin-top" class="btn btn-primary btn-sm" data-i18n-signin style="background:#c9a227;color:#0a2540;border:none;font-weight:700;padding:0.25rem 0.55rem;font-size:0.78rem;line-height:1.2;border-radius:6px;">\u0648\u0631\u0648\u062F</button>' +
        '<div id="auth-header-user" class="hidden" style="display:none;align-items:center;gap:0.5rem;">' +
        '<span id="user-display-top" style="font-size:0.85rem;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;"></span>' +
        '<button type="button" id="btn-signout-top" class="btn btn-outline btn-sm" data-i18n-signout style="color:#fff;border-color:rgba(255,255,255,.5);padding:0.25rem 0.55rem;font-size:0.78rem;">\u062E\u0631\u0648\u062C</button></div>';
      actions.insertBefore(wrap, actions.firstChild);
    }
    applySignInLabels();
  }

  function showSignInError(msg) {
    var el = document.getElementById('signin-error');
    if (!el) {
      alert(msg);
      return;
    }
    el.style.display = 'block';
    el.textContent = msg;
  }

  function googleSignIn() {
    if (typeof firebase === 'undefined' || typeof auth === 'undefined' || !auth) {
      showSignInError(isFa() ? '\u0627\u0628\u062A\u062F\u0627 \u0622\u0645\u0627\u062F\u0647 \u0646\u06CC\u0633\u062A. \u0635\u0641\u062D\u0647 \u0631\u0627 \u0631\u0641\u0631\u0634 \u06A9\u0646\u06CC\u062F.' : 'Auth not ready. Please refresh.');
      return;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    var useRedirect = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    function fail(err) {
      console.warn('Google sign-in error', err);
      var code = err && err.code ? err.code : '';
      var msg = (err && err.message) || 'Sign-in failed';
      if (code.indexOf('unauthorized-domain') >= 0) {
        msg = isFa()
          ? '\u062F\u0627\u0645\u0646\u0647 \u0633\u0627\u06CC\u062A \u062F\u0631 Firebase \u062B\u0628\u062A \u0646\u0634\u062F\u0647. \u062F\u0631 Firebase Console \u2192 Authentication \u2192 Settings \u2192 Authorized domains \u060C seventhtrumpet.org \u0648 www.seventhtrumpet.org \u0631\u0627 \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u06CC\u062F.'
          : 'This domain is not authorized in Firebase. In Firebase Console \u2192 Authentication \u2192 Settings \u2192 Authorized domains, add seventhtrumpet.org and www.seventhtrumpet.org';
      }
      showSignInError(msg);
    }

    if (useRedirect) {
      auth.signInWithRedirect(provider).catch(fail);
      return;
    }
    auth.signInWithPopup(provider).then(function () {
      closeSignInModal();
    }).catch(function (err) {
      if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request')) {
        auth.signInWithRedirect(provider).catch(fail);
      } else {
        fail(err);
      }
    });
  }

  function openEmailModal() {
    closeSignInModal();
    var em = document.getElementById('email-modal');
    if (em) em.classList.add('open');
  }

  function bindModalButtons() {
    var g = document.getElementById('btn-google-modal');
    if (g && !g._bound) {
      g._bound = true;
      g.addEventListener('click', function (e) {
        e.preventDefault();
        googleSignIn();
      });
    }
    var em = document.getElementById('btn-email-modal');
    if (em && !em._bound) {
      em._bound = true;
      em.addEventListener('click', function (e) {
        e.preventDefault();
        openEmailModal();
      });
    }
  }

  function updateAuthHeader(user) {
    ensureHeaderAuth();
    var btnSignIn = document.getElementById('btn-signin-top');
    var userWrap = document.getElementById('auth-header-user');
    var nameEl = document.getElementById('user-display-top');
    if (!btnSignIn || !userWrap) return;
    if (user) {
      btnSignIn.style.display = 'none';
      userWrap.classList.remove('hidden');
      userWrap.style.display = 'flex';
      if (nameEl) nameEl.textContent = user.displayName || user.email || '';
    } else {
      btnSignIn.style.display = '';
      userWrap.classList.add('hidden');
      userWrap.style.display = 'none';
    }
  }

  function bindHeaderButtons() {
    ensureHeaderAuth();
    var top = document.getElementById('btn-signin-top');
    if (top && !top._bound) {
      top._bound = true;
      top.addEventListener('click', function (e) {
        e.preventDefault();
        openSignInModal();
      });
    }
    var so = document.getElementById('btn-signout-top');
    if (so && !so._bound) {
      so._bound = true;
      so.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof auth !== 'undefined' && auth) auth.signOut();
      });
    }
    bindModalButtons();
  }

  function boot() {
    ensureHeaderAuth();
    bindHeaderButtons();
    applySignInLabels();
    if (typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) {
      auth.onAuthStateChanged(function (user) {
        updateAuthHeader(user);
      });
    }
    document.addEventListener('click', function () {
      setTimeout(applySignInLabels, 50);
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();
