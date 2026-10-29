/* Seventh Trumpet profile logo */
(function () {
  // Full quality logo (angel + SeventhTrumpet.org seal)
  var LOGO_URL = 'https://litter.catbox.moe/4hsgsb.jpg';
  var LOGO = (window.ST_LOGO && window.ST_LOGO.length > 100) ? window.ST_LOGO : LOGO_URL;
  var FAV = (window.ST_FAV && window.ST_FAV.length > 50) ? window.ST_FAV : LOGO;

  function boot() {
    var style = document.createElement('style');
    style.textContent = '.logo{display:inline-flex!important;align-items:center;gap:.55rem}.logo-img{width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;border:2px solid rgba(201,162,39,.9);box-shadow:0 0 0 1px rgba(255,255,255,.2);flex-shrink:0;background:#0a2540}@media(min-width:600px){.logo-img{width:2.9rem;height:2.9rem}}';
    document.head.appendChild(style);

    var links = document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"]');
    if (!links.length) {
      var l = document.createElement('link');
      l.rel = 'icon';
      l.type = 'image/jpeg';
      l.href = FAV;
      document.head.appendChild(l);
    } else {
      links.forEach(function (el) { el.href = FAV; });
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
      img.width = 48;
      img.height = 48;
      img.decoding = 'async';
      a.insertBefore(img, a.firstChild);
    });

    var og = document.querySelector('meta[property="og:image"]');
    if (!og) {
      og = document.createElement('meta');
      og.setAttribute('property', 'og:image');
      document.head.appendChild(og);
    }
    og.setAttribute('content', LOGO_URL);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
