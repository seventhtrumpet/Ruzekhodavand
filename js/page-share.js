/* Page share for angel / teachings / about — does NOT change Bible share */
(function () {
  if (window.__stPageShare) return;
  window.__stPageShare = true;

  var SITE = 'https://seventhtrumpet.org/';

  function isEn() {
    try {
      return ((typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa') === 'en';
    } catch (e) { return false; }
  }
  function t(fa, en) { return isEn() ? en : fa; }

  function pageUrl() {
    try {
      var u = location.href.split('#')[0];
      if (u && u.indexOf('http') === 0) return u;
    } catch (e) {}
    return SITE;
  }

  function brand() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }

  function collectAngel() {
    var title = (document.getElementById('angel-title') || {}).textContent || '';
    var verse = (document.getElementById('angel-verse') || {}).textContent || '';
    var ref = (document.getElementById('angel-ref') || {}).textContent || '';
    var msg = (document.getElementById('angel-message') || {}).textContent || '';
    var parts = [];
    if (title) parts.push(title.trim());
    if (verse) parts.push(verse.trim());
    if (msg) parts.push(msg.trim().slice(0, 280));
    return {
      text: parts.join('\n\n') || (isEn() ? 'Three Angels Message' : '\u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647'),
      ref: (ref || '').trim() || pageUrl()
    };
  }

  function collectGeneric() {
    var h = document.querySelector('main h1, main h2, .about-card h2, article h1, article h2');
    var p = document.querySelector('main p, .about-card p, article p');
    var text = '';
    if (h) text = (h.textContent || '').trim();
    if (p) text = (text ? text + '\n\n' : '') + (p.textContent || '').trim().slice(0, 240);
    if (!text) text = brand();
    return { text: text, ref: pageUrl() };
  }

  function payload() {
    var page = (document.body && document.body.getAttribute('data-page')) || '';
    if (page === 'angel' || location.pathname.indexOf('angel') >= 0) return collectAngel();
    return collectGeneric();
  }

  function ensureCss() {
    if (document.getElementById('st-page-share-css')) return;
    var s = document.createElement('style');
    s.id = 'st-page-share-css';
    s.textContent =
      '.st-page-share{display:flex;flex-wrap:wrap;gap:0.5rem;margin:1.1rem 0 0.5rem;justify-content:center}' +
      '.st-page-share button{font-family:inherit;font-weight:800;font-size:0.88rem;padding:0.65rem 1rem;border:none;border-radius:999px;cursor:pointer}' +
      '.st-ps-wa{background:#25D366;color:#fff}' +
      '.st-ps-photo{background:#c9a227;color:#0a2540}' +
      '.st-ps-copy{background:#e8eef5;color:#0a2540}' +
      'body.dark .st-ps-copy{background:#1a2b3c;color:#e8eef5}';
    document.head.appendChild(s);
  }

  function sharePhoto() {
    var p = payload();
    if (typeof window.ST_sharePhoto === 'function') {
      window.ST_sharePhoto(true, 'ig', { text: p.text, ref: p.ref });
      return;
    }
    if (typeof window.ST_shareWithPhoto === 'function') {
      window.ST_shareWithPhoto(p.text, p.ref, 'ig');
      return;
    }
    setTimeout(function () {
      if (typeof window.ST_sharePhoto === 'function') {
        window.ST_sharePhoto(true, 'ig', { text: p.text, ref: p.ref });
      } else {
        alert(t(
          '\u0644\u0637\u0641\u0627\u064b \u06a9\u0645\u06cc \u0635\u0628\u0631 \u06a9\u0646\u06cc\u062f \u0648 \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0634 \u06a9\u0646\u06cc\u062f',
          'Please wait a moment and try again'
        ));
      }
    }, 400);
  }

  function shareWa() {
    var p = payload();
    var msg = p.text + '\n\n' + brand() + '\n\n' + pageUrl();
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  function shareCopy() {
    var p = payload();
    var msg = p.text + '\n\n' + brand() + '\n\n' + pageUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).then(function () {
        alert(t('\u06a9\u067e\u06cc \u0634\u062f', 'Copied'));
      }).catch(function () {
        prompt(t('\u06a9\u067e\u06cc', 'Copy'), msg);
      });
    } else {
      prompt(t('\u06a9\u067e\u06cc', 'Copy'), msg);
    }
  }

  function makeBar() {
    ensureCss();
    var bar = document.createElement('div');
    bar.className = 'st-page-share';
    bar.setAttribute('data-st-page-share', '1');
    bar.innerHTML =
      '<button type="button" class="st-ps-wa" data-act="wa">' +
      t('\u0648\u0627\u062a\u0633\u0627\u067e', 'WhatsApp') +
      '</button>' +
      '<button type="button" class="st-ps-photo" data-act="photo">' +
      t('\u0639\u06a9\u0633 +\u067e\u0631\u0648\u0641\u0627\u06cc\u0644', 'Photo + profile') +
      '</button>' +
      '<button type="button" class="st-ps-copy" data-act="copy">' +
      t('\u06a9\u067e\u06cc', 'Copy') +
      '</button>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      e.preventDefault();
      var a = b.getAttribute('data-act');
      if (a === 'wa') shareWa();
      else if (a === 'photo') sharePhoto();
      else shareCopy();
    });
    return bar;
  }

  function inject() {
    var page = (document.body && document.body.getAttribute('data-page')) || '';
    var path = (location.pathname || '').toLowerCase();

    if (page === 'bible' || path.indexOf('bible') >= 0) return;

    var angel = document.getElementById('angel-detail');
    if (angel && !angel.querySelector('[data-st-page-share]')) {
      angel.appendChild(makeBar());
    }

    if (page === 'teachings' || page === 'about' || path.indexOf('teachings') >= 0 || path.indexOf('about') >= 0) {
      var host = document.querySelector('main.container, main.page, main');
      if (host && !host.querySelector('[data-st-page-share]')) {
        var firstCard = host.querySelector('article, .about-card');
        if (firstCard && firstCard.parentNode) {
          firstCard.parentNode.insertBefore(makeBar(), firstCard);
        } else {
          host.insertBefore(makeBar(), host.firstChild);
        }
      }
    }
  }

  function boot() {
    inject();
    setTimeout(inject, 300);
    setTimeout(inject, 1000);
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', function () { setTimeout(inject, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
