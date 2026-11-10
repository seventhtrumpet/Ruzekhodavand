/* Homepage: stronger Three Angels, shorter mission, softer background */
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
      /* Softer hero so text and angels stand out */
      '.hero{position:relative;overflow:hidden;}' +
      '.hero::before{' +
      'content:\"\";position:absolute;inset:0;z-index:0;' +
      'background:linear-gradient(180deg,rgba(8,18,32,0.45) 0%,rgba(8,18,32,0.62) 45%,rgba(8,18,32,0.78) 100%)!important;' +
      'pointer-events:none;' +
      '}' +
      '.hero-inner{position:relative;z-index:1;}' +

      /* Bigger, clearer Three Angels block */
      '.angels-heading{text-align:center;margin:1.4rem 0 0.85rem;}' +
      '.angels-heading-title{' +
      'font-size:clamp(1.35rem,4.2vw,1.75rem)!important;font-weight:800!important;' +
      'color:#fff!important;margin:0 0 0.35rem!important;letter-spacing:0.02em;' +
      'text-shadow:0 2px 12px rgba(0,0,0,0.35);' +
      '}' +
      '.angels-heading-hint{' +
      'font-size:0.95rem!important;color:rgba(255,255,255,0.9)!important;margin:0!important;' +
      '}' +
      '.angels-row{' +
      'display:flex!important;flex-wrap:wrap!important;justify-content:center!important;' +
      'gap:0.85rem!important;margin:0.5rem auto 1.2rem!important;max-width:920px;' +
      '}' +
      '.angel-card{' +
      'flex:1 1 9.5rem;min-width:9.2rem;max-width:15rem;' +
      'padding:1.15rem 0.9rem 1.05rem!important;' +
      'border-radius:16px!important;' +
      'background:rgba(255,255,255,0.14)!important;' +
      'border:1px solid rgba(201,162,39,0.55)!important;' +
      'box-shadow:0 8px 28px rgba(0,0,0,0.22)!important;' +
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
      'text-align:center;text-decoration:none!important;color:#fff!important;' +
      'transition:transform .15s ease, background .15s ease, box-shadow .15s ease;' +
      '}' +
      '.angel-card:hover,.angel-card:focus{' +
      'transform:translateY(-5px);background:rgba(255,255,255,0.22)!important;' +
      'box-shadow:0 12px 32px rgba(0,0,0,0.3)!important;' +
      '}' +
      '.angel-num{' +
      'width:2.4rem;height:2.4rem;margin:0 auto 0.55rem;' +
      'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
      'background:#c9a227!important;color:#0a2540!important;' +
      'font-weight:800!important;font-size:1.15rem!important;' +
      '}' +
      '.angel-title{font-size:1.05rem!important;font-weight:800!important;margin-bottom:0.25rem!important;color:#fff!important;}' +
      '.angel-text{font-size:0.9rem!important;opacity:0.95!important;margin-bottom:0.55rem!important;color:rgba(255,255,255,0.92)!important;}' +
      '.angel-cta{' +
      'display:inline-block;margin-top:0.15rem;padding:0.35rem 0.75rem;' +
      'border-radius:999px;background:rgba(201,162,39,0.95)!important;color:#0a2540!important;' +
      'font-weight:800!important;font-size:0.8rem!important;' +
      '}' +

      /* Mission: shorter, one clear card */
      '.mission-section{max-width:640px;margin:0.75rem auto 1.5rem;padding:0 1rem;}' +
      '.mission-card{padding:1.25rem 1.2rem!important;}' +
      '.mission-card h2{font-size:1.15rem!important;margin-bottom:0.55rem!important;}' +
      '.mission-card p{font-size:0.95rem!important;line-height:1.7!important;}' +
      '.mission-card p[data-i18n="missionP2"],.mission-card p[data-i18n="missionP3"]{display:none!important;}' +

      '@media (max-width:560px){' +
      '.angel-card{flex:1 1 100%;max-width:20rem;}' +
      '.angels-row{gap:0.65rem!important;}' +
      '}';
    document.head.appendChild(st);
  }

  function shortCopy() {
    var en = isEn();
    // Shorter hint under angels title
    var hint = document.querySelector('.angels-heading-hint, [data-i18n="angelsHint"]');
    if (hint) {
      hint.textContent = en
        ? 'Tap an angel to read the message'
        : '\u0644\u0645\u0633 \u06a9\u0646\u06cc\u062f \u062a\u0627 \u067e\u06cc\u0627\u0645 \u0631\u0627 \u0628\u062e\u0648\u0627\u0646\u06cc\u062f';
    }
    // One short mission paragraph
    var p1 = document.querySelector('.mission-card [data-i18n="missionP1"]');
    if (p1) {
      p1.textContent = en
        ? 'We share the everlasting gospel and the three angels\' messages of Revelation 14 — in Persian and English.'
        : '\u0645\u0627 \u067e\u06cc\u0627\u0645 \u0627\u0646\u062c\u06cc\u0644 \u062c\u0627\u0648\u062f\u0627\u0646\u06cc \u0648 \u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647 \u0645\u06a9\u0627\u0634\u0641\u0647 \u06f1\u06f4 \u0631\u0627 \u0628\u0647 \u0641\u0627\u0631\u0633\u06cc \u0648 \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc \u0628\u0647 \u0627\u0634\u062a\u0631\u0627\u06a9 \u0645\u06cc\u200c\u06af\u0630\u0627\u0631\u06cc\u0645.';
    }
    // Hide extra mission paragraphs if not already hidden by CSS
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
