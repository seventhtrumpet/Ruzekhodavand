/* Back button — header style (circular chevron, like profile apps) */
(function () {
  function isHome() {
    var p = (location.pathname || '').toLowerCase();
    return p === '/' || p.endsWith('/index.html') || p.endsWith('/index') || p === '';
  }

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function label() {
    return isEn() ? 'Home' : '\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc';
  }

  function applyLabel() {
    var a = document.getElementById('page-back');
    if (!a) return;
    var text = a.querySelector('.page-back-text');
    if (text) text.textContent = label();
    a.setAttribute('aria-label', label());
    a.setAttribute('title', label());
  }

  function inject() {
    if (isHome()) {
      var existing = document.getElementById('page-back');
      if (existing) existing.remove();
      return;
    }
    if (document.getElementById('page-back')) {
      applyLabel();
      return;
    }

    if (!document.getElementById('page-back-css')) {
      var st = document.createElement('style');
      st.id = 'page-back-css';
      st.textContent =
        /* Circular back — sits in header, profile-app style */
        '.page-back{' +
        'display:inline-flex;align-items:center;justify-content:center;gap:0.35rem;' +
        'height:2.35rem;min-width:2.35rem;padding:0 0.65rem 0 0.45rem;' +
        'border-radius:999px;' +
        'background:rgba(255,255,255,0.14);' +
        'border:1px solid rgba(255,255,255,0.28);' +
        'color:#fff;text-decoration:none;flex-shrink:0;' +
        'font-family:inherit;font-weight:600;font-size:0.82rem;' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'transition:background .15s ease, transform .15s ease;' +
        '}' +
        '.page-back:hover{background:rgba(255,255,255,0.24);}' +
        '.page-back:active{transform:scale(0.96);}' +
        '.page-back-icon{' +
        'display:inline-flex;align-items:center;justify-content:center;' +
        'width:1.35rem;height:1.35rem;flex-shrink:0;' +
        'font-size:1.15rem;line-height:1;font-weight:700;' +
        '}' +
        'html[dir="rtl"] .page-back-icon{transform:scaleX(-1);}' +
        '.page-back-text{white-space:nowrap;max-width:7.5rem;overflow:hidden;text-overflow:ellipsis;}' +
        '@media (max-width:380px){.page-back-text{display:none;}.page-back{padding:0;width:2.35rem;}}' +
        /* If header not found, floating fallback */
        '.page-back.page-back-float{' +
        'position:fixed;top:0.7rem;z-index:1100;' +
        'left:0.7rem;' +
        'box-shadow:0 4px 16px rgba(0,0,0,0.25);' +
        'background:rgba(10,37,64,0.88);' +
        '}' +
        'html[dir="rtl"] .page-back.page-back-float{left:auto;right:0.7rem;}';
      document.head.appendChild(st);
    }

    var a = document.createElement('a');
    a.id = 'page-back';
    a.className = 'page-back';
    a.href = 'index.html';
    a.innerHTML =
      '<span class="page-back-icon" aria-hidden="true">\u2039</span>' +
      '<span class="page-back-text"></span>';

    var headerInner = document.querySelector('.header-inner');
    var headerActions = document.querySelector('.header-actions');
    var menuBtn = document.getElementById('menu-btn');

    if (headerInner) {
      // Place after hamburger (or at start of header) — profile-style top control
      if (menuBtn && menuBtn.parentNode === headerInner) {
        if (menuBtn.nextSibling) headerInner.insertBefore(a, menuBtn.nextSibling);
        else headerInner.appendChild(a);
      } else if (headerActions) {
        headerActions.insertBefore(a, headerActions.firstChild);
      } else {
        headerInner.insertBefore(a, headerInner.firstChild);
      }
    } else {
      a.classList.add('page-back-float');
      document.body.appendChild(a);
    }

    applyLabel();
  }

  function boot() {
    inject();
    // Re-run after menu injects hamburger
    setTimeout(inject, 200);
    setTimeout(inject, 600);
    window.addEventListener('cog-lang-changed', applyLabel);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () {
      setTimeout(applyLabel, 100);
      setTimeout(applyLabel, 400);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
