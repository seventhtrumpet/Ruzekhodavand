/* First visit: language gate AFTER privacy/banner, bilingual English / Persian labels */
(function () {
  var LANG_KEY = 'cog_lang';
  var CHOSEN_KEY = 'cog_lang_chosen';
  var WELCOME_KEY = 'cog_welcome_seen_v2';

  function pathIsHome() {
    var path = (location.pathname || '').toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '' ||
      (document.body && document.body.getAttribute('data-page') === 'home');
  }

  function hasChosenLang() {
    try { return !!localStorage.getItem(CHOSEN_KEY); } catch (e) { return false; }
  }

  function setLang(lang) {
    lang = lang === 'en' ? 'en' : 'fa';
    try {
      localStorage.setItem(LANG_KEY, lang);
      localStorage.setItem(CHOSEN_KEY, '1');
    } catch (e) {}
    try {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    } catch (e2) {}
    try { if (typeof currentLang !== 'undefined') currentLang = lang; } catch (e3) {}
  }

  function ensureCss() {
    if (document.getElementById('welcome-tip-css')) return;
    var st = document.createElement('style');
    st.id = 'welcome-tip-css';
    st.textContent =
      '.welcome-tip{position:fixed;inset:0;z-index:100050;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(8,16,28,0.55)}' +
      '.welcome-card{width:100%;max-width:420px;background:#fff;border-radius:16px;padding:1.4rem 1.2rem 1.2rem;box-shadow:0 12px 40px rgba(0,0,0,0.3)}' +
      'body.dark .welcome-card{background:#152536;color:#e8eef5}' +
      '.welcome-brand{text-align:center;font-weight:800;font-size:1.15rem;color:var(--primary,#0a2540);margin:0 0 0.35rem;line-height:1.45}' +
      'body.dark .welcome-brand{color:#9ec5ea}' +
      '.welcome-sub{text-align:center;font-size:0.95rem;line-height:1.6;color:#445;margin:0 0 1.15rem}' +
      'body.dark .welcome-sub{color:#b8c4d0}' +
      '.welcome-lang-row{display:flex;flex-direction:column;gap:0.65rem}' +
      '.welcome-lang-row button{width:100%;display:block;padding:1rem 1rem;border-radius:12px;border:2px solid #e0dcd3;background:#f7f5f0;cursor:pointer;font-family:inherit;font-weight:800;font-size:1.05rem;color:#0a2540;text-align:center;line-height:1.45;transition:border-color .15s,transform .15s,box-shadow .15s}' +
      '.welcome-lang-row button:hover{border-color:#c9a227;transform:translateY(-2px);box-shadow:0 6px 18px rgba(10,37,64,.12)}' +
      '.welcome-lang-row button.wl-pick-en{background:#0a2540;color:#fff;border-color:#0a2540}' +
      '.welcome-lang-row button.wl-pick-fa{background:#c9a227;color:#0a2540;border-color:#c9a227}' +
      'body.dark .welcome-lang-row button{background:#1a2b3c;border-color:#2a3a4c;color:#e8eef5}' +
      '.welcome-hint{text-align:center;font-size:0.8rem;line-height:1.5;color:#6b7785;margin:0.85rem 0 0}' +
      '.welcome-actions{display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem}' +
      '.welcome-actions a{display:block;text-align:center;padding:0.85rem 1rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem}' +
      '.welcome-actions a.w-bible{background:#c9a227;color:#0a2540}' +
      '.welcome-actions a.w-angels{background:#0a2540;color:#fff}' +
      '.welcome-actions a.w-media{background:#f0f2f5;color:#0a2540}' +
      'body.dark .welcome-actions a.w-media{background:#1a2b3c;color:#e8eef5}' +
      '.welcome-close{display:block;width:100%;margin-top:0.75rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.9rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(st);
  }

  function privacyVisible() {
    var el = document.getElementById('privacy-banner');
    if (!el) return false;
    if (el.classList.contains('privacy-banner-hide')) return false;
    return true;
  }

  function afterPrivacy(cb) {
    if (!privacyVisible()) {
      cb();
      return;
    }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      setTimeout(cb, 400);
    }
    var ok = document.getElementById('privacy-banner-ok');
    var later = document.getElementById('privacy-banner-later');
    if (ok) ok.addEventListener('click', finish);
    if (later) later.addEventListener('click', finish);
    var el = document.getElementById('privacy-banner');
    if (el && window.MutationObserver) {
      var mo = new MutationObserver(function () {
        if (!privacyVisible()) finish();
      });
      mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    }
    setTimeout(finish, 15000);
  }

  function showLanguageGate() {
    if (hasChosenLang()) return;
    if (document.getElementById('welcome-lang-gate')) return;
    ensureCss();
    var tip = document.createElement('div');
    tip.id = 'welcome-lang-gate';
    tip.className = 'welcome-tip';
    tip.innerHTML =
      '<div class="welcome-card" role="dialog" aria-label="Choose language / \u0627\u0646\u062a\u062e\u0627\u0628 \u0632\u0628\u0627\u0646">' +
      '<p class="welcome-brand">Seventh Trumpet / \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645</p>' +
      '<p class="welcome-sub">' +
      'Please choose your language<br>' +
      '\u0644\u0637\u0641\u0627\u064b \u0632\u0628\u0627\u0646 \u062e\u0648\u062f \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f' +
      '</p>' +
      '<div class="welcome-lang-row">' +
      '<button type="button" class="wl-pick-en" id="welcome-lang-en">' +
      'English / \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc' +
      '</button>' +
      '<button type="button" class="wl-pick-fa" id="welcome-lang-fa">' +
      '\u0641\u0627\u0631\u0633\u06cc / Persian' +
      '</button>' +
      '</div>' +
      '<p class="welcome-hint">' +
      'You can change language anytime in the header<br>' +
      '\u0647\u0631 \u0632\u0645\u0627\u0646 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0632\u0628\u0627\u0646 \u0631\u0627 \u0627\u0632 \u0628\u0627\u0644\u0627\u06cc \u0635\u0641\u062d\u0647 \u0639\u0648\u0636 \u06a9\u0646\u06cc\u062f' +
      '</p>' +
      '</div>';
    document.body.appendChild(tip);

    function pick(lang) {
      setLang(lang);
      tip.remove();
      location.reload();
    }
    document.getElementById('welcome-lang-en').addEventListener('click', function () { pick('en'); });
    document.getElementById('welcome-lang-fa').addEventListener('click', function () { pick('fa'); });
  }

  function isEn() {
    try {
      return (localStorage.getItem(LANG_KEY) || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function showStartTip() {
    try { if (localStorage.getItem(WELCOME_KEY)) return; } catch (e) {}
    if (!pathIsHome()) return;
    if (document.getElementById('welcome-tip') || document.getElementById('welcome-lang-gate')) return;
    ensureCss();
    var en = isEn();
    var tip = document.createElement('div');
    tip.id = 'welcome-tip';
    tip.className = 'welcome-tip';
    tip.style.alignItems = 'flex-end';
    tip.style.zIndex = '100040';
    tip.innerHTML =
      '<div class="welcome-card" role="dialog" aria-label="Welcome">' +
      '<p class="welcome-brand">' +
      (en ? 'Welcome! Start here' : '\u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f! \u0627\u0632 \u0627\u06cc\u0646\u062c\u0627 \u0634\u0631\u0648\u0639 \u06a9\u0646\u06cc\u062f') +
      '<br><span style="font-weight:600;font-size:0.9rem;opacity:0.85">' +
      (en ? '\u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f' : 'Welcome! Start here') +
      '</span></p>' +
      '<div class="welcome-actions">' +
      '<a class="w-bible" href="bible.html">' + (en ? 'Read the Bible / \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633' : '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633 / Bible') + '</a>' +
      '<a class="w-angels" href="angel.html?n=1">' + (en ? 'Three Angels / \u0633\u0647 \u0641\u0631\u0634\u062a\u0647' : '\u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647 / Three Angels') + '</a>' +
      '<a class="w-media" href="media.html">' + (en ? 'Videos & audio / \u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627' : '\u0648\u06cc\u062f\u06cc\u0648 \u0648 \u0635\u062f\u0627 / Media') + '</a>' +
      '</div>' +
      '<button type="button" class="welcome-close" id="welcome-close">' + (en ? 'OK / \u0628\u0627\u0634\u062f' : '\u0628\u0627\u0634\u062f / OK') + '</button>' +
      '</div>';
    document.body.appendChild(tip);
    function dismiss() {
      try { localStorage.setItem(WELCOME_KEY, '1'); } catch (e) {}
      tip.remove();
    }
    document.getElementById('welcome-close').addEventListener('click', dismiss);
    tip.addEventListener('click', function (e) {
      if (e.target === tip) dismiss();
    });
  }

  function boot() {
    if (!hasChosenLang()) {
      setTimeout(function () {
        afterPrivacy(function () {
          if (!hasChosenLang()) showLanguageGate();
        });
      }, 900);
      return;
    }
    setTimeout(showStartTip, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 200); });
  else setTimeout(boot, 200);
})();
