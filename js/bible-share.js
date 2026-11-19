/* Bible share — restored stable behavior */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SOCIAL = {
    instagram: 'https://www.instagram.com/seventhtrumpet.media',
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    tiktok: 'https://www.tiktok.com/@seventhtrumpet.me',
    youtube: 'https://youtube.com/@seventhtrumpetmedia',
    telegram: 'https://t.me/share/url?url='
  };
  function isEn() {
    try { return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en'; }
    catch (e) { return false; }
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
      ref = (first.getAttribute('data-chapter') || '') + ':' + (first.getAttribute('data-verse') || '');
    }
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }
  function brandLine() { return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645'; }
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
    } catch (e) { return Promise.resolve(false); }
  }
  function doShare(app) {
    var p = versePayload();
    var pageUrl = SITE + '/';
    var brand = brandLine();
    var cardTitle = (p.ref ? (p.ref + ' \u2014 ') : '') + brand;
    var cardText = '';
    if (p.text) cardText += p.text + '\n\n';
    if (p.ref) cardText += p.ref + '\n\n';
    cardText += brand;
    var full = cardText + '\n\n' + pageUrl;
    var en = isEn();
    var msg = full;

    function shareTextLink() {
      if (navigator.share) {
        navigator.share({ title: cardTitle, text: cardText, url: pageUrl }).catch(function () {
          window.open('https://wa.me/?text=' + encodeURIComponent(full), '_blank', 'noopener');
        });
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(full), '_blank', 'noopener');
      }
    }

    if (app === 'wa' || app === 'more' || app === 'system' || app === 'msg' || app === 'messenger' || app === 'signal') {
      shareTextLink();
      return;
    }
    if (app === 'tg') {
      window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(msg), '_blank', 'noopener');
      return;
    }
    if (app === 'fb' || app === 'ig') {
      if (typeof window.ST_sharePhoto === 'function') {
        window.ST_sharePhoto(app === 'ig', app);
      } else if (app === 'fb') {
        window.open(SOCIAL.facebook + encodeURIComponent(pageUrl), '_blank', 'noopener');
      } else {
        window.open(SOCIAL.instagram, '_blank', 'noopener');
      }
      return;
    }
    if (app === 'tt') {
      copyText(full).then(function () { toast(en ? 'Copied' : '\u06a9\u067e\u06cc \u0634\u062f'); });
      setTimeout(function () { window.open(SOCIAL.tiktok, '_blank', 'noopener'); }, 400);
      return;
    }
    if (app === 'yt') {
      window.open(SOCIAL.youtube, '_blank', 'noopener');
      return;
    }
    copyText(full).then(function (ok) {
      toast(ok ? (en ? 'Copied' : '\u06a9\u067e\u06cc \u0634\u062f') : (en ? 'Failed' : '\u0646\u0634\u062f'));
    });
  }
  function ensureCss() {
    if (document.getElementById('vshare-icons-css')) return;
    var st = document.createElement('style');
    st.id = 'vshare-icons-css';
    st.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5000;background:rgba(8,16,28,0.55);display:flex;align-items:flex-end;justify-content:center;padding:0.75rem}' +
      '.vshare-panel{width:100%;max-width:400px;background:#fff;border-radius:16px;padding:1.15rem 1rem 1rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1.15rem;margin:0 0 0.9rem;text-align:center;color:#0a2540}' +
      'body.dark .vshare-title{color:#9ec5ea}' +
      '.vshare-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem}' +
      '.vshare-btn{display:flex;align-items:center;justify-content:center;padding:0.85rem 0.35rem;border:none;border-radius:12px;font-family:inherit;font-weight:800;font-size:0.9rem;cursor:pointer;color:#fff}' +
      '.vshare-btn.wa{background:#25D366}.vshare-btn.tg{background:#0088cc}' +
      '.vshare-btn.ig{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.fb{background:#1877F2}.vshare-btn.msg{background:#006AFF}.vshare-btn.signal{background:#3A76F0}' +
      '.vshare-btn.tt{background:#111}.vshare-btn.yt{background:#FF0000}' +
      '.vshare-btn.more{background:#5b6b7c;grid-column:1/-1}.vshare-btn.site{background:#0a2540;grid-column:1/-1}' +
      '.vshare-hint{font-size:0.75rem;color:#6b7785;text-align:center;margin:0.5rem 0 0;line-height:1.35}' +
      '.vshare-close{display:block;width:100%;margin-top:0.6rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.95rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
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
      '<div class="vshare-grid">' +
      '<button type="button" class="vshare-btn wa" data-go="wa">WhatsApp</button>' +
      '<button type="button" class="vshare-btn tg" data-go="tg">Telegram</button>' +
      '<button type="button" class="vshare-btn ig" data-go="ig">Instagram</button>' +
      '<button type="button" class="vshare-btn fb" data-go="fb">Facebook</button>' +
      '<button type="button" class="vshare-btn msg" data-go="msg">Messenger</button>' +
      '<button type="button" class="vshare-btn signal" data-go="signal">Signal</button>' +
      '<button type="button" class="vshare-btn tt" data-go="tt">TikTok</button>' +
      '<button type="button" class="vshare-btn yt" data-go="yt">YouTube</button>' +
      '<button type="button" class="vshare-btn more" data-go="more">' +
      (en ? 'More apps\u2026' : '\u0628\u0631\u0646\u0627\u0645\u0647\u200c\u0647\u0627\u06cc \u0628\u06cc\u0634\u062a\u0631\u2026') +
      '</button>' +
      '<button type="button" class="vshare-btn site" data-go="site">' +
      (en ? 'Open website' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0648\u0628\u0633\u0627\u06cc\u062a') +
      '</button></div>' +
      '<p class="vshare-hint">' +
      (en ? 'WhatsApp: verse + website link. Instagram/Facebook: photo.' :
        '\u0648\u0627\u062a\u0633\u0627\u067e: \u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9. \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645/\u0641\u06cc\u0633\u0628\u0648\u06a9: \u0639\u06a9\u0633.') +
      '</p>' +
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
          setTimeout(close, 200);
          return;
        }
        close();
        setTimeout(function () { doShare(go); }, 80);
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
    bindBibleShare();
    setLabels();
    setTimeout(bindBibleShare, 400);
    setTimeout(bindBibleShare, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
