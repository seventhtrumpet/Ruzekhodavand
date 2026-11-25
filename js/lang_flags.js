/* Persian / English language selector with historical Lion and Sun flag */
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
      '.st-lang-flag .st-flag-svg{display:block;width:1.55rem;height:.93rem;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.16)}' +
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
    btnFa.innerHTML = '<svg class="st-flag-svg st-flag-persian" viewBox="0 0 60 36" role="img" aria-label="Historical Persian Lion and Sun flag"><rect width="60" height="12" fill="#239f40"/><rect y="12" width="60" height="12" fill="#fff"/><rect y="24" width="60" height="12" fill="#da0000"/><g fill="#d6a528" stroke="#a77b13" stroke-width=".45" stroke-linejoin="round"><circle cx="31" cy="18" r="5.2"/><path d="M30 11.8l1.4 2.2 2.6-.5-1 2.4 2 1.8-2.6.4-.9 2.5-1.5-2-2.6.2 1.5-2.1-1.2-2.3 2.6.4z"/><path d="M18 20.8c2.2-1.1 4.4-1 6.1.1l3.3-.4 1.7 1.7-1.7 1.5-3.2-.2-1.5 2.2-2.2.3-1.3-1.5-2.3.2-1.4-1.6 1.1-1.8z"/><path d="M24 21.5l2.8-2.3 3.5.6 1.2 2.4-2.2 2.2-3.8-.2z"/><path d="M25 24l-1 4 1.6 1.5 1.2-4M29 24l.4 4.1 1.8 1.1.3-5M20 21l-2.5-2.4-1.2 1.1 1.9 3.1M28 19l2.2-2.2 1.5.8-1.1 2.5"/><path d="M16 17.5l-1.2-2.2.7-.7 2.3 1.6M24 17l1.5-2.4 1 .4-.6 2.7" /><path d="M16 29l17-17" stroke="#d6a528" stroke-width="1.2" fill="none"/><path d="M32 11l2-2 1 2-1.5 1.2" /></g></svg><span class="st-lang-label">\u0641\u0627\u0631\u0633\u06cc</span>';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'st-lang-flag';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.setAttribute('aria-label', 'English');
    btnEn.innerHTML = '<svg class="st-flag-svg st-flag-us" viewBox="0 0 60 36" role="img" aria-label="United States flag"><rect width="60" height="36" fill="#fff"/><g fill="#b22234"><rect y="0" width="60" height="2.77"/><rect y="5.54" width="60" height="2.77"/><rect y="11.08" width="60" height="2.77"/><rect y="16.62" width="60" height="2.77"/><rect y="22.16" width="60" height="2.77"/><rect y="27.7" width="60" height="2.77"/><rect y="33.24" width="60" height="2.77"/></g><rect width="25" height="19.4" fill="#3c3b6e"/><g fill="#fff"><circle cx="2.2" cy="2" r=".65"/><circle cx="6" cy="2" r=".65"/><circle cx="9.8" cy="2" r=".65"/><circle cx="13.599999999999998" cy="2" r=".65"/><circle cx="17.4" cy="2" r=".65"/><circle cx="21.2" cy="2" r=".65"/><circle cx="4.1" cy="5.7" r=".65"/><circle cx="7.9" cy="5.7" r=".65"/><circle cx="11.700000000000001" cy="5.7" r=".65"/><circle cx="15.499999999999998" cy="5.7" r=".65"/><circle cx="19.299999999999997" cy="5.7" r=".65"/><circle cx="23.099999999999998" cy="5.7" r=".65"/><circle cx="2.2" cy="9.4" r=".65"/><circle cx="6" cy="9.4" r=".65"/><circle cx="9.8" cy="9.4" r=".65"/><circle cx="13.599999999999998" cy="9.4" r=".65"/><circle cx="17.4" cy="9.4" r=".65"/><circle cx="21.2" cy="9.4" r=".65"/><circle cx="4.1" cy="13.100000000000001" r=".65"/><circle cx="7.9" cy="13.100000000000001" r=".65"/><circle cx="11.700000000000001" cy="13.100000000000001" r=".65"/><circle cx="15.499999999999998" cy="13.100000000000001" r=".65"/><circle cx="19.299999999999997" cy="13.100000000000001" r=".65"/><circle cx="23.099999999999998" cy="13.100000000000001" r=".65"/><circle cx="2.2" cy="16.8" r=".65"/><circle cx="6" cy="16.8" r=".65"/><circle cx="9.8" cy="16.8" r=".65"/><circle cx="13.599999999999998" cy="16.8" r=".65"/><circle cx="17.4" cy="16.8" r=".65"/><circle cx="21.2" cy="16.8" r=".65"/></g></svg><span class="st-lang-label">English</span>';

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
