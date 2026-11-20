/* Share: system sheet (verse + tappable link + OG profile) + optional photo */
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
    var text = '', ref = '';
    try {
      var vt = document.getElementById('verse-text');
      if (vt) text = (vt.textContent || '').trim();
      var vr = document.getElementById('verse-ref');
      if (vr) ref = (vr.textContent || '').trim();
    } catch (e) {}
    var selected = document.querySelectorAll('.mb-verse.selected');
    if (selected.length) {
      var lines = [];
      selected.forEach(function (el) { lines.push((el.textContent || '').trim()); });
      text = lines.join('\n');
      var first = selected[0];
      var ch = first.getAttribute('data-chapter') || '';
      var vs = first.getAttribute('data-verse') || '';
      if (ch || vs) ref = ch + ':' + vs;
    }
    if (!text) {
      var main = document.querySelector('.mb-verse.active, .verse-body, article p');
      if (main) text = (main.textContent || '').trim().slice(0, 600);
    }
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }

  function brandLine() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }

  function sharePageUrl() {
    try {
      var selected = document.querySelectorAll('.mb-verse.selected');
      if (selected.length) {
        var first = selected[0];
        var ch = first.getAttribute('data-chapter') || '';
        var vs = first.getAttribute('data-verse') || '';
        var p = new URLSearchParams(location.search);
        var b = p.get('b') || p.get('book') || '';
        if (!b) {
          try {
            var st = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
            if (st.bookId) b = String(st.bookId);
          } catch (e2) {}
        }
        if (b && ch) {
          return SITE + '/bible.html?b=' + encodeURIComponent(b) +
            '&c=' + encodeURIComponent(ch) +
            '&v=' + encodeURIComponent(vs || '1');
        }
      }
      var params = getParams();
      if (params && params.bookId && params.chapter) {
        return SITE + '/bible.html?b=' + params.bookId +
          '&c=' + params.chapter +
          '&v=' + (params.verse || 1);
      }
    } catch (e) {}
    return SITE + '/';
  }

  function buildParts() {
    var p = versePayload();
    var pageUrl = sharePageUrl();
    var brand = brandLine();
    var title = (p.ref ? (p.ref + ' \u2014 ') : '') + brand;
    var text = '';
    if (p.text) text += p.text + '\n\n';
    if (p.ref) text += p.ref + '\n';
    text += brand;
    return { title: title, text: text.trim(), url: pageUrl, payload: p };
  }

  function toast(msg) {
    var t = document.getElementById('vshare-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'vshare-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:6000;background:#0a2540;color:#fff;padding:0.7rem 1rem;border-radius:12px;font-size:0.88rem;font-weight:700;max-width:90%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function () { try { t.remove(); } catch (e) {} }, 3200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return Promise.resolve(!!ok);
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function shareSystem() {
    var parts = buildParts();
    var en = isEn();
    if (navigator.share) {
      navigator.share({
        title: parts.title,
        text: parts.text,
        url: parts.url
      }).catch(function () {});
      return;
    }
    var full = parts.text + '\n\n' + parts.url;
    copyText(full).then(function (ok) {
      toast(ok
        ? (en ? 'Copied verse + link' : '\u06a9\u067e\u06cc \u0634\u062f: \u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9')
        : (en ? 'Share not supported' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u067e\u0634\u062a\u06cc\u0628\u0627\u0646\u06cc \u0646\u0645\u06cc\u200c\u0634\u0648\u062f'));
    });
  }

  function sharePhoto() {
    var parts = buildParts();
    if (typeof window.ST_sharePhoto === 'function') {
      window.ST_sharePhoto(false, 'ig', {
        text: parts.payload.text,
        ref: parts.payload.ref,
        url: parts.url,
        title: parts.title
      });
      return;
    }
    shareSystem();
  }

  function ensureCss() {
    if (document.getElementById('vshare-icons-css')) return;
    var st = document.createElement('style');
    st.id = 'vshare-icons-css';
    st.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5000;background:rgba(8,16,28,0.55);display:flex;align-items:flex-end;justify-content:center;padding:0.75rem}' +
      '.vshare-panel{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:1.15rem 1rem 1rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1.15rem;margin:0 0 0.55rem;text-align:center;color:#0a2540}' +
      'body.dark .vshare-title{color:#9ec5ea}' +
      '.vshare-desc{font-size:0.82rem;color:#5a6a7a;text-align:center;margin:0 0 0.9rem;line-height:1.45}' +
      'body.dark .vshare-desc{color:#9aabbc}' +
      '.vshare-btn{display:flex;align-items:center;justify-content:center;width:100%;padding:0.95rem 0.5rem;border:none;border-radius:12px;font-family:inherit;font-weight:800;font-size:1rem;cursor:pointer;color:#fff;margin-bottom:0.5rem}' +
      '.vshare-btn.main{background:#0a2540}' +
      '.vshare-btn.photo{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.site{background:#5b6b7c}' +
      '.vshare-close{display:block;width:100%;margin-top:0.35rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.95rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(st);
  }

  function openSharePanel() {
    ensureCss();
    var old = document.getElementById('vshare-overlay');
    if (old) old.remove();
    var en = isEn();
    var overlay = document.createElement('div');
    overlay.id = 'vshare-overlay';
    overlay.className = 'vshare-overlay';
    overlay.innerHTML =
      '<div class="vshare-panel" role="dialog">' +
      '<p class="vshare-title">' + (en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9') + '</p>' +
      '<p class="vshare-desc">' +
      (en
        ? 'Sends the verse + a real tappable website link. Profile photo appears as the link preview. Choose WhatsApp, Signal, Messenger, etc.'
        : '\u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9 \u0648\u0627\u0642\u0639\u06cc \u0642\u0627\u0628\u0644\u0650 \u0644\u0645\u0633 \u0627\u0631\u0633\u0627\u0644 \u0645\u06cc\u200c\u0634\u0648\u062f. \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0627\u0632 \u067e\u06cc\u0634\u200c\u0646\u0645\u0627\u06cc\u0634 \u0644\u06cc\u0646\u06a9 \u0645\u06cc\u200c\u0622\u06cc\u062f. \u062e\u0648\u062f\u062a\u0627\u0646 \u0648\u0627\u062a\u0633\u0627\u067e\u060c \u0633\u06cc\u06af\u0646\u0627\u0644\u060c \u0645\u0633\u0646\u062c\u0631 \u0648 \u2026 \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f.') +
      '</p>' +
      '<button type="button" class="vshare-btn main" data-go="system">' +
      (en ? 'Share (WhatsApp, Signal, \u2026)' : '\u0627\u0634\u062a\u0631\u0627\u06a9 (\u0648\u0627\u062a\u0633\u0627\u067e\u060c \u0633\u06cc\u06af\u0646\u0627\u0644\u060c \u2026)') +
      '</button>' +
      '<button type="button" class="vshare-btn photo" data-go="photo">' +
      (en ? 'Share as photo (Instagram \u2026)' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0628\u0627 \u0639\u06a9\u0633 (\u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645 \u2026)') +
      '</button>' +
      '<button type="button" class="vshare-btn site" data-go="site">' +
      (en ? 'Open website' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0648\u0628\u0633\u0627\u06cc\u062a') +
      '</button>' +
      '<button type="button" class="vshare-close" id="vs-close">' +
      (en ? 'Close' : '\u0628\u0633\u062a\u0646') +
      '</button></div>';
    document.body.appendChild(overlay);
    function close() { try { overlay.remove(); } catch (e) {} }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    var cl = document.getElementById('vs-close');
    if (cl) cl.addEventListener('click', close);
    overlay.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var go = btn.getAttribute('data-go');
        if (go === 'site') {
          window.open(SITE + '/', '_blank', 'noopener');
          setTimeout(close, 150);
          return;
        }
        close();
        setTimeout(function () {
          if (go === 'photo') sharePhoto();
          else shareSystem();
        }, 80);
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
    if (!btn || btn._stShareBound) return;
    btn._stShareBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    }, true);
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    bindBibleShare();
    setLabels();
    setTimeout(bindBibleShare, 400);
    setTimeout(bindBibleShare, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
