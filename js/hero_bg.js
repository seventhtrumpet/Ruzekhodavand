/* Hero background image with parallax scroll */
(function () {
  var LOCAL = 'media/hero-bg.jpg';
  var HOSTED = 'https://litter.catbox.moe/nv205i.jpg';

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
    img.onload = function () { hero.classList.add('hero-bg-ready'); };
    img.onerror = function () {
      if (url !== HOSTED) img.src = HOSTED;
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
      // Move while hero is in view
      if (rect.bottom < 0 || rect.top > viewH) return;
      // 0 at top of page, increases as you scroll down
      var scrolled = Math.max(0, -rect.top);
      var maxMove = Math.min(viewH * 0.35, hero.offsetHeight * 0.25);
      var progress = Math.min(1, scrolled / (hero.offsetHeight || 1));
      var y = progress * maxMove;
      // Scale a bit so edges never show empty
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
    var test = new Image();
    test.onload = function () { mount(LOCAL); };
    test.onerror = function () { mount(HOSTED); };
    test.src = LOCAL;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMount);
  } else {
    tryMount();
  }
  setTimeout(tryMount, 200);
})();
