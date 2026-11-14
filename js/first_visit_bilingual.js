/* First visit (no language chosen yet): show English / Persian together on every label */
(function () {
  var CHOSEN = 'cog_lang_chosen';

  function notChosen() {
    try { return localStorage.getItem(CHOSEN) !== '1'; } catch (e) { return true; }
  }

  function dual(en, fa) {
    en = (en == null ? '' : String(en)).trim();
    fa = (fa == null ? '' : String(fa)).trim();
    if (en && fa && en !== fa) return en + ' / ' + fa;
    return en || fa || '';
  }

  function getT() {
    return (typeof T !== 'undefined' && T) ? T : null;
  }

  function val(lang, key) {
    var dict = getT();
    if (dict && dict[lang] && dict[lang][key] != null && String(dict[lang][key]).length)
      return String(dict[lang][key]);
    return '';
  }

  function applyBilingual() {
    if (!notChosen()) return false;

    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('lang-fa');
    document.body.classList.add('lang-en', 'lang-bilingual-first');

    var titleEn = val('en', 'pageTitle') || 'Seventh Trumpet \u2014 Three Angels\' Message';
    var titleFa = val('fa', 'pageTitle') || '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645 \u2014 \u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647';
    document.title = dual(titleEn, titleFa);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!k) return;
      var text = dual(val('en', k), val('fa', k));
      if (text) el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      if (!k) return;
      var text = dual(val('en', k), val('fa', k));
      if (text) el.placeholder = text;
    });

    var si = document.getElementById('btn-signin-top');
    if (si) si.textContent = 'Login / \u0648\u0631\u0648\u062f';

    var so = document.getElementById('btn-signout-top');
    if (so) so.textContent = 'Out / \u062e\u0631\u0648\u062c';

    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = 'EN / \u0641\u0627';

    var verseLabel = document.querySelector('.daily-verse-label');
    if (verseLabel && !verseLabel.getAttribute('data-i18n')) {
      verseLabel.textContent = 'Fresh Bread / \u0646\u0627\u0646 \u062a\u0627\u0632\u0647';
    }

    return true;
  }

  function patchApply() {
    if (window.__bilingualApplyPatched) return;
    window.__bilingualApplyPatched = true;

    function wrap(name) {
      var orig = window[name];
      if (typeof orig !== 'function') return;
      window[name] = function () {
        if (notChosen()) {
          applyBilingual();
          return;
        }
        return orig.apply(this, arguments);
      };
    }
    wrap('applyLanguage');
    if (window.langFix && typeof window.langFix.apply === 'function') {
      var oa = window.langFix.apply;
      window.langFix.apply = function () {
        if (notChosen()) {
          applyBilingual();
          return;
        }
        return oa.apply(this, arguments);
      };
    }
  }

  function boot() {
    if (!notChosen()) return;
    applyBilingual();
    patchApply();
    setTimeout(applyBilingual, 400);
    setTimeout(applyBilingual, 1000);
    setTimeout(applyBilingual, 2000);
    setTimeout(applyBilingual, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
