/* Branded share card for every visitor — profile picture + verse + website ON the image. One tap. */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SITE_NAME_FA = '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  var SITE_NAME_EN = 'Seventh Trumpet';
  var PROFILE_URLS = [
    'https://iili.io/n8MSJBp.jpg',
    'https://iili.io/n8M8tYF.jpg'
  ];

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('fail')); };
      img.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + 't=1';
    });
  }

  function loadProfile() {
    var chain = Promise.reject();
    PROFILE_URLS.forEach(function (u) {
      chain = chain.catch(function () { return loadImage(u); });
    });
    return chain.catch(function () { return null; });
  }

  function wrapText(ctx, text, maxW) {
    var words = String(text || '').split(/\s+/);
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = words[i]; }
      else line = test;
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

  function drawCard(bgImg, opts) {
    opts = opts || {};
    var title = opts.title || (isEn() ? SITE_NAME_EN : SITE_NAME_FA);
    var body = opts.body || '';
    var ref = opts.ref || '';
    var en = isEn();
    var w = 1080, h = 1920;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    if (bgImg) {
      try {
        var scale = Math.max(w / bgImg.width, h / bgImg.height);
        var dw = bgImg.width * scale, dh = bgImg.height * scale;
        ctx.drawImage(bgImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
      } catch (e) { bgImg = null; }
    }
    if (!bgImg) {
      var g0 = ctx.createLinearGradient(0, 0, 0, h);
      g0.addColorStop(0, '#0a2540');
      g0.addColorStop(0.5, '#1a4a6c');
      g0.addColorStop(1, '#0a2540');
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);
    }

    var g1 = ctx.createLinearGradient(0, 0, 0, h);
    g1.addColorStop(0, 'rgba(8,18,32,0.4)');
    g1.addColorStop(1, 'rgba(8,18,32,0.78)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(0, 0, w, 10);

    var cardX = 60, cardY = h * 0.22, cardW = w - 120, cardH = h * 0.52;
    ctx.fillStyle = 'rgba(10,37,64,0.88)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 5;
    roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '700 34px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, cardY + 64);

    ctx.strokeStyle = 'rgba(201,162,39,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 90, cardY + 88);
    ctx.lineTo(w / 2 + 90, cardY + 88);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '500 42px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, body, cardW - 100);
    if (lines.length > 9) lines = lines.slice(0, 9).concat(['\u2026']);
    var lineH = 54;
    var startY = cardY + 140;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    var afterVerse = startY + lines.length * lineH + 28;
    if (ref) {
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 34px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText(String(ref), w / 2, afterVerse);
      afterVerse += 50;
    }

    // Website ON the picture — near verse (no caption needed)
    var btnW = Math.min(cardW - 80, 720);
    var btnH = 110;
    var btnX = (w - btnW) / 2;
    var btnY = Math.min(afterVerse + 16, cardY + cardH - btnH - 36);
    ctx.fillStyle = '#c9a227';
    roundRect(ctx, btnX, btnY, btnW, btnH, 20);
    ctx.fill();
    ctx.fillStyle = '#0a2540';
    ctx.font = '800 40px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, btnY + 48);
    ctx.font = '600 26px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(en ? 'seventhtrumpet.org' : 'seventhtrumpet.org', w / 2, btnY + 88);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, h - 150, w, 150);
    ctx.fillStyle = '#c9a227';
    ctx.font = '700 38px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, h - 78);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '500 26px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(en ? 'Three Angels Message' : '\u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647', w / 2, h - 40);

    return canvas;
  }

  function showEasyShare(canvas, opts) {
    opts = opts || {};
    var url = opts.url || SITE;
    var en = isEn();
    var dataUrl = canvas.toDataURL('image/png');
    var old = document.getElementById('st-card-preview');
    if (old) old.remove();

    if (!document.getElementById('st-card-preview-css')) {
      var st = document.createElement('style');
      st.id = 'st-card-preview-css';
      st.textContent =
        '#st-card-preview{position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;gap:0.7rem}' +
        '#st-card-preview img{max-width:min(92vw,340px);max-height:48vh;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.5)}' +
        '#st-card-preview .acts{display:flex;flex-direction:column;gap:0.55rem;width:min(92vw,340px)}' +
        '#st-card-preview button{font-family:inherit;font-weight:800;font-size:1.05rem;padding:0.95rem 1.1rem;border:none;border-radius:12px;cursor:pointer;width:100%}' +
        '#st-card-preview .share{background:#25D366;color:#fff}' +
        '#st-card-preview .save{background:#c9a227;color:#0a2540}' +
        '#st-card-preview .close{background:#fff;color:#333;font-size:0.95rem;font-weight:600}' +
        '#st-card-preview p{color:#fff;font-size:0.9rem;text-align:center;max-width:320px;margin:0;line-height:1.45}';
      document.head.appendChild(st);
    }

    var box = document.createElement('div');
    box.id = 'st-card-preview';
    box.innerHTML =
      '<img alt="" src="' + dataUrl + '">' +
      '<p>' + (en
        ? 'Your logo, verse, and website are already on this image. No caption needed.'
        : '\u0644\u0648\u06af\u0648\u060c \u0622\u06cc\u0647 \u0648 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0631\u0648\u06cc \u0639\u06a9\u0633 \u0647\u0633\u062a. \u0646\u06cc\u0627\u0632\u06cc \u0628\u0647 \u0646\u0648\u0634\u062a\u0646 \u06a9\u067e\u0634\u0646 \u0646\u06cc\u0633\u062a.') +
      '</p>' +
      '<div class="acts">' +
      '<button type="button" class="share" id="st-sh">' +
      (en ? 'Share now (WhatsApp, Instagram…)' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u06a9\u0646\u06cc\u062f (\u0648\u0627\u062a\u0633\u0627\u067e\u060c \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645\u2026)') +
      '</button>' +
      '<button type="button" class="save" id="st-sv">' +
      (en ? 'Save to phone' : '\u0630\u062e\u06cc\u0631\u0647 \u062f\u0631 \u06af\u0648\u0634\u06cc') +
      '</button>' +
      '<button type="button" class="close" id="st-cl">' +
      (en ? 'Close' : '\u0628\u0633\u062a\u0646') +
      '</button></div>';
    document.body.appendChild(box);

    function toBlob(cb) {
      canvas.toBlob(function (b) { cb(b); }, 'image/png');
    }

    document.getElementById('st-cl').onclick = function () { box.remove(); };

    document.getElementById('st-sv').onclick = function () {
      toBlob(function (blob) {
        if (!blob) return;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = opts.filename || 'seventh-trumpet.png';
        a.click();
      });
    };

    // Big green button: phone share sheet → WhatsApp / Instagram / etc.
    document.getElementById('st-sh').onclick = function () {
      toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], opts.filename || 'seventh-trumpet.png', { type: 'image/png' });
        // Prefer sharing the IMAGE only — branding is already on it (no caption required)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: opts.title || SITE_NAME_EN })
            .catch(function () {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = opts.filename || 'seventh-trumpet.png';
              a.click();
              alert(en
                ? 'Saved. Open WhatsApp or Instagram and choose this image from Gallery.'
                : '\u0630\u062e\u06cc\u0631\u0647 \u0634\u062f. \u0648\u0627\u062a\u0633\u0627\u067e \u06cc\u0627 \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645 \u0631\u0627 \u0628\u0627\u0632 \u06a9\u0646\u06cc\u062f \u0648 \u0627\u06cc\u0646 \u0639\u06a9\u0633 \u0631\u0627 \u0627\u0632 \u06af\u0627\u0644\u0631\u06cc \u0628\u06af\u06cc\u0631\u06cc\u062f.');
            });
        } else {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = opts.filename || 'seventh-trumpet.png';
          a.click();
          alert(en
            ? 'Saved to phone. Open WhatsApp or Instagram → pick this image. No caption needed.'
            : '\u0631\u0648\u06cc \u06af\u0648\u0634\u06cc \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f. \u0648\u0627\u062a\u0633\u0627\u067e \u06cc\u0627 \u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0631\u0627\u0645 \u2192 \u0627\u06cc\u0646 \u0639\u06a9\u0633. \u0646\u06cc\u0627\u0632\u06cc \u0628\u0647 \u06a9\u067e\u0634\u0646 \u0646\u06cc\u0633\u062a.');
        }
      });
    };
  }

  window.ST_shareBeautifulCard = function (opts) {
    opts = opts || {};
    loadProfile().then(function (img) {
      showEasyShare(drawCard(img, opts), opts);
    });
  };
  window.ST_SITE = SITE;
})();
