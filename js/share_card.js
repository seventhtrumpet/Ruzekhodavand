/* Share card — profile photo background (rebuild PE1+PE2 when sharing) */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SITE_NAME_FA = '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  var SITE_NAME_EN = 'Seventh Trumpet';

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function getProfileDataUrl() {
    try {
      if (window.ST_PE1 && window.ST_PE2) {
        return 'data:image/jpeg;base64,' + window.ST_PE1 + window.ST_PE2;
      }
      if (typeof window.ST_PROFILE_EMBED === 'string' && window.ST_PROFILE_EMBED.indexOf('data:image') === 0) {
        return window.ST_PROFILE_EMBED;
      }
    } catch (e) {}
    return '';
  }

  function loadEmbed() {
    return new Promise(function (resolve) {
      var src = getProfileDataUrl();
      if (!src) {
        // Wait briefly for pe1/pe2 scripts to finish loading
        var tries = 0;
        function wait() {
          src = getProfileDataUrl();
          if (src) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = src;
            return;
          }
          tries++;
          if (tries < 40) setTimeout(wait, 100);
          else resolve(null);
        }
        setTimeout(wait, 50);
        return;
      }
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
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

    // BACKGROUND PHOTO
    if (bgImg) {
      var scale = Math.max(w / bgImg.width, h / bgImg.height);
      var dw = bgImg.width * scale;
      var dh = bgImg.height * scale;
      ctx.drawImage(bgImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      // Strong fallback so something is always visible
      var g0 = ctx.createLinearGradient(0, 0, 0, h);
      g0.addColorStop(0, '#0a2540');
      g0.addColorStop(0.5, '#1a4a6c');
      g0.addColorStop(1, '#0a2540');
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);
      var g2 = ctx.createRadialGradient(w/2, h*0.3, 20, w/2, h*0.3, 500);
      g2.addColorStop(0, 'rgba(201,162,39,0.35)');
      g2.addColorStop(1, 'rgba(201,162,39,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    }

    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(5,15,30,0.15)');
    g.addColorStop(0.4, 'rgba(5,15,30,0.25)');
    g.addColorStop(1, 'rgba(5,15,30,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#c9a227';
    ctx.fillRect(0, 0, w, 12);

    var cardX = 55, cardY = h * 0.18, cardW = w - 110, cardH = h * 0.56;
    ctx.fillStyle = 'rgba(8, 28, 48, 0.72)';
    roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 5;
    roundRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, cardY + 62);

    ctx.strokeStyle = 'rgba(201,162,39,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 100, cardY + 88);
    ctx.lineTo(w / 2 + 100, cardY + 88);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '500 44px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, body, cardW - 90);
    if (lines.length > 9) lines = lines.slice(0, 9).concat(['\u2026']);
    var lineH = 56;
    var startY = cardY + 140;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    var after = startY + lines.length * lineH + 28;
    if (ref) {
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 36px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText(String(ref), w / 2, after);
      after += 50;
    }

    var btnW = Math.min(cardW - 60, 780);
    var btnH = 120;
    var btnX = (w - btnW) / 2;
    var btnY = Math.min(after + 18, cardY + cardH - btnH - 28);
    ctx.fillStyle = '#c9a227';
    roundRect(ctx, btnX, btnY, btnW, btnH, 22);
    ctx.fill();
    ctx.fillStyle = '#0a2540';
    ctx.font = '800 46px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, btnY + 52);
    ctx.font = '700 28px Inter, system-ui, sans-serif';
    ctx.fillText('www.seventhtrumpet.org', w / 2, btnY + 96);

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, h - 150, w, 150);
    ctx.fillStyle = '#c9a227';
    ctx.font = '800 40px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, h - 80);
    ctx.fillStyle = '#fff';
    ctx.font = '600 28px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(en ? 'Seventh Trumpet' : SITE_NAME_FA, w / 2, h - 38);

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
        '#st-card-preview{position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,.85);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;gap:0.65rem}' +
        '#st-card-preview img{max-width:min(92vw,340px);max-height:50vh;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.5)}' +
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
        ? 'Save this PICTURE, then put it on WhatsApp Status from Gallery (not text).'
        : '\u0627\u06cc\u0646 \u0639\u06a9\u0633 \u0631\u0627 \u0630\u062e\u06cc\u0631\u0647 \u06a9\u0646\u06cc\u062f\u060c \u0628\u0639\u062f \u0627\u0632 \u06af\u0627\u0644\u0631\u06cc \u062f\u0631 Status \u0628\u06af\u0630\u0627\u0631\u06cc\u062f (\u0646\u0647 \u0645\u062a\u0646).') +
      '</p>' +
      '<div class="acts">' +
      '<button type="button" class="save" id="st-sv">' + (en ? '1) Save picture' : '\u06f1) \u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="share" id="st-sh">' + (en ? '2) Share picture' : '\u06f2) \u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" class="close" id="st-cl">' + (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button></div>';
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
    loadEmbed().then(function (img) {
      showPreview(drawCard(img, opts), opts);
    });
  };
  window.ST_SITE = SITE;
})();
