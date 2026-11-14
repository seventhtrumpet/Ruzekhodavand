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

  /* Daily verse: smaller + appear a bit later so language/privacy come first */
  (function () {
    var st = document.createElement('style');
    st.id = 'daily-verse-compact-css';
    st.textContent =
      '#daily-verse{opacity:0;transform:translateY(12px);transition:opacity .45s ease,transform .45s ease;pointer-events:none}' +
      '#daily-verse.dv-ready{opacity:1;transform:none;pointer-events:auto}' +
      '#daily-verse .daily-verse-inner{max-width:520px;margin-left:auto;margin-right:auto;padding:0.85rem 1rem!important;border-radius:12px}' +
      '#daily-verse .daily-verse-label{font-size:0.85rem!important;margin-bottom:0.35rem!important}' +
      '#daily-verse .daily-verse-text{font-size:0.92rem!important;line-height:1.55!important;margin:0.35rem 0!important}' +
      '#daily-verse .daily-verse-ref{font-size:0.8rem!important}' +
      '#daily-verse .verse-refresh{font-size:0.8rem!important;padding:0.3rem 0.7rem!important;margin-top:0.45rem!important}' +
      '#daily-verse{padding:0.75rem 1rem!important}';
    document.head.appendChild(st);

    function reveal() {
      var sec = document.getElementById('daily-verse');
      if (sec) sec.classList.add('dv-ready');
    }
    function whenReady() {
      try {
        if (localStorage.getItem('cog_lang_chosen') !== '1') {
          setTimeout(whenReady, 500);
          return;
        }
      } catch (e) {}
      setTimeout(reveal, 1200);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(whenReady, 200); });
    } else {
      setTimeout(whenReady, 200);
    }
  })();
})();
