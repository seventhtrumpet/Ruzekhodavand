/* Fresh Bread share: square profile photo with an attached verse-and-link panel. */
(function () {
  'use strict';
  var SITE = 'https://www.seventhtrumpet.org/';
  var LOGO = 'https://iili.io/n8MSJBp.jpg';
  var BUTTON_ID = 'daily-status-share-card';

  function language() {
    try { return localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa'; }
    catch (e) { return document.documentElement.lang || 'fa'; }
  }
  function msg(en, fa) { return language() === 'en' ? en : fa; }

  function verseData() {
    var verses = window.DAILY_VERSES || [];
    if (!verses.length) return null;
    var text = (document.getElementById('verse-text') || {}).textContent || '';
    var ref = (document.getElementById('verse-ref') || {}).textContent || '';
    text = text.trim(); ref = ref.trim();
    var match = verses.find(function (v) {
      return (ref && [v.ref_fa, v.ref_en, v.refFa, v.refEn, v.ref]
        .some(function (r) { return r && String(r).trim() === ref; })) ||
        (text && [v.fa, v.en].some(function (t) { return t && String(t).trim() === text; }));
    });
    if (!match) {
      var now = new Date();
      var start = new Date(now.getFullYear(), 0, 0);
      var day = Math.floor((now - start) / 86400000);
      match = verses[Math.abs(now.getFullYear() * 366 + day) % verses.length];
    }
    var index = verses.indexOf(match);
    var en = language() === 'en';
    return {
      text: en ? (match.en || match.fa || '') : (match.fa || match.en || ''),
      reference: en ? (match.ref_en || match.refEn || match.ref || '') :
        (match.ref_fa || match.refFa || match.ref || ''),
      url: SITE + 'v/' + Math.max(0, index),
      heading: en ? 'DAILY BIBLE VERSE' : 'آیه روز از کتاب مقدس',
      brand: en ? 'SEVENTH TRUMPET' : 'شیپور هفتم'
    };
  }

  function loadImage(blob) {
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(objectUrl); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(objectUrl); reject(new Error('image-decode')); };
      img.src = objectUrl;
    });
  }

  function wrapText(ctx, text, maxWidth) {
    var words = String(text || '').split(/\s+/);
    var lines = [], line = '';
    words.forEach(function (word) {
      var candidate = line ? line + ' ' + word : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line); line = word;
      } else line = candidate;
    });
    if (line) lines.push(line);
    return lines;
  }

  function makeShareCard(blob, data) {
    return loadImage(blob).then(function (img) {
      var width = 1080, photoHeight = 1080, pad = 76;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      ctx.font = '44px "Noto Naskh Arabic", "Noto Sans Arabic", Arial, sans-serif';
      var verseLines = wrapText(ctx, data.text, width - pad * 2);
      var refLines = wrapText(ctx, data.reference, width - pad * 2);
      var lineHeight = 66;
      var panelHeight = 270 + verseLines.length * lineHeight + refLines.length * 54;
      panelHeight = Math.max(440, Math.min(panelHeight, 1050));
      canvas.width = width;
      canvas.height = photoHeight + panelHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, canvas.height);

      // Keep the profile picture square and undistorted at the top.
      var scale = Math.min(width / img.width, photoHeight / img.height);
      var drawW = img.width * scale, drawH = img.height * scale;
      ctx.fillStyle = '#101b2b';
      ctx.fillRect(0, 0, width, photoHeight);
      ctx.drawImage(img, (width - drawW) / 2, (photoHeight - drawH) / 2, drawW, drawH);

      // Attached caption panel is part of the same share image.
      var panelY = photoHeight;
      var gradient = ctx.createLinearGradient(0, panelY, 0, canvas.height);
      gradient.addColorStop(0, '#fffdf7');
      gradient.addColorStop(1, '#f0eadc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, panelY, width, panelHeight);
      ctx.fillStyle = '#b58a42';
      ctx.fillRect(0, panelY, width, 9);

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.fillStyle = '#9a7130';
      ctx.font = 'bold 34px Arial, sans-serif';
      ctx.fillText(data.heading, width / 2, panelY + 72);
      ctx.fillStyle = '#1d2c3d';
      ctx.font = 'bold 38px Arial, sans-serif';
      ctx.fillText(data.brand, width / 2, panelY + 126);

      var y = panelY + 208;
      ctx.direction = language() === 'en' ? 'ltr' : 'rtl';
      ctx.textAlign = language() === 'en' ? 'left' : 'right';
      ctx.fillStyle = '#26384a';
      ctx.font = '44px "Noto Naskh Arabic", "Noto Sans Arabic", Arial, sans-serif';
      verseLines.forEach(function (line) {
        if (y < canvas.height - 160) ctx.fillText(line, language() === 'en' ? pad : width - pad, y);
        y += lineHeight;
      });
      ctx.fillStyle = '#87642e';
      ctx.font = 'bold 35px "Noto Naskh Arabic", "Noto Sans Arabic", Arial, sans-serif';
      refLines.forEach(function (line) {
        if (y < canvas.height - 125) ctx.fillText(line, language() === 'en' ? pad : width - pad, y);
        y += 54;
      });

      ctx.direction = 'ltr';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#145b91';
      ctx.font = 'bold 34px Arial, sans-serif';
      ctx.fillText('www.seventhtrumpet.org', width / 2, canvas.height - 58);
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (out) {
          if (out) resolve(out); else reject(new Error('card-render'));
        }, 'image/jpeg', 0.94);
      });
    });
  }

  // Preload the profile image before the user taps Share. Web Share must be
  // called directly from the tap handler or Android may reject the request.
  var preparedShareFile = null;
  function prepareShareFile() {
    fetch(LOGO, { mode: 'cors', cache: 'force-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('photo-fetch');
        return r.blob();
      })
      .then(function (blob) {
        preparedShareFile = new File([blob], 'seventh-trumpet.jpg', {
          type: blob.type || 'image/jpeg'
        });
      })
      .catch(function (err) {
        console.warn('Daily Bread profile image could not be preloaded:', err);
      });
  }

  function shareToApp() {
    var data = verseData();
    if (!data || !data.text) {
      alert(msg('The daily verse is not ready yet. Please try again.', 'آیه روز هنوز آماده نیست. لطفاً دوباره تلاش کنید.'));
      return;
    }

    var caption = [
      data.text,
      data.reference,
      'Seventh Trumpet | شیپور هفتم',
      SITE
    ].filter(Boolean).join('\\n\\n');

    if (!navigator.share) {
      alert(msg('Sharing is not supported by this browser.', 'مرورگر شما از اشتراک‌گذاری پشتیبانی نمی‌کند.'));
      return;
    }

    var shareData = {
      title: 'Seventh Trumpet | Daily Bible Verse',
      text: caption,
      url: SITE
    };

    // Attach the real square profile photo when it was preloaded and the
    // browser confirms file sharing is supported. The website stays in text.
    if (preparedShareFile && navigator.canShare) {
      try {
        if (navigator.canShare({ files: [preparedShareFile] })) {
          shareData.files = [preparedShareFile];
        }
      } catch (e) {}
    }

    try {
      navigator.share(shareData).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        console.error('Daily Bread share failed:', err);
        alert(msg('Sharing failed. Please try again.', 'اشتراک‌گذاری انجام نشد. لطفاً دوباره تلاش کنید.'));
      });
    } catch (err) {
      console.error('Daily Bread share failed:', err);
      alert(msg('Sharing failed. Please try again.', 'اشتراک‌گذاری انجام نشد. لطفاً دوباره تلاش کنید.'));
    }
  }

  function addButton() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh || document.getElementById(BUTTON_ID)) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = BUTTON_ID;
    button.className = 'verse-refresh';
    button.style.marginInlineStart = '0.45rem';
    button.style.marginTop = '0.4rem';
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-inline-end:7px"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"></path></svg><span>' + msg('Share Daily Verse', 'اشتراک‌گذاری آیه روز') + '</span>';
    button.setAttribute('aria-label', msg('Share the profile photo with the daily verse and website link', 'اشتراک‌گذاری عکس پروفایل همراه با آیه روز و لینک وب‌سایت'));
    button.addEventListener('click', shareToApp);
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() {
    ['daily-share', 'vshare-overlay', 'daily-status-share', 'daily-status-share-image'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old) old.remove();
    });
    prepareShareFile();
    addButton();
    if (!document.getElementById(BUTTON_ID)) {
      var observer = new MutationObserver(addButton);
      observer.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(function () { observer.disconnect(); }, 10000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();