/* Back / Home control on every page except homepage */
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
    // Persian: صفحه اصلی (not a bad translation of Home)
    return isEn() ? 'Home page' : '\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc';
  }

  function applyLabel() {
    var a = document.getElementById('page-back');
    if (a) a.textContent = '\u2190 ' + label();
  }

  function inject() {
    if (isHome()) return;
    if (document.getElementById('page-back')) {
      applyLabel();
      return;
    }
    if (!document.getElementById('page-back-css')) {
      var st = document.createElement('style');
      st.id = 'page-back-css';
      st.textContent =
        '.page-back-bar{max-width:1200px;margin:0 auto;padding:.55rem 1rem 0}' +
        '.page-back{display:inline-flex;align-items:center;gap:.35rem;padding:.4rem .85rem;border-radius:8px;background:var(--bg-card,#fff);border:1px solid var(--border,#e0dcd3);color:var(--primary,#0a2540);text-decoration:none;font-weight:600;font-size:.9rem;font-family:inherit}' +
        '.page-back:hover{border-color:var(--primary,#0a2540)}' +
        'body.dark .page-back{background:#1a2332;border-color:#2a3544;color:#e8eef5}';
      document.head.appendChild(st);
    }

    var bar = document.createElement('div');
    bar.className = 'page-back-bar';
    bar.id = 'page-back-bar';
    var a = document.createElement('a');
    a.id = 'page-back';
    a.className = 'page-back';
    a.href = 'index.html';
    a.textContent = '\u2190 ' + label();
    bar.appendChild(a);

    var header = document.querySelector('.header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(bar, header.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  function boot() {
    inject();
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
