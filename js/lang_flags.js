/* Flags with English / فارسی under the icon — compact, not covering social */
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

  var IRAN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" width="22" height="14" aria-hidden="true">' +
    '<rect width="9" height="2" y="0" fill="#239f40"/>' +
    '<rect width="9" height="2" y="2" fill="#fff"/>' +
    '<rect width="9" height="2" y="4" fill="#da0000"/>' +
    '<g stroke="#c9a227" stroke-width="0.15"><circle cx="4.5" cy="3" r="0.9" fill="none"/></g></svg>';

  var US_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 10" width="22" height="12" aria-hidden="true">' +
    '<rect width="19" height="10" fill="#bf0a30"/>' +
    '<rect y="0.77" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="2.31" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="3.85" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="5.38" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="6.92" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="8.46" width="19" height="0.77" fill="#fff"/>' +
    '<rect width="7.6" height="5.38" fill="#002868"/></svg>';

  function ensureCss() {
    if (document.getElementById('st-lang-flags-css')) return;
    var st = document.createElement('style');
    st.id = 'st-lang-flags-css';
    st.textContent =
      '.header-inner{display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:0.25rem!important}' +
      '#header-social.header-social{display:flex!important;flex-shrink:0!important;gap:0.2rem!important;order:2}' +
      '#header-social.header-social a{width:1.6rem!important;height:1.6rem!important}' +
      '.header-actions{display:flex!important;align-items:center!important;gap:0.2rem!important;margin-inline-start:auto!important;flex-shrink:0!important;order:5}' +
      '.st-lang-flags{display:inline-flex;align-items:flex-end;gap:0.2rem;flex-shrink:0;order:4}' +
      '.st-lang-flag{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:0.08rem;padding:0.12rem 0.2rem;border:1px solid rgba(255,255,255,0.3);border-radius:8px;background:rgba(255,255,255,0.12);cursor:pointer;font-family:inherit;color:#fff;line-height:1;min-width:2.1rem}' +
      '.st-lang-flag span{display:block!important;font-size:0.55rem;font-weight:800;letter-spacing:0;max-width:2.4rem;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.st-lang-flag svg{display:block;border-radius:2px}' +
      '.st-lang-flag.is-active{box-shadow:0 0 0 2px rgba(201,162,39,0.55);border-color:#c9a227}' +
      '.lang-toggle.st-lang-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}' +
      '#auth-header-wrap{order:6;flex-shrink:0}' +
      '.nav-burger,.menu-btn{order:0;flex-shrink:0}' +
      'a.logo,#header-brand{order:1;flex-shrink:1;min-width:0}';
    document.head.appendChild(st);
  }

  function paint() {
    ensureCss();
    var old = document.getElementById('lang-toggle');
    if (document.getElementById('st-lang-flags')) {
      syncActive();
      return;
    }
    if (old) {
      old.classList.add('st-lang-hidden');
      old.setAttribute('aria-hidden', 'true');
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
    btnFa.setAttribute('title', '\u0641\u0627\u0631\u0633\u06cc');
    btnFa.setAttribute('aria-label', '\u0641\u0627\u0631\u0633\u06cc');
    btnFa.innerHTML = IRAN_SVG + '<span>\u0641\u0627\u0631\u0633\u06cc</span>';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'st-lang-flag';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.setAttribute('title', 'English');
    btnEn.setAttribute('aria-label', 'English');
    btnEn.innerHTML = US_SVG + '<span>English</span>';

    wrap.appendChild(btnFa);
    wrap.appendChild(btnEn);

    var actions = document.querySelector('.header-actions');
    var inner = document.querySelector('.header-inner');
    if (actions) actions.appendChild(wrap);
    else if (inner) inner.appendChild(wrap);
    else if (old && old.parentNode) old.parentNode.insertBefore(wrap, old.nextSibling);
    else document.body.appendChild(wrap);

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
  setTimeout(paint, 400);
  setTimeout(paint, 1000);
})();
