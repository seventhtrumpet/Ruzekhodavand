/* Language flags — medium size with FA / EN labels */
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
    '<g stroke="#c9a227" stroke-width="0.15">' +
    '<circle cx="4.5" cy="3" r="0.9" fill="none"/>' +
    '</g></svg>';

  var US_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 10" width="22" height="12" aria-hidden="true">' +
    '<rect width="19" height="10" fill="#bf0a30"/>' +
    '<rect y="0.77" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="2.31" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="3.85" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="5.38" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="6.92" width="19" height="0.77" fill="#fff"/>' +
    '<rect y="8.46" width="19" height="0.77" fill="#fff"/>' +
    '<rect width="7.6" height="5.38" fill="#002868"/>' +
    '</svg>';

  function ensureCss() {
    if (document.getElementById('st-lang-flags-css')) return;
    var st = document.createElement('style');
    st.id = 'st-lang-flags-css';
    st.textContent =
      '.st-lang-flags{display:inline-flex;align-items:center;gap:0.25rem;margin-inline-start:0.25rem;flex-shrink:0}' +
      '.st-lang-flag{display:inline-flex;align-items:center;justify-content:center;gap:0.25rem;padding:0.22rem 0.4rem;border:1px solid rgba(255,255,255,0.35);border-radius:8px;background:rgba(255,255,255,0.14);cursor:pointer;font-family:inherit;font-size:0.72rem;font-weight:700;color:#fff;line-height:1}' +
      '.st-lang-flag span{display:inline!important;font-size:0.7rem;font-weight:800;letter-spacing:0.02em}' +
      '.st-lang-flag svg{display:block;border-radius:2px}' +
      '.st-lang-flag.is-active{box-shadow:0 0 0 2px rgba(201,162,39,0.55);border-color:#c9a227}' +
      '.st-lang-flag:not(.is-active){opacity:0.88}' +
      '.st-lang-flag:hover{opacity:1}' +
      '.lang-toggle.st-lang-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}';
    document.head.appendChild(st);
  }

  function paint() {
    ensureCss();
    var old = document.getElementById('lang-toggle');
    if (!old) return;
    if (document.getElementById('st-lang-flags')) {
      syncActive();
      return;
    }

    old.classList.add('st-lang-hidden');
    old.setAttribute('aria-hidden', 'true');

    var wrap = document.createElement('div');
    wrap.id = 'st-lang-flags';
    wrap.className = 'st-lang-flags';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language');

    var btnFa = document.createElement('button');
    btnFa.type = 'button';
    btnFa.className = 'st-lang-flag';
    btnFa.setAttribute('data-lang', 'fa');
    btnFa.setAttribute('title', 'Persian / \u0641\u0627\u0631\u0633\u06cc');
    btnFa.setAttribute('aria-label', 'Persian');
    btnFa.innerHTML = IRAN_SVG + '<span>FA</span>';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'st-lang-flag';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.setAttribute('title', 'English');
    btnEn.setAttribute('aria-label', 'English');
    btnEn.innerHTML = US_SVG + '<span>EN</span>';

    wrap.appendChild(btnFa);
    wrap.appendChild(btnEn);

    var actions = document.querySelector('.header-actions');
    if (actions) actions.appendChild(wrap);
    else if (old.parentNode) old.parentNode.insertBefore(wrap, old.nextSibling);
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
  setTimeout(paint, 300);
  setTimeout(paint, 900);
})();
