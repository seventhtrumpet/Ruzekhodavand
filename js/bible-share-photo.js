/* Share photo: wait until image is ready, show preview, then Save / Open app */
(function () {
  function isEn() {
    try { return (localStorage.getItem('cog_lang') || 'fa') === 'en'; } catch (e) { return false; }
  }
  function getLogo() {
    if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 100) return window.ST_LOGO;
    var img = document.querySelector('img.logo-img');
    return (img && img.src) || '';
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
      var f = selected[0];
      ref = (f.getAttribute('data-chapter') || '') + ':' + (f.getAttribute('data-verse') || '');
    }
    return { text: text, ref: ref };
  }
  function brand() { return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645'; }
  function loadImg(src) {
    return new Promise(function (res) {
      if (!src) return res(null);
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
  }
  function wrap(ctx, text, maxW) {
    var words = String(text || '').split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }
  function makeCanvas() {
    var p = versePayload();
    var W = 1080, H = 1350;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a2540'); g.addColorStop(1, '#123a5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(201,162,39,.9)'; ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    return loadImg(getLogo()).then(function (logo) {
      var cy = 280, r = 220;
      if (logo) {
        ctx.save();
        ctx.beginPath(); ctx.arc(W / 2, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(logo, W / 2 - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.beginPath(); ctx.arc(W / 2, cy, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 12; ctx.stroke();
      }
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '700 40px system-ui,Tahoma,sans-serif';
      ctx.fillText(brand(), W / 2, cy + r + 64);
      var verse = p.text || 'Seventh Trumpet';
      if (verse.length > 260) verse = verse.slice(0, 260) + '\u2026';
      ctx.fillStyle = '#f5f7fa';
      ctx.font = '500 42px system-ui,Tahoma,sans-serif';
      var lines = wrap(ctx, verse, W - 140);
      if (lines.length > 6) { lines = lines.slice(0, 6); lines[5] += '\u2026'; }
      var y = cy + r + 130;
      lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y + i * 54); });
      if (p.ref) {
        ctx.fillStyle = '#c9a227';
        ctx.font = '700 34px system-ui,Tahoma,sans-serif';
        ctx.fillText(p.ref, W / 2, y + lines.length * 54 + 36);
      }
      var barTop = H - 200;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(60, barTop, W - 120, 140);
      ctx.strokeStyle = 'rgba(201,162,39,0.95)';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, barTop, W - 120, 140);
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 34px system-ui,Tahoma,sans-serif';
      ctx.fillText('seventhtrumpet.org', W / 2, barTop + 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 36px system-ui,Tahoma,sans-serif';
      ctx.fillText('@seventhtrumpet.media', W / 2, barTop + 98);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '600 24px system-ui,Tahoma,sans-serif';
      ctx.fillText('https://seventhtrumpet.org', W / 2, barTop + 128);
      return c;
    });
  }

  function ensurePreviewCss() {
    if (document.getElementById('st-photo-css')) return;
    var st = document.createElement('style');
    st.id = 'st-photo-css';
    st.textContent =
      '.st-photo-overlay{position:fixed;inset:0;z-index:7000;background:rgba(8,16,28,0.72);display:flex;align-items:center;justify-content:center;padding:1rem}' +
      '.st-photo-card{width:100%;max-width:380px;background:#fff;border-radius:16px;padding:1rem;box-shadow:0 12px 40px rgba(0,0,0,.35);text-align:center}' +
      'body.dark .st-photo-card{background:#152536;color:#e8eef5}' +
      '.st-photo-title{font-weight:800;font-size:1.05rem;margin:0 0 0.75rem;color:#0a2540}' +
      'body.dark .st-photo-title{color:#9ec5ea}' +
      '.st-photo-status{font-size:0.9rem;color:#5b6b7c;margin:0.5rem 0 1rem;line-height:1.4}' +
      '.st-photo-spin{width:36px;height:36px;border:3px solid #d8dee6;border-top-color:#c9a227;border-radius:50%;margin:0.75rem auto;animation:stspin .8s linear infinite}' +
      '@keyframes stspin{to{transform:rotate(360deg)}}' +
      '.st-photo-preview{width:100%;max-height:50vh;object-fit:contain;border-radius:12px;background:#0a2540;margin:0.5rem 0 0.85rem}' +
      '.st-photo-actions{display:flex;flex-direction:column;gap:0.45rem}' +
      '.st-photo-actions button{border:none;border-radius:12px;padding:0.85rem 0.75rem;font-family:inherit;font-weight:800;font-size:0.95rem;cursor:pointer}' +
      '.st-photo-save{background:#c9a227;color:#0a2540}' +
      '.st-photo-open{background:#0a2540;color:#fff}' +
      '.st-photo-close{background:transparent;color:#6b7785;font-weight:600}';
    document.head.appendChild(st);
  }

  function closePreview() {
    var el = document.getElementById('st-photo-overlay');
    if (el) try { el.remove(); } catch (e) {}
  }

  function showLoading(app) {
    ensurePreviewCss();
    closePreview();
    var en = isEn();
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card" role="dialog" aria-live="polite">' +
      '<p class="st-photo-title">' + (en ? 'Preparing picture\u2026' : '\u062f\u0631 \u062d\u0627\u0644 \u0633\u0627\u062e\u062a \u0639\u06a9\u0633\u2026') + '</p>' +
      '<div class="st-photo-spin" aria-hidden="true"></div>' +
      '<p class="st-photo-status">' +
      (en
        ? 'Please wait. Do not close until the picture is ready.'
        : '\u0644\u0637\u0641\u0627\u064b \u0635\u0628\u0631 \u06a9\u0646\u06cc\u062f. \u062a\u0627 \u0639\u06a9\u0633 \u0622\u0645\u0627\u062f\u0647 \u0646\u0634\u062f\u0647\u060c \u0646\u0628\u0628\u0646\u062f.') +
      '</p>' +
      '</div>';
    document.body.appendChild(ov);
    return ov;
  }

  function showReady(dataUrl, blob, app) {
    ensurePreviewCss();
    closePreview();
    var en = isEn();
    var isFb = app === 'fb';
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card" role="dialog">' +
      '<p class="st-photo-title">' + (en ? 'Picture ready' : '\u0639\u06a9\u0633 \u0622\u0645\u0627\u062f\u0647 \u0627\u0633\u062a') + '</p>' +
      '<img class="st-photo-preview" alt="verse" src="' + dataUrl + '" />' +
      '<p class="st-photo-status">' +
      (en
        ? '1) Save the picture  2) Open the app  3) Add the photo'
        : '1) \u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633  2) \u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0628\u0631\u0646\u0627\u0645\u0647  3) \u0627\u0636\u0627\u0641\u0647 \u06a9\u0631\u062f\u0646 \u0639\u06a9\u0633') +
      '</p>' +
      '<div class="st-photo-actions">' +
      '<button type="button" class="st-photo-save" id="st-photo-save">' +
      (en ? 'Save picture' : '\u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633') +
      '</button>' +
      '<button type="button" class="st-photo-open" id="st-photo-open">' +
      (isFb
        ? (en ? 'Open Facebook' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0641\u06cc\u0633\u0628\u0648\u06a9')
        : (en ? 'Open Instagram' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645')) +
      '</button>' +
      '<button type="button" class="st-photo-close" id="st-photo-close">' +
      (en ? 'Done' : '\u062a\u0645\u0627\u0645') +
      '</button>' +
      '</div></div>';
    document.body.appendChild(ov);

    document.getElementById('st-photo-save').onclick = function () {
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'seventh-trumpet-verse.jpg';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { try { a.remove(); } catch (e) {} }, 500);
      if (blob && navigator.canShare) {
        try {
          var file = new File([blob], 'seventh-trumpet-verse.jpg', { type: 'image/jpeg' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: brand(), text: 'https://seventhtrumpet.org' }).catch(function () {});
          }
        } catch (e) {}
      }
    };
    document.getElementById('st-photo-open').onclick = function () {
      if (isFb) window.open('https://www.facebook.com/', '_blank', 'noopener');
      else window.open('https://www.instagram.com/seventhtrumpet.media', '_blank', 'noopener');
    };
    document.getElementById('st-photo-close').onclick = closePreview;
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closePreview();
    });
  }

  function showError() {
    ensurePreviewCss();
    closePreview();
    var en = isEn();
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card">' +
      '<p class="st-photo-title">' + (en ? 'Could not make picture' : '\u0639\u06a9\u0633 \u0633\u0627\u062e\u062a\u0647 \u0646\u0634\u062f') + '</p>' +
      '<button type="button" class="st-photo-close" id="st-photo-close">' + (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button>' +
      '</div>';
    document.body.appendChild(ov);
    document.getElementById('st-photo-close').onclick = closePreview;
  }

  window.ST_sharePhoto = function (openIg, app) {
    app = app || (openIg ? 'ig' : 'fb');
    showLoading(app);
    makeCanvas().then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('blob'));
          var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve({ blob: blob, dataUrl: dataUrl });
        }, 'image/jpeg', 0.92);
      });
    }).then(function (pack) {
      showReady(pack.dataUrl, pack.blob, app);
    }).catch(function () {
      showError();
    });
  };

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('[data-go="ig"],[data-go="fb"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var go = btn.getAttribute('data-go');
    var ov = document.getElementById('vshare-overlay');
    if (ov) try { ov.remove(); } catch (err) {}
    setTimeout(function () {
      window.ST_sharePhoto(go === 'ig', go);
    }, 40);
  }, true);
})();
