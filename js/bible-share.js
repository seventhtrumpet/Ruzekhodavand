/* Deep links + daily verse share image using site profile picture */
(function () {
  var PROFILE_IMG = 'https://iili.io/n8MSJBp.jpg';

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

  function drawVerseCard(img, text, ref) {
    var w = 1080, h = 1920;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    // Draw profile image covering full canvas (cover)
    if (img) {
      var scale = Math.max(w / img.width, h / img.height);
      var dw = img.width * scale;
      var dh = img.height * scale;
      var dx = (w - dw) / 2;
      var dy = (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a2540');
      g.addColorStop(1, '#0f1c2e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Dark overlay so text is readable
    ctx.fillStyle = 'rgba(8, 18, 32, 0.55)';
    ctx.fillRect(0, 0, w, h);

    // Soft card in center
    ctx.fillStyle = 'rgba(10, 37, 64, 0.72)';
    roundRect(ctx, 80, h * 0.28, w - 160, h * 0.42, 28);
    ctx.fill();

    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    roundRect(ctx, 80, h * 0.28, w - 160, h * 0.42, 28);
    ctx.stroke();

    // Site name
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '600 34px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645', w / 2, h * 0.28 + 70);

    // Verse
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 46px Inter, Vazirmatn, system-ui, sans-serif';
    var lines = wrapText(ctx, text, w - 240);
    if (lines.length > 12) lines = lines.slice(0, 12).concat(['…']);
    var lineH = 64;
    var startY = h * 0.42 - (lines.length * lineH) / 2 + 40;
    lines.forEach(function (ln, i) {
      ctx.fillText(ln, w / 2, startY + i * lineH);
    });

    // Reference
    ctx.fillStyle = '#c9a227';
    ctx.font = '700 38px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(String(ref || ''), w / 2, startY + lines.length * lineH + 70);

    // URL
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '400 30px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, h - 100);

    return canvas;
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

  function shareDaily() {
    var text = (document.getElementById('verse-text') || {}).textContent || '';
    var ref = (document.getElementById('verse-ref') || {}).textContent || '';
    var url = (location.origin || 'https://seventhtrumpet.org') + '/';

    function finish(canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) return;
        var file = new File([blob], 'daily-verse.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: ref || 'Daily Verse',
            text: (ref ? ref + '\n' : '') + text + '\n' + url
          }).catch(function () {
            downloadBlob(blob);
          });
        } else if (navigator.share) {
          navigator.share({
            title: ref || 'Daily Verse',
            text: (ref ? ref + '\n' : '') + text + '\n' + url,
            url: url
          }).catch(function () { downloadBlob(blob); });
        } else {
          downloadBlob(blob);
        }
      }, 'image/png');
    }

    function downloadBlob(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'daily-verse.png';
      a.click();
    }

    loadImage(PROFILE_IMG)
      .then(function (img) { finish(drawVerseCard(img, text, ref)); })
      .catch(function () { finish(drawVerseCard(null, text, ref)); });
  }

  function initDailyShare() {
    var section = document.getElementById('daily-verse');
    if (!section || document.getElementById('daily-share')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'daily-share';
    btn.className = 'verse-refresh';
    btn.style.marginInlineStart = '0.5rem';
    btn.textContent = isEn() ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
    var refresh = document.getElementById('verse-refresh');
    if (refresh && refresh.parentNode) refresh.parentNode.insertBefore(btn, refresh.nextSibling);
    else {
      var inner = section.querySelector('.daily-verse-inner');
      if (inner) inner.appendChild(btn);
    }
    btn.addEventListener('click', shareDaily);
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    setLabels();
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
