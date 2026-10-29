/* Seventh Trumpet profile logo — high quality */
(function () {
  // High-resolution hosted logo (sharp when opened large)
  var HQ = 'https://iili.io/n8MSJBp.jpg';
  var HQ256 = 'https://iili.io/n8M8tYF.jpg';
  var FILE = (location.origin || 'https://seventhtrumpet.org') + '/img/logo.jpg';
  // Prefer HQ for display; embedded only as last fallback
  var LOGO = HQ;
  var FAV = (window.ST_FAV && window.ST_FAV.length > 80) ? window.ST_FAV : HQ256;

  function openLogoViewer(src) {
    if (document.getElementById('logo-viewer')) return;
    var overlay = document.createElement('div');
    overlay.id = 'logo-viewer';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Logo');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);' +
      'display:flex;align-items:center;justify-content:center;padding:0.8rem;' +
      'cursor:pointer;-webkit-tap-highlight-color:transparent;';

    var img = document.createElement('img');
    img.src = src;
    img.alt = 'Seventh Trumpet';
    img.style.cssText =
      'width:min(96vw,560px);height:auto;aspect-ratio:1;border-radius:50%;' +
      'border:4px solid rgba(201,162,39,.95);box-shadow:0 16px 48px rgba(0,0,0,.55);' +
      'object-fit:cover;background:#0a2540;max-height:90vh;';

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close');
    close.textContent = '\u00d7';
    close.style.cssText =
      'position:absolute;top:12px;right:14px;width:48px;height:48px;border:0;' +
      'border-radius:50%;background:rgba(255,255,255,.18);color:#fff;font-size:1.8rem;' +
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
    apple.href = HQ256;

    // Header circle logo — tap opens sharp full view
    document.querySelectorAll('a.logo').forEach(function (a) {
      if (a.querySelector('img.logo-img')) return;
      var img = document.createElement('img');
      img.src = HQ256;
      img.alt = 'Seventh Trumpet';
      img.className = 'logo-img';
      img.width = 48;
      img.height = 48;
      img.decoding = 'async';
      img.title = 'View logo';
      img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLogoViewer(HQ);
      });
      a.insertBefore(img, a.firstChild);
    });

    // Google / social previews use the sharp 512 logo
    function setMeta(attr, key, val) {
      var m = document.querySelector('meta[' + attr + '="' + key + '"]');
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute(attr, key);
        document.head.appendChild(m);
      }
      m.setAttribute('content', val);
    }
    setMeta('property', 'og:image', HQ);
    setMeta('property', 'og:image:width', '512');
    setMeta('property', 'og:image:height', '512');
    setMeta('name', 'twitter:image', HQ);
    setMeta('name', 'twitter:card', 'summary');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
