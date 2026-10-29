/* Force reliable Persian/English switching + feature tiles + sign-in */
(function () {
  var LANG_KEY = 'cog_lang';

  function getLang() {
    try {
      if (typeof currentLang !== 'undefined' && (currentLang === 'fa' || currentLang === 'en')) {
        return currentLang;
      }
    } catch (e) {}
    try {
      var s = localStorage.getItem(LANG_KEY);
      if (s === 'en' || s === 'fa') return s;
    } catch (e2) {}
    return 'fa';
  }

  function setLang(lang) {
    lang = lang === 'en' ? 'en' : 'fa';
    try { currentLang = lang; } catch (e) {}
    try { localStorage.setItem(LANG_KEY, lang); } catch (e2) {}
    return lang;
  }

  function applyAll() {
    var lang = setLang(getLang());
    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-fa', lang === 'fa');
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    var t = (typeof T !== 'undefined' && T[lang]) ? T[lang] : {};
    if (t.pageTitle) document.title = t.pageTitle;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key && t[key] != null && String(t[key]).length) {
        el.textContent = t[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key && t[key] != null) el.placeholder = t[key];
    });
    document.querySelectorAll('[data-lang-only]').forEach(function (el) {
      el.style.display = (el.getAttribute('data-lang-only') === lang) ? '' : 'none';
    });

    // Feature tiles (keep same cards, only update language)
    try {
      if (typeof window.renderFeaturesLang === 'function') window.renderFeaturesLang();
    } catch (e3) {}

    try { if (typeof applySignInLabels === 'function') applySignInLabels(); } catch (e4) {}
    try { if (typeof updateAuthUI === 'function') updateAuthUI(); } catch (e5) {}
    try { if (typeof updateLiveBadge === 'function') updateLiveBadge(); } catch (e6) {}
    try {
      window.dispatchEvent(new CustomEvent('cog-lang-changed', { detail: { lang: lang } }));
    } catch (e7) {}
  }

  function toggle() {
    var next = getLang() === 'fa' ? 'en' : 'fa';
    setLang(next);
    applyAll();
    try { if (typeof renderMedia === 'function') renderMedia(); } catch (e) {}
    try { if (typeof renderAll === 'function') renderAll(); } catch (e2) {}
  }

  // Override global functions so every script uses this fixed version
  window.applyLanguage = applyAll;
  window.toggleLanguage = toggle;
  try {
    applyLanguage = applyAll;
    toggleLanguage = toggle;
  } catch (e) {}

  function bindToggle() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    // Replace node to drop broken/duplicate listeners
    var neu = btn.cloneNode(true);
    btn.parentNode.replaceChild(neu, btn);
    neu.id = 'lang-toggle';
    neu.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      toggle();
    });
  }

  function ensureSignIn() {
    // Feature tile / any [data-open-signin] opens the modal
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-open-signin], a[href="#signin"], a[href="index.html#user-bar"]');
      if (!a) return;
      e.preventDefault();
      if (typeof openSignInModal === 'function') {
        openSignInModal();
        return;
      }
      var modal = document.getElementById('signin-modal');
      if (modal) {
        modal.classList.add('open');
        return;
      }
      // Fallback: show classic user-bar + email modal path
      var bar = document.getElementById('user-bar');
      if (bar) {
        bar.style.display = '';
        bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      var emailBtn = document.getElementById('btn-email');
      var googleBtn = document.getElementById('btn-google');
      if (googleBtn) googleBtn.click();
      else if (emailBtn) emailBtn.click();
    });
  }

  function boot() {
    // Default Persian if never set
    try {
      if (!localStorage.getItem(LANG_KEY)) localStorage.setItem(LANG_KEY, 'fa');
    } catch (e) {}
    bindToggle();
    ensureSignIn();
    // Apply after other i18n merges finish
    setTimeout(applyAll, 0);
    setTimeout(applyAll, 200);
    setTimeout(applyAll, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
