/* Hero background — stays fixed; content scrolls over it */
(function () {
  var LOCAL = 'media/hero-bg.jpg';
  var HOSTED = 'https://i.imgur.com/Nmz3YPt.jpeg';

  function mount(url) {
    var hero = document.querySelector('section.hero');
    if (!hero) return;
    if (hero.querySelector('.hero-bg-video')) return;
    hero.classList.add('has-video-bg', 'has-image-bg');

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
    // Fixed layer on body so it stays while everything scrolls
    document.body.insertBefore(wrap, document.body.firstChild);
    // Keep a spacer class on hero so height is preserved
    hero.classList.add('hero-has-fixed-bg');
  }

  function tryMount() {
    var hero = document.querySelector('section.hero');
    if (!hero || document.querySelector('.hero-bg-image')) return;

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
})();
