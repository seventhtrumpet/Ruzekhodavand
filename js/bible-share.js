/* Share: always send website link + profile picture preview.
   When someone taps the preview card/picture in chat → opens your website. */
(function () {
  var PROFILE_IMG = 'https://iili.io/n8MSJBp.jpg';
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

  /** Link that opens YOUR website (with verse when possible). Preview uses site profile picture. */
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
    // Home with share flag so preview still shows profile image
    return SITE + '/?from=share';
  }

  function applyDeepLink() {
    var params = getParams();
    if (!params) return;
    try {
      localStorage.setItem('cog_bible_state', JSON.stringify(params));
    } catch (e) {}
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

  function setLabels() {
    var en = isEn();
    var share = document.getElementById('mb-share');
    var copy = document.getElementById('mb-copy');
    var clear = document.getElementById('mb-clear');
    var daily = document.getElementById('daily-share');
    if (share) share.textContent = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
    if (copy) copy.textContent = en ? 'Copy' : '\u06a9\u067e\u06cc';
    if (clear) clear.textContent = en ? 'Clear' : '\u067e\u0627\u06a9';
    if (daily) daily.textContent = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('img')); };
      img.src = src;
    });
  }

  function wrapText(ctx, text, maxW) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
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

  function drawVerseCard(img, text, ref) {
    var w = 1080, h = 1920;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    if (img) {
      var scale = Math.max(w / img.width, h / img.height);
      var dw = img.width * scale;
      var dh = img.height * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a2540');
      g.addColorStop(1, '#0f1c2e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = 'rgba(8, 18, 32, 0.55)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(10, 37, 64, 0.72)';
    roundRect(ctx, 80, h * 0.28, w - 160, h * 0.42, 28);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    roundRect(ctx, 80, h * 0.28, w - 160, h * 0.42, 28);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '600 34px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645', w / 2, h * 0.28 + 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = '500 46px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, text, w - 240);
    if (lines.length > 12) lines = lines.slice(0, 12).concat(['\u2026']);
    var lineH = 64;
    var startY = h * 0.42 - (lines.length * lineH) / 2 + 40;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    ctx.fillStyle = '#c9a227';
    ctx.font = '700 38px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(String(ref || ''), w / 2, startY + lines.length * lineH + 70);

    // Always show site on the picture so people know where to go
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '600 32px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, h - 100);

    return canvas;
  }

  function versePayload() {
    var text = (document.getElementById('verse-text') || {}).textContent || '';
    var ref = (document.getElementById('verse-ref') || {}).textContent || '';
    var selected = document.querySelectorAll('.mb-verse.selected');
    if (selected.length) {
      var lines = [];
      selected.forEach(function (el) {
        lines.push((el.textContent || '').trim());
      });
      text = lines.join('\n');
      var first = selected[0];
      ref = (first.getAttribute('data-chapter') || '') + ':' + (first.getAttribute('data-verse') || '');
    }
    return { text: text, ref: ref };
  }

  /** Message for chats: verse + website link (link shows profile picture preview) */
  function shareMessage(text, ref, url) {
    var u = url || sharePageUrl();
    var parts = [];
    if (ref) parts.push(ref);
    if (text) parts.push(text);
    parts.push(u); // URL alone on last lines helps WhatsApp/Facebook show picture preview
    return parts.join('\n\n');
  }

  function openUrl(url) {
    window.open(url, '_blank', 'noopener');
  }

  function ensurePanelCss() {
    if (document.getElementById('verse-share-panel-css')) return;
    var st = document.createElement('style');
    st.id = 'verse-share-panel-css';
    st.textContent =
      '.vshare-overlay{position:fixed;inset:0;z-index:5000;background:rgba(8,16,28,0.55);display:flex;align-items:flex-end;justify-content:center;padding:0.75rem}' +
      '.vshare-panel{width:100%;max-width:420px;background:#fff;border-radius:16px 16px 12px 12px;padding:1.1rem 1rem 1.2rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .vshare-panel{background:#152536;color:#e8eef5}' +
      '.vshare-title{font-weight:800;font-size:1.05rem;margin:0 0 0.35rem;text-align:center;color:#0a2540}' +
      'body.dark .vshare-title{color:#9ec5ea}' +
      '.vshare-hint{font-size:0.85rem;text-align:center;color:#6b7785;margin:0 0 0.9rem;line-height:1.45}' +
      '.vshare-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.55rem}' +
      '.vshare-btn{display:flex;align-items:center;justify-content:center;gap:0.35rem;padding:0.75rem 0.5rem;border:none;border-radius:10px;font-family:inherit;font-weight:700;font-size:0.88rem;cursor:pointer;color:#fff}' +
      '.vshare-btn.wa{background:#25D366}' +
      '.vshare-btn.ig{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)}' +
      '.vshare-btn.fb{background:#1877F2}' +
      '.vshare-btn.tt{background:#111}' +
      '.vshare-btn.yt{background:#FF0000}' +
      '.vshare-btn.site{background:#0a2540;grid-column:1/-1}' +
      '.vshare-btn.img{background:#c9a227;color:#0a2540;grid-column:1/-1}' +
      '.vshare-close{display:block;width:100%;margin-top:0.75rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.9rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(st);
  }

  function openSharePanel() {
    ensurePanelCss();
    var old = document.getElementById('vshare-overlay');
    if (old) old.remove();

    var payload = versePayload();
    var text = payload.text;
    var ref = payload.ref;
    var pageUrl = sharePageUrl();
    var msg = shareMessage(text, ref, pageUrl);
    var en = isEn();

    var overlay = document.createElement('div');
    overlay.id = 'vshare-overlay';
    overlay.className = 'vshare-overlay';
    overlay.innerHTML =
      '<div class="vshare-panel" role="dialog">' +
      '<p class="vshare-title">' + (en ? 'Share this verse' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0622\u06cc\u0647') + '</p>' +
      '<p class="vshare-hint">' +
      (en
        ? 'Friends see your profile picture. When they tap it, your website opens.'
        : '\u062f\u0648\u0633\u062a\u0627\u0646 \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0634\u0645\u0627 \u0631\u0627 \u0645\u06cc\u200c\u0628\u06cc\u0646\u0646\u062f. \u0628\u0627 \u0644\u0645\u0633 \u06a9\u0631\u062f\u0646\u060c \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0628\u0627\u0632 \u0645\u06cc\u200c\u0634\u0648\u062f.') +
      '</p>' +
      '<div class="vshare-grid">' +
      '<button type="button" class="vshare-btn wa" data-go="wa">WhatsApp</button>' +
      '<button type="button" class="vshare-btn ig" data-go="ig">Instagram</button>' +
      '<button type="button" class="vshare-btn fb" data-go="fb">Facebook</button>' +
      '<button type="button" class="vshare-btn tt" data-go="tt">TikTok</button>' +
      '<button type="button" class="vshare-btn yt" data-go="yt">YouTube</button>' +
      '<button type="button" class="vshare-btn site" data-go="site">' + (en ? 'Open our website' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0648\u0628\u200c\u0633\u0627\u06a9') + '</button>' +
      '<button type="button" class="vshare-btn img" data-go="img">' + (en ? 'Save picture (Status / Story)' : '\u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633 (\u0627\u0633\u062a\u0648\u0631\u06cc)') + '</button>' +
      '</div>' +
      '<button type="button" class="vshare-close" id="vshare-close">' + (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button>' +
      '</div>';

    // fix typo in FA site button if any
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    document.getElementById('vshare-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    overlay.querySelectorAll('[data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var go = btn.getAttribute('data-go');
        if (go === 'wa') {
          // WhatsApp chat: link preview = profile picture; tap preview → website
          openUrl('https://wa.me/?text=' + encodeURIComponent(msg));
        } else if (go === 'ig') {
          try {
            if (navigator.clipboard) navigator.clipboard.writeText(msg);
          } catch (e) {}
          openUrl(SOCIAL.instagram);
        } else if (go === 'fb') {
          // Facebook shows site image; tap opens website
          openUrl('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl));
        } else if (go === 'tt') {
          try {
            if (navigator.clipboard) navigator.clipboard.writeText(msg);
          } catch (e) {}
          openUrl(SOCIAL.tiktok);
        } else if (go === 'yt') {
          openUrl(SOCIAL.youtube);
        } else if (go === 'site') {
          openUrl(pageUrl);
        } else if (go === 'img') {
          saveVerseImage(text, ref, pageUrl);
        }
        if (go !== 'img') setTimeout(close, 400);
      });
    });
  }

  function saveVerseImage(text, ref, pageUrl) {
    function finish(canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], 'seventh-trumpet-verse.png', { type: 'image/png' });
        var data = {
          files: [file],
          title: ref || (isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645'),
          text: shareMessage(text, ref, pageUrl),
          url: pageUrl || SITE
        };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share(data).catch(function () { downloadBlob(blob); });
        } else if (navigator.share) {
          navigator.share({ title: data.title, text: data.text, url: data.url }).catch(function () { downloadBlob(blob); });
        } else {
          downloadBlob(blob);
        }
      }, 'image/png');
    }
    function downloadBlob(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'seventh-trumpet-verse.png';
      a.click();
    }
    loadImage(PROFILE_IMG)
      .then(function (img) { finish(drawVerseCard(img, text, ref)); })
      .catch(function () { finish(drawVerseCard(null, text, ref)); });
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
    btn.textContent = isEn() ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
    btn.onclick = function (e) {
      e.preventDefault();
      openSharePanel();
    };
  }

  function bindBibleShare() {
    var btn = document.getElementById('mb-share');
    if (!btn || btn._vshareBound) return;
    btn._vshareBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSharePanel();
    });
  }

  function bindVerseTap() {
    var section = document.getElementById('daily-verse');
    if (!section || section._vshareTap) return;
    section._vshareTap = true;
    var textEl = document.getElementById('verse-text');
    if (textEl) {
      textEl.style.cursor = 'pointer';
      textEl.addEventListener('click', function () { openSharePanel(); });
    }
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
    if (lt) lt.addEventListener('click', function () {
      setTimeout(setLabels, 100);
      setTimeout(setLabels, 400);
    });
    window.addEventListener('cog-lang-changed', setLabels);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
