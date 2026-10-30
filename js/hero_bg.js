/* Hero background image with parallax — permanent hosted image */
(function () {
  var LOCAL = 'media/hero-bg.jpg';
  // Permanent host (Imgur)
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
    img.onload = function () { hero.classList.add('hero-bg-ready'); };
    img.onerror = function () {
      if (url !== HOSTED && window.ST_HERO_BG_URL) {
        img.src = window.ST_HERO_BG_URL;
      } else if (url !== HOSTED) {
        img.src = HOSTED;
      }
    };
    wrap.appendChild(img);
    hero.insertBefore(wrap, hero.firstChild);
    setupParallax(hero, wrap, img);
  }

  function setupParallax(hero, wrap, img) {
    var ticking = false;
    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var viewH = window.innerHeight || 1;
      if (rect.bottom < 0 || rect.top > viewH) return;
      var scrolled = Math.max(0, -rect.top);
      var maxMove = Math.min(viewH * 0.35, hero.offsetHeight * 0.25);
      var progress = Math.min(1, scrolled / (hero.offsetHeight || 1));
      var y = progress * maxMove;
      wrap.style.transform = 'translate3d(0,' + (y * 0.45) + 'px,0)';
      img.style.transform = 'translate3d(0,' + (-y * 0.25) + 'px,0) scale(1.12)';
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  function tryMount() {
    var hero = document.querySelector('section.hero');
    if (!hero || hero.querySelector('.hero-bg-video')) return;

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
