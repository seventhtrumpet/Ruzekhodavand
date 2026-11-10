/* Keep fixed Bible ref bar positioned under header + content spacer */
(function () {
  function place() {
    var bar = document.querySelector('.mb-bar');
    if (!bar) return;
    var header = document.querySelector('.header');
    var h = header ? header.offsetHeight : 54;
    bar.style.top = h + 'px';
    var sp = document.querySelector('.mb-bar-spacer');
    if (!sp) {
      sp = document.createElement('div');
      sp.className = 'mb-bar-spacer';
      sp.setAttribute('aria-hidden', 'true');
      if (bar.nextSibling) bar.parentNode.insertBefore(sp, bar.nextSibling);
      else bar.parentNode.appendChild(sp);
    }
    sp.style.height = (bar.offsetHeight + 6) + 'px';
  }
  function boot() {
    place();
    setTimeout(place, 150);
    setTimeout(place, 600);
    window.addEventListener('resize', place);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
