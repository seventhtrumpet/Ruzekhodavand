/* Site-wide share: always include website URL so preview shows profile picture and opens the site */
(function () {
  var SITE = 'https://seventhtrumpet.org';

  function lang() {
    try { return localStorage.getItem('cog_lang') || 'fa'; } catch (e) { return 'fa'; }
  }
  function t(fa, en) { return lang() === 'fa' ? fa : en; }

  function pageUrl() {
    try {
      var u = window.location.href.split('#')[0];
      if (u && u.indexOf('seventhtrumpet') >= 0) return u;
    } catch (e) {}
    return SITE;
  }

  function shareWhatsApp(text, url) {
    var u = url || pageUrl();
    // Put URL last so WhatsApp builds link preview (profile picture from website)
    var msg = ((text || 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645') + '\n\n' + u);
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  function copyLink(url) {
    var u = url || pageUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(u).then(function () {
        alert(t('\u0644\u06cc\u0646\u06a9 \u06a9\u067e\u06cc \u0634\u062f — \u0628\u0627 \u0627\u0631\u0633\u0627\u0644\u060c \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0646\u0634\u0627\u0646 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f',
          'Link copied — when sent, your profile picture preview appears'));
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
      '<button type="button" class="st-share-btn st-share-wa" data-act="wa">' +
      t('\u0627\u0634\u062a\u0631\u0627\u06a9 \u062f\u0631 \u0648\u0627\u062a\u0633\u0627\u067e', 'Share on WhatsApp') +
      '</button>' +
      '<button type="button" class="st-share-btn st-share-copy" data-act="copy">' +
      t('\u06a9\u067e\u06cc \u0644\u06cc\u0646\u06a9 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a', 'Copy website link') +
      '</button>';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      if (btn.getAttribute('data-act') === 'wa') shareWhatsApp(title, url || pageUrl());
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
      if (tEl) title = tEl.textContent || '';
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
