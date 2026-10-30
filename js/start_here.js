/* Prominent Start here button for simple navigation */
(function () {
  function inject() {
    if (document.getElementById('start-here-wrap')) return;
    var heroInner = document.querySelector('.hero .hero-inner');
    if (!heroInner) return;

    var wrap = document.createElement('div');
    wrap.id = 'start-here-wrap';
    wrap.className = 'start-here-wrap';
    wrap.innerHTML =
      '<a class="btn btn-primary start-here-btn" href="angel.html?n=1" data-i18n="startHere">' +
      '\u0627\u0632 \u0627\u06cc\u0646\u062c\u0627 \u0634\u0631\u0648\u0639 \u06a9\u0646\u06cc\u062f' +
      '</a>' +
      '<p class="start-here-hint" data-i18n="startHereHint">' +
      '\u067e\u06cc\u0627\u0645 \u0641\u0631\u0634\u062a\u0647 \u0627\u0648\u0644 \u0631\u0627 \u0628\u062e\u0648\u0627\u0646\u06cc\u062f' +
      '</p>';

    // Place after hero subtitle if possible
    var sub = heroInner.querySelector('.hero-sub');
    if (sub && sub.nextSibling) {
      sub.parentNode.insertBefore(wrap, sub.nextSibling);
    } else {
      var angels = heroInner.querySelector('.angels-heading');
      if (angels) heroInner.insertBefore(wrap, angels);
      else heroInner.appendChild(wrap);
    }

    // Apply language if available
    try {
      if (typeof applyLanguage === 'function') applyLanguage();
    } catch (e) {}
  }

  // Styles
  var style = document.createElement('style');
  style.textContent =
    '.start-here-wrap{text-align:center;margin:1.25rem auto 0.5rem;max-width:420px}' +
    '.start-here-btn{display:inline-flex!important;min-width:220px;padding:0.9rem 1.6rem!important;' +
    'font-size:1.1rem!important;font-weight:700!important;border-radius:999px!important;' +
    'box-shadow:0 6px 24px rgba(0,0,0,.4)!important;background:#c9a227!important;color:#0a2540!important;' +
    'border:none!important}' +
    '.start-here-btn:hover{filter:brightness(1.08);transform:translateY(-2px)}' +
    '.start-here-hint{margin:0.55rem 0 0;font-size:0.88rem;color:#fff;' +
    'text-shadow:0 1px 8px rgba(0,0,0,.75);opacity:.95}';
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
  setTimeout(inject, 300);
})();
