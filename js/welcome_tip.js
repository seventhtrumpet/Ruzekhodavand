/* First thing on open: small language chooser only (no other welcome windows) */
(function () {
  var LANG_KEY = 'cog_lang';
  var CHOSEN_KEY = 'cog_lang_chosen';

  function detectLang() {
    try {
      var list = [];
      if (navigator.languages && navigator.languages.length) {
        for (var i = 0; i < navigator.languages.length; i++) list.push(navigator.languages[i]);
      }
      if (navigator.language) list.push(navigator.language);
      if (navigator.userLanguage) list.push(navigator.userLanguage);
      for (var j = 0; j < list.length; j++) {
        var l = String(list[j] || '').toLowerCase();
        if (l.indexOf('fa') === 0 || l.indexOf('per') === 0) return 'fa';
      }
    } catch (e) {}
    return 'en';
  }

  function hasChosenLang() {
    try { return localStorage.getItem(CHOSEN_KEY) === '1'; } catch (e) { return false; }
  }

  function setLang(lang, chosen) {
    lang = lang === 'en' ? 'en' : 'fa';
    try {
      localStorage.setItem(LANG_KEY, lang);
      if (chosen) localStorage.setItem(CHOSEN_KEY, '1');
    } catch (e) {}
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    } catch (e2) {}
    try { if (typeof currentLang !== 'undefined') currentLang = lang; } catch (e3) {}
    try { window.currentLang = lang; } catch (e4) {}
  }

  function ensureCss() {
    if (document.getElementById('welcome-tip-css')) return;
    var st = document.createElement('style');
    st.id = 'welcome-tip-css';
    st.textContent =
      '.welcome-tip{position:fixed;inset:0;z-index:100100;display:flex;align-items:center;justify-content:center;padding:0.75rem;background:rgba(8,16,28,0.5)}' +
      '.welcome-card{width:100%;max-width:280px;background:#fff;border-radius:12px;padding:0.8rem 0.85rem 0.75rem;box-shadow:0 8px 28px rgba(0,0,0,0.28)}' +
      'body.dark .welcome-card{background:#152536;color:#e8eef5}' +
      '.welcome-brand{text-align:center;font-weight:800;font-size:0.92rem;color:var(--primary,#0a2540);margin:0 0 0.2rem;line-height:1.35}' +
      'body.dark .welcome-brand{color:#9ec5ea}' +
      '.welcome-sub{text-align:center;font-size:0.75rem;line-height:1.35;color:#556;margin:0 0 0.55rem}' +
      'body.dark .welcome-sub{color:#b8c4d0}' +
      '.welcome-lang-row{display:flex;flex-direction:column;gap:0.35rem}' +
      '.welcome-lang-row button{width:100%;display:block;padding:0.5rem 0.65rem;border-radius:9px;border:2px solid #e0dcd3;background:#f7f5f0;cursor:pointer;font-family:inherit;font-weight:800;font-size:0.85rem;color:#0a2540;text-align:center;line-height:1.25}' +
      '.welcome-lang-row button.wl-pick-en{background:#0a2540;color:#fff;border-color:#0a2540}' +
      '.welcome-lang-row button.wl-pick-fa{background:#c9a227;color:#0a2540;border-color:#c9a227}' +
      '.welcome-lang-row button.wl-recommended{box-shadow:0 0 0 2px rgba(201,162,39,0.5)}' +
      '.welcome-rec{display:block;font-size:0.62rem;font-weight:600;opacity:0.9;margin-top:0.12rem}' +
      '.welcome-hint{text-align:center;font-size:0.65rem;line-height:1.3;color:#6b7785;margin:0.45rem 0 0}';
    document.head.appendChild(st);
  }

  function showLanguageGate(suggested) {
    if (hasChosenLang()) return;
    if (document.getElementById('welcome-lang-gate')) return;
    ensureCss();
    var tip = document.createElement('div');
    tip.id = 'welcome-lang-gate';
    tip.className = 'welcome-tip';
    var recEn = suggested === 'en' ? '<span class="welcome-rec">Recommended / \u067e\u06cc\u0634\u0646\u0647\u0627\u062f\u06cc</span>' : '';
    var recFa = suggested === 'fa' ? '<span class="welcome-rec">Recommended / \u067e\u06cc\u0634\u0646\u0647\u0627\u062f\u06cc</span>' : '';
    tip.innerHTML =
      '<div class="welcome-card" role="dialog" aria-label="Language">' +
      '<p class="welcome-brand">Seventh Trumpet / \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645</p>' +
      '<p class="welcome-sub">Choose language / \u0627\u0646\u062a\u062e\u0627\u0628 \u0632\u0628\u0627\u0646</p>' +
      '<div class="welcome-lang-row">' +
      '<button type="button" class="wl-pick-en' + (suggested === 'en' ? ' wl-recommended' : '') + '" id="welcome-lang-en">' +
      'English / \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc' + recEn + '</button>' +
      '<button type="button" class="wl-pick-fa' + (suggested === 'fa' ? ' wl-recommended' : '') + '" id="welcome-lang-fa">' +
      '\u0641\u0627\u0631\u0633\u06cc / Persian' + recFa + '</button>' +
      '</div>' +
      '<p class="welcome-hint">Change anytime with flags / \u0639\u0648\u0636 \u0628\u0627 \u067e\u0631\u0686\u0645</p>' +
      '</div>';
    (document.body || document.documentElement).appendChild(tip);

    function pick(lang) {
      setLang(lang, true);
      tip.remove();
      location.reload();
    }
    document.getElementById('welcome-lang-en').addEventListener('click', function () { pick('en'); });
    document.getElementById('welcome-lang-fa').addEventListener('click', function () { pick('fa'); });
  }

  function bootLangFirst() {
    if (hasChosenLang()) return;
    var suggested = detectLang();
    setLang(suggested, false);
    if (document.body) showLanguageGate(suggested);
    else document.addEventListener('DOMContentLoaded', function () { showLanguageGate(suggested); });
  }

  bootLangFirst();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!hasChosenLang() && !document.getElementById('welcome-lang-gate')) {
        showLanguageGate(detectLang());
      }
    });
  }
})();
