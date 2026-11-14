/* Language flags: Lion & Sun (historical Iran) + US flag — not IRI flag */
(function () {
  if (window.__stFlagsInit) return;
  window.__stFlagsInit = true;

  function readLang() {
    try {
      var s = localStorage.getItem('cog_lang');
      if (s === 'en' || s === 'fa') return s;
    } catch (e) {}
    try {
      if (document.documentElement.lang === 'en') return 'en';
    } catch (e2) {}
    return 'fa';
  }

  function setLang(lang) {
    lang = lang === 'en' ? 'en' : 'fa';
    if (window.__toggleLang && readLang() !== lang) {
      try { window.__toggleLang(); return; } catch (e) {}
    }
    if (window.toggleLanguage && readLang() !== lang) {
      try { window.toggleLanguage(); return; } catch (e2) {}
    }
    try { localStorage.setItem('cog_lang', lang); localStorage.setItem('cog_lang_chosen', '1'); } catch (e3) {}
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    } catch (e4) {}
    location.reload();
  }

  var IRAN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" width="28" height="18" aria-hidden="true">' +
    '<rect width="9" height="2" y="0" fill="#239f40"/>' +
    '<rect width="9" height="2" y="2" fill="#fff"/>' +
    '<rect width="9" height="2" y="4" fill="#da0000"/>' +
    '<circle cx="4.5" cy="3" r="0.7" fill="#c9a227"/>' +
    '<g stroke="#c9a227" stroke-width="0.15">' +
    '<line x1="4.5" y1="1.9" x2="4.5" y2="2.2"/>' +
    '<line x1="4.5" y1="3.8" x2="4.5" y2="4.1"/>' +
    '<line x1="3.4" y1="3" x2="3.7" y2="3"/>' +
    '<line x1="5.3" y1="3" x2="5.6" y2="3"/>' +
    '</g>' +
    '<ellipse cx="4.2" cy="3.35" rx="0.85" ry="0.4" fill="#8B6914"/>' +
    '<circle cx="4.9" cy="3.15" r="0.28" fill="#8B6914"/>' +
    '<path d="M5.1 3.0 L5.5 2.7 L5.35 3.15 Z" fill="#8B6914"/>' +
    '</svg>';

  var US_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 10" width="28" height="15" aria-hidden="true">' +
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
      '.st-lang-flags{display:inline-flex;align-items:center;gap:0.35rem;margin-inline-start:0.35rem}' +
      '.st-lang-flag{display:inline-flex;align-items:center;justify-content:center;gap:0.3rem;padding:0.25rem 0.45rem;border:1px solid var(--border,#d8dee6);border-radius:8px;background:var(--bg-card,#fff);cursor:pointer;font-family:inherit;font-size:0.78rem;font-weight:700;color:var(--text,#1a1a1a);line-height:1;transition:box-shadow .15s,border-color .15s,opacity .15s}' +
      'body.dark .st-lang-flag{background:#152536;border-color:#2a3a4c;color:#e8eef5}' +
      '.st-lang-flag svg{display:block;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.08)}' +
      '.st-lang-flag.is-active{border-color:var(--primary,#0a2540);box-shadow:0 0 0 2px rgba(10,37,64,.2)}' +
      'body.dark .st-lang-flag.is-active{border-color:#9ec5ea;box-shadow:0 0 0 2px rgba(158,197,234,.25)}' +
      '.st-lang-flag:not(.is-active){opacity:0.85}' +
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
    btnFa.setAttribute('title', '\u0641\u0627\u0631\u0633\u06cc');
    btnFa.setAttribute('aria-label', '\u0641\u0627\u0631\u0633\u06cc');
    btnFa.innerHTML = IRAN_SVG + '<span>\u0641\u0627</span>';

    var btnEn = document.createElement('button');
    btnEn.type = 'button';
    btnEn.className = 'st-lang-flag';
    btnEn.setAttribute('data-lang', 'en');
    btnEn.setAttribute('title', 'English');
    btnEn.setAttribute('aria-label', 'English');
    btnEn.innerHTML = US_SVG + '<span>EN</span>';

    wrap.appendChild(btnFa);
    wrap.appendChild(btnEn);

    if (old.parentNode) old.parentNode.insertBefore(wrap, old.nextSibling);
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

  function syncActive() {
    var lang = readLang();
    document.querySelectorAll('.st-lang-flag').forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function boot() {
    paint();
    setTimeout(paint, 400);
    setTimeout(paint, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
