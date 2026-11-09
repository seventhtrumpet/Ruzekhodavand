/* Deep links + daily verse share as image (good for WhatsApp status) */
(function () {
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

  /** Draw verse card for WhatsApp status / social — not the site profile photo */
  function makeVerseCard(text, ref) {
    var w = 1080, h = 1920; // status-friendly portrait
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    // Soft navy gradient (brand colors, not logo photo)
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0a2540');
    g.addColorStop(0.55, '#163a5f');
    g.addColorStop(1, '#0f1c2e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Gold accent line
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(120, 280);
    ctx.lineTo(w - 120, 280);
    ctx.stroke();

    // Site name small at top
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 36px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645', w / 2, 200);

    // Verse text (wrapped)
    ctx.fillStyle = '#ffffff';
    ctx.font = '500 52px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    var maxW = w - 160;
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    if (lines.length > 14) lines = lines.slice(0, 14).concat(['…']);

    var lineH = 72;
    var startY = h / 2 - (lines.length * lineH) / 2;
    lines.forEach(function (ln, idx) {
      ctx.fillText(ln, w / 2, startY + idx * lineH);
    });

    // Reference
    ctx.fillStyle = '#c9a227';
    ctx.font = '600 40px Inter, Vazirmatn, system-ui, sans-serif';
    ctx.fillText(String(ref || ''), w / 2, startY + lines.length * lineH + 80);

    // Bottom URL
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '400 32px Inter, system-ui, sans-serif';
    ctx.fillText('seventhtrumpet.org', w / 2, h - 120);

    return canvas;
  }

  function shareDaily() {
    var text = (document.getElementById('verse-text') || {}).textContent || '';
    var ref = (document.getElementById('verse-ref') || {}).textContent || '';
    var url = (location.origin || 'https://seventhtrumpet.org') + '/';
    var canvas = makeVerseCard(text, ref);

    function shareBlob(blob) {
      var file = new File([blob], 'daily-verse.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: ref || 'Daily Verse',
          text: (ref ? ref + '\n' : '') + text + '\n' + url
        });
      }
      if (navigator.share) {
        return navigator.share({
          title: ref || 'Daily Verse',
          text: (ref ? ref + '\n' : '') + text + '\n' + url,
          url: url
        });
      }
      // Fallback: download image
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'daily-verse.png';
      a.click();
      return Promise.resolve();
    }

    canvas.toBlob(function (blob) {
      if (!blob) return;
      shareBlob(blob).catch(function () {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'daily-verse.png';
        a.click();
      });
    }, 'image/png');
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
    if (refresh && refresh.parentNode) {
      refresh.parentNode.insertBefore(btn, refresh.nextSibling);
    } else {
      var inner = section.querySelector('.daily-verse-inner');
      if (inner) inner.appendChild(btn);
    }
    btn.addEventListener('click', shareDaily);
  }

  function bindBibleShare() {
    var btn = document.getElementById('mb-share');
    if (!btn || btn._shareBound) return;
    btn._shareBound = true;
    btn.addEventListener('click', function () {
      if (typeof window.shareSelected === 'function') window.shareSelected();
    });
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    bindBibleShare();
    setLabels();
    var lt = document.getElementById('lang-toggle');
    if (lt) {
      lt.addEventListener('click', function () {
        setTimeout(setLabels, 100);
        setTimeout(setLabels, 400);
      });
    }
    window.addEventListener('cog-lang-changed', setLabels);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
