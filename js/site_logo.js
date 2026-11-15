/* Site logo — wider profile circle, social icons stay free */
(function () {
  function openPreview(src) {
    if (document.getElementById('logo-preview-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'logo-preview-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,.88);' +
      'display:flex;align-items:center;justify-content:center;padding:1rem;';
    var img = document.createElement('img');
    img.src = src;
    img.alt = 'Seventh Trumpet';
    img.style.cssText =
      'width:min(96vw,560px);height:auto;aspect-ratio:1;border-radius:50%;' +
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
      try { overlay.remove(); } catch (e) {}
    }
    close.addEventListener('click', dismiss);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });
    overlay.appendChild(img);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
  }

  function ensureCss() {
    if (document.getElementById('site-logo-css')) return;
    var style = document.createElement('style');
    style.id = 'site-logo-css';
    style.textContent =
      '.logo{display:inline-flex!important;align-items:center;gap:.55rem;text-decoration:none;color:inherit;cursor:pointer;min-width:0;max-width:min(48vw,14rem)}' +
      '.logo-img{width:3.25rem;height:3.25rem;border-radius:50%;object-fit:cover;' +
      'border:2px solid rgba(201,162,39,.9);box-shadow:0 0 0 1px rgba(255,255,255,.2);' +
      'flex-shrink:0;background:#0a2540;cursor:pointer}' +
      '.logo .logo-name,.logo [data-i18n="siteName"]{cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '@media(min-width:600px){.logo-img{width:3.6rem;height:3.6rem}}' +
      '#header-social.header-social{flex-shrink:0!important;z-index:6!important}';
    document.head.appendChild(style);
  }

  function setMeta(attr, key, val) {
    var el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  }

  function applyFav(src) {
    var href = window.ST_FAV || src;
    document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').forEach(function (l) {
      l.href = href;
    });
    if (!document.querySelector('link[rel="icon"]')) {
      var link = document.createElement('link');
      link.rel = 'icon';
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function placeLogo(src) {
    if (!src || src.length < 50) return;
    ensureCss();
    document.querySelectorAll('a.logo').forEach(function (a) {
      if (!a.querySelector('img.logo-img')) {
        var img = document.createElement('img');
        img.className = 'logo-img';
        img.alt = 'Seventh Trumpet';
        img.width = 58;
        img.height = 58;
        img.src = src;
        img.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openPreview(src);
        });
        a.insertBefore(img, a.firstChild);
      } else {
        a.querySelector('img.logo-img').src = src;
      }
    });
    applyFav(src);
    try {
      setMeta('property', 'og:image', src);
      setMeta('property', 'og:image:width', '512');
      setMeta('property', 'og:image:height', '512');
      setMeta('name', 'twitter:image', src);
    } catch (e) {}
  }

  function boot() {
    if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 200) {
      placeLogo(window.ST_LOGO);
      return;
    }
    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 200) {
        clearInterval(t);
        placeLogo(window.ST_LOGO);
      } else if (tries > 40) clearInterval(t);
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
