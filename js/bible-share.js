/* Share the verse simply — WhatsApp first (link preview opens website when tapped) */
(function () {
  var SITE = 'https://seventhtrumpet.org';

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function getParams() {
    try {
      var p = new URLSearchParams(location.search);
      var b = p.get('b') || p.get('book');
      var c = p.get('c') || p.get('chapter');
      var v = p.get('v') || p.get('verse');
      if (b && c) {
        var verse = 1;
        if (v) {
          var m = String(v).match(/^(\d+)/);
          if (m) verse = Number(m[1]);
        }
        return { bookId: Number(b), chapter: Number(c), verse: verse };
      }
    } catch (e) {}
    return null;
  }

  function sharePageUrl() {
    var params = getParams();
    if (!params) {
      try {
        var st = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
        if (st && st.bookId && st.chapter) {
          params = { bookId: st.bookId, chapter: st.chapter, verse: st.verse || 1 };
        }
      } catch (e) {}
    }
    if (params && params.bookId) {
      return SITE + '/bible.html?b=' + params.bookId +
        '&c=' + (params.chapter || 1) +
        '&v=' + (params.verse || 1);
    }
    return SITE + '/';
  }

  function applyDeepLink() {
    var params = getParams();
    if (!params) return;
    try { localStorage.setItem('cog_bible_state', JSON.stringify(params)); } catch (e) {}
    var tries = 0;
    function tryScroll() {
      tries++;
      var el = document.getElementById('v-' + params.chapter + '-' + params.verse);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(function () { el.classList.remove('highlight'); }, 2500);
        return;
      }
      if (tries < 40) setTimeout(tryScroll, 250);
    }
    setTimeout(tryScroll, 700);
  }

  function versePayload() {
    var text = (document.getElementById('verse-text') || {}).textContent || '';
    var ref = (document.getElementById('verse-ref') || {}).textContent || '';
    var selected = document.querySelectorAll('.mb-verse.selected');
    if (selected.length) {
      var lines = [];
      selected.forEach(function (el) { lines.push((el.textContent || '').trim()); });
      text = lines.join('\n');
      var first = selected[0];
      ref = (first.getAttribute('data-chapter') || '') + ':' + (first.getAttribute('data-verse') || '');
    }
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }

  /** Message people receive: verse in their language + website (WhatsApp makes preview tappable) */
  function buildMessage() {
    var p = versePayload();
    var url = sharePageUrl();
    var en = isEn();
    var parts = [];
    if (p.ref) parts.push(p.ref);
    if (p.text) parts.push(p.text);
    parts.push(en
      ? 'Seventh Trumpet — read more:'
      : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645 \u2014 \u0628\u06cc\u0634\u062a\u0631 \u0628\u062e\u0648\u0627\u0646\u06cc\u062f:');
    parts.push(url);
    return parts.join('\n\n');
  }

  function ensureCss() {
    if (document.getElementById('verse-share-simple-css')) return;
    var st = document.createElement('style');
    st.id = 'verse-share-simple-css';
    st.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5000;background:rgba(8,16,28,0.55);display:flex;align-items:flex-end;justify-content:center;padding:0.75rem}' +
      '.vshare-panel{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:1.15rem 1rem 1.2rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1.1rem;margin:0 0 0.35rem;text-align:center;color:#0a2540}' +
      'body.dark .vshare-title{color:#9ec5ea}' +
      '.vshare-hint{font-size:0.88rem;text-align:center;color:#6b7785;margin:0 0 1rem;line-height:1.5}' +
      '.vshare-btn{display:block;width:100%;margin:0 0 0.55rem;padding:0.9rem 1rem;border:none;border-radius:12px;font-family:inherit;font-weight:800;font-size:1rem;cursor:pointer}' +
      '.vshare-btn.wa{background:#25D366;color:#fff}' +
      '.vshare-btn.copy{background:#0a2540;color:#fff}' +
      '.vshare-btn.more{background:#f0f2f5;color:#0a2540}' +
      'body.dark .vshare-btn.more{background:#1a2b3c;color:#e8eef5}' +
      '.vshare-close{display:block;width:100%;margin-top:0.35rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.95rem;padding:0.55rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(st);
  }

  function openSharePanel() {
    ensureCss();
    var old = document.getElementById('vshare-overlay');
    if (old) old.remove();

    var en = isEn();
    var msg = buildMessage();
    var url = sharePageUrl();

    var overlay = document.createElement('div');
    overlay.id = 'vshare-overlay';
    overlay.className = 'vshare-overlay';
    overlay.innerHTML =
      '<div class="vshare-panel" role="dialog">' +
      '<p class="vshare-title">' + (en ? 'Share this verse' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0627\u06cc\u0646 \u0622\u06cc\u0647') + '</p>' +
      '<p class="vshare-hint">' +
      (en
        ? 'Send the verse on WhatsApp. Your friend can tap the message preview to open the website.'
        : '\u0622\u06cc\u0647 \u0631\u0627 \u062f\u0631 \u0648\u0627\u062a\u0633\u0627\u067e \u0628\u0641\u0631\u0633\u062a\u06cc\u062f. \u062f\u0648\u0633\u062a \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u062f \u0631\u0648\u06cc \u067e\u06cc\u0627\u0645 \u0644\u0645\u0633 \u06a9\u0646\u062f \u062a\u0627 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0628\u0627\u0632 \u0634\u0648\u062f.') +
      '</p>' +
      '<button type="button" class="vshare-btn wa" id="vs-wa">' +
      (en ? 'Share on WhatsApp' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u062f\u0631 \u0648\u0627\u062a\u0633\u0627\u067e') + '</button>' +
      '<button type="button" class="vshare-btn copy" id="vs-copy">' +
      (en ? 'Copy verse' : '\u06a9\u067e\u06cc \u0622\u06cc\u0647') + '</button>' +
      '<button type="button" class="vshare-btn more" id="vs-sys">' +
      (en ? 'More apps…' : '\u0628\u0631\u0646\u0627\u0645\u0647\u200c\u0647\u0627\u06cc \u0628\u06cc\u0634\u062a\u0631\u2026') + '</button>' +
      '<button type="button" class="vshare-close" id="vs-close">' +
      (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button>' +
      '</div>';

    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    document.getElementById('vs-close').onclick = close;
    overlay.onclick = function (e) { if (e.target === overlay) close(); };

    document.getElementById('vs-wa').onclick = function () {
      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      setTimeout(close, 300);
    };

    document.getElementById('vs-copy').onclick = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(function () {
          alert(en ? 'Verse copied' : '\u0622\u06cc\u0647 \u06a9\u067e\u06cc \u0634\u062f');
        }).catch(function () { prompt(en ? 'Copy:' : '\u06a9\u067e\u06cc:', msg); });
      } else {
        prompt(en ? 'Copy:' : '\u06a9\u067e\u06cc:', msg);
      }
      setTimeout(close, 200);
    };

    document.getElementById('vs-sys').onclick = function () {
      if (navigator.share) {
        navigator.share({
          title: en ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
          text: msg,
          url: url
        }).catch(function () {});
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      }
      setTimeout(close, 300);
    };
  }

  function setLabels() {
    var en = isEn();
    var share = document.getElementById('mb-share');
    var daily = document.getElementById('daily-share');
    // Not "share picture" — share the verse
    var label = en ? 'Share verse' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0622\u06cc\u0647';
    if (share) share.textContent = label;
    if (daily) daily.textContent = label;
  }

  function initDailyShare() {
    var section = document.getElementById('daily-verse');
    if (!section) return;
    var btn = document.getElementById('daily-share');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'daily-share';
      btn.className = 'verse-refresh';
      btn.style.marginInlineStart = '0.5rem';
      var refresh = document.getElementById('verse-refresh');
      if (refresh && refresh.parentNode) refresh.parentNode.insertBefore(btn, refresh.nextSibling);
      else {
        var inner = section.querySelector('.daily-verse-inner');
        if (inner) inner.appendChild(btn);
      }
    }
    btn.onclick = function (e) { e.preventDefault(); openSharePanel(); };
    setLabels();
  }

  function bindBibleShare() {
    var btn = document.getElementById('mb-share');
    if (!btn || btn._verseShareBound) return;
    btn._verseShareBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    });
  }

  function bindVerseTap() {
    var textEl = document.getElementById('verse-text');
    if (!textEl || textEl._verseShareBound) return;
    textEl._verseShareBound = true;
    textEl.style.cursor = 'pointer';
    textEl.addEventListener('click', openSharePanel);
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    bindBibleShare();
    bindVerseTap();
    setLabels();
    setTimeout(bindBibleShare, 500);
    setTimeout(bindBibleShare, 1500);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(setLabels, 150); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
