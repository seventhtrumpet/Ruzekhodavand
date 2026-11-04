/* Pure language switch — FA only or EN only in UI chrome */
(function () {
  var KEY = 'cog_lang';

  function read() {
    try {
      var s = localStorage.getItem(KEY);
      if (s === 'en' || s === 'fa') return s;
    } catch (e) {}
    try {
      if (typeof currentLang === 'string' && (currentLang === 'en' || currentLang === 'fa')) return currentLang;
    } catch (e2) {}
    return 'fa';
  }

  function write(lang) {
    lang = lang === 'en' ? 'en' : 'fa';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    try { currentLang = lang; } catch (e2) {}
    try { window.currentLang = lang; } catch (e3) {}
    return lang;
  }

  function dict(lang) {
    if (typeof T !== 'undefined' && T && T[lang]) return T[lang];
    return {};
  }

  /* Hard fallbacks so UI never shows mixed FA+EN labels */
  var FALLBACK = {
    fa: {
      home: '\u062e\u0627\u0646\u0647',
      media: '\u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627',
      bibleNav: '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633',
      live: '\u067e\u062e\u0634 \u0632\u0646\u062f\u0647',
      about: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627',
      contact: '\u062a\u0645\u0627\u0633',
      questionsNav: '\u0633\u0648\u0627\u0644\u0627\u062a',
      feedbackNav: '\u0628\u0627\u0632\u062e\u0648\u0631\u062f',
      privacyNav: '\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc',
      siteName: '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
      startHere: '\u0627\u0632 \u0627\u06cc\u0646\u062c\u0627 \u0634\u0631\u0648\u0639 \u06a9\u0646\u06cc\u062f',
      signIn: '\u0648\u0631\u0648\u062f',
      langBtn: 'English',
      followUs: '\u0645\u0627 \u0631\u0627 \u062f\u0646\u0628\u0627\u0644 \u06a9\u0646\u06cc\u062f',
      view: '\u0645\u0634\u0627\u0647\u062f\u0647',
      fromMedia: '\u0627\u0632 \u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627'
    },
    en: {
      home: 'Home',
      media: 'Media',
      bibleNav: 'Bible',
      live: 'Live',
      about: 'About',
      contact: 'Contact',
      questionsNav: 'Questions',
      feedbackNav: 'Feedback',
      privacyNav: 'Privacy',
      siteName: 'Seventh Trumpet',
      startHere: 'Start here',
      signIn: 'Sign in',
      langBtn: '\u0641\u0627\u0631\u0633\u06cc',
      followUs: 'Follow us',
      view: 'View',
      fromMedia: 'From the media'
    }
  };

  function label(lang, key) {
    var t = dict(lang);
    if (t[key] != null && String(t[key]).length) return t[key];
    return (FALLBACK[lang] && FALLBACK[lang][key]) || '';
  }

  function apply(lang) {
    lang = write(lang);
    var t = dict(lang);

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
    document.body.classList.remove('lang-en', 'lang-fa');
    document.body.classList.add(lang === 'en' ? 'lang-en' : 'lang-fa');

    if (t.pageTitle) document.title = t.pageTitle;
    else if (lang === 'fa') document.title = '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645 \u2014 \u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647';
    else document.title = 'Seventh Trumpet \u2014 Three Angels\' Message';

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!k) return;
      var v = label(lang, k);
      if (v) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-placeholder');
      var v = label(lang, k);
      if (v) el.placeholder = v;
    });
    document.querySelectorAll('[data-lang-only]').forEach(function (el) {
      el.style.display = el.getAttribute('data-lang-only') === lang ? '' : 'none';
    });

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'fa' ? 'English' : '\u0641\u0627\u0631\u0633\u06cc';
    }

    // Sign-in button if present without data-i18n
    document.querySelectorAll('#auth-btn, .auth-btn, #sign-in-btn').forEach(function (el) {
      if (el.getAttribute('data-i18n')) return;
      var txt = (el.textContent || '').trim();
      if (/sign\s*in|\u0648\u0631\u0648\u062f|login/i.test(txt) || !txt) {
        el.textContent = label(lang, 'signIn') || (lang === 'fa' ? '\u0648\u0631\u0648\u062f' : 'Sign in');
      }
    });

    try { if (typeof window.renderFeaturesLang === 'function') window.renderFeaturesLang(); } catch (e) {}
    try { if (typeof applySignInLabels === 'function') applySignInLabels(); } catch (e2) {}
    try { if (typeof updateAuthUI === 'function') updateAuthUI(); } catch (e3) {}
    try { if (typeof updateLiveBadge === 'function') updateLiveBadge(); } catch (e4) {}
    try {
      window.dispatchEvent(new CustomEvent('cog-lang-changed', { detail: { lang: lang } }));
    } catch (e5) {}
  }

  function toggle() {
    var next = read() === 'en' ? 'fa' : 'en';
    apply(next);
    try { if (typeof renderMedia === 'function') renderMedia(); } catch (e) {}
    try { if (typeof renderAll === 'function') renderAll(); } catch (e2) {}
  }

  window.applyLanguage = function () { apply(read()); };
  window.toggleLanguage = toggle;
  window.__toggleLang = toggle;
  window.__setLang = apply;
  window.__getLang = read;

  function bind() {
    document.querySelectorAll('#lang-toggle, [data-lang-toggle], button.lang-toggle').forEach(function (btn) {
      if (btn._stLangBound) return;
      btn._stLangBound = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggle();
      }, true);
    });
  }

  function boot() {
    apply(read());
    bind();
    setTimeout(function () { bind(); apply(read()); }, 300);
    setTimeout(function () { bind(); apply(read()); }, 1000);
    setTimeout(function () { bind(); apply(read()); }, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
