/* Sign in at top; Google/Email only after click */
(function () {
  function applySignInLabels() {
    const fa = (typeof currentLang !== 'undefined' ? currentLang : 'fa') === 'fa';
    const set = (sel, faT, enT) => {
      document.querySelectorAll(sel).forEach(el => { el.textContent = fa ? faT : enT; });
    };
    set('[data-i18n-signin]', 'ورود', 'Sign in');
    set('[data-i18n-signout]', 'خروج', 'Sign out');
    set('[data-i18n-signin-title]', 'ورود', 'Sign in');
    set('[data-i18n-signin-google]', 'ورود با گوگل', 'Sign in with Google');
    set('[data-i18n-signin-email]', 'ورود با ایمیل', 'Sign in with Email');
  }
  window.applySignInLabels = applySignInLabels;

  function closeSignInModal() {
    document.getElementById('signin-modal')?.classList.remove('open');
  }
  window.closeSignInModal = closeSignInModal;

  function openSignInModal() {
    document.getElementById('signin-modal')?.classList.add('open');
  }

  function ensureAuthUI() {
    const bar = document.getElementById('user-bar');
    if (bar) bar.style.display = 'none';

    if (!document.getElementById('signin-modal')) {
      const modal = document.createElement('div');
      modal.id = 'signin-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML =
        '<div class="modal" style="max-width:380px;text-align:center;">' +
        '<button type="button" class="modal-close" id="signin-modal-close">&times;</button>' +
        '<h2 style="margin-bottom:1.2rem;color:var(--primary)" data-i18n-signin-title>ورود</h2>' +
        '<button type="button" id="btn-google" class="btn btn-primary" style="width:100%;margin-bottom:0.7rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">' +
        '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="">' +
        '<span data-i18n-signin-google>ورود با گوگل</span></button>' +
        '<button type="button" id="btn-email" class="btn btn-outline" style="width:100%;" data-i18n-signin-email>ورود با ایمیل</button>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) closeSignInModal(); });
      document.getElementById('signin-modal-close').addEventListener('click', closeSignInModal);
    }

    let actions = document.querySelector('.header-actions');
    if (!actions) {
      const inner = document.querySelector('.header-inner');
      if (inner) {
        actions = document.createElement('div');
        actions.className = 'header-actions';
        inner.appendChild(actions);
      }
    }
    if (actions && !document.getElementById('btn-signin-top')) {
      const wrap = document.createElement('div');
      wrap.id = 'auth-header-wrap';
      wrap.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
      wrap.innerHTML =
        '<button type="button" id="btn-signin-top" class="btn btn-primary btn-sm" data-i18n-signin>ورود</button>' +
        '<div id="auth-header-user" class="hidden" style="display:none;align-items:center;gap:0.5rem;">' +
        '<span id="user-display-top" style="font-size:0.85rem;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></span>' +
        '<button type="button" id="btn-signout-top" class="btn btn-outline btn-sm" data-i18n-signout>خروج</button></div>';
      const menuToggle = document.getElementById('menu-toggle');
      if (menuToggle && menuToggle.parentNode === actions) actions.insertBefore(wrap, menuToggle);
      else actions.insertBefore(wrap, actions.firstChild);
    }
    applySignInLabels();
  }

  function updateAuthUITop() {
    const btnSignIn = document.getElementById('btn-signin-top');
    const userWrap = document.getElementById('auth-header-user');
    const display = document.getElementById('user-display-top');
    const bar = document.getElementById('user-bar');
    if (bar) bar.style.display = 'none';
    const user = (typeof currentUser !== 'undefined') ? currentUser : null;
    const t = (typeof T !== 'undefined' && typeof currentLang !== 'undefined' && T[currentLang]) ? T[currentLang] : { welcome: 'Welcome' };
    if (user) {
      if (btnSignIn) btnSignIn.style.display = 'none';
      if (userWrap) { userWrap.style.display = 'flex'; userWrap.classList.remove('hidden'); }
      if (display) {
        const name = user.displayName || user.email || 'User';
        const esc = (typeof escapeHtml === 'function') ? escapeHtml(name) : name;
        display.innerHTML = (t.welcome || '') + ', <strong>' + esc + '</strong>';
      }
      closeSignInModal();
    } else {
      if (btnSignIn) btnSignIn.style.display = '';
      if (userWrap) { userWrap.style.display = 'none'; userWrap.classList.add('hidden'); }
    }
    applySignInLabels();
  }

  function bindAuth() {
    ensureAuthUI();
    document.getElementById('btn-signin-top')?.addEventListener('click', openSignInModal);
    const g = document.getElementById('btn-google');
    if (g) {
      const ng = g.cloneNode(true);
      g.parentNode.replaceChild(ng, g);
      ng.addEventListener('click', () => {
        if (typeof auth !== 'undefined') auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
      });
    }
    const e = document.getElementById('btn-email');
    if (e) {
      const ne = e.cloneNode(true);
      e.parentNode.replaceChild(ne, e);
      ne.addEventListener('click', () => {
        closeSignInModal();
        document.getElementById('email-modal')?.classList.add('open');
      });
    }
    document.getElementById('btn-signout-top')?.addEventListener('click', () => {
      if (typeof auth !== 'undefined') auth.signOut();
    });
    if (typeof auth !== 'undefined') {
      auth.onAuthStateChanged(user => {
        try { currentUser = user; } catch (err) {}
        updateAuthUITop();
      });
    }
    document.getElementById('lang-toggle')?.addEventListener('click', () => setTimeout(applySignInLabels, 80));
    updateAuthUITop();
  }

  function boot() { setTimeout(bindAuth, 150); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
