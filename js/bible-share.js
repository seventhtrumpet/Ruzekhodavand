/* Share panel: verse first + tappable link + OG profile; WA / TG / Signal / Photo / More
   Daily verse on home page is handled only by daily-bread-status.js */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SOCIAL = {
    telegram: 'https://t.me/share/url?url='
  };

  function isEn() {
    try {
      return ((typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function brandLine() {
    return isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }

  function getShareRoute() {
    var params = new URLSearchParams();
    try {
      var saved = JSON.parse(localStorage.getItem('cog_bible_share_route') || 'null');
      if (saved && Number(saved.bookId) > 0 && Number(saved.chapter) > 0) {
        params.set('b', String(saved.bookId));
        params.set('c', String(saved.chapter));
        params.set('v', String(Number(saved.verse) > 0 ? Number(saved.verse) : 1));
      }
    } catch (e) {}
    try {
      var incoming = new URLSearchParams(window.location.search);
      ['b','book','c','chapter','v','verse','lang','version','slug'].forEach(function (key) {
        if (incoming.has(key)) params.set(key, incoming.get(key));
      });
    } catch (e2) {}
    return params;
  }

  function versePayload() {
    var text = '', ref = '';
    try {
      var selected = document.querySelectorAll('.mb-verse.selected');
      if (selected.length) {
        var lines = [];
        selected.forEach(function (el) {
          lines.push((el.textContent || '').replace(/^\\d+\\s*/, '').trim());
        });
        text = lines.join('\\n');
        var first = selected[0];
        var last = selected[selected.length - 1];
        var ch = first.getAttribute('data-chapter') || '';
        var v1 = first.getAttribute('data-verse') || '';
        var v2 = last.getAttribute('data-verse') || '';
        if (ch) ref = ch + ':' + v1 + (v2 && v2 !== v1 ? '-' + v2 : '');
      }
    } catch (e) {}
    if (!text) {
      var route = getShareRoute();
      var routeChapter = route.get('c') || route.get('chapter');
      var routeVerse = route.get('v') || route.get('verse');
      if (routeChapter && routeVerse) {
        var linkedVerse = document.getElementById('v-' + routeChapter + '-' + routeVerse);
        if (linkedVerse) text = (linkedVerse.textContent || '').replace(/^\\d+\\s*/, '').trim();
        ref = routeChapter + ':' + routeVerse;
      }
    }
    if (!text) {
      try {
        var vt = document.getElementById('verse-text');
        if (vt) text = (vt.textContent || '').trim();
      } catch (e2) {}
    }
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }

  function sharePageUrl() {
    try {
      var params = getShareRoute();
      var route = params;
      var lang = isEn() ? 'en' : 'fa';
      var version = '';
      try {
        version = localStorage.getItem(lang === 'en' ? 'cog_bible_en_version' : 'cog_bible_fa_version') || (lang === 'en' ? 'kjv' : 'opcb');
      } catch (e) { version = lang === 'en' ? 'kjv' : 'opcb'; }
      route.set('lang', lang);
      route.set('version', version);
      var slug = '';
      try {
        slug = (window.__stBibleSlugByCanonicalId || {})[String(params.get('b') || params.get('book') || '')] || '';
      } catch (e2) {}
      if (slug) route.set('slug', slug);
      return SITE + '/bible.html?' + route.toString();
    } catch (e3) {}
    return SITE + '/bible.html?lang=' + (isEn() ? 'en' : 'fa');
  }

  function buildParts() {
    var p = versePayload();
    var pageUrl = sharePageUrl();
    var brand = brandLine();
    var title = brand;
    if (p.ref) title = p.ref + ' \u2014 ' + brand;

    var textLines = [];
    if (p.text) textLines.push(p.text);
    if (p.ref) textLines.push(p.ref);
    textLines.push(brand);
    textLines.push(pageUrl);
    var text = textLines.join('\n\n');

    return {
      title: title,
      text: text,
      url: pageUrl,
      full: text,
      payload: p
    };
  }

  function toast(msg) {
    var t = document.getElementById('vshare-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'vshare-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:6000;background:#0a2540;color:#fff;padding:0.7rem 1rem;border-radius:12px;font-size:0.88rem;font-weight:700;max-width:90%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function () { try { t.remove(); } catch (e) {} }, 2800);
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

  function doShare(app) {
    var parts = buildParts();
    var en = isEn();

    if (app === 'wa') {
      // Prefer the native Android share sheet with the generated profile-branded
      // image attached and the verse + canonical passage URL as its caption.
      // The visitor can then choose WhatsApp and "My Status".
      if (typeof window.ST_sharePhoto === 'function') {
        window.ST_sharePhoto(false, 'wa', {
          text: parts.payload.text,
          ref: parts.payload.ref,
          url: parts.url,
          title: parts.title
        });
      } else {
        window.location.href = 'https://wa.me/?text=' + encodeURIComponent(parts.full);
      }
      return;
    }

    if (app === 'tg') {
      window.open(
        SOCIAL.telegram + encodeURIComponent(parts.url) + '&text=' + encodeURIComponent(parts.text),
        '_blank',
        'noopener'
      );
      return;
    }

    if (app === 'signal') {
      if (navigator.share) {
        navigator.share({ title: parts.title, text: parts.text, url: parts.url }).catch(function (err) {
          if (err && err.name === 'AbortError') return;
          copyText(parts.full).then(function (ok) {
            if (ok) toast(en ? 'Copied' : '\u06a9\u067e\u06cc \u0634\u062f');
          });
        });
      } else {
        copyText(parts.full);
      }
      return;
    }

    if (app === 'photo') {
      if (typeof window.ST_sharePhoto === 'function') {
        window.ST_sharePhoto(false, 'ig', {
          text: parts.payload.text,
          ref: parts.payload.ref,
          url: parts.url,
          title: parts.title
        });
      } else {
        doShare('more');
      }
      return;
    }

    if (app === 'more' || app === 'system') {
      if (navigator.share) {
        navigator.share({ title: parts.title, text: parts.text, url: parts.url }).catch(function (err) {
          if (err && err.name === 'AbortError') return;
          copyText(parts.full);
        });
      } else {
        copyText(parts.full);
      }
      return;
    }

    copyText(parts.full);
  }

  function ensureCss() {
    if (document.getElementById('vshare-css')) return;
    var s = document.createElement('style');
    s.id = 'vshare-css';
    s.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5500;background:rgba(10,20,35,.45);display:flex;align-items:flex-end;justify-content:center;padding:1rem}' +
      '.vshare-panel{width:100%;max-width:420px;background:#fff;border-radius:18px 18px 12px 12px;padding:1rem 1rem 1.2rem;box-shadow:0 -8px 32px rgba(0,0,0,.2)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1rem;margin:0 0 0.35rem}' +
      '.vshare-hint{font-size:0.78rem;opacity:0.75;margin:0 0 0.85rem;line-height:1.4}' +
      '.vshare-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.55rem}' +
      '.vshare-btn{border:none;border-radius:12px;padding:0.75rem 0.5rem;font-family:inherit;font-weight:800;font-size:0.88rem;cursor:pointer;color:#fff}' +
      '.vshare-btn.wa{background:#25D366}.vshare-btn.tg{background:#0088cc}' +
      '.vshare-btn.signal{background:#3A76F0}.vshare-btn.photo{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.more{background:#0a2540;grid-column:1/-1}' +
      '.vshare-cancel{margin-top:0.7rem;width:100%;border:1px solid #d0d7e0;background:transparent;border-radius:12px;padding:0.65rem;font-family:inherit;font-weight:700;cursor:pointer}' +
      'body.dark .vshare-cancel{border-color:#2a3a4c;color:#dbe7f3}';
    document.head.appendChild(s);
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
      '<div class="vshare-panel" role="dialog" aria-modal="true">' +
      '<p class="vshare-title">' + (en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9') + '</p>' +
      '<p class="vshare-hint">' +
      (en ? 'Verse + tappable website link' : '\u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9 \u0642\u0627\u0628\u0644 \u0644\u0645\u0633') +
      '</p>' +
      '<div class="vshare-grid">' +
      '<button type="button" class="vshare-btn wa" data-go="wa">WhatsApp</button>' +
      '<button type="button" class="vshare-btn tg" data-go="tg">Telegram</button>' +
      '<button type="button" class="vshare-btn signal" data-go="signal">Signal</button>' +
      '<button type="button" class="vshare-btn photo" data-go="photo">' + (en ? 'Photo' : '\u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="vshare-btn more" data-go="more">' + (en ? 'More apps' : '\u0628\u0631\u0646\u0627\u0645\u0647\u200c\u0647\u0627\u06cc \u0628\u06cc\u0634\u062a\u0631') + '</button>' +
      '</div>' +
      '<button type="button" class="vshare-cancel" data-go="cancel">' + (en ? 'Cancel' : '\u0644\u063a\u0648') + '</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var go = btn.getAttribute('data-go');
        if (go === 'cancel') { overlay.remove(); return; }
        overlay.remove();
        setTimeout(function () { doShare(go); }, 80);
      });
    });
  }

  function setLabels() {
    var en = isEn();
    var label = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
    var mb = document.getElementById('mb-share');
    if (mb) mb.textContent = label;
  }

  function bindDaily() {
    var old = document.getElementById('daily-share');
    if (old) try { old.remove(); } catch (e) {}
  }

  function bindBible() {
    var btn = document.getElementById('mb-share');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openSharePanel();
    });
    setLabels();
  }

  function boot() {
    bindDaily();
    bindBible();
    setTimeout(bindDaily, 500);
    setTimeout(setLabels, 400);
    window.addEventListener('cog-lang-changed', setLabels);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.ST_openVerseShare = openSharePanel;
  window.ST_shareVerse = function (app) { doShare(app || 'more'); };
})();
