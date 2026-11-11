/* Every share from the site can use a beautiful profile-background picture */
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
    var msg = ((text || 'Seventh Trumpet') + '\n\n' + u);
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  function shareBeautiful(title, body) {
    if (typeof window.ST_shareBeautifulCard === 'function') {
      window.ST_shareBeautifulCard({
        title: title || (lang() === 'en' ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645'),
        body: body || title || '',
        url: pageUrl(),
        filename: 'seventh-trumpet-share.png'
      });
    } else {
      shareWhatsApp(title, pageUrl());
    }
  }

  function copyLink(url) {
    var u = url || pageUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(u).then(function () {
        alert(t('\u0644\u06cc\u0646\u06a9 \u06a9\u067e\u06cc \u0634\u062f', 'Link copied'));
      }).catch(function () {
        prompt(t('\u06a9\u067e\u06cc \u06a9\u0646\u06cc\u062f:', 'Copy:'), u);
      });
    } else {
      prompt(t('\u06a9\u067e\u06cc \u06a9\u0646\u06cc\u062f:', 'Copy:'), u);
    }
  }

  function makeBar(title, url) {
    var bar = document.createElement('div');
    bar.className = 'st-share-bar';
    bar.innerHTML =
      '<button type="button" class="st-share-btn st-share-pic" data-act="pic">' +
      t('\u0639\u06a9\u0633 \u0632\u06cc\u0628\u0627', 'Beautiful picture') +
      '</button>' +
      '<button type="button" class="st-share-btn st-share-wa" data-act="wa">' +
      t('\u0648\u0627\u062a\u0633\u0627\u067e', 'WhatsApp') +
      '</button>' +
      '<button type="button" class="st-share-btn st-share-copy" data-act="copy">' +
      t('\u0644\u06cc\u0646\u06a9', 'Link') +
      '</button>';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var act = btn.getAttribute('data-act');
      if (act === 'pic') shareBeautiful(title, title);
      else if (act === 'wa') shareWhatsApp(title, url || pageUrl());
      else copyLink(url || pageUrl());
    });
    return bar;
  }

  function injectStyles() {
    if (document.getElementById('st-share-css')) return;
    var s = document.createElement('style');
    s.id = 'st-share-css';
    s.textContent =
      '.st-share-bar{display:flex;flex-wrap:wrap;gap:0.45rem;margin-top:0.75rem;justify-content:center}' +
      '.st-share-btn{font-family:inherit;font-size:0.85rem;font-weight:600;padding:0.45rem 0.85rem;' +
      'border-radius:999px;border:1px solid transparent;cursor:pointer;background:#eee;color:#222}' +
      '.st-share-pic{background:#c9a227!important;color:#0a2540!important;font-weight:800!important}' +
      '.st-share-wa{background:#25D366!important;border-color:#1ebe57!important;color:#fff!important}' +
      '.st-share-btn:hover{filter:brightness(1.05)}' +
      '.media-card .st-share-bar{justify-content:flex-start}' +
      '.modal .st-share-bar{margin-top:1rem}';
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

  function attachToModal() {
    var modal = document.querySelector('.modal, #post-modal, .post-modal');
    if (!modal || modal.querySelector('.st-share-bar')) return;
    modal.appendChild(makeBar('', pageUrl()));
  }

  function run() {
    injectStyles();
    attachToMediaCards();
    attachToModal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 400);
  setTimeout(run, 1200);
})();
