/* Admin visit counter: display + undo on successful login only */
(function () {
  function refresh() {
    if (typeof window.refreshAdminVisitorDisplay === 'function') {
      window.refreshAdminVisitorDisplay();
      return;
    }
    var el = document.getElementById('admin-visitor-count');
    if (!el) return;
    try {
      el.textContent = (parseInt(localStorage.getItem('cog_visitor_count') || '0', 10) || 0).toLocaleString();
    } catch (e) { el.textContent = '0'; }
  }

  window.loadVisitorCount = refresh;
  try { loadVisitorCount = refresh; } catch (e) {}

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('login-form');
    if (form && !form._visitHooked) {
      form._visitHooked = true;
      form.addEventListener('submit', function () {
        setTimeout(function () {
          try {
            if (sessionStorage.getItem('cog_auth') === 'true') {
              if (typeof window.undoAdminVisit === 'function') window.undoAdminVisit();
              refresh();
            }
          } catch (e) {}
        }, 0);
      });
    }
    if (sessionStorage.getItem('cog_auth') === 'true') {
      try { localStorage.setItem('cog_admin_skip_visit', '1'); } catch (e) {}
      refresh();
    }
  });
})();
