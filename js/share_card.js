/* Share card with profile picture BACKGROUND (CORS-safe image URLs) */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SITE_NAME_FA = '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  var SITE_NAME_EN = 'Seventh Trumpet';
  /* CORS-friendly proxies so canvas can use the photo as background */
  var PROFILE_URLS = [
    'https://images.weserv.nl/?url=iili.io/n8MSJBp.jpg&w=900&output=jpg',
    'https://images.weserv.nl/?url=iili.io/n8M8tYF.jpg&w=900&output=jpg',
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@main/media/share-bg.jpg',
    'https://iili.io/n8MSJBp.jpg'
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
      img.src = src;
    });
  }

  function loadProfile() {
    var i = 0;
    function next() {
      if (i >= PROFILE_URLS.length) return Promise.resolve(null);
      var src = PROFILE_URLS[i++];
      return loadImage(src).catch(function () { return next(); });
    }
    return next();
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

    // BACKGROUND PICTURE
    if (bgImg) {
      try {
        var scale = Math.max(w / bgImg.width, h / bgImg.height);
        var dw = bgImg.width * scale, dh = bgImg.height * scale;
        ctx.drawImage(bgImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
      } catch (e) {
        bgImg = null;
      }
    }
    if (!bgImg) {
      var g0 = ctx.createLinearGradient(0, 0, 0, h);
      g0.addColorStop(0, '#0a2540');
      g0.addColorStop(0.5, '#1a4a6c');
      g0.addColorStop(1, '#0a2540');
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);
    }

    // Light overlay so photo still shows
    var g1 = ctx.createLinearGradient(0, 0, 0, h);
    g1.addColorStop(0, 'rgba(8,18,32,0.2)');
    g1.addColorStop(0.4, 'rgba(8,18,32,0.3)');
    g1.addColorStop(1, 'rgba(8,18,32,0.65)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#c9a227';
    ctx.fillRect(0, 0, w, 10);

    var cardX = 60, cardY = h * 0.2, cardW = w - 120, cardH = h * 0.55;
    ctx.fillStyle = 'rgba(10,37,64,0.78)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 5;
    roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '700 34px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, cardY + 60);

    ctx.strokeStyle = 'rgba(201,162,39,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 90, cardY + 82);
    ctx.lineTo(w / 2 + 90, cardY + 82);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '500 42px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, body, cardW - 100);
    if (lines.length > 8) lines = lines.slice(0, 8).concat(['\u2026']);
    var lineH = 54;
    var startY = cardY + 130;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    var after = startY + lines.length * lineH + 24;
    if (ref) {
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 34px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText(String(ref), w / 2, after);
      after += 48;
    }

    // Website name written on the picture under the verse
    var btnW = Math.min(cardW - 70, 760);
    var btnH = 120;
    var btnX = (w - btnW) / 2;
    var btnY = Math.min(after + 20, cardY + cardH - btnH - 30);
    ctx.fillStyle = '#c9a227';
    roundRect(ctx, btnX, btnY, btnW, btnH, 22);
    ctx.fill();
    ctx.fillStyle = '#0a2540';
    ctx.font = '800 44px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, btnY + 52);
    ctx.font = '700 28px Inter, system-ui, sans-serif';
    ctx.fillText('www.seventhtrumpet.org', w / 2, btnY + 95);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, h - 160, w, 160);
    ctx.fillStyle = '#c9a227';
    ctx.font = '800 42px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, h - 85);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 28px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(en ? 'Seventh Trumpet' : SITE_NAME_FA, w / 2, h - 40);

    return canvas;
  }

  function showPreview(canvas, opts) {
    opts = opts || {};
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
        '#st-card-preview .acts{display:flex;flex-direction:column;gap:0.5rem;width:min(92vw,340px)}' +
        '#st-card-preview button{font-family:inherit;font-weight:800;font-size:1rem;padding:0.9rem 1rem;border:none;border-radius:12px;cursor:pointer;width:100%}' +
        '#st-card-preview .share{background:#25D366;color:#fff}' +
        '#st-card-preview .save{background:#c9a227;color:#0a2540}' +
        '#st-card-preview .close{background:#fff;color:#333;font-weight:600}' +
        '#st-card-preview p{color:#fff;font-size:0.88rem;text-align:center;max-width:320px;margin:0;line-height:1.45}';
      document.head.appendChild(st);
    }

    var box = document.createElement('div');
    box.id = 'st-card-preview';
    box.innerHTML =
      '<img alt="" src="' + dataUrl + '">' +
      '<p>' + (en
        ? 'Background photo + verse + website name on the image.'
        : '\u0639\u06a9\u0633 \u067e\u0633\u200c\u0632\u0645\u06cc\u0646\u0647 + \u0622\u06cc\u0647 + \u0646\u0627\u0645 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0631\u0648\u06cc \u0639\u06a9\u0633.') +
      '</p>' +
      '<div class="acts">' +
      '<button type="button" class="share" id="st-sh">' + (en ? 'Share this picture' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0627\u06cc\u0646 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="save" id="st-sv">' + (en ? 'Save picture' : '\u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="close" id="st-cl">' + (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button></div>';
    document.body.appendChild(box);

    function toBlob(cb) {
      try {
        canvas.toBlob(function (b) { cb(b); }, 'image/png');
      } catch (e) {
        alert(en ? 'Could not create picture' : '\u0639\u06a9\u0633 \u0633\u0627\u062e\u062a\u0647 \u0646\u0634\u062f');
      }
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
    document.getElementById('st-sh').onclick = function () {
      toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], opts.filename || 'seventh-trumpet.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: opts.title || SITE_NAME_EN }).catch(function () {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = opts.filename || 'seventh-trumpet.png';
            a.click();
          });
        } else {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = opts.filename || 'seventh-trumpet.png';
          a.click();
        }
      });
    };
  }

  window.ST_shareBeautifulCard = function (opts) {
    opts = opts || {};
    loadProfile().then(function (img) {
      showPreview(drawCard(img, opts), opts);
    });
  };
  window.ST_SITE = SITE;
})();
