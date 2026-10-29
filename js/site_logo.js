/* Seventh Trumpet profile logo */
(function () {
  var FILE = (location.origin || 'https://seventhtrumpet.org') + '/img/logo.jpg';
  var LOGO = (window.ST_LOGO && window.ST_LOGO.length > 200) ? window.ST_LOGO : FILE;
  var FAV = (window.ST_FAV && window.ST_FAV.length > 80) ? window.ST_FAV : LOGO;

  function openLogoViewer(src) {
    if (document.getElementById('logo-viewer')) return;
    var overlay = document.createElement('div');
    overlay.id = 'logo-viewer';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Logo');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);' +
      'display:flex;align-items:center;justify-content:center;padding:1.2rem;' +
      'cursor:pointer;-webkit-tap-highlight-color:transparent;';

    var img = document.createElement('img');
    img.src = src;
    img.alt = 'Seventh Trumpet';
    img.style.cssText =
      'max-width:min(92vw,420px);max-height:85vh;border-radius:50%;' +
      'border:3px solid rgba(201,162,39,.95);box-shadow:0 12px 40px rgba(0,0,0,.5);' +
      'object-fit:cover;background:#0a2540;';

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '\u00d7';
    close.style.cssText =
      'position:absolute;top:12px;right:14px;width:44px;height:44px;border:0;' +
      'border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:1.6rem;' +
      'line-height:1;cursor:pointer;';

    function dismiss() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
      if (e.key === 'Escape') dismiss();
    }

    overlay.addEventListener('click', dismiss);
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      dismiss();
    });
    img.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    document.addEventListener('keydown', onKey);

    overlay.appendChild(img);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
  }

  function boot() {
    var style = document.createElement('style');
    style.textContent =
      '.logo{display:inline-flex!important;align-items:center;gap:.55rem}' +
      '.logo-img{width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;' +
      'border:2px solid rgba(201,162,39,.9);box-shadow:0 0 0 1px rgba(255,255,255,.2);' +
      'flex-shrink:0;background:#0a2540;cursor:pointer}' +
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
      links.forEach(function (el) {
        el.href = FAV;
        el.type = 'image/jpeg';
      });
    }
    var apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      document.head.appendChild(apple);
    }
    apple.href = LOGO;

    // Header circle logo — tap opens full view (does not navigate)
    document.querySelectorAll('a.logo').forEach(function (a) {
      if (a.querySelector('img.logo-img')) return;
      var img = document.createElement('img');
      img.src = LOGO;
      img.alt = 'Seventh Trumpet';
      img.className = 'logo-img';
      img.width = 48;
      img.height = 48;
      img.decoding = 'async';
      img.title = 'View logo';
      img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLogoViewer(LOGO);
      });
      a.insertBefore(img, a.firstChild);
    });

    // Social / search preview
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
