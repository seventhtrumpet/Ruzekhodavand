/* Loading overlay with gentle animation — Bible / Media */
(function () {
  var page = (document.body && document.body.getAttribute('data-page')) || '';
  var path = (location.pathname || '').toLowerCase();
  var isBible = page === 'bible' || path.indexOf('bible') >= 0;
  var isMedia = page === 'media' || path.indexOf('media') >= 0;
  if (!isBible && !isMedia) return;

  var labelFa = isBible ? '\u062f\u0631 \u062d\u0627\u0644 \u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633\u2026' : '\u062f\u0631 \u062d\u0627\u0644 \u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627\u2026';
  var labelEn = isBible ? 'Opening the Bible\u2026' : 'Opening media\u2026';
  var icon = isBible ? '\uD83D\uDCD6' : '\uD83C\uDFAC';

  function lang() {
    try {
      return localStorage.getItem('cog_lang') || 'fa';
    } catch (e) {
      return 'fa';
    }
  }

  function inject() {
    if (document.getElementById('st-loading')) return;
    var style = document.createElement('style');
    style.id = 'st-loading-css';
    style.textContent =
      '#st-loading{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(7,18,32,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
      'transition:opacity 0.35s ease}' +
      '#st-loading.st-hide{opacity:0;pointer-events:none}' +
      '.st-loading-box{text-align:center;color:#fff;padding:1.5rem;max-width:280px}' +
      '.st-loading-icon{font-size:2.6rem;line-height:1;margin-bottom:0.85rem;' +
      'animation:st-pulse 1.2s ease-in-out infinite}' +
      '.st-loading-spin{width:42px;height:42px;margin:0 auto 1rem;border-radius:50%;' +
      'border:3px solid rgba(201,162,39,0.25);border-top-color:#c9a227;' +
      'animation:st-spin 0.8s linear infinite}' +
      '.st-loading-text{font-size:1.05rem;font-weight:600;text-shadow:0 1px 8px rgba(0,0,0,0.5)}' +
      '@keyframes st-spin{to{transform:rotate(360deg)}}' +
      '@keyframes st-pulse{0%,100%{transform:scale(1);opacity:0.85}50%{transform:scale(1.08);opacity:1}}';
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.id = 'st-loading';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="st-loading-box">' +
      '<div class="st-loading-icon" aria-hidden="true">' + icon + '</div>' +
      '<div class="st-loading-spin" aria-hidden="true"></div>' +
      '<div class="st-loading-text" id="st-loading-text">' +
      (lang() === 'en' ? labelEn : labelFa) +
      '</div></div>';
    document.body.appendChild(el);
  }

  function hide() {
    var el = document.getElementById('st-loading');
    if (!el) return;
    el.classList.add('st-hide');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }

  function boot() {
    inject();
    // Hide when page has settled
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      hide();
    }
    // Bible / media ready signals
    setTimeout(finish, 1200);
    setTimeout(finish, 2800);
    window.addEventListener('load', function () {
      setTimeout(finish, 400);
    });
    // If media grid or bible content appears
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      var ready =
        document.getElementById('media-grid') ||
        document.getElementById('bible-reader') ||
        document.querySelector('.bible-content, #bible-app, .verse-list, #chapter-text');
      if (ready || tries > 20) {
        clearInterval(iv);
        setTimeout(finish, 300);
      }
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
