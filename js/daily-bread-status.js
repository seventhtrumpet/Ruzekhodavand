/* Daily Bread: ONE image = profile photo + card attached under it + real tappable link in share text */
(function () {
  'use strict';

  var SITE = 'https://seventhtrumpet.org/';
  var LOGO = 'https://iili.io/n8MSJBp.jpg';
  var BUTTON_ID = 'daily-status-share-card';
  var WIDTH = 1080;
  var PHOTO_H = 1080;

  var preparedFile = null;
  var preparedKey = '';
  var logoBitmap = null;

  function language() {
    try {
      return localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa';
    } catch (e) {
      return document.documentElement.lang || 'fa';
    }
  }
  function isEn() { return language() === 'en'; }
  function msg(en, fa) { return isEn() ? en : fa; }

  function verseData() {
    var textEl = document.getElementById('verse-text');
    var refEl = document.getElementById('verse-ref');
    var text = (textEl && textEl.textContent || '').trim();
    var ref = (refEl && refEl.textContent || '').trim();

    var verses = window.DAILY_VERSES || [];
    if (verses.length) {
      var match = null;
      for (var i = 0; i < verses.length; i++) {
        var v = verses[i];
        var refs = [v.ref_fa, v.ref_en, v.refFa, v.refEn, v.ref];
        var texts = [v.fa, v.en];
        var refHit = ref && refs.some(function (r) { return r && String(r).trim() === ref; });
        var textHit = text && texts.some(function (t) { return t && String(t).trim() === text; });
        if (refHit || textHit) { match = v; break; }
      }
      if (!match) {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var day = Math.floor((now - start) / 86400000);
        match = verses[Math.abs(now.getFullYear() * 366 + day) % verses.length];
      }
      if (match) {
        text = isEn() ? (match.en || match.fa || text) : (match.fa || match.en || text);
        ref = isEn()
          ? (match.ref_en || match.refEn || match.ref || ref)
          : (match.ref_fa || match.refFa || match.ref || ref);
      }
    }

    return {
      text: text,
      reference: ref,
      heading: isEn() ? 'FRESH BREAD' : '\u0646\u0627\u0646 \u062a\u0627\u0632\u0647',
      sub: isEn() ? 'Daily Bible Verse' : '\u0622\u06cc\u0647\u0650 \u0631\u0648\u0632 \u0627\u0632 \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633',
      brand: isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
      urlLabel: 'seventhtrumpet.org',
      url: SITE
    };
  }

  function wrapText(ctx, text, maxWidth) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  function loadLogo() {
    if (logoBitmap) return Promise.resolve(logoBitmap);
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        logoBitmap = img;
        resolve(img);
      };
      img.onerror = function () { resolve(null); };
      img.src = LOGO;
    });
  }

  /**
   * ONE continuous image:
   * [======== profile picture block ========]
   * [======== card attached under it =======]  same canvas, no gap, same width
   */
  function makeConnectedCard(data) {
    return loadLogo().then(function (img) {
      var pad = 72;
      var measure = document.createElement('canvas').getContext('2d');
      measure.font = '44px "Vazirmatn", "Noto Naskh Arabic", Tahoma, Arial, sans-serif';
      var verseLines = wrapText(measure, data.text, WIDTH - pad * 2);
      measure.font = 'bold 36px "Vazirmatn", Tahoma, Arial, sans-serif';
      var refLines = wrapText(measure, data.reference, WIDTH - pad * 2);

      var lineH = 58;
      var cardBody =
        56 +
        70 +
        48 +
        36 +
        verseLines.length * lineH +
        28 +
        refLines.length * 48 +
        40 +
        56 +
        70;
      cardBody = Math.max(420, Math.min(cardBody, 900));

      var H = PHOTO_H + cardBody;
      var canvas = document.createElement('canvas');
      canvas.width = WIDTH;
      canvas.height = H;
      var ctx = canvas.getContext('2d');

      /* ----- PROFILE BLOCK (top) ----- */
      var bg = ctx.createLinearGradient(0, 0, 0, PHOTO_H);
      bg.addColorStop(0, '#0a2540');
      bg.addColorStop(1, '#163a5f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, WIDTH, PHOTO_H);

      if (img) {
        var size = Math.min(img.width, img.height);
        var sx = (img.width - size) / 2;
        var sy = (img.height - size) / 2;
        var out = 720;
        var ox = (WIDTH - out) / 2;
        var oy = (PHOTO_H - out) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(WIDTH / 2, PHOTO_H / 2, out / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, size, size, ox, oy, out, out);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(WIDTH / 2, PHOTO_H / 2, out / 2 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(201,162,39,0.85)';
        ctx.lineWidth = 10;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px "Vazirmatn", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.fillText(data.brand, WIDTH / 2, PHOTO_H - 48);

      /* ----- CARD ATTACHED (same canvas, flush under photo) ----- */
      var y0 = PHOTO_H;

      /* gold seam connecting photo to card */
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(0, y0 - 6, WIDTH, 12);

      var cardGrad = ctx.createLinearGradient(0, y0, 0, H);
      cardGrad.addColorStop(0, '#fffdf8');
      cardGrad.addColorStop(1, '#f3ebdc');
      ctx.fillStyle = cardGrad;
      ctx.fillRect(0, y0, WIDTH, cardBody);

      var y = y0 + 64;
      ctx.fillStyle = '#9a7130';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.fillText(data.heading, WIDTH / 2, y);

      y += 48;
      ctx.fillStyle = '#5a6a7a';
      ctx.font = '600 28px "Vazirmatn", Arial, sans-serif';
      ctx.fillText(data.sub, WIDTH / 2, y);

      y += 56;
      ctx.direction = isEn() ? 'ltr' : 'rtl';
      ctx.textAlign = isEn() ? 'left' : 'right';
      ctx.fillStyle = '#1a2b3c';
      ctx.font = '600 42px "Vazirmatn", "Noto Naskh Arabic", Tahoma, sans-serif';
      var x = isEn() ? pad : WIDTH - pad;
      for (var i = 0; i < verseLines.length; i++) {
        ctx.fillText(verseLines[i], x, y);
        y += lineH;
      }

      y += 20;
      ctx.fillStyle = '#87642e';
      ctx.font = 'bold 34px "Vazirmatn", Tahoma, sans-serif';
      for (var j = 0; j < refLines.length; j++) {
        ctx.fillText(refLines[j], x, y);
        y += 48;
      }

      ctx.direction = 'ltr';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0a2540';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText(data.brand, WIDTH / 2, H - 88);
      ctx.fillStyle = '#145b91';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.fillText(data.urlLabel, WIDTH / 2, H - 40);

      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('blob'));
        }, 'image/jpeg', 0.92);
      });
    });
  }

  function cacheKey(data) {
    return language() + '|' + (data.reference || '') + '|' + (data.text || '').slice(0, 60);
  }

  function prepare() {
    var data = verseData();
    if (!data.text) return;
    var key = cacheKey(data);
    if (key === preparedKey && preparedFile) return;
    makeConnectedCard(data)
      .then(function (blob) {
        preparedFile = new File([blob], 'seventh-trumpet-fresh-bread.jpg', { type: 'image/jpeg' });
        preparedKey = key;
      })
      .catch(function (err) {
        console.warn('Daily Bread card prepare failed:', err);
      });
  }

  function shareConnected() {
    var data = verseData();
    if (!data || !data.text) {
      alert(msg(
        'The daily verse is not ready yet. Please try again.',
        '\u0622\u06cc\u0647 \u0631\u0648\u0632 \u0647\u0646\u0648\u0632 \u0622\u0645\u0627\u062f\u0647 \u0646\u06cc\u0633\u062a. \u0644\u0637\u0641\u0627\u064b \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0634 \u06a9\u0646\u06cc\u062f.'
      ));
      return;
    }

    var caption = [
      data.text,
      data.reference,
      data.brand + ' | ' + data.heading,
      data.url
    ].filter(Boolean).join('\n\n');

    function doShare(file) {
      if (!navigator.share) {
        try {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(file);
          a.download = 'seventh-trumpet-fresh-bread.jpg';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { try { a.remove(); URL.revokeObjectURL(a.href); } catch (e) {} }, 500);
        } catch (e) {}
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(caption);
        }
        alert(msg(
          'Image saved. Link copied — paste it with the photo.',
          '\u0639\u06a9\u0633 \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f. \u0644\u06cc\u0646\u06a9 \u06a9\u067e\u06cc \u0634\u062f \u2014 \u0647\u0645\u0631\u0627\u0647 \u0639\u06a9\u0633 \u062c\u0627\u06cc\u200c\u06af\u0630\u0627\u0631\u06cc \u06a9\u0646\u06cc\u062f.'
        ));
        return;
      }

      var payload = {
        title: data.brand + ' | ' + data.heading,
        text: caption,
        url: data.url
      };
      var withFile = {
        title: payload.title,
        text: payload.text,
        url: payload.url
      };
      if (file) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            withFile.files = [file];
          }
        } catch (e) {}
      }

      navigator.share(withFile.files ? withFile : payload).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        if (withFile.files) {
          navigator.share(payload).catch(function () {});
        }
      });
    }

    var key = cacheKey(data);
    if (preparedFile && preparedKey === key) {
      doShare(preparedFile);
      return;
    }

    makeConnectedCard(data)
      .then(function (blob) {
        var file = new File([blob], 'seventh-trumpet-fresh-bread.jpg', { type: 'image/jpeg' });
        preparedFile = file;
        preparedKey = key;
        doShare(file);
      })
      .catch(function () {
        doShare(null);
      });
  }

  function addButton() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh) return;

    var oldIds = ['daily-status-share-card', 'daily-share', 'daily-status-share', 'daily-status-share-image'];
    oldIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) try { el.remove(); } catch (e) {}
    });

    var button = document.createElement('button');
    button.type = 'button';
    button.id = BUTTON_ID;
    button.className = 'verse-refresh';
    button.style.marginInlineStart = '0.45rem';
    button.style.marginTop = '0.4rem';
    button.textContent = msg('Share', '\u0627\u0634\u062a\u0631\u0627\u06a9');
    button.setAttribute(
      'aria-label',
      msg(
        'Share profile picture with Fresh Bread card and website link',
        '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0628\u0627 \u06a9\u0627\u0631\u062a \u0646\u0627\u0646 \u062a\u0627\u0632\u0647 \u0648 \u0644\u06cc\u0646\u06a9 \u0648\u0628\u0633\u0627\u06cc\u062a'
      )
    );
    button.addEventListener('click', function (e) {
      e.preventDefault();
      shareConnected();
    });
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() {
    addButton();
    loadLogo().then(function () { prepare(); });
    var refresh = document.getElementById('verse-refresh');
    if (refresh) {
      refresh.addEventListener('click', function () {
        preparedFile = null;
        preparedKey = '';
        setTimeout(prepare, 400);
      });
    }
    setTimeout(prepare, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
