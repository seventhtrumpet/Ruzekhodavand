/* Share: big square profile + verse + website link on the picture */
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
    try {
      var href = location.href.split('#')[0];
      if (href && href.indexOf('http') === 0) return href;
    } catch (e) {}
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
    if (!text) {
      var main = document.querySelector('.angel-text, .daily-verse-text, #daily-verse .verse-body, article p');
      if (main) text = (main.textContent || '').trim().slice(0, 500);
    }
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }

  function buildMessage() {
    var p = versePayload();
    var url = sharePageUrl();
    var brand = isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
    var parts = [];
    if (p.ref) parts.push(p.ref);
    if (p.text) parts.push(p.text);
    parts.push(brand);
    parts.push(url);
    return parts.join('\n\n');
  }

  function getProfileImg(cb) {
    var tries = 0;
    function attempt() {
      try {
        if (window.ST_PE1 && window.ST_PE2 && window.ST_PE1.length > 100) {
          var img = new Image();
          img.onload = function () { cb(img); };
          img.onerror = function () { tryLp(); };
          img.src = 'data:image/jpeg;base64,' + window.ST_PE1 + window.ST_PE2;
          return;
        }
        tryLp();
      } catch (e) { tryLp(); }
      function tryLp() {
        try {
          if (window.ST_LP && window.ST_LP[0] && window.ST_LP[1]) {
            var img2 = new Image();
            img2.onload = function () { cb(img2); };
            img2.onerror = function () { next(); };
            img2.src = 'data:image/jpeg;base64,' + window.ST_LP[0] + window.ST_LP[1];
            return;
          }
        } catch (e2) {}
        next();
      }
      function next() {
        tries++;
        if (tries < 50) setTimeout(attempt, 80);
        else cb(null);
      }
    }
    attempt();
  }

  function wrapLines(ctx, text, maxW, maxLines) {
    var words = String(text || '').split(/\s+/);
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      var last = lines[lines.length - 1];
      if (last.length > 2) lines[lines.length - 1] = last.replace(/\s+\S*$/, '') + '\u2026';
    }
    return lines;
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

  function makeCardImage(done) {
    var p = versePayload();
    var en = isEn();
    var brand = en ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';

    getProfileImg(function (profile) {
      var w = 1080, h = 1920;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');

      var g0 = ctx.createLinearGradient(0, 0, 0, h);
      g0.addColorStop(0, '#0c2d4a');
      g0.addColorStop(1, '#061828');
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#c9a227';
      ctx.fillRect(0, 0, w, 16);

      var sq = 420;
      var sqX = (w - sq) / 2;
      var sqY = 120;
      if (profile) {
        ctx.save();
        roundRect(ctx, sqX, sqY, sq, sq, 28);
        ctx.clip();
        var scale = Math.max(sq / profile.width, sq / profile.height);
        var dw = profile.width * scale;
        var dh = profile.height * scale;
        ctx.drawImage(profile, sqX + (sq - dw) / 2, sqY + (sq - dh) / 2, dw, dh);
        ctx.restore();
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 8;
        roundRect(ctx, sqX, sqY, sq, sq, 28);
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(201,162,39,0.25)';
        roundRect(ctx, sqX, sqY, sq, sq, 28);
        ctx.fill();
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 8;
        roundRect(ctx, sqX, sqY, sq, sq, 28);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(brand, w / 2, sqY + sq + 55);

      var cardX = 55;
      var cardY = sqY + sq + 90;
      var cardW = w - 110;
      var cardH = 720;
      ctx.fillStyle = 'rgba(8, 28, 48, 0.78)';
      roundRect(ctx, cardX, cardY, cardW, cardH, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201,162,39,0.85)';
      ctx.lineWidth = 4;
      roundRect(ctx, cardX, cardY, cardW, cardH, 28);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 40px Inter, Vazirmatn, system-ui, sans-serif';
      var lines = wrapLines(ctx, p.text, cardW - 80, 11);
      var lineH = 52;
      var startY = cardY + 70;
      lines.forEach(function (ln, i) {
        ctx.fillText(ln, w / 2, startY + i * lineH);
      });

      if (p.ref) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '600 28px Inter, Vazirmatn, system-ui, sans-serif';
        ctx.fillText(p.ref, w / 2, cardY + cardH - 100);
      }

      var boxW = 520, boxH = 64;
      var boxX = (w - boxW) / 2;
      var boxY = cardY + cardH - 78;
      ctx.fillStyle = '#c9a227';
      roundRect(ctx, boxX, boxY, boxW, boxH, 18);
      ctx.fill();
      ctx.fillStyle = '#0a2540';
      ctx.font = '700 32px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText('seventhtrumpet.org', w / 2, boxY + 44);

      ctx.fillStyle = '#c9a227';
      ctx.fillRect(0, h - 16, w, 16);

      canvas.toBlob(function (blob) {
        done(blob, sharePageUrl(), brand);
      }, 'image/png');
    });
  }

  function doShare(app) {
    var msg = buildMessage();
    var pageUrl = sharePageUrl();

    makeCardImage(function (blob, url, brand) {
      if (!blob) {
        if (app === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        else if (app === 'tg') window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(msg), '_blank', 'noopener');
        return;
      }
      var file = new File([blob], 'seventh-trumpet.png', { type: 'image/png' });

      if (app === 'wa' || app === 'tg') {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: brand, text: url, url: url }).catch(function () {
            if (app === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
            else window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(msg), '_blank', 'noopener');
          });
        } else {
          if (app === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
          else window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(msg), '_blank', 'noopener');
        }
        return;
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: brand, text: url, url: url }).catch(function () {
          try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
          openSocial(app, pageUrl);
        });
      } else {
        try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
        openSocial(app, pageUrl);
      }
    });
  }

  function openSocial(app, pageUrl) {
    if (app === 'ig') window.open(SOCIAL.instagram, '_blank', 'noopener');
    else if (app === 'fb') window.open(SOCIAL.facebook + encodeURIComponent(pageUrl), '_blank', 'noopener');
    else if (app === 'tt') window.open(SOCIAL.tiktok, '_blank', 'noopener');
    else if (app === 'yt') window.open(SOCIAL.youtube, '_blank', 'noopener');
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
    var pageUrl = sharePageUrl();

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
          window.open(pageUrl, '_blank', 'noopener');
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
    if (!btn || btn._shareBound7) return;
    btn._shareBound7 = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    });
  }

  function bindVerseTap() {
    var textEl = document.getElementById('verse-text');
    if (!textEl || textEl._shareBound7) return;
    textEl._shareBound7 = true;
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
