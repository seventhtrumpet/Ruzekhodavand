/* Share: WhatsApp/Telegram + nice picture with logo watermark + website link */
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

  function getLogoImg(cb) {
    var tries = 0;
    function attempt() {
      try {
        if (window.ST_LP && window.ST_LP[0] && window.ST_LP[1]) {
          var img = new Image();
          img.onload = function () { cb(img); };
          img.onerror = function () { cb(null); };
          img.src = 'data:image/jpeg;base64,' + window.ST_LP[0] + window.ST_LP[1];
          return;
        }
        if (window.ST_PE1 && window.ST_PE2 && window.ST_PE1.length > 100) {
          var img2 = new Image();
          img2.onload = function () { cb(img2); };
          img2.onerror = function () { cb(null); };
          img2.src = 'data:image/jpeg;base64,' + window.ST_PE1 + window.ST_PE2;
          return;
        }
      } catch (e) {}
      tries++;
      if (tries < 40) setTimeout(attempt, 80);
      else cb(null);
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

  function makeShareImage(done) {
    var p = versePayload();
    var url = sharePageUrl();
    var en = isEn();
    var brand = en ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';

    getLogoImg(function (logo) {
      var w = 1080, h = 1080;
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');

      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0c2d4a');
      g.addColorStop(0.55, '#0a2540');
      g.addColorStop(1, '#061828');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#c9a227';
      ctx.fillRect(0, 0, w, 10);
      ctx.fillRect(0, h - 10, w, 10);

      ctx.strokeStyle = 'rgba(201,162,39,0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, w - 72, h - 72);

      if (logo) {
        var s = 100;
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.arc(w - 70, 90, s / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fill();
        ctx.drawImage(logo, w - 70 - s / 2, 90 - s / 2, s, s);
        ctx.restore();
      }

      ctx.fillStyle = '#c9a227';
      ctx.font = '700 34px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(brand, w / 2, 100);

      ctx.strokeStyle = 'rgba(201,162,39,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 80, 122);
      ctx.lineTo(w / 2 + 80, 122);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '500 42px Inter, Vazirmatn, system-ui, sans-serif';
      var lines = wrapLines(ctx, p.text, w - 140, 9);
      var lineH = 54;
      var blockH = lines.length * lineH;
      var startY = (h - blockH) / 2 - 20;
      if (startY < 180) startY = 180;
      lines.forEach(function (ln, i) {
        ctx.fillText(ln, w / 2, startY + i * lineH);
      });

      if (p.ref) {
        ctx.fillStyle = 'rgba(255,255,255,0.78)';
        ctx.font = '600 28px Inter, Vazirmatn, system-ui, sans-serif';
        ctx.fillText(p.ref, w / 2, startY + lines.length * lineH + 48);
      }

      var boxW = 480, boxH = 56;
      var boxX = (w - boxW) / 2;
      var boxY = h - 130;
      ctx.fillStyle = '#c9a227';
      roundRect(ctx, boxX, boxY, boxW, boxH, 14);
      ctx.fill();
      ctx.fillStyle = '#0a2540';
      ctx.font = '700 30px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText('seventhtrumpet.org', w / 2, boxY + 38);

      canvas.toBlob(function (blob) {
        done(blob, url, brand);
      }, 'image/png');
    });
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

  function sharePicture() {
    makeShareImage(function (blob, url, brand) {
      if (!blob) return;
      var file = new File([blob], 'seventh-trumpet.png', { type: 'image/png' });
      var data = { files: [file], title: brand, text: url, url: url };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share(data).catch(function () {
          downloadBlob(blob);
        });
      } else {
        downloadBlob(blob);
      }
    });
  }

  function downloadBlob(blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'seventh-trumpet.png';
    a.click();
  }

  function ensureCss() {
    if (document.getElementById('vshare-icons-css')) return;
    var st = document.createElement('style');
    st.id = 'vshare-icons-css';
    st.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5000;background:rgba(8,16,28,0.55);display:flex;align-items:flex-end;justify-content:center;padding:0.75rem}' +
      '.vshare-panel{width:100%;max-width:420px;background:#fff;border-radius:16px;padding:1.1rem 1rem 1rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1.1rem;margin:0 0 0.25rem;text-align:center;color:#0a2540}' +
      'body.dark .vshare-title{color:#9ec5ea}' +
      '.vshare-hint{font-size:0.8rem;text-align:center;color:#6b7785;margin:0 0 0.85rem;line-height:1.4}' +
      '.vshare-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.5rem}' +
      '.vshare-btn{display:flex;align-items:center;justify-content:center;gap:0.35rem;padding:0.85rem 0.4rem;border:none;border-radius:12px;font-family:inherit;font-weight:800;font-size:0.9rem;cursor:pointer;color:#fff}' +
      '.vshare-btn.pic{background:#c9a227;color:#0a2540;grid-column:1/-1;font-size:0.95rem;padding:1rem}' +
      '.vshare-btn.wa{background:#25D366}' +
      '.vshare-btn.tg{background:#0088cc}' +
      '.vshare-btn.ig{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.fb{background:#1877F2}' +
      '.vshare-btn.tt{background:#111}' +
      '.vshare-btn.yt{background:#FF0000}' +
      '.vshare-btn.copy{background:#555}' +
      '.vshare-btn.site{background:#0a2540;grid-column:1/-1}' +
      '.vshare-close{display:block;width:100%;margin-top:0.6rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.95rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
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
      '<p class="vshare-title">' + (en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9') + '</p>' +
      '<p class="vshare-hint">' +
      (en
        ? 'Picture includes logo + seventhtrumpet.org link.'
        : '\u0639\u06a9\u0633 \u0628\u0627 \u0644\u0648\u06af\u0648 + \u0644\u06cc\u0646\u06a9 seventhtrumpet.org') +
      '</p>' +
      '<div class="vshare-grid">' +
      '<button type="button" class="vshare-btn pic" data-go="pic">' +
      (en ? 'Share picture (logo + link)' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 (\u0644\u0648\u06af\u0648 + \u0644\u06cc\u0646\u06a9)') +
      '</button>' +
      '<button type="button" class="vshare-btn wa" data-go="wa">WhatsApp</button>' +
      '<button type="button" class="vshare-btn tg" data-go="tg">Telegram</button>' +
      '<button type="button" class="vshare-btn copy" data-go="copy">' + (en ? 'Copy link' : '\u06a9\u067e\u06cc \u0644\u06cc\u0646\u06a9') + '</button>' +
      '<button type="button" class="vshare-btn ig" data-go="ig">Instagram</button>' +
      '<button type="button" class="vshare-btn fb" data-go="fb">Facebook</button>' +
      '<button type="button" class="vshare-btn tt" data-go="tt">TikTok</button>' +
      '<button type="button" class="vshare-btn yt" data-go="yt">YouTube</button>' +
      '<button type="button" class="vshare-btn site" data-go="site">' +
      (en ? 'Open website' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a') +
      '</button>' +
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
          setTimeout(sharePicture, 120);
          return;
        }
        if (go === 'wa') {
          window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        } else if (go === 'tg') {
          window.open(SOCIAL.telegram + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(msg), '_blank', 'noopener');
        } else if (go === 'copy') {
          try {
            if (navigator.clipboard) navigator.clipboard.writeText(msg);
            alert(en ? 'Copied' : '\u06a9\u067e\u06cc \u0634\u062f');
          } catch (e) {
            prompt(en ? 'Copy:' : '\u06a9\u067e\u06cc:', msg);
          }
        } else if (go === 'ig') {
          try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
          window.open(SOCIAL.instagram, '_blank', 'noopener');
        } else if (go === 'fb') {
          window.open(SOCIAL.facebook + encodeURIComponent(pageUrl), '_blank', 'noopener');
        } else if (go === 'tt') {
          try { if (navigator.clipboard) navigator.clipboard.writeText(msg); } catch (e) {}
          window.open(SOCIAL.tiktok, '_blank', 'noopener');
        } else if (go === 'yt') {
          window.open(SOCIAL.youtube, '_blank', 'noopener');
        } else if (go === 'site') {
          window.open(pageUrl, '_blank', 'noopener');
        }
        setTimeout(close, 250);
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
    if (!btn || btn._shareBound5) return;
    btn._shareBound5 = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    });
  }

  function bindVerseTap() {
    var textEl = document.getElementById('verse-text');
    if (!textEl || textEl._shareBound5) return;
    textEl._shareBound5 = true;
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
