/* Share always creates a real picture — preview + Save / Share */
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
    var w = 1080, h = 1920;
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
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
      g0.addColorStop(0, '#0a2540'); g0.addColorStop(0.5, '#1a4a6c'); g0.addColorStop(1, '#0a2540');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, w, h);
      var g2 = ctx.createRadialGradient(w/2, h*0.28, 10, w/2, h*0.28, 520);
      g2.addColorStop(0, 'rgba(201,162,39,0.28)'); g2.addColorStop(1, 'rgba(201,162,39,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
    }

    var g1 = ctx.createLinearGradient(0, 0, 0, h);
    g1.addColorStop(0, 'rgba(8,18,32,0.42)'); g1.addColorStop(1, 'rgba(8,18,32,0.8)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c9a227'; ctx.fillRect(0, 0, w, 10);

    var cardX = 70, cardY = h * 0.26, cardW = w - 140, cardH = h * 0.44;
    ctx.fillStyle = 'rgba(10,37,64,0.84)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 32); ctx.fill();
    ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 4;
    roundRect(ctx, cardX, cardY, cardW, cardH, 32); ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, cardY + 72);

    ctx.strokeStyle = 'rgba(201,162,39,0.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w/2-80, cardY+95); ctx.lineTo(w/2+80, cardY+95); ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '500 44px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, body, cardW - 80);
    if (lines.length > 11) lines = lines.slice(0, 11).concat(['\u2026']);
    var lineH = 58;
    var startY = Math.max(cardY + 120, cardY + cardH/2 - (lines.length*lineH)/2 + 40);
    lines.forEach(function (ln, i) { ctx.fillText(ln, w/2, startY + i*lineH); });

    if (ref) {
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText(String(ref), w/2, Math.min(startY + lines.length*lineH + 56, cardY + cardH - 36));
    }

    ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(0, h-170, w, 170);
    ctx.fillStyle = '#c9a227';
    ctx.font = '700 36px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w/2, h-95);
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '500 28px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(isEn() ? 'Three Angels Message \u00b7 Revelation 14' : '\u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647 \u00b7 \u0645\u06a9\u0627\u0634\u0641\u0647 \u06f1\u06f4', w/2, h-48);
    return canvas;
  }

  function showPreview(canvas, opts) {
    opts = opts || {};
    var url = opts.url || SITE;
    var en = isEn();
    var dataUrl = canvas.toDataURL('image/png');
    var old = document.getElementById('st-card-preview');
    if (old) old.remove();

    if (!document.getElementById('st-card-preview-css')) {
      var st = document.createElement('style');
      st.id = 'st-card-preview-css';
      st.textContent = '#st-card-preview{position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,.8);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;gap:.75rem}' +
        '#st-card-preview img{max-width:min(92vw,360px);max-height:52vh;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.5)}' +
        '#st-card-preview .acts{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}' +
        '#st-card-preview button{font-family:inherit;font-weight:800;font-size:.95rem;padding:.75rem 1.1rem;border:none;border-radius:10px;cursor:pointer}' +
        '#st-card-preview .save{background:#c9a227;color:#0a2540}' +
        '#st-card-preview .share{background:#25D366;color:#fff}' +
        '#st-card-preview .close{background:#fff;color:#222}' +
        '#st-card-preview p{color:#fff;font-size:.85rem;text-align:center;max-width:320px;margin:0;line-height:1.45}';
      document.head.appendChild(st);
    }

    var box = document.createElement('div');
    box.id = 'st-card-preview';
    box.innerHTML = '<img alt="verse" src="' + dataUrl + '">' +
      '<div class="acts">' +
      '<button type="button" class="share" id="st-sh">' + (en ? 'Share picture' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="save" id="st-sv">' + (en ? 'Save picture' : '\u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="close" id="st-cl">' + (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button></div>' +
      '<p>' + (en
        ? 'Save this picture, then open WhatsApp Status / Instagram Story and choose it from Gallery. Write seventhtrumpet.org in the caption.'
        : '\u0639\u06a9\u0633 \u0631\u0627 \u0630\u062e\u06cc\u0631\u0647 \u06a9\u0646\u06cc\u062f\u060c \u0628\u0639\u062f Status \u06cc\u0627 Story \u0631\u0627 \u0628\u0627\u0632 \u06a9\u0646\u06cc\u062f \u0648 \u0627\u06cc\u0646 \u0639\u06a9\u0633 \u0631\u0627 \u0627\u0632 \u06af\u0627\u0644\u0631\u06cc \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f. \u062f\u0631 \u06a9\u067e\u0634\u0646: seventhtrumpet.org') +
      '</p>';
    document.body.appendChild(box);

    function toBlob(cb) { canvas.toBlob(function (b) { cb(b); }, 'image/png'); }
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
        var text = [opts.ref, opts.body, url].filter(Boolean).join('\n\n');
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: opts.title || SITE_NAME_EN, text: text, url: url }).catch(function () {
            var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = opts.filename || 'seventh-trumpet.png'; a.click();
          });
        } else {
          var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = opts.filename || 'seventh-trumpet.png'; a.click();
          alert(en ? 'Picture saved — add it to Status from Gallery' : '\u0639\u06a9\u0633 \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f \u2014 \u0627\u0632 \u06af\u0627\u0644\u0631\u06cc \u0628\u0647 Status \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f');
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
