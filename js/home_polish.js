/* Homepage: Option A soft hero + bigger Three Angels + short mission */
(function () {
  var path = (location.pathname || '').toLowerCase();
  var isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '' ||
    (document.body && document.body.getAttribute('data-page') === 'home');
  if (!isHome) return;

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function injectCss() {
    if (document.getElementById('home-polish-css')) return;
    var st = document.createElement('style');
    st.id = 'home-polish-css';
    st.textContent =
      /* Option A: do not pile extra dark overlays on hero */
      'section.hero{background:transparent!important;}' +
      'section.hero::before{opacity:0.35!important;}' +

      /* Bigger Three Angels */
      '.angels-heading{text-align:center;margin:1.4rem 0 0.85rem;}' +
      '.angels-heading-title{' +
      'font-size:clamp(1.35rem,4.2vw,1.75rem)!important;font-weight:800!important;' +
      'color:#fff!important;margin:0 0 0.35rem!important;' +
      'text-shadow:0 2px 12px rgba(0,0,0,0.35)!important;' +
      '}' +
      '.angels-heading-hint{' +
      'font-size:0.95rem!important;color:rgba(255,255,255,0.95)!important;margin:0!important;' +
      'text-shadow:0 1px 8px rgba(0,0,0,0.3)!important;' +
      '}' +
      '.angels-row{' +
      'display:flex!important;flex-wrap:wrap!important;justify-content:center!important;' +
      'gap:0.85rem!important;margin:0.5rem auto 1.2rem!important;max-width:920px;' +
      '}' +
      '.angel-card{' +
      'flex:1 1 9.5rem;min-width:9.2rem;max-width:15rem;' +
      'padding:1.15rem 0.9rem 1.05rem!important;' +
      'border-radius:16px!important;' +
      'background:rgba(255,255,255,0.18)!important;' +
      'border:1px solid rgba(201,162,39,0.6)!important;' +
      'box-shadow:0 8px 28px rgba(0,0,0,0.2)!important;' +
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      'text-align:center;text-decoration:none!important;color:#fff!important;' +
      '}' +
      '.angel-card:hover,.angel-card:focus{' +
      'transform:translateY(-5px);background:rgba(255,255,255,0.26)!important;' +
      '}' +
      '.angel-num{' +
      'width:2.4rem;height:2.4rem;margin:0 auto 0.55rem;' +
      'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
      'background:#c9a227!important;color:#0a2540!important;' +
      'font-weight:800!important;font-size:1.15rem!important;' +
      '}' +
      '.angel-title{font-size:1.05rem!important;font-weight:800!important;margin-bottom:0.25rem!important;color:#fff!important;}' +
      '.angel-text{font-size:0.9rem!important;opacity:0.95!important;margin-bottom:0.55rem!important;color:rgba(255,255,255,0.95)!important;}' +
      '.angel-cta{' +
      'display:inline-block;margin-top:0.15rem;padding:0.35rem 0.75rem;' +
      'border-radius:999px;background:rgba(201,162,39,0.95)!important;color:#0a2540!important;' +
      'font-weight:800!important;font-size:0.8rem!important;' +
      '}' +

      '.mission-section{max-width:640px;margin:0.75rem auto 1.5rem;padding:0 1rem;}' +
      '.mission-card p[data-i18n="missionP2"],.mission-card p[data-i18n="missionP3"]{display:none!important;}' +

      '@media (max-width:560px){.angel-card{flex:1 1 100%;max-width:20rem;}}';
    document.head.appendChild(st);
  }

  function shortCopy() {
    var en = isEn();
    var hint = document.querySelector('.angels-heading-hint, [data-i18n="angelsHint"]');
    if (hint) {
      hint.textContent = en
        ? 'Tap an angel to read the message'
        : '\u0644\u0645\u0633 \u06a9\u0646\u06cc\u062f \u062a\u0627 \u067e\u06cc\u0627\u0645 \u0631\u0627 \u0628\u062e\u0648\u0627\u0646\u06cc\u062f';
    }
    var p1 = document.querySelector('.mission-card [data-i18n="missionP1"]');
    if (p1) {
      p1.textContent = en
        ? 'We share the everlasting gospel and the three angels\' messages of Revelation 14 — in Persian and English.'
        : '\u0645\u0627 \u067e\u06cc\u0627\u0645 \u0627\u0646\u062c\u06cc\u0644 \u062c\u0627\u0648\u062f\u0627\u0646\u06cc \u0648 \u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647 \u0645\u06a9\u0627\u0634\u0641\u0647 \u06f1\u06f4 \u0631\u0627 \u0628\u0647 \u0641\u0627\u0631\u0633\u06cc \u0648 \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc \u0628\u0647 \u0627\u0634\u062a\u0631\u0627\u06a9 \u0645\u06cc\u200c\u06af\u0630\u0627\u0631\u06cc\u0645.';
    }
    document.querySelectorAll('.mission-card [data-i18n="missionP2"], .mission-card [data-i18n="missionP3"]').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  function boot() {
    injectCss();
    shortCopy();
    window.addEventListener('cog-lang-changed', shortCopy);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () {
      setTimeout(shortCopy, 120);
      setTimeout(shortCopy, 400);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
