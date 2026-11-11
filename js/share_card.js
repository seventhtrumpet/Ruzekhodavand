/* Share card — always profile background + website link */
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
      if (window.ST_PE1 && window.ST_PE2 && window.ST_PE1.length > 100) {
        return 'data:image/jpeg;base64,' + window.ST_PE1 + window.ST_PE2;
      }
      if (window.ST_PROFILE_B64 && window.ST_PROFILE_B64.length > 100) {
        return 'data:image/jpeg;base64,' + window.ST_PROFILE_B64;
      }
      if (window.ST_LP && window.ST_LP[0] && window.ST_LP[1]) {
        return 'data:image/jpeg;base64,' + window.ST_LP[0] + window.ST_LP[1];
      }
    } catch (e) {}
    return '';
  }

  function loadEmbed() {
    return new Promise(function (resolve) {
      var tries = 0;
      function attempt() {
        var src = getProfileDataUrl();
        if (src) {
          var img = new Image();
          img.onload = function () { resolve(img); };
          img.onerror = function () { resolve(null); };
          img.src = src;
          return;
        }
        tries++;
        if (tries < 60) setTimeout(attempt, 100);
        else resolve(null);
      }
      attempt();
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
    var url = opts.url || SITE;
    var en = isEn();
    var w = 1080, h = 1920;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    if (bgImg) {
      var scale = Math.max(w / bgImg.width, h / bgImg.height);
      var dw = bgImg.width * scale;
      var dh = bgImg.height * scale;
      ctx.drawImage(bgImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      var g0 = ctx.createLinearGradient(0, 0, 0, h);
      g0.addColorStop(0, '#0a2540');
      g0.addColorStop(0.5, '#1a4a6c');
      g0.addColorStop(1, '#0a2540');
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, w, h);
    }

    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(5,15,30,0.18)');
    g.addColorStop(0.4, 'rgba(5,15,30,0.28)');
    g.addColorStop(1, 'rgba(5,15,30,0.58)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#c9a227';
    ctx.fillRect(0, 0, w, 14);

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
    var lineH = 56, startY = cardY + 140;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    if (ref) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '600 28px Inter, Vazirmatn, system-ui, sans-serif';
      ctx.fillText(ref, w / 2, cardY + cardH - 100);
    }

    var boxW = 520, boxH = 64;
    var boxX = (w - boxW) / 2;
    var boxY = cardY + cardH - 72;
    ctx.fillStyle = '#c9a227';
    roundRect(ctx, boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.fillStyle = '#0a2540';
    ctx.font = '700 32px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, boxY + 42);

    ctx.fillStyle = 'rgba(8, 28, 48, 0.9)';
    ctx.fillRect(0, h - 120, w, 120);
    ctx.fillStyle = '#c9a227';
    ctx.font = '600 26px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(url, w / 2, h - 70);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '500 22px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(en ? 'Tap the link to open the website' : '\u0631\u0648\u06cc \u0644\u06cc\u0646\u06a9 \u0628\u0632\u0646\u06cc\u062f \u0648 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u0628\u0627\u0632 \u0645\u06cc\u200c\u0634\u0648\u062f', w / 2, h - 35);

    return canvas;
  }

  function showPreview(canvas, opts) {
    opts = opts || {};
    var en = isEn();
    var url = opts.url || SITE;
    var old = document.getElementById('st-card-preview');
    if (old) old.remove();
    var dataUrl = canvas.toDataURL('image/png');
    var box = document.createElement('div');
    box.id = 'st-card-preview';
    box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;font-family:Inter,Vazirmatn,system-ui,sans-serif;';
    box.innerHTML =
      '<img alt="" src="' + dataUrl + '" style="max-width:min(92vw,360px);max-height:58vh;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.5);border:2px solid #c9a227;">' +
      '<p style="color:#fff;text-align:center;margin:12px 12px 6px;font-size:14px;line-height:1.5;max-width:340px;">' + (en
        ? 'Picture with your profile photo + link. Save, then Status from Gallery.'
        : '\u0639\u06a9\u0633 \u0628\u0627 \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0644\u06cc\u0646\u06a9. \u0630\u062e\u06cc\u0631\u0647 \u06a9\u0646\u06cc\u062f\u060c \u0628\u0639\u062f Status \u0627\u0632 \u06af\u0627\u0644\u0631\u06cc.') +
      '</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px;">' +
      '<button type="button" id="st-sv" style="background:#c9a227;color:#0a2540;border:0;padding:12px 18px;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;">' + (en ? '1) Save picture' : '\u06f1) \u0630\u062e\u06cc\u0631\u0647 \u0639\u06a9\u0633') + '</button>' +
      '<button type="button" id="st-sh" style="background:#25D366;color:#fff;border:0;padding:12px 18px;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;">' + (en ? '2) Share picture + link' : '\u06f2) \u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 + \u0644\u06cc\u0646\u06a9') + '</button>' +
      '<button type="button" id="st-cl" style="background:#444;color:#fff;border:0;padding:12px 18px;border-radius:12px;font-weight:600;font-size:15px;cursor:pointer;">' + (en ? 'Close' : '\u0628\u0633\u062a\u0646') + '</button></div>';
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
        var shareData = { files: [file], title: opts.title || SITE_NAME_EN, text: url, url: url };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share(shareData).catch(function () {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = opts.filename || 'seventh-trumpet.png';
            a.click();
          });
        } else {
          try { if (navigator.clipboard) navigator.clipboard.writeText(url); } catch (e) {}
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
    if (!opts.url) opts.url = SITE;
    loadEmbed().then(function (img) {
      showPreview(drawCard(img, opts), opts);
    });
  };
  window.ST_SITE = SITE;
})();
