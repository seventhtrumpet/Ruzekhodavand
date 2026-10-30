/* Hero background — full image visible + parallax on scroll */
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
      setupParallax(hero, wrap, img);
    };
    img.onerror = function () {
      if (url !== HOSTED) img.src = HOSTED;
    };

    wrap.appendChild(img);
    hero.insertBefore(wrap, hero.firstChild);
  }

  function setupParallax(hero, wrap, img) {
    if (wrap._parallaxBound) return;
    wrap._parallaxBound = true;

    var ticking = false;

    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var viewH = window.innerHeight || 1;

      // How far the hero has scrolled through the viewport (0 → 1+)
      var scrolled = Math.max(0, -rect.top);
      var range = Math.max(hero.offsetHeight * 0.8, viewH * 0.6);
      var progress = Math.min(1.2, scrolled / range);

      // Stronger parallax so you can see the image move
      var shift = progress * 80; // px

      // Move the whole layer slower than the page
      wrap.style.transform = 'translate3d(0, ' + (shift * 0.5) + 'px, 0)';

      // Keep image centered + shift opposite direction slightly
      img.style.transform =
        'translate(-50%, calc(-50% + ' + (-shift * 0.35) + 'px))';
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Also listen on touchmove for some mobile browsers
    window.addEventListener('touchmove', onScroll, { passive: true });

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
