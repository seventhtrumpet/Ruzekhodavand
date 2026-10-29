/* Seventh Trumpet profile logo */
(function () {
  function boot() {
    var LOGO = window.ST_LOGO || '';
    var FAV = window.ST_FAV || LOGO;
    if (!LOGO) return;

    var style = document.createElement('style');
    style.textContent = '.logo{display:inline-flex!important;align-items:center;gap:.5rem}.logo-img{width:2.35rem;height:2.35rem;border-radius:50%;object-fit:cover;border:2px solid rgba(201,162,39,.85);box-shadow:0 0 0 1px rgba(255,255,255,.15);flex-shrink:0}@media(min-width:600px){.logo-img{width:2.75rem;height:2.75rem}}';
    document.head.appendChild(style);

    var links = document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"]');
    if (!links.length) {
      var l = document.createElement('link');
      l.rel = 'icon';
      l.type = 'image/jpeg';
      l.href = FAV;
      document.head.appendChild(l);
    } else {
      links.forEach(function (el) { el.href = FAV; el.type = 'image/jpeg'; });
    }
    var apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      document.head.appendChild(apple);
    }
    apple.href = LOGO;

    document.querySelectorAll('a.logo').forEach(function (a) {
      if (a.querySelector('img.logo-img')) return;
      var img = document.createElement('img');
      img.src = LOGO;
      img.alt = 'Seventh Trumpet';
      img.className = 'logo-img';
      img.width = 44;
      img.height = 44;
      a.insertBefore(img, a.firstChild);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
