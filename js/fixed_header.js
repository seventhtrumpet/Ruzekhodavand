/* Site header always fixed on every page while scrolling */
(function () {
  function apply() {
    var header = document.querySelector('.header');
    if (!header) return;

    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.right = '0';
    header.style.width = '100%';
    header.style.zIndex = '1200';

    var h = header.offsetHeight || 56;

    // Spacer so content is not hidden under fixed header
    var spacer = document.getElementById('site-header-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'site-header-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      if (header.nextSibling) header.parentNode.insertBefore(spacer, header.nextSibling);
      else header.parentNode.appendChild(spacer);
    }
    spacer.style.height = h + 'px';
    spacer.style.width = '100%';
    spacer.style.flexShrink = '0';

    // Bible bar sits under fixed header
    var bar = document.querySelector('.mb-bar');
    if (bar) {
      bar.style.position = 'fixed';
      bar.style.top = h + 'px';
      bar.style.left = '0';
      bar.style.right = '0';
      bar.style.zIndex = '1150';
      var bsp = document.querySelector('.mb-bar-spacer');
      if (!bsp) {
        bsp = document.createElement('div');
        bsp.className = 'mb-bar-spacer';
        bsp.setAttribute('aria-hidden', 'true');
        if (bar.nextSibling) bar.parentNode.insertBefore(bsp, bar.nextSibling);
        else bar.parentNode.appendChild(bsp);
      }
      bsp.style.height = (bar.offsetHeight + 4) + 'px';
    }

    // Back button must stay inside header (always visible)
    var back = document.getElementById('page-back');
    if (back && back.classList.contains('page-back-float')) {
      back.classList.remove('page-back-float');
      var inner = document.querySelector('.header-inner');
      if (inner && !inner.contains(back)) {
        var menuBtn = document.getElementById('menu-btn');
        if (menuBtn && menuBtn.nextSibling) inner.insertBefore(back, menuBtn.nextSibling);
        else if (menuBtn) inner.appendChild(back);
        else inner.insertBefore(back, inner.firstChild);
      }
    }
  }

  function boot() {
    apply();
    setTimeout(apply, 150);
    setTimeout(apply, 500);
    setTimeout(apply, 1200);
    window.addEventListener('resize', apply);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
