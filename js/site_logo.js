/* Seventh Trumpet profile logo */
(function () {
  var FILE = (location.origin || 'https://seventhtrumpet.org') + '/img/logo.jpg';
  // Prefer embedded logo (always works), fall back to file if present
  var LOGO = (window.ST_LOGO && window.ST_LOGO.length > 200) ? window.ST_LOGO : FILE;
  var FAV = (window.ST_FAV && window.ST_FAV.length > 80) ? window.ST_FAV : LOGO;

  function boot() {
    var style = document.createElement('style');
    style.textContent =
      '.logo{display:inline-flex!important;align-items:center;gap:.55rem}' +
      '.logo-img{width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;' +
      'border:2px solid rgba(201,162,39,.9);box-shadow:0 0 0 1px rgba(255,255,255,.2);' +
      'flex-shrink:0;background:#0a2540}' +
      '@media(min-width:600px){.logo-img{width:2.9rem;height:2.9rem}}';
    document.head.appendChild(style);

    // Browser tab icon
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

    // Header circle logo
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

    // Social / search preview (needs a real public URL when img/logo.jpg exists)
    function setMeta(attr, key, val) {
      var m = document.querySelector('meta[' + attr + '="' + key + '"]');
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute(attr, key);
        document.head.appendChild(m);
      }
      m.setAttribute('content', val);
    }
    setMeta('property', 'og:image', FILE);
    setMeta('property', 'og:image:width', '512');
    setMeta('property', 'og:image:height', '512');
    setMeta('name', 'twitter:image', FILE);
    setMeta('name', 'twitter:card', 'summary');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
