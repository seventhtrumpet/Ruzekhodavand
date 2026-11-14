/* Privacy notice banner — compact; after language is chosen */
(function () {
  var KEY_ACCEPT = 'cog_privacy_accepted';
  var KEY_LATER = 'cog_privacy_later_session';

  function lang() {
    try {
      return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
    } catch (e) { return 'fa'; }
  }

  function t() {
    var chosen = false;
    try { chosen = localStorage.getItem('cog_lang_chosen') === '1'; } catch (e) {}
    if (!chosen) {
      return {
        title: 'Privacy / \u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc',
        text: 'We use cookies for language and settings. / \u0645\u0627 \u0627\u0632 \u06a9\u0648\u06a9\u06cc \u0628\u0631\u0627\u06cc \u0632\u0628\u0627\u0646 \u0648 \u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0645\u06cc\u200c\u06a9\u0646\u06cc\u0645.',
        link: 'Privacy / \u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc',
        ok: 'Got it / \u0645\u062a\u0648\u062c\u0647 \u0634\u062f\u0645',
        later: 'Not now / \u0627\u0644\u0627\u0646 \u0646\u0647'
      };
    }
    if (lang() === 'en') {
      return {
        title: 'Privacy',
        text: 'We use cookies for language, optional sign-in, and settings.',
        link: 'Privacy Policy',
        ok: 'Got it',
        later: 'Not now'
      };
    }
    return {
      title: '\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc',
      text: '\u0645\u0627 \u0627\u0632 \u06a9\u0648\u06a9\u06cc \u0628\u0631\u0627\u06cc \u0632\u0628\u0627\u0646 \u0648 \u062a\u0646\u0638\u06cc\u0645\u0627\u062a \u0627\u0633\u062a\u0641\u0627\u062f\u0647 \u0645\u06cc\u200c\u06a9\u0646\u06cc\u0645.',
      link: '\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc',
      ok: '\u0645\u062a\u0648\u062c\u0647 \u0634\u062f\u0645',
      later: '\u0627\u0644\u0627\u0646 \u0646\u0647'
    };
  }

  function shouldShow() {
    try {
      if (localStorage.getItem(KEY_ACCEPT) === '1') return false;
      if (sessionStorage.getItem(KEY_LATER) === '1') return false;
    } catch (e) {}
    return true;
  }

  function inject() {
    if (document.getElementById('privacy-banner')) return;
    var L = t();
    var el = document.createElement('div');
    el.id = 'privacy-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', L.title);
    el.innerHTML =
      '<div class="privacy-banner-inner">' +
      '<div class="privacy-banner-text">' +
      '<strong class="privacy-banner-title">' + L.title + '</strong> ' +
      '<span class="privacy-banner-msg">' + L.text + '</span> ' +
      '<a class="privacy-banner-link" href="privacy.html">' + L.link + '</a>' +
      '</div>' +
      '<div class="privacy-banner-actions">' +
      '<button type="button" class="privacy-banner-ok" id="privacy-banner-ok">' + L.ok + '</button>' +
      '<button type="button" class="privacy-banner-later" id="privacy-banner-later">' + L.later + '</button>' +
      '</div></div>';
    document.body.appendChild(el);
    document.getElementById('privacy-banner-ok').addEventListener('click', function () {
      try { localStorage.setItem(KEY_ACCEPT, '1'); } catch (e) {}
      hide();
    });
    document.getElementById('privacy-banner-later').addEventListener('click', function () {
      try { sessionStorage.setItem(KEY_LATER, '1'); } catch (e) {}
      hide();
    });
  }

  function hide() {
    var el = document.getElementById('privacy-banner');
    if (!el) return;
    el.classList.add('privacy-banner-hide');
    setTimeout(function () { el.remove(); }, 300);
  }

  function refreshLang() {
    var el = document.getElementById('privacy-banner');
    if (!el) return;
    var L = t();
    var title = el.querySelector('.privacy-banner-title');
    var msg = el.querySelector('.privacy-banner-msg');
    var link = el.querySelector('.privacy-banner-link');
    var ok = el.querySelector('#privacy-banner-ok');
    var later = el.querySelector('#privacy-banner-later');
    if (title) title.textContent = L.title;
    if (msg) msg.textContent = L.text + ' ';
    if (link) link.textContent = L.link;
    if (ok) ok.textContent = L.ok;
    if (later) later.textContent = L.later;
  }

  var style = document.createElement('style');
  style.textContent =
    '#privacy-banner{position:fixed;bottom:0;left:0;right:0;z-index:100000;padding:0.5rem 0.75rem;background:rgba(15,30,50,0.97);color:#f5f5f5;box-shadow:0 -2px 16px rgba(0,0,0,0.2);font-family:inherit;transition:transform .25s ease,opacity .25s ease}' +
    '#privacy-banner.privacy-banner-hide{transform:translateY(110%);opacity:0}' +
    '.privacy-banner-inner{max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.5rem}' +
    '.privacy-banner-text{flex:1;min-width:160px;font-size:0.78rem;line-height:1.4}' +
    '.privacy-banner-title{display:inline;margin-bottom:0;font-size:0.82rem;margin-inline-end:0.35rem}' +
    '.privacy-banner-link{color:#7eb8ff;text-decoration:underline;white-space:nowrap;font-size:0.78rem}' +
    '.privacy-banner-actions{display:flex;flex-wrap:wrap;gap:0.35rem;flex-shrink:0}' +
    '.privacy-banner-ok{background:#c9a227;color:#1a1a1a;border:none;border-radius:7px;padding:0.35rem 0.75rem;font-family:inherit;font-weight:600;cursor:pointer;font-size:0.78rem}' +
    '.privacy-banner-later{background:transparent;color:#ddd;border:1px solid rgba(255,255,255,0.35);border-radius:7px;padding:0.35rem 0.75rem;font-family:inherit;cursor:pointer;font-size:0.78rem}' +
    '.privacy-banner-later:hover{background:rgba(255,255,255,0.08)}' +
    '@media(max-width:520px){.privacy-banner-actions{width:100%}.privacy-banner-ok,.privacy-banner-later{flex:1}}';
  document.head.appendChild(style);

  function boot() {
    if (!shouldShow()) return;
    try {
      if (localStorage.getItem('cog_lang_chosen') !== '1') {
        setTimeout(boot, 400);
        return;
      }
    } catch (e) {}
    inject();
    document.getElementById('lang-toggle') && document.getElementById('lang-toggle').addEventListener('click', function () {
      setTimeout(refreshLang, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 200); });
  } else {
    setTimeout(boot, 200);
  }
})();
