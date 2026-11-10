/* Clear back-to-home control — easy for older / less experienced users */
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

  // Very clear labels — not only an arrow
  function label() {
    return isEn() ? 'Back to Home' : '\u0628\u0627\u0632\u06af\u0634\u062a \u0628\u0647 \u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc';
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
        '.page-back{' +
        'display:inline-flex;align-items:center;justify-content:center;gap:0.35rem;' +
        'height:2.4rem;min-width:2.4rem;padding:0 0.75rem 0 0.5rem;' +
        'border-radius:999px;' +
        'background:rgba(255,255,255,0.2);' +
        'border:1px solid rgba(255,255,255,0.4);' +
        'color:#fff;text-decoration:none;flex-shrink:0;' +
        'font-family:inherit;font-weight:700;font-size:0.82rem;' +
        'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
        'box-shadow:0 2px 10px rgba(0,0,0,0.15);' +
        '}' +
        '.page-back:active{transform:scale(0.97)}' +
        '.page-back-icon{font-size:1.2rem;line-height:1;font-weight:700}' +
        'html[dir="rtl"] .page-back-icon{transform:scaleX(-1)}' +
        '.page-back-text{white-space:nowrap;max-width:11rem;overflow:hidden;text-overflow:ellipsis}' +
        /* On very small screens keep short clear text, not icon-only */
        '@media (max-width:360px){.page-back{padding:0 0.55rem;font-size:0.75rem}.page-back-text{max-width:7.5rem}}';
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
    var menuBtn = document.getElementById('menu-btn');
    var headerActions = document.querySelector('.header-actions');

    if (headerInner) {
      if (menuBtn && menuBtn.parentNode === headerInner) {
        if (menuBtn.nextSibling) headerInner.insertBefore(a, menuBtn.nextSibling);
        else headerInner.appendChild(a);
      } else if (headerActions) {
        headerActions.insertBefore(a, headerActions.firstChild);
      } else {
        headerInner.insertBefore(a, headerInner.firstChild);
      }
    } else {
      document.body.insertBefore(a, document.body.firstChild);
    }

    applyLabel();
  }

  function boot() {
    inject();
    setTimeout(inject, 200);
    setTimeout(inject, 700);
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
