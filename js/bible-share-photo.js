/* Site-wide share photo: logo, verse, preview; share file + tappable link */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var W = 1080, H = 1350;

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }
  function brand() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }
  function siteUrl() {
    return SITE + '/';
  }

  function versePayload(payload) {
    if (payload && (payload.text || payload.ref)) {
      return { text: (payload.text || '').trim(), ref: (payload.ref || '').trim() };
    }
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
    return { text: (text || '').trim(), ref: (ref || '').trim() };
  }

  function wrapText(ctx, text, maxWidth) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? (line + ' ' + words[i]) : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  var logoImg = null;
  var logoPromise = null;
  function preloadLogo() {
    if (logoImg && logoImg.complete) return Promise.resolve(logoImg);
    if (logoPromise) return logoPromise;
    logoPromise = new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { logoImg = img; resolve(img); };
      img.onerror = function () { resolve(null); };
      try {
        if (window.ST_LOGO) img.src = window.ST_LOGO;
        else img.src = SITE + '/logo.png';
      } catch (e) { resolve(null); }
    });
    return logoPromise;
  }

  function makeCanvas(payload) {
    return preloadLogo().then(function (logo) {
      var p = versePayload(payload);
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a2540');
      g.addColorStop(1, '#163a5f');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var cx = W / 2, cy = 220, r = 110;
      if (logo) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logo, cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      var y = 420;
      if (p.ref) {
        ctx.font = '700 42px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle = '#c9a227';
        ctx.fillText(p.ref, W / 2, y);
        y += 70;
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 40px Vazirmatn, Tahoma, sans-serif';
      var lines = wrapText(ctx, p.text || brand(), W - 120);
      for (var i = 0; i < lines.length && i < 14; i++) {
        ctx.fillText(lines[i], W / 2, y);
        y += 54;
      }

      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, H - 160, W, 160);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 34px Vazirmatn, Tahoma, sans-serif';
      ctx.fillText('@seventhtrumpet.media', W / 2, H - 90);
      ctx.font = '500 28px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#9ec5ea';
      ctx.fillText(siteUrl().replace('https://', ''), W / 2, H - 45);
      return canvas;
    });
  }

  function ensureCss() {
    if (document.getElementById('st-photo-css')) return;
    var st = document.createElement('style');
    st.id = 'st-photo-css';
    st.textContent =
      '.st-photo-overlay{position:fixed;inset:0;z-index:5500;background:rgba(8,16,28,0.6);display:flex;align-items:center;justify-content:center;padding:1rem}' +
      '.st-photo-card{background:#fff;border-radius:16px;padding:1rem;max-width:360px;width:100%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.3)}' +
      'body.dark .st-photo-card{background:#152536;color:#e8eef5}' +
      '.st-photo-title{font-weight:800;margin:0 0 0.75rem;color:#0a2540}' +
      'body.dark .st-photo-title{color:#9ec5ea}' +
      '.st-photo-preview{width:100%;border-radius:12px;margin-bottom:0.75rem}' +
      '.st-photo-hint{font-size:0.78rem;color:#6b7785;margin:0 0 0.75rem;line-height:1.4}' +
      '.st-photo-actions{display:flex;flex-direction:column;gap:0.4rem}' +
      '.st-photo-save,.st-photo-open{border:none;border-radius:10px;padding:0.75rem;font-weight:800;font-family:inherit;cursor:pointer;color:#fff;background:#0a2540}' +
      '.st-photo-open{background:#1877F2}' +
      '.st-photo-close{border:none;background:transparent;color:#6b7785;font-weight:600;padding:0.5rem;font-family:inherit;cursor:pointer}';
    document.head.appendChild(st);
  }

  function closePreview() {
    var ov = document.getElementById('st-photo-overlay');
    if (ov) try { ov.remove(); } catch (e) {}
  }

  function showLoading() {
    ensureCss();
    closePreview();
    var en = isEn();
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card"><p class="st-photo-title">' +
      (en ? 'Making picture\u2026' : '\u062f\u0631 \u062d\u0627\u0644 \u0633\u0627\u062e\u062a \u0639\u06a9\u0633\u2026') +
      '</p></div>';
    document.body.appendChild(ov);
  }

  function showReady(dataUrl, blob, app, payload) {
    ensureCss();
    closePreview();
    var en = isEn();
    var isFb = app === 'fb';
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card">' +
      '<p class="st-photo-title">' + (en ? 'Ready' : '\u0622\u0645\u0627\u062f\u0647') + '</p>' +
      '<img class="st-photo-preview" alt="share" src="' + dataUrl + '" />' +
      '<p class="st-photo-hint">' +
      (en
        ? 'Share sends the photo + verse + a real tappable website link.'
        : '\u0627\u0634\u062a\u0631\u0627\u06a9: \u0639\u06a9\u0633 + \u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9 \u0642\u0627\u0628\u0644\u0650 \u0644\u0645\u0633.') +
      '</p>' +
      '<div class="st-photo-actions">' +
      '<button type="button" class="st-photo-save" id="st-photo-share">' +
      (en ? 'Share photo + link' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 + \u0644\u06cc\u0646\u06a9') + '</button>' +
      '<button type="button" class="st-photo-save" id="st-photo-save">' +
      (en ? 'Save picture' : '\u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="st-photo-open" id="st-photo-open">' +
      (isFb
        ? (en ? 'Open Facebook' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0641\u06cc\u0633\u0628\u0648\u06a9')
        : (en ? 'Open Instagram' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645')) +
      '</button>' +
      '<button type="button" class="st-photo-close" id="st-photo-close">' +
      (en ? 'Done' : '\u062a\u0645\u0627\u0645') + '</button>' +
      '</div></div>';
    document.body.appendChild(ov);

    function doFileShare() {
      if (!(blob && navigator.canShare)) return false;
      try {
        var file = new File([blob], 'seventh-trumpet-share.jpg', { type: 'image/jpeg' });
        if (!navigator.canShare({ files: [file] })) return false;
        var p = payload || {};
        var text = '';
        if (p.text) text += p.text + '\n\n';
        if (p.ref) text += p.ref + '\n';
        text += (p.url || siteUrl());
        navigator.share({
          files: [file],
          title: p.title || brand(),
          text: text,
          url: p.url || siteUrl()
        }).catch(function () {});
        return true;
      } catch (e) {
        return false;
      }
    }

    var shareBtn = document.getElementById('st-photo-share');
    if (shareBtn) shareBtn.onclick = function () {
      if (!doFileShare()) document.getElementById('st-photo-save').click();
    };

    document.getElementById('st-photo-save').onclick = function () {
      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'seventh-trumpet-share.jpg';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { try { a.remove(); } catch (e) {} }, 400);
      doFileShare();
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
    ensureCss();
    closePreview();
    var en = isEn();
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card">' +
      '<p class="st-photo-title">' + (en ? 'Could not make picture' : '\u0639\u06a9\u0633 \u0633\u0627\u062e\u062a\u0647 \u0646\u0634\u062f') + '</p>' +
      '<button type="button" class="st-photo-close" id="st-photo-close">' +
      (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button></div>';
    document.body.appendChild(ov);
    document.getElementById('st-photo-close').onclick = closePreview;
  }

  window.ST_sharePhoto = function (openIg, app, payload) {
    app = app || (openIg ? 'ig' : 'fb');
    showLoading();
    makeCanvas(payload || null).then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('blob'));
          resolve({ blob: blob, dataUrl: canvas.toDataURL('image/jpeg', 0.92) });
        }, 'image/jpeg', 0.92);
      });
    }).then(function (pack) {
      showReady(pack.dataUrl, pack.blob, app, payload || null);
    }).catch(function () {
      showError();
    });
  };

  window.ST_shareWithPhoto = function (text, ref, app) {
    window.ST_sharePhoto(app === 'ig', app || 'ig', { text: text || '', ref: ref || '' });
  };
})();
