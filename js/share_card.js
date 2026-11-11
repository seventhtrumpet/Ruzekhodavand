/* Beautiful share cards — always use website profile picture as background */
(function () {
  var PROFILE_IMG = 'https://iili.io/n8MSJBp.jpg';
  var SITE = 'https://seventhtrumpet.org';
  var SITE_NAME_FA = '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  var SITE_NAME_EN = 'Seventh Trumpet';

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

  /** Story-size card (1080x1920) with profile photo background + text */
  function drawStoryCard(bgImg, opts) {
    opts = opts || {};
    var title = opts.title || (isEn() ? SITE_NAME_EN : SITE_NAME_FA);
    var body = opts.body || '';
    var ref = opts.ref || '';
    var footer = opts.footer || 'seventhtrumpet.org';

    var w = 1080, h = 1920;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    // Background: profile / website picture (full cover)
    if (bgImg) {
      var scale = Math.max(w / bgImg.width, h / bgImg.height);
      var dw = bgImg.width * scale;
      var dh = bgImg.height * scale;
      ctx.drawImage(bgImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      var g0 = ctx.createLinearGradient(0, 0, 0, h);
      g0.addColorStop(0, '#0a2540');
      g0.addColorStop(1, '#1a3a5c');
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);
    }

    // Soft cinematic overlays
    var g1 = ctx.createLinearGradient(0, 0, 0, h);
    g1.addColorStop(0, 'rgba(8,18,32,0.35)');
    g1.addColorStop(0.45, 'rgba(8,18,32,0.45)');
    g1.addColorStop(1, 'rgba(8,18,32,0.75)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // Gold accent line top
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(0, 0, w, 8);

    // Glass card in center
    var cardX = 70, cardY = h * 0.26, cardW = w - 140, cardH = h * 0.44;
    ctx.fillStyle = 'rgba(10, 37, 64, 0.78)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,162,39,0.95)';
    ctx.lineWidth = 4;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.stroke();

    // Site name
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, cardY + 72);

    // Gold divider
    ctx.strokeStyle = 'rgba(201,162,39,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 80, cardY + 95);
    ctx.lineTo(w / 2 + 80, cardY + 95);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 44px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, body, cardW - 80);
    if (lines.length > 11) lines = lines.slice(0, 11).concat(['\u2026']);
    var lineH = 58;
    var textBlockH = lines.length * lineH;
    var startY = cardY + cardH / 2 - textBlockH / 2 + 40;
    if (startY < cardY + 120) startY = cardY + 120;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    // Reference
    if (ref) {
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText(String(ref), w / 2, Math.min(startY + lines.length * lineH + 56, cardY + cardH - 40));
    }

    // Bottom brand bar
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, h - 160, w, 160);
    ctx.fillStyle = '#c9a227';
    ctx.font = '700 34px Inter, system-ui, sans-serif';
    ctx.fillText(footer, w / 2, h - 90);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '500 28px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(isEn() ? 'Three Angels Message \u00b7 Revelation 14' : '\u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647 \u00b7 \u0645\u06a9\u0627\u0634\u0641\u0647 \u06f1\u06f4', w / 2, h - 48);

    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
    });
  }

  /**
   * Build a beautiful share image (profile background) and share or download it.
   * opts: { title, body, ref, url, filename }
   */
  window.ST_shareBeautifulCard = function (opts) {
    opts = opts || {};
    var url = opts.url || SITE;
    var filename = opts.filename || 'seventh-trumpet.png';
    var textForShare = [opts.ref, opts.body, url].filter(Boolean).join('\n\n');

    function finish(canvas) {
      canvasToBlob(canvas).then(function (blob) {
        if (!blob) return;
        var file = new File([blob], filename, { type: 'image/png' });
        var payload = {
          files: [file],
          title: opts.title || (isEn() ? SITE_NAME_EN : SITE_NAME_FA),
          text: textForShare,
          url: url
        };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share(payload).catch(function () { download(blob, filename); });
        } else if (navigator.share) {
          navigator.share({ title: payload.title, text: payload.text, url: url })
            .catch(function () { download(blob, filename); });
        } else {
          download(blob, filename);
        }
      });
    }

    function download(blob, name) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
    }

    loadImage(PROFILE_IMG)
      .then(function (img) { finish(drawStoryCard(img, opts)); })
      .catch(function () { finish(drawStoryCard(null, opts)); });
  };

  window.ST_PROFILE_IMG = PROFILE_IMG;
  window.ST_SITE = SITE;
  window.ST_drawStoryCard = drawStoryCard;
  window.ST_loadProfileImg = function () { return loadImage(PROFILE_IMG); };
})();
