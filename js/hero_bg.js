/* Hero background image — three/four angels poster (no video) */
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
      if (url !== HOSTED) {
        img.src = HOSTED;
      }
    };
    wrap.appendChild(img);
    hero.insertBefore(wrap, hero.firstChild);
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
