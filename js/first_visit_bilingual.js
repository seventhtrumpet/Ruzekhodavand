/* Until language is chosen: use browser language so the page is readable (not dual-text clutter) */
(function () {
  var CHOSEN = 'cog_lang_chosen';

  function notChosen() {
    try { return localStorage.getItem(CHOSEN) !== '1'; } catch (e) { return true; }
  }

  function detectLang() {
    try {
      var list = navigator.languages || [navigator.language || ''];
      for (var i = 0; i < list.length; i++) {
        var l = String(list[i] || '').toLowerCase();
        if (l.indexOf('fa') === 0 || l.indexOf('per') === 0) return 'fa';
      }
    } catch (e) {}
    try {
      var s = localStorage.getItem('cog_lang');
      if (s === 'en' || s === 'fa') return s;
    } catch (e2) {}
    return 'en';
  }

  function softApply() {
    if (!notChosen()) return;
    var lang = detectLang();
    try {
      localStorage.setItem('cog_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
      if (typeof currentLang !== 'undefined') currentLang = lang;
      window.currentLang = lang;
    } catch (e) {}
    try {
      if (typeof applyLanguage === 'function') applyLanguage();
    } catch (e2) {}
  }

  function boot() {
    if (!notChosen()) return;
    softApply();
    setTimeout(softApply, 500);
    setTimeout(softApply, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
