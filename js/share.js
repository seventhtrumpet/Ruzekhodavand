/* Site-wide share: WhatsApp (link) + photo (profile + text + website) for IG/FB */
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
    return SITE + '/';
  }

  function shareWhatsApp(text, url) {
    var u = url || pageUrl();
    var msg = (text || (lang() === 'fa' ? '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645' : 'Seventh Trumpet')) +
      '\n\nSeventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645\n\n' + u;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  function copyText(text) {
    var full = (text || '') + '\n\n' + pageUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(function () {
        alert(t('\u06a9\u067e\u06cc \u0634\u062f', 'Copied'));
      }).catch(function () {
        prompt(t('\u06a9\u067e\u06cc:', 'Copy:'), full);
      });
    } else {
      prompt(t('\u06a9\u067e\u06cc:', 'Copy:'), full);
    }
  }

  function sharePhoto(title, url) {
    var text = title || (lang() === 'fa' ? '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645' : 'Seventh Trumpet');
    var ref = url || pageUrl();
    if (typeof window.ST_sharePhoto === 'function') {
      window.ST_sharePhoto(true, 'ig', { text: text, ref: ref });
    } else if (typeof window.ST_shareWithPhoto === 'function') {
      window.ST_shareWithPhoto(text, ref, 'ig');
    } else {
      copyText(text + '\n\n' + ref);
      alert(t(
        '\u0639\u06a9\u0633 \u0647\u0646\u0648\u0632 \u0622\u0645\u0627\u062f\u0647 \u0646\u06cc\u0633\u062a \u2014 \u0645\u062a\u0646 \u06a9\u067e\u06cc \u0634\u062f',
        'Photo not ready yet \u2014 text copied'
      ));
    }
  }

  function makeBar(title, url) {
    var bar = document.createElement('div');
    bar.className = 'st-share-bar';
    var u = url || pageUrl();
    bar.innerHTML =
      '<button type="button" class="st-share-btn st-share-wa" data-act="wa">' +
      t('\u0648\u0627\u062a\u0633\u0627\u067e', 'WhatsApp') +
      '</button>' +
      '<button type="button" class="st-share-btn st-share-photo" data-act="photo">' +
      t('\u0639\u06a9\u0633 +\u067e\u0631\u0648\u0641\u0627\u06cc\u0644', 'Photo + profile') +
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
      else if (act === 'photo') sharePhoto(title, u);
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
      '.st-share-btn{font-family:inherit;font-size:0.82rem;font-weight:700;padding:0.5rem 0.85rem;' +
      'border-radius:999px;border:1px solid transparent;cursor:pointer;background:#eee;color:#222}' +
      '.st-share-wa{background:#25D366!important;color:#fff!important}' +
      '.st-share-photo{background:#c9a227!important;color:#0a2540!important}' +
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

  function attachToDailyVerse() {
    var section = document.getElementById('daily-verse');
    if (!section || section.querySelector('.st-share-bar')) return;
    var title = '';
    var textEl = document.getElementById('verse-text') || section.querySelector('.verse-text, p');
    if (textEl) title = (textEl.textContent || '').trim().slice(0, 280);
    var refEl = document.getElementById('verse-ref') || section.querySelector('.verse-ref');
    var ref = refEl ? (refEl.textContent || '').trim() : '';
    if (ref) title = (title ? title + '\n' : '') + ref;
    section.appendChild(makeBar(title || 'Fresh Bread', pageUrl()));
  }

  function run() {
    injectStyles();
    attachToMediaCards();
    attachToDailyVerse();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 500);
  setTimeout(run, 1500);
})();
