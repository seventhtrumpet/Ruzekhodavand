// Load profile logo in 2 chunks, assemble, THEN apply to header
(function () {
  var n = 2;
  var loaded = 0;

  function applyLogo() {
    if (!document.querySelector('script[data-site-logo]')) {
      var s = document.createElement('script');
      s.src = 'js/site_logo.js';
      s.setAttribute('data-site-logo', '1');
      document.body.appendChild(s);
    } else if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 200) {
      // site_logo already ran once — force refresh header images
      document.querySelectorAll('img.logo-img').forEach(function (img) {
        img.src = window.ST_LOGO;
      });
      document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').forEach(function (l) {
        l.href = window.ST_FAV || window.ST_LOGO;
      });
    }
  }

  function next() {
    if (loaded >= n) {
      var a = document.createElement('script');
      a.src = 'js/logo_assemble.js';
      a.onload = applyLogo;
      a.onerror = applyLogo;
      document.body.appendChild(a);
      return;
    }
    var s = document.createElement('script');
    s.src = 'js/logo_p' + loaded + '.js';
    s.onload = function () { loaded++; next(); };
    s.onerror = function () { loaded++; next(); };
    document.body.appendChild(s);
  }

  next();
})();
