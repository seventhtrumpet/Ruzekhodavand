/* Profile picture + real link CARD under it (not caption, not painted on the image) */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var LOGO_HQ = 'https://iili.io/n8MSJBp.jpg';
  var SOCIAL = {
    instagram: 'https://www.instagram.com/seventhtrumpet.media',
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    tiktok: 'https://www.tiktok.com/@seventhtrumpet.me',
    youtube: 'https://youtube.com/@seventhtrumpetmedia',
    telegram: 'https://t.me/share/url?url='
  };

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
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
      var main = document.querySelector('.angel-text, .daily-verse-text, #daily-verse .verse-body, article p, .mb-verse.active');
      if (main) text = (main.textContent || '').trim().slice(0, 600);
    }
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }

  function brandLine() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }

  function shareTitle() {
    var p = versePayload();
    if (p.ref) return p.ref + ' — ' + brandLine();
    return brandLine();
  }

  function cardWords() {
    var p = versePayload();
    var lines = [];
    if (p.text) lines.push(p.text);
    if (p.ref) lines.push(p.ref);
    lines.push(brandLine());
    return lines.join('\n\n');
  }

  function getProfileImg(cb) {
    var sources = [LOGO_HQ, 'https://iili.io/n8M8tYF.jpg'];
    try {
      if (window.ST_PROFILE_B64 && window.ST_PROFILE_B64.length > 100) {
        sources.unshift('data:image/jpeg;base64,' + window.ST_PROFILE_B64);
      }
    } catch (e) {}
    try {
      if (window.ST_PE1 && window.ST_PE2 && window.ST_PE1.length > 100) {
        sources.unshift('data:image/jpeg;base64,' + window.ST_PE1 + window.ST_PE2);
      }
    } catch (e2) {}
    var i = 0;
    function tryNext() {
      if (i >= sources.length) { cb(null); return; }
      var src = sources[i++];
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { cb(img); };
      img.onerror = function () { tryNext(); };
      img.src = src;
    }
    tryNext();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function makeProfileImage(done) {
    getProfileImg(function (profile) {
      var w = 1080, sq = 920, pad = 50, footer = 80;
      var h = pad + sq + footer;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      try { ctx.imageSmoothingQuality = 'high'; } catch (e) {}

      ctx.fillStyle = '#061828';
      ctx.fillRect(0, 0, w, h);

      var sqX = (w - sq) / 2, sqY = pad;
      if (profile) {
        ctx.save();
        roundRect(ctx, sqX, sqY, sq, sq, 40);
        ctx.clip();
        var scale = Math.max(sq / profile.width, sq / profile.height);
        var dw = profile.width * scale, dh = profile.height * scale;
        ctx.drawImage(profile, sqX + (sq - dw) / 2, sqY + (sq - dh) / 2, dw, dh);
        ctx.restore();
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 10;
        roundRect(ctx, sqX, sqY, sq, sq, 40);
        ctx.stroke();
      }

      ctx.fillStyle = '#c9a227';
      ctx.font = '700 32px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(brandLine(), w / 2, sqY + sq + 48);

      canvas.toBlob(function (blob) { done(blob); }, 'image/png');
    });
  }

  function doShare(app) {
    var title = shareTitle();
    var words = cardWords();
    var pageUrl = SITE;

    makeProfileImage(function (blob) {
      var file = null;
      if (blob) {
        try { file = new File([blob], 'seventh-trumpet.png', { type: 'image/png' }); } catch (e) {}
      }

      if (app === 'wa') {
        function shareLinkCard() {
          return navigator.share({ title: title, text: words, url: pageUrl });
        }
        function sharePictureAndCard() {
          return navigator.share({ files: [file], title: title, text: words, url: pageUrl });
        }

        if (file && navigator.canShare) {
          var both = { files: [file], title: title, text: words, url: pageUrl };
          if (navigator.canShare(both)) {
            sharePictureAndCard().catch(function () {
              shareLinkCard().catch(function () {
                window.open('https://wa.me/?text=' + encodeURIComponent(words + '\n\n' + pageUrl), '_blank', 'noopener');
              });
            });
            return;
          }
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: title, text: words }).catch(function () {
              shareLinkCard().catch(function () {
                window.open('https://wa.me/?text=' + encodeURIComponent(words + '\n\n' + pageUrl), '_blank', 'noopener');
              });
            });
            return;
          }
        }

        if (navigator.share) {
          shareLinkCard().catch(function () {
            window.open('https://wa.me/?text=' + encodeURIComponent(words + '\n\n' + pageUrl), '_blank', 'noopener');
          });
        } else {
          window.open('https://wa.me/?text=' + encodeURIComponent(words + '\n\n' + pageUrl), '_blank', 'noopener');
        }
        return;
      }

      if (app === 'tg') {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: title, text: words, url: pageUrl }).catch(function () {
            window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(words), '_blank', 'noopener');
          });
        } else {
          window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(words), '_blank', 'noopener');
        }
        return;
      }

      if (app === 'fb') {
        window.open(SOCIAL.facebook + encodeURIComponent(pageUrl), '_blank', 'noopener');
        return;
      }

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: title, text: words, url: pageUrl }).catch(function () {
          try { if (navigator.clipboard) navigator.clipboard.writeText(words + '\n\n' + pageUrl); } catch (e) {}
          if (app === 'ig') window.open(SOCIAL.instagram, '_blank', 'noopener');
          else if (app === 'tt') window.open(SOCIAL.tiktok, '_blank', 'noopener');
          else if (app === 'yt') window.open(SOCIAL.youtube, '_blank', 'noopener');
        });
      } else if (navigator.share) {
        navigator.share({ title: title, text: words, url: pageUrl }).catch(function () {
          try { if (navigator.clipboard) navigator.clipboard.writeText(words + '\n\n' + pageUrl); } catch (e) {}
        });
      } else {
        try { if (navigator.clipboard) navigator.clipboard.writeText(words + '\n\n' + pageUrl); } catch (e) {}
        if (app === 'ig') window.open(SOCIAL.instagram, '_blank', 'noopener');
        else if (app === 'tt') window.open(SOCIAL.tiktok, '_blank', 'noopener');
        else if (app === 'yt') window.open(SOCIAL.youtube, '_blank', 'noopener');
      }
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
      '.vshare-btn{display:flex;align-items:center;justify-content:center;padding:0.9rem 0.4rem;border:none;border-radius:12px;font-family:inherit;font-weight:800;font-size:0.95rem;cursor:pointer;color:#fff}' +
      '.vshare-btn.wa{background:#25D366}' +
      '.vshare-btn.tg{background:#0088cc}' +
      '.vshare-btn.ig{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.fb{background:#1877F2}' +
      '.vshare-btn.tt{background:#111}' +
      '.vshare-btn.yt{background:#FF0000}' +
      '.vshare-btn.site{background:#0a2540;grid-column:1/-1}' +
      '.vshare-close{display:block;width:100%;margin-top:0.65rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.95rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
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
      '<button type="button" class="vshare-btn tt" data-go="tt">TikTok</button>' +
      '<button type="button" class="vshare-btn yt" data-go="yt">YouTube</button>' +
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
    if (!btn || btn._stShareImg) return;
    btn._stShareImg = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    }, true);
  }

  function bindVerseTap() {
    var textEl = document.getElementById('verse-text');
    if (!textEl || textEl._stShareImg) return;
    textEl._stShareImg = true;
    textEl.style.cursor = 'pointer';
    textEl.addEventListener('click', openSharePanel);
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

  function boot() {
    applyDeepLink();
    initDailyShare();
    bindBibleShare();
    bindVerseTap();
    setLabels();
    setTimeout(bindBibleShare, 400);
    setTimeout(bindBibleShare, 1200);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(setLabels, 150); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
