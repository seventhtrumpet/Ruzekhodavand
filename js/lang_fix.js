/* Bulletproof language switch — runs last, overrides everything */
(function () {
  var KEY = 'cog_lang';

  function read() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === 'en' || s === 'fa') return s;
    } catch (e) {}
    try {
      if (typeof currentLang === 'string' && (currentLang === 'en' || currentLang === 'fa')) return currentLang;
    } catch (e2) {}
    return 'fa';
  }

  function write(lang) {
    lang = lang === 'en' ? 'en' : 'fa';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    try { currentLang = lang; } catch (e2) {}
    try { window.currentLang = lang; } catch (e3) {}
    return lang;
  }

  function dict(lang) {
    if (typeof T !== 'undefined' && T && T[lang]) return T[lang];
    return {};
  }

  function apply(lang) {
    lang = write(lang);
    var t = dict(lang);

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    document.body.classList.remove('lang-en', 'lang-fa');
    document.body.classList.add(lang === 'en' ? 'lang-en' : 'lang-fa');

    if (t.pageTitle) document.title = t.pageTitle;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k && t[k] != null && String(t[k]).length) el.textContent = t[k];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (k && t[k] != null) el.placeholder = t[k];
    });
    document.querySelectorAll('[data-lang-only]').forEach(function (el) {
      el.style.display = el.getAttribute('data-lang-only') === lang ? '' : 'none';
    });

    // Lang button label: show the OTHER language name
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'fa' ? (t.langBtn || 'English') : (t.langBtn || 'Persian');
      // Also hard-set in case T missing
      if (!t.langBtn) btn.textContent = lang === 'fa' ? 'English' : '\u0641\u0627\u0631\u0633\u06CC';
    }

    try {
      if (typeof window.renderFeaturesLang === 'function') window.renderFeaturesLang();
    } catch (e) {}
    try {
      if (typeof applySignInLabels === 'function') applySignInLabels();
    } catch (e2) {}
    try {
      if (typeof updateAuthUI === 'function') updateAuthUI();
    } catch (e3) {}
    try {
      if (typeof updateLiveBadge === 'function') updateLiveBadge();
    } catch (e4) {}
    try {
      window.dispatchEvent(new CustomEvent('cog-lang-changed', { detail: { lang: lang } }));
    } catch (e5) {}
  }

  function toggle() {
    var next = read() === 'en' ? 'fa' : 'en';
    apply(next);
    try { if (typeof renderMedia === 'function') renderMedia(); } catch (e) {}
    try { if (typeof renderAll === 'function') renderAll(); } catch (e2) {}
  }

  window.applyLanguage = function () { apply(read()); };
  window.toggleLanguage = toggle;
  window.__toggleLang = toggle;
  window.__setLang = apply;
  window.__getLang = read;

  function bind() {
    // Bind every lang-toggle (in case clones exist)
    document.querySelectorAll('#lang-toggle, [data-lang-toggle], button.lang-toggle').forEach(function (btn) {
      if (btn._stLangBound) return;
      btn._stLangBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggle();
      }, true); // capture so we win over other handlers
    });
  }

  function boot() {
    // If somehow stuck, still apply current preference
    apply(read());
    bind();
    // Re-bind after late scripts inject UI
    setTimeout(function () { bind(); apply(read()); }, 300);
    setTimeout(function () { bind(); apply(read()); }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
