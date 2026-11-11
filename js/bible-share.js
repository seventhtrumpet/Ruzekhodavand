/* Full share panel: WhatsApp, Instagram, TikTok, Facebook, YouTube + profile picture card */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SOCIAL = {
    whatsapp: 'https://wa.me/442081333076',
    instagram: 'https://www.instagram.com/seventhtrumpet.media',
    facebook: 'https://www.facebook.com/share/1Ev7nyyXVu/',
    tiktok: 'https://www.tiktok.com/@seventhtrumpet.me',
    youtube: 'https://youtube.com/@seventhtrumpetmedia'
  };

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

  function buildMessage() {
    var p = versePayload();
    var url = sharePageUrl();
    var en = isEn();
    var parts = [];
    if (p.ref) parts.push(p.ref);
    if (p.text) parts.push(p.text);
    parts.push(en ? 'Seventh Trumpet:' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645:');
    parts.push(url);
    return parts.join('\n\n');
  }

  function openUrl(u) {
    window.open(u, '_blank', 'noopener');
  }

  function openPictureCard() {
    var p = versePayload();
    if (typeof window.ST_shareBeautifulCard === 'function') {
      window.ST_shareBeautifulCard({
        title: isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
        body: p.text,
        ref: p.ref,
        url: sharePageUrl(),
        filename: 'seventh-trumpet-verse.png'
      });
    } else {
      alert(isEn() ? 'Please wait and try again' : '\u0644\u0637\u0641\u0627 \u06a9\u0645\u06cc \u0635\u0628\u0631 \u06a9\u0646\u06cc\u062f');
    }
  }

  function ensureCss() {
    if (document.getElementById('verse-share-full-css')) return;
    var st = document.createElement('style');
    st.id = 'verse-share-full-css';
    st.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5000;background:rgba(8,16,28,0.55);display:flex;align-items:flex-end;justify-content:center;padding:0.75rem}' +
      '.vshare-panel{width:100%;max-width:420px;background:#fff;border-radius:16px;padding:1.15rem 1rem 1.15rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1.1rem;margin:0 0 0.3rem;text-align:center;color:#0a2540}' +
      'body.dark .vshare-title{color:#9ec5ea}' +
      '.vshare-hint{font-size:0.85rem;text-align:center;color:#6b7785;margin:0 0 0.9rem;line-height:1.45}' +
      '.vshare-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem}' +
      '.vshare-btn{display:flex;align-items:center;justify-content:center;padding:0.8rem 0.4rem;border:none;border-radius:12px;font-family:inherit;font-weight:800;font-size:0.9rem;cursor:pointer;color:#fff}' +
      '.vshare-btn.pic{background:#c9a227;color:#0a2540;grid-column:1/-1}' +
      '.vshare-btn.wa{background:#25D366}' +
      '.vshare-btn.ig{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.fb{background:#1877F2}' +
      '.vshare-btn.tt{background:#111}' +
      '.vshare-btn.yt{background:#FF0000}' +
      '.vshare-btn.site{background:#0a2540;grid-column:1/-1}' +
      '.vshare-btn.copy{background:#3d5a73}' +
      '.vshare-close{display:block;width:100%;margin-top:0.65rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.95rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(st);
  }

  function openSharePanel() {
    ensureCss();
    var old = document.getElementById('vshare-overlay');
    if (old) old.remove();

    var en = isEn();
    var msg = buildMessage();
    var pageUrl = sharePageUrl();

    var overlay = document.createElement('div');
    overlay.id = 'vshare-overlay';
    overlay.className = 'vshare-overlay';
    overlay.innerHTML =
      '<div class="vshare-panel" role="dialog">' +
      '<p class="vshare-title">' + (en ? 'Share this verse' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0627\u06cc\u0646 \u0622\u06cc\u0647') + '</p>' +
      '<p class="vshare-hint">' +
      (en
        ? 'Card with profile picture + verse + website. Or open WhatsApp, Instagram, TikTok, Facebook…'
        : '\u06a9\u0627\u0631\u062a \u0628\u0627 \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0622\u06cc\u0647 + \u0648\u0628\u200c\u0633\u0627\u06cc\u062a. \u06cc\u0627 \u0648\u0627\u062a\u0633\u0627\u067e\u060c \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645\u060c \u062a\u06cc\u06a9\u200c\u062a\u0627\u06a9\u060c \u0641\u06cc\u0633\u0628\u0648\u06a9\u2026') +
      '</p>' +
      '<div class="vshare-grid">' +
      '<button type="button" class="vshare-btn pic" data-go="pic">' +
      (en ? 'Share card (profile picture + verse)' : '\u06a9\u0627\u0631\u062a \u0627\u0634\u062a\u0631\u0627\u06a9 (\u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0622\u06cc\u0647)') + '</button>' +
      '<button type="button" class="vshare-btn wa" data-go="wa">WhatsApp</button>' +
      '<button type="button" class="vshare-btn ig" data-go="ig">Instagram</button>' +
      '<button type="button" class="vshare-btn fb" data-go="fb">Facebook</button>' +
      '<button type="button" class="vshare-btn tt" data-go="tt">TikTok</button>' +
      '<button type="button" class="vshare-btn yt" data-go="yt">YouTube</button>' +
      '<button type="button" class="vshare-btn copy" data-go="copy">' +
      (en ? 'Copy verse' : '\u06a9\u067e\u06cc \u0622\u06cc\u0647') + '</button>' +
      '<button type="button" class="vshare-btn site" data-go="site">' +
      (en ? 'Open website' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a') + '</button>' +
      '</div>' +
      '<button type="button" class="vshare-close" id="vs-close">' +
      (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button></div>';

    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    document.getElementById('vs-close').onclick = close;
    overlay.onclick = function (e) { if (e.target === overlay) close(); };

    overlay.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var go = btn.getAttribute('data-go');
        if (go === 'pic') {
          close();
          setTimeout(openPictureCard, 150);
          return;
        }
        if (go === 'wa') {
          openUrl('https://wa.me/?text=' + encodeURIComponent(msg));
        } else if (go === 'ig') {
          try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
          openUrl(SOCIAL.instagram);
        } else if (go === 'fb') {
          openUrl('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl));
        } else if (go === 'tt') {
          try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
          openUrl(SOCIAL.tiktok);
        } else if (go === 'yt') {
          openUrl(SOCIAL.youtube);
        } else if (go === 'copy') {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg).then(function () {
              alert(en ? 'Copied' : '\u06a9\u067e\u06cc \u0634\u062f');
            }).catch(function () { prompt(en ? 'Copy:' : '\u06a9\u067e\u06cc:', msg); });
          } else prompt(en ? 'Copy:' : '\u06a9\u067e\u06cc:', msg);
        } else if (go === 'site') {
          openUrl(pageUrl);
        }
        if (go !== 'pic') setTimeout(close, 350);
      });
    });
  }

  function setLabels() {
    var en = isEn();
    var label = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
    var share = document.getElementById('mb-share');
    var daily = document.getElementById('daily-share');
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
    if (!btn || btn._fullShareBound) return;
    btn._fullShareBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    });
  }

  function bindVerseTap() {
    var textEl = document.getElementById('verse-text');
    if (!textEl || textEl._fullShareBound) return;
    textEl._fullShareBound = true;
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
