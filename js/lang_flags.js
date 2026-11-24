/* Neutral language choices — Persian / English labels in header */
(function () {
  if (window.__stFlagsInit) return;
  window.__stFlagsInit = true;

  function readLang() {
    try {
      var L = localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa';
      return L === 'en' ? 'en' : 'fa';
    } catch (e) { return 'fa'; }
  }

  function setLang(lang) {
    lang = lang === 'en' ? 'en' : 'fa';
    try {
      localStorage.setItem('cog_lang', lang);
      localStorage.setItem('cog_lang_chosen', '1');
    } catch (e) {}
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    } catch (e2) {}
    try { if (typeof currentLang !== 'undefined') currentLang = lang; } catch (e3) {}
    try { window.currentLang = lang; } catch (e4) {}
    try {
      if (typeof applyLanguage === 'function') applyLanguage();
      else if (window.langFix && typeof window.langFix.apply === 'function') window.langFix.apply(lang);
    } catch (e5) {}
    try {
      window.dispatchEvent(new CustomEvent('cog-lang-changed', { detail: { lang: lang } }));
    } catch (e6) {}
    try { location.reload(); } catch (e7) {}
  }

  function syncActive() {
    var lang = readLang();
    document.querySelectorAll('.st-lang-flag').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-lang') === lang);
    });
  }

  function ensureCss() {
    if (document.getElementById('st-lang-flags-css')) return;
    var st = document.createElement('style');
    st.id = 'st-lang-flags-css';
    st.textContent =
      '.header-inner{display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:0.25rem!important}' +
      '#header-social.header-social{display:flex!important;flex-shrink:0!important;gap:0.2rem!important;order:2}' +
      '#header-social.header-social a{width:1.5rem!important;height:1.5rem!important}' +
      '.header-actions{display:flex!important;align-items:center!important;gap:0.2rem!important;margin-inline-start:auto!important;flex-shrink:0!important;order:5}' +
      '.st-lang-flags{display:inline-flex!important;align-items:flex-end;gap:0.2rem;flex-shrink:0;order:4;visibility:visible!important;opacity:1!important}' +
      '.lang-toggle.st-lang-hidden,#lang-toggle.st-lang-hidden{display:none!important}' +
      '.st-lang-flag{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0.08rem;padding:0.12rem 0.2rem;border:1px solid rgba(255,255,255,0.3);border-radius:8px;background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;font-family:inherit;min-width:2.4rem}' +
      '.st-lang-flag .st-lang-emoji{font-size:1rem;line-height:1}' +
      '.st-lang-flag .st-lang-label{font-size:0.62rem;font-weight:700;letter-spacing:0.02em}' +
      '.st-lang-flag.is-active{background:rgba(201,162,39,0.35);border-color:#c9a227}';
    document.head.appendChild(st);
  }

  function paint() {
    ensureCss();
    var actions = document.querySelector('.header-actions');
    if (!actions) return;

    var wrap = document.getElementById('st-lang-flags');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'st-lang-flags';
      wrap.className = 'st-lang-flags';
      actions.insertBefore(wrap, actions.firstChild);
    }
    wrap.innerHTML = '';

    var btnFa = document.createElement('button');
    btnFa.type = 'button';
    btnFa.className = 'st-lang-flag';
    btnFa.setAttribute('data-lang', 'fa');
    btnFa.setAttribute('aria-label', '\u0641\u0627\u0631\u0633\u06cc');
    btnFa.innerHTML = '<span class="st-lang-emoji" aria-hidden="true">\uD83C\uDDEE\uD83C\uDDF7</span><span class="st-lang-label">\u0641\u0627\u0631\u0633\u06cc</span>';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'st-lang-flag';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.setAttribute('aria-label', 'English');
    btnEn.innerHTML = '<span class="st-lang-emoji" aria-hidden="true">\uD83C\uDDFA\uD83C\uDDF8</span><span class="st-lang-label">English</span>';

    wrap.appendChild(btnFa);
    wrap.appendChild(btnEn);

    btnFa.addEventListener('click', function (e) {
      e.preventDefault();
      if (readLang() !== 'fa') setLang('fa');
    });
    btnEn.addEventListener('click', function (e) {
      e.preventDefault();
      if (readLang() !== 'en') setLang('en');
    });

    var oldToggle = document.getElementById('lang-toggle');
    if (oldToggle) {
      oldToggle.classList.add('st-lang-hidden');
      oldToggle.style.display = 'none';
    }

    syncActive();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  setTimeout(paint, 400);
  setTimeout(paint, 1000);
})();
