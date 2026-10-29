/* Runtime bugfixes applied after core scripts */
(function () {
  window.escapeHtml = function (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  try { escapeHtml = window.escapeHtml; } catch (e) {}

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('lang-toggle');
    if (btn && !btn._langBound) {
      btn._langBound = true;
      btn.addEventListener('click', function () {
        if (typeof toggleLanguage === 'function') toggleLanguage();
        setTimeout(function () {
          if (typeof renderMedia === 'function') renderMedia();
        }, 50);
      });
    }
    var grid = document.getElementById('media-grid');
    if (grid && typeof window.pullMediaFromCloud === 'function') {
      window.pullMediaFromCloud().then(function (merged) {
        if (!merged || !merged.length) return;
        try { posts = merged; } catch (e) {}
        if (typeof renderMedia === 'function') renderMedia();
      });
    }
  });
})();
