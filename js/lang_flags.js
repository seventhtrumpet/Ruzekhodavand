/* One flag button per language: single SVG flag + label (no small emoji flag) */
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
    var old = document.getElementById('st-lang-flags-css');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'st-lang-flags-css';
    st.textContent =
      '.st-lang-flags{display:inline-flex!important;align-items:center;gap:0.25rem;flex-shrink:0;order:4;visibility:visible!important;opacity:1!important}' +
      '.lang-toggle.st-lang-hidden,#lang-toggle.st-lang-hidden{display:none!important}' +
      '.st-lang-flag{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0.1rem;padding:0.2rem 0.35rem;border:1px solid rgba(255,255,255,0.35);border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-family:inherit;min-width:3.2rem}' +
      '.st-lang-flag .st-flag-svg{display:block;width:1.55rem;height:0.95rem;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.2)}' +
      '.st-lang-flag .st-lang-label{font-size:0.62rem;line-height:1.1;font-weight:700;letter-spacing:0.01em}' +
      '.st-lang-flag .st-lang-label::before,.st-lang-flag .st-lang-label::after{content:none!important;display:none!important}' +
      '.st-lang-flag .st-lang-emoji,.st-lang-flag img:not(.st-flag-svg){display:none!important}' +
      '.st-lang-flag.is-active{background:rgba(201,162,39,0.4);border-color:#c9a227}' +
      '.st-lang-flags:not(#st-lang-flags){display:none!important}';
    document.head.appendChild(st);
  }

  var FA_SVG = '<svg class="st-flag-svg" viewBox="0 0 60 36" aria-hidden="true"><rect width="60" height="12" y="0" fill="#239f40"/><rect width="60" height="12" y="12" fill="#fff"/><rect width="60" height="12" y="24" fill="#da0000"/><circle cx="30" cy="18" r="4.2" fill="none" stroke="#da0000" stroke-width="1.2"/></svg>';
  var EN_SVG = '<svg class="st-flag-svg" viewBox="0 0 60 36" aria-hidden="true"><rect width="60" height="36" fill="#b22234"/><g fill="#fff"><rect y="4" width="60" height="4"/><rect y="12" width="60" height="4"/><rect y="20" width="60" height="4"/><rect y="28" width="60" height="4"/></g><rect width="24" height="16" fill="#3c3b6e"/></svg>';

  function paint() {
    ensureCss();
    var actions = document.querySelector('.header-actions');
    if (!actions) return;

    document.querySelectorAll('.st-lang-flags, .st-lang-flag').forEach(function (n) {
      try { n.remove(); } catch (e) {}
    });
    var oldToggle = document.getElementById('lang-toggle');
    if (oldToggle) {
      oldToggle.classList.add('st-lang-hidden');
      oldToggle.style.display = 'none';
    }

    var wrap = document.createElement('div');
    wrap.id = 'st-lang-flags';
    wrap.className = 'st-lang-flags';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language');

    var btnFa = document.createElement('button');
    btnFa.type = 'button';
    btnFa.className = 'st-lang-flag';
    btnFa.setAttribute('data-lang', 'fa');
    btnFa.setAttribute('aria-label', '\u0641\u0627\u0631\u0633\u06cc');
    btnFa.innerHTML = FA_SVG + '<span class="st-lang-label">\u0641\u0627\u0631\u0633\u06cc</span>';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'st-lang-flag';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.setAttribute('aria-label', 'English');
    btnEn.innerHTML = EN_SVG + '<span class="st-lang-label">English</span>';

    wrap.appendChild(btnFa);
    wrap.appendChild(btnEn);
    actions.insertBefore(wrap, actions.firstChild);

    btnFa.addEventListener('click', function (e) {
      e.preventDefault();
      if (readLang() !== 'fa') setLang('fa');
    });
    btnEn.addEventListener('click', function (e) {
      e.preventDefault();
      if (readLang() !== 'en') setLang('en');
    });

    syncActive();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  setTimeout(paint, 300);
  setTimeout(paint, 900);
})();
