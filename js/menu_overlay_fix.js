/* Ensure menu overlay never blocks the page when closed */
(function () {
  function forceClose() {
    var overlay = document.getElementById('menu-overlay');
    var panel = document.getElementById('side-menu');
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('hidden', '');
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
    }
    if (panel) {
      panel.classList.remove('open');
    }
    document.body.classList.remove('menu-open');
  }

  function patch() {
    var overlay = document.getElementById('menu-overlay');
    if (overlay && !overlay.classList.contains('open')) {
      overlay.setAttribute('hidden', '');
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
    }
    // If dark was stuck only because of overlay, leave user theme alone
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(patch, 0);
      setTimeout(patch, 300);
    });
  } else {
    setTimeout(patch, 0);
  }

  // Escape closes menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') forceClose();
  });
})();
