/* Small Back control — does not cover social icons */
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
    return isEn() ? 'Back' : '\u0628\u0627\u0632\u06af\u0634\u062a';
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
        '.page-back{display:inline-flex;align-items:center;justify-content:center;gap:0.15rem;' +
        'height:1.7rem;padding:0 0.45rem;border-radius:8px;' +
        'background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);' +
        'color:#fff;text-decoration:none;flex-shrink:0;order:7;' +
        'font-family:inherit;font-weight:700;font-size:0.68rem;line-height:1;white-space:nowrap}' +
        '.page-back-icon{font-size:0.85rem;line-height:1}' +
        'html[dir="rtl"] .page-back-icon{transform:scaleX(-1)}' +
        '.page-back-text{max-width:3.2rem;overflow:hidden;text-overflow:ellipsis}';
      document.head.appendChild(st);
    }
    var a = document.createElement('a');
    a.id = 'page-back';
    a.className = 'page-back';
    a.href = 'index.html';
    a.innerHTML = '<span class="page-back-icon" aria-hidden="true">\u2039</span><span class="page-back-text">' + label() + '</span>';
    var actions = document.querySelector('.header-actions');
    var inner = document.querySelector('.header-inner');
    if (actions) actions.appendChild(a);
    else if (inner) inner.appendChild(a);
    else document.body.appendChild(a);
    applyLabel();
  }
  function boot() {
    inject();
    setTimeout(inject, 300);
    setTimeout(inject, 900);
    window.addEventListener('cog-lang-changed', applyLabel);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
