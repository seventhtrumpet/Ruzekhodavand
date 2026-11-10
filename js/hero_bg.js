/* Hero background — Option A: soft photo, FULL image visible (all angels) */
(function () {
  var LOCAL = 'media/hero-bg.jpg';
  var HOSTED = 'https://i.imgur.com/Nmz3YPt.jpeg';

  function injectOptionAStyles() {
    if (document.getElementById('hero-option-a-css')) {
      // refresh rules in case old crop CSS was cached in same session
      document.getElementById('hero-option-a-css').textContent = cssText();
      return;
    }
    var st = document.createElement('style');
    st.id = 'hero-option-a-css';
    st.textContent = cssText();
    document.head.appendChild(st);
  }

  function cssText() {
    return (
      /* Fixed full-screen layer */
      '.hero-bg-image{' +
      'position:fixed!important;inset:0!important;z-index:0!important;' +
      'pointer-events:none!important;overflow:hidden!important;' +
      'background:#0a1a2e!important;' + /* navy fill behind letterbox */
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      '}' +
      /* SHOW FULL PICTURE — do not crop with cover */
      '.hero-bg-image img{' +
      'width:100%!important;height:100%!important;' +
      'max-width:100%!important;max-height:100%!important;' +
      'object-fit:contain!important;' + /* critical: full image, all angels */
      'object-position:center center!important;' +
      'filter:brightness(1.1) contrast(0.96) saturate(0.95)!important;' +
      '}' +
      /* Soft overlay so text stays readable */
      '.hero-bg-image::after{' +
      'content:\"\";position:absolute;inset:0;' +
      'background:' +
      'linear-gradient(180deg,' +
      'rgba(10,26,46,0.25) 0%,' +
      'rgba(10,26,46,0.38) 45%,' +
      'rgba(10,26,46,0.52) 100%),' +
      'radial-gradient(ellipse at 50% 28%, rgba(201,162,39,0.1) 0%, transparent 55%);' +
      'pointer-events:none;' +
      '}' +
      'section.hero{' +
      'position:relative;z-index:1;' +
      'background:transparent!important;' +
      '}' +
      'section.hero::before{background:transparent!important;}' +
      '.hero-inner{position:relative;z-index:2;}' +
      'section.hero h1, section.hero .hero-sub,' +
      'section.hero .angels-heading-title, section.hero .angels-heading-hint{' +
      'text-shadow:0 2px 14px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)!important;' +
      '}' +
      '.header{position:relative;z-index:1200;}' +
      'section.daily-verse, section.mission-section, main.container, footer.footer{' +
      'background:var(--bg, #f5f3ee);position:relative;z-index:1;' +
      '}' +
      'body.dark section.daily-verse, body.dark section.mission-section,' +
      'body.dark main.container, body.dark footer.footer{' +
      'background:var(--bg, #0f1620);' +
      '}' +
      /* Mobile: still show full image */
      '@media (max-width:700px){' +
      '.hero-bg-image img{object-fit:contain!important;object-position:center 30%!important;}' +
      '}'
    );
  }

  function mount(url) {
    var hero = document.querySelector('section.hero');
    if (!hero) return;

    injectOptionAStyles();

    var existing = document.querySelector('.hero-bg-image');
    if (existing) {
      var img0 = existing.querySelector('img');
      if (img0 && url && img0.src.indexOf('Nmz3YPt') < 0 && img0.src.indexOf('hero-bg') < 0) {
        /* keep */
      }
      return;
    }

    hero.classList.add('has-video-bg', 'has-image-bg', 'hero-has-fixed-bg');

    var wrap = document.createElement('div');
    wrap.className = 'hero-bg-video hero-bg-image';
    wrap.setAttribute('aria-hidden', 'true');

    var img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.referrerPolicy = 'no-referrer';
    img.onload = function () {
      hero.classList.add('hero-bg-ready');
    };
    img.onerror = function () {
      if (url !== HOSTED) img.src = HOSTED;
    };

    wrap.appendChild(img);
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  function tryMount() {
    var hero = document.querySelector('section.hero');
    if (!hero) return;
    if (document.querySelector('.hero-bg-image')) {
      injectOptionAStyles();
      return;
    }

    if (window.ST_HERO_BG_URL) {
      mount(window.ST_HERO_BG_URL);
      return;
    }

    var test = new Image();
    test.onload = function () { mount(LOCAL); };
    test.onerror = function () { mount(HOSTED); };
    test.src = LOCAL;
  }

  document.addEventListener('st-hero-ready', tryMount);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMount);
  } else {
    tryMount();
  }
  setTimeout(tryMount, 200);
  setTimeout(tryMount, 800);
})();
