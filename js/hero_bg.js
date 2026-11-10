/* Hero background — Option A: soft photo, readable text */
(function () {
  var LOCAL = 'media/hero-bg.jpg';
  var HOSTED = 'https://i.imgur.com/Nmz3YPt.jpeg';

  function injectOptionAStyles() {
    if (document.getElementById('hero-option-a-css')) return;
    var st = document.createElement('style');
    st.id = 'hero-option-a-css';
    st.textContent =
      /* Photo stays fixed behind content */
      '.hero-bg-image{' +
      'position:fixed!important;inset:0!important;z-index:0!important;' +
      'pointer-events:none!important;overflow:hidden!important;' +
      '}' +
      '.hero-bg-image img{' +
      'width:100%!important;height:100%!important;' +
      'object-fit:cover!important;object-position:center center!important;' +
      'filter:brightness(1.08) contrast(0.95) saturate(0.92)!important;' +
      'transform:scale(1.02);' +
      '}' +
      /* Soft light overlay — not heavy black (Option A) */
      '.hero-bg-image::after{' +
      'content:\"\";position:absolute;inset:0;' +
      'background:' +
      'linear-gradient(180deg,' +
      'rgba(12,28,48,0.28) 0%,' +
      'rgba(12,28,48,0.42) 40%,' +
      'rgba(12,28,48,0.55) 100%),' +
      'radial-gradient(ellipse at 50% 30%, rgba(201,162,39,0.12) 0%, transparent 55%);' +
      'pointer-events:none;' +
      '}' +
      /* Hero section sits above fixed bg */
      'section.hero{' +
      'position:relative;z-index:1;' +
      'background:transparent!important;' +
      '}' +
      'section.hero::before{' +
      'background:transparent!important;' +
      '}' +
      '.hero-inner{position:relative;z-index:2;}' +
      /* Text stays clear on soft photo */
      'section.hero h1, section.hero .hero-sub,' +
      'section.hero .angels-heading-title, section.hero .angels-heading-hint{' +
      'text-shadow:0 2px 14px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.25)!important;' +
      '}' +
      /* Rest of page solid so content below is easy to read */
      'body > *:not(.hero-bg-image):not(.header):not(#menu-overlay):not(#menu-panel){' +
      'position:relative;z-index:1;' +
      '}' +
      '.header{position:relative;z-index:1200;}' +
      /* After hero, keep normal page background */
      'section.daily-verse, section.mission-section, main.container, footer.footer{' +
      'background:var(--bg, #f5f3ee);' +
      '}' +
      'body.dark section.daily-verse, body.dark section.mission-section,' +
      'body.dark main.container, body.dark footer.footer{' +
      'background:var(--bg, #0f1620);' +
      '}';
    document.head.appendChild(st);
  }

  function mount(url) {
    var hero = document.querySelector('section.hero');
    if (!hero) return;
    if (document.querySelector('.hero-bg-image')) {
      injectOptionAStyles();
      return;
    }
    injectOptionAStyles();
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
