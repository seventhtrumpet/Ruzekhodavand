/* Public media UX: no playlist button; autoplay video when opened */
(function () {
  function patchOpenPost() {
    if (typeof window.openPost !== 'function') return;
    if (window.openPost._stPublicPatched) return;
    var orig = window.openPost;
    window.openPost = function (id) {
      orig(id);
      try {
        var content = document.getElementById('modal-content');
        if (!content) return;
        // Remove any playlist controls for public
        content.querySelectorAll('#modal-pl-select, label').forEach(function (el) {
          var t = (el.textContent || '') + (el.getAttribute('for') || '');
          if (el.id === 'modal-pl-select' || /playlist|\u067e\u0644\u06cc/i.test(t)) {
            var row = el.closest('div');
            if (row) row.remove();
            else el.remove();
          }
        });
        content.querySelectorAll('button').forEach(function (btn) {
          var t = (btn.textContent || '').trim();
          if (/playlist|\u067e\u0644\u06cc|\u0627\u0641\u0632\u0648\u062f\u0646 \u0628\u0647/i.test(t) && btn.getAttribute('onclick') && btn.getAttribute('onclick').indexOf('Playlist') >= 0) {
            var row = btn.closest('div');
            if (row) row.remove();
          }
        });
        // Prefer autoplay for YouTube iframes
        var iframe = content.querySelector('iframe');
        if (iframe && iframe.src && iframe.src.indexOf('autoplay') < 0) {
          iframe.src += (iframe.src.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
        }
        var vid = content.querySelector('video');
        if (vid) {
          try { vid.play(); } catch (e) {}
        }
      } catch (e) {}
    };
    window.openPost._stPublicPatched = true;
  }

  function boot() {
    patchOpenPost();
    setTimeout(patchOpenPost, 500);
    setTimeout(patchOpenPost, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
