/* Load media + auth + core fix */
(function () {
  function loadScript(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) { if (cb) cb(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { if (cb) cb(); };
    document.body.appendChild(s);
  }
  function boot() {
    loadScript('js/app_core_fix.js', function () {
      loadScript('js/app_media.js', function () {
        loadScript('js/auth_ui.js', function () {
          try {
            if (typeof applyLanguage === 'function') applyLanguage();
            if (typeof renderAll === 'function') renderAll();
            if (typeof setupEventListeners === 'function') setupEventListeners();
          } catch (e) { console.log(e); }
        });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

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
    var btn = document.getElementById('scroll-top');
    if (btn) {
      window.addEventListener('scroll', function () {
        btn.classList.toggle('show', window.scrollY > 400);
      });
      btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  });
})();
