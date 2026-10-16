/* Enhancements: load media module + auth UI + daily verse */
(function () {
  function loadScript(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) { if (cb) cb(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { if (cb) cb(); };
    document.body.appendChild(s);
  }
  function boot() {
    loadScript('js/app_media.js', function () {
      loadScript('js/auth_ui.js', function () {
        if (typeof renderAll === 'function') try { renderAll(); } catch (e) {}
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // daily verse
  function showVerse() {
    var el = document.getElementById('verse-text');
    var ref = document.getElementById('verse-ref');
    if (!el) return;
    var verses = window.DAILY_VERSES || [];
    if (!verses.length) return;
    var v = verses[Math.floor(Math.random() * verses.length)];
    var lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
    el.textContent = (lang === 'en' ? v.en : v.fa) || v.fa || v.en || '';
    if (ref) ref.textContent = (lang === 'en' ? v.refEn : v.refFa) || v.ref || '';
  }
  document.addEventListener('DOMContentLoaded', function () {
    showVerse();
    document.getElementById('verse-refresh')?.addEventListener('click', showVerse);
  });

  // scroll top
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('scroll-top');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 400);
    });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });
})();
