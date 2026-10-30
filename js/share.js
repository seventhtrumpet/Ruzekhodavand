/* Simple share: WhatsApp + copy link — works on media cards and post modal */
(function () {
  function lang() {
    try { return localStorage.getItem('cog_lang') || 'fa'; } catch (e) { return 'fa'; }
  }
  function t(fa, en) { return lang() === 'fa' ? fa : en; }

  function pageUrl() {
    return window.location.href.split('#')[0];
  }

  function shareWhatsApp(text, url) {
    var msg = encodeURIComponent((text || 'Seventh Trumpet') + '\n' + (url || pageUrl()));
    window.open('https://wa.me/?text=' + msg, '_blank', 'noopener');
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
      '<button type="button" class="st-share-btn st-share-wa" data-act="wa">' +
      t('\u0627\u0634\u062a\u0631\u0627\u06a9 \u062f\u0631 \u0648\u0627\u062a\u0633\u0627\u067e', 'Share on WhatsApp') +
      '</button>' +
      '<button type="button" class="st-share-btn st-share-copy" data-act="copy">' +
      t('\u06a9\u067e\u06cc \u0644\u06cc\u0646\u06a9', 'Copy link') +
      '</button>';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      if (btn.getAttribute('data-act') === 'wa') shareWhatsApp(title, url);
      else copyLink(url);
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
      'border-radius:999px;border:1px solid var(--border,#e0dcd3);background:var(--bg-card,#fff);' +
      'color:var(--text,#1a1a1a);cursor:pointer}' +
      '.st-share-wa{background:#25D366!important;border-color:#1ebe57!important;color:#fff!important}' +
      '.st-share-btn:hover{filter:brightness(1.05)}' +
      '.media-card .st-share-bar{justify-content:flex-start}' +
      '.modal .st-share-bar{margin-top:1rem}';
    document.head.appendChild(s);
  }

  function enhanceMediaCards() {
    document.querySelectorAll('.media-card').forEach(function (card) {
      if (card.querySelector('.st-share-bar')) return;
      var titleEl = card.querySelector('.media-title');
      var title = titleEl ? titleEl.textContent.trim() : 'Seventh Trumpet';
      var body = card.querySelector('.media-body') || card;
      body.appendChild(makeBar(title, pageUrl().replace(/\/[^/]*$/, '/media.html')));
    });
  }

  function enhanceModal() {
    var modal = document.getElementById('modal-content') || document.querySelector('.modal');
    if (!modal || modal.querySelector('.st-share-bar')) return;
    var h = modal.querySelector('h2, h3, .media-title');
    var title = h ? h.textContent.trim() : 'Seventh Trumpet';
    modal.appendChild(makeBar(title, pageUrl()));
  }

  function boot() {
    injectStyles();
    enhanceMediaCards();
    enhanceModal();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 800);
  setTimeout(boot, 2500);

  // When modal opens later
  document.addEventListener('click', function () {
    setTimeout(enhanceModal, 200);
  });
})();
