/* Simple verse/page share — WhatsApp + copy (no "send your photo") */
(function () {
  var SITE = 'https://seventhtrumpet.org';

  function lang() {
    try { return localStorage.getItem('cog_lang') || 'fa'; } catch (e) { return 'fa'; }
  }
  function t(fa, en) { return lang() === 'fa' ? fa : en; }

  function pageUrl() {
    try {
      var u = window.location.href.split('#')[0];
      if (u && u.indexOf('http') === 0) return u;
    } catch (e) {}
    return SITE;
  }

  function shareWhatsApp(text, url) {
    var u = url || pageUrl();
    var msg = (text || (lang() === 'fa' ? '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645' : 'Seventh Trumpet')) + '\n\n' + u;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        alert(t('\u06a9\u067e\u06cc \u0634\u062f', 'Copied'));
      }).catch(function () {
        prompt(t('\u06a9\u067e\u06cc:', 'Copy:'), text);
      });
    } else {
      prompt(t('\u06a9\u067e\u06cc:', 'Copy:'), text);
    }
  }

  function makeBar(title, url) {
    var bar = document.createElement('div');
    bar.className = 'st-share-bar';
    var u = url || pageUrl();
    bar.innerHTML =
      '<button type="button" class="st-share-btn st-share-wa" data-act="wa">' +
      t('\u0627\u0634\u062a\u0631\u0627\u06a9 \u062f\u0631 \u0648\u0627\u062a\u0633\u0627\u067e', 'Share on WhatsApp') +
      '</button>' +
      '<button type="button" class="st-share-btn st-share-copy" data-act="copy">' +
      t('\u06a9\u067e\u06cc', 'Copy') +
      '</button>';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var act = btn.getAttribute('data-act');
      if (act === 'wa') shareWhatsApp(title, u);
      else copyText((title || '') + '\n\n' + u);
    });
    return bar;
  }

  function injectStyles() {
    if (document.getElementById('st-share-css')) return;
    var s = document.createElement('style');
    s.id = 'st-share-css';
    s.textContent =
      '.st-share-bar{display:flex;flex-wrap:wrap;gap:0.45rem;margin-top:0.75rem;justify-content:center}' +
      '.st-share-btn{font-family:inherit;font-size:0.85rem;font-weight:700;padding:0.5rem 0.9rem;' +
      'border-radius:999px;border:1px solid transparent;cursor:pointer;background:#eee;color:#222}' +
      '.st-share-wa{background:#25D366!important;color:#fff!important}' +
      '.st-share-btn:hover{filter:brightness(1.05)}';
    document.head.appendChild(s);
  }

  function attachToMediaCards() {
    document.querySelectorAll('.media-card').forEach(function (card) {
      if (card.querySelector('.st-share-bar')) return;
      var title = '';
      var tEl = card.querySelector('.media-card-title, h3, .title');
      if (tEl) title = (tEl.textContent || '').trim();
      var link = card.querySelector('a[href]');
      var url = link ? link.href : pageUrl();
      card.appendChild(makeBar(title, url));
    });
  }

  function run() {
    injectStyles();
    attachToMediaCards();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 500);
  setTimeout(run, 1500);
})();
