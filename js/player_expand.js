/* Auto-open ?play= from home; expand / fullscreen media player */
(function () {
  function isFa() {
    try {
      return ((typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa') !== 'en';
    } catch (e) {
      return true;
    }
  }

  function getPlayId() {
    try {
      var q = new URLSearchParams(window.location.search).get('play');
      if (q) return q;
      var h = (window.location.hash || '').replace(/^#/, '');
      if (h.indexOf('post-') === 0) return h.slice(5);
      if (h) return h;
    } catch (e) {}
    return null;
  }

  function tryAutoOpen(attempt) {
    attempt = attempt || 0;
    var id = getPlayId();
    if (!id) return;
    if (typeof window.openPost !== 'function') {
      if (attempt < 20) setTimeout(function () { tryAutoOpen(attempt + 1); }, 250);
      return;
    }
    try {
      if (typeof posts === 'undefined' || !posts || !posts.length) {
        try {
          window.posts = JSON.parse(localStorage.getItem('cog_posts_v1') || '[]');
        } catch (e) {}
      }
      window.openPost(id);
      try {
        var u = new URL(window.location.href);
        u.searchParams.delete('play');
        u.hash = '';
        history.replaceState(null, '', u.pathname + u.search);
      } catch (e2) {}
    } catch (e3) {
      if (attempt < 15) setTimeout(function () { tryAutoOpen(attempt + 1); }, 300);
    }
  }

  function enhancePlayer() {
    var content = document.getElementById('modal-content');
    if (!content) return;
    if (content.querySelector('#player-expand-btn')) return;

    var wrap = content.querySelector('.video-wrap');
    var video = content.querySelector('video');
    var iframe = content.querySelector('iframe');
    if (!wrap && !video && !iframe) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'player-expand-btn';
    btn.className = 'btn';
    btn.style.cssText =
      'margin:0.6rem 0 0;width:100%;padding:0.7rem 1rem;font-size:1.05rem;font-weight:800;' +
      'background:#c9a227;color:#0a2540;border:2px solid #a8861a;border-radius:10px;';
    btn.textContent = isFa() ? '\u0628\u0632\u0631\u06af / \u062a\u0645\u0627\u0645\u200c\u0635\u0641\u062d\u0647' : 'Expand / Fullscreen';

    function enterExpand() {
      document.body.classList.add('player-expanded');
      if (wrap) wrap.classList.add('player-fs');
      if (video) video.classList.add('player-fs');
      btn.textContent = isFa() ? '\u06a9\u0648\u0686\u06a9 \u06a9\u0631\u062f\u0646' : 'Exit expand';
      btn.setAttribute('data-expanded', '1');
      try {
        var el = wrap || video || iframe;
        if (el && el.requestFullscreen) el.requestFullscreen();
        else if (el && el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch (e) {}
    }

    function exitExpand() {
      document.body.classList.remove('player-expanded');
      if (wrap) wrap.classList.remove('player-fs');
      if (video) video.classList.remove('player-fs');
      btn.textContent = isFa() ? '\u0628\u0632\u0631\u06af / \u062a\u0645\u0627\u0645\u200c\u0635\u0641\u062d\u0647' : 'Expand / Fullscreen';
      btn.removeAttribute('data-expanded');
      try {
        if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
      } catch (e) {}
    }

    btn.addEventListener('click', function () {
      if (btn.getAttribute('data-expanded')) exitExpand();
      else enterExpand();
    });

    if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(btn, wrap.nextSibling);
    else if (video && video.parentNode) video.parentNode.insertBefore(btn, video.nextSibling);
    else content.appendChild(btn);

    function onOrient() {
      try {
        var landscape = window.matchMedia('(orientation: landscape)').matches;
        if (landscape && window.innerWidth < 900) {
          if (!btn.getAttribute('data-expanded')) enterExpand();
        }
      } catch (e) {}
    }
    window.addEventListener('orientationchange', function () {
      setTimeout(onOrient, 200);
    });
    window.addEventListener('resize', onOrient);
  }

  function patchOpenPost() {
    if (typeof window.openPost !== 'function') return;
    if (window.openPost._expandPatched) return;
    var orig = window.openPost;
    window.openPost = function (id) {
      orig(id);
      setTimeout(enhancePlayer, 60);
      setTimeout(enhancePlayer, 300);
    };
    window.openPost._expandPatched = true;
  }

  function boot() {
    patchOpenPost();
    setTimeout(patchOpenPost, 400);
    setTimeout(function () {
      patchOpenPost();
      tryAutoOpen(0);
    }, 600);
    setTimeout(function () { tryAutoOpen(0); }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
