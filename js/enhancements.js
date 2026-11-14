/* Load media + auth + core fix + daily verse (auto by calendar day) */
(function () {
  function loadScript(src, cb) {
    if (document.querySelector('script[src="' + src + '"]')) { if (cb) cb(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { if (cb) cb(); };
    s.onerror = function () { if (cb) cb(); };
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

  function dayIndex(len) {
    if (!len) return 0;
    var d = new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    var day = Math.floor((d - start) / 86400000);
    return Math.abs((d.getFullYear() * 366 + day)) % len;
  }

  function showVerse(forceRandom) {
    var el = document.getElementById('verse-text');
    var ref = document.getElementById('verse-ref');
    if (!el) return;
    var verses = window.DAILY_VERSES || [];
    if (!verses.length) {
      el.textContent = '';
      if (ref) ref.textContent = '';
      return;
    }
    var v = forceRandom
      ? verses[Math.floor(Math.random() * verses.length)]
      : verses[dayIndex(verses.length)];
    var enText = (v.en || v.fa || '').trim();
    var faText = (v.fa || v.en || '').trim();
    var enRef = (v.ref_en || v.refEn || v.ref || '').trim();
    var faRef = (v.ref_fa || v.refFa || v.ref || '').trim();
    var lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'en';
    el.textContent = (lang === 'en' ? enText : faText) || '';
    el.style.whiteSpace = '';
    if (ref) ref.textContent = (lang === 'en' ? enRef : faRef) || '';
  }

  function initVerse() {
    function go() {
      showVerse(false);
      var btn = document.getElementById('verse-refresh');
      if (btn && !btn._verseBound) {
        btn._verseBound = true;
        btn.addEventListener('click', function () { showVerse(true); });
      }
    }
    if (window.DAILY_VERSES && window.DAILY_VERSES.length) go();
    else loadScript('js/daily_verses.js', go);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initVerse);
  else initVerse();

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('scroll-top');
    if (btn) {
      window.addEventListener('scroll', function () {
        btn.classList.toggle('show', window.scrollY > 400);
      });
      btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  });
})();
