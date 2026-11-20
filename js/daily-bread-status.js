/* Daily Bread: share the verse link or the complete bilingual card image. */
(function () {
  'use strict';
  var SITE = 'https://www.seventhtrumpet.org';
  var LOGO = 'https://iili.io/n8MSJBp.jpg';
  var BUTTON_ID = 'daily-status-share';
  var IMAGE_BUTTON_ID = 'daily-status-share-image';

  function language() {
    try { return localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa'; }
    catch (e) { return document.documentElement.lang || 'fa'; }
  }
  function msg(en, fa) { return language() === 'en' ? en : fa; }

  function dailyVerse() {
    var verses = window.DAILY_VERSES || [];
    if (!verses.length) return null;
    var visibleText = '';
    var visibleRef = '';
    var textEl = document.getElementById('verse-text');
    var refEl = document.getElementById('verse-ref');
    if (textEl) visibleText = (textEl.textContent || '').trim();
    if (refEl) visibleRef = (refEl.textContent || '').trim();
    if (visibleRef || visibleText) {
      var match = verses.find(function (v) {
        return (visibleRef && [v.ref_fa, v.ref_en, v.refFa, v.refEn, v.ref]
          .some(function (r) { return r && String(r).trim() === visibleRef; })) ||
          (visibleText && [v.fa, v.en].some(function (t) { return t && String(t).trim() === visibleText; }));
      });
      if (match) return match;
    }
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var day = Math.floor((now - start) / 86400000);
    return verses[Math.abs(now.getFullYear() * 366 + day) % verses.length];
  }

  function verseData() {
    var verse = dailyVerse();
    if (!verse) return null;
    var verses = window.DAILY_VERSES || [];
    var index = verses.indexOf(verse);
    if (index < 0) index = 0;
    return {
      verse: verse,
      url: SITE + '/v/' + index,
      fa: verse.fa || '',
      en: verse.en || verse.fa || '',
      refFa: verse.ref_fa || verse.refFa || verse.ref || '',
      refEn: verse.ref_en || verse.refEn || verse.ref || ''
    };
  }

  function shareLink() {
    var data = verseData();
    if (!data) { alert(msg('The daily verse is not ready yet. Please try again.', 'آیه روز هنوز آماده نیست. لطفاً دوباره تلاش کنید.')); return; }
    var shareData = {
      title: 'Daily Bible Verse | Seventh Trumpet',
      text: 'Seventh Trumpet | ' + data.refEn + ' | www.seventhtrumpet.org',
      url: data.url
    };
    if (navigator.share) {
      try {
        var p = navigator.share(shareData);
        if (p && p.catch) p.catch(function (err) {
          if (err && err.name !== 'AbortError') alert(msg('Android could not open the share menu. Please try again.', 'منوی اشتراک‌گذاری اندروید باز نشد. لطفاً دوباره تلاش کنید.'));
        });
      } catch (err) {
        alert(msg('Android could not open the share menu. Please try again.', 'منوی اشتراک‌گذاری اندروید باز نشد. لطفاً دوباره تلاش کنید.'));
      }
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data.url).then(function () {
        alert(msg('Share link copied.', 'لینک اشتراک‌گذاری کپی شد.'));
      }).catch(function () { window.prompt('Copy this share link:', data.url); });
    } else window.prompt('Copy this share link:', data.url);
  }

  function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (word) {
      var test = line ? line + ' ' + word : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  function loadLogo() {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('logo-load')); };
      img.src = LOGO;
    });
  }

  function makeCardBlob(data) {
    return loadLogo().then(function (logo) {
      var canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1700;
      var ctx = canvas.getContext('2d');
      var bg = ctx.createLinearGradient(0, 0, 1080, 1400);
      bg.addColorStop(0, '#071b31');
      bg.addColorStop(0.58, '#123b58');
      bg.addColorStop(1, '#071827');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1080, 1400);

      ctx.shadowColor = 'rgba(0,0,0,.28)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 14;
      roundedRect(ctx, 58, 270, 964, 1370, 34);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 270, 112, 0, Math.PI * 2);
      ctx.clip();
      var side = Math.min(logo.naturalWidth, logo.naturalHeight);
      var sx = (logo.naturalWidth - side) / 2;
      var sy = (logo.naturalHeight - side) / 2;
      ctx.drawImage(logo, sx, sy, side, side, 428, 158, 224, 224);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(540, 270, 112, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#d4b45d';
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0a2540';
      ctx.font = 'bold 42px system-ui, sans-serif';
      ctx.fillText('SEVENTH TRUMPET', 540, 445);
      ctx.fillStyle = '#8a6a20';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('شیپور هفتم', 540, 495);

      ctx.fillStyle = '#9b7824';
      ctx.font = 'bold 25px system-ui, sans-serif';
      ctx.fillText('آیه کتاب مقدس', 540, 560);
      ctx.fillStyle = '#172b3e';
      ctx.font = '36px system-ui, sans-serif';
      ctx.direction = 'rtl';
      var faLines = wrapText(ctx, data.fa, 830);
      var y = 625;
      faLines.forEach(function (line) { ctx.fillText(line, 540, y); y += 62; });
      ctx.fillStyle = '#8a6a20';
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillText(data.refFa, 540, y + 12);
      y += 78;

      ctx.beginPath();
      ctx.moveTo(155, y);
      ctx.lineTo(925, y);
      ctx.strokeStyle = '#d8c58e';
      ctx.lineWidth = 2;
      ctx.stroke();
      y += 58;

      ctx.direction = 'ltr';
      ctx.fillStyle = '#9b7824';
      ctx.font = 'bold 25px system-ui, sans-serif';
      ctx.fillText('DAILY BIBLE VERSE', 540, y);
      y += 58;
      ctx.fillStyle = '#26394a';
      ctx.font = '32px system-ui, sans-serif';
      var enLines = wrapText(ctx, data.en, 830);
      enLines.forEach(function (line) { ctx.fillText(line, 540, y); y += 54; });
      ctx.fillStyle = '#8a6a20';
      ctx.font = 'bold 27px system-ui, sans-serif';
      ctx.fillText(data.refEn, 540, y + 10);

      ctx.beginPath();
      ctx.moveTo(155, 1480);
      ctx.lineTo(925, 1480);
      ctx.strokeStyle = '#d8c58e';
      ctx.stroke();
      ctx.fillStyle = '#0b3859';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('www.seventhtrumpet.org', 540, 1545);
      ctx.fillStyle = '#687887';
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillText('Read the Bible • Share the Gospel', 540, 1590);

      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('image-create'));
        }, 'image/png');
      });
    });
  }

  function shareCardImage() {
    var data = verseData();
    if (!data) { alert(msg('The daily verse is not ready yet. Please try again.', 'آیه روز هنوز آماده نیست. لطفاً دوباره تلاش کنید.')); return; }
    makeCardBlob(data).then(function (blob) {
      var file = new File([blob], 'Seventh-Trumpet-Daily-Verse.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: 'Daily Bible Verse | Seventh Trumpet',
          text: 'Seventh Trumpet | ' + data.refEn + ' | www.seventhtrumpet.org'
        });
      }
      var objectUrl = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'Seventh-Trumpet-Daily-Verse.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 60000);
      alert(msg('Your verse card image was saved. Open it in Photos/Gallery and share it to WhatsApp Status or Signal.', 'تصویر آیه ذخیره شد. آن را در گالری باز کنید و در وضعیت واتساپ یا سیگنال به اشتراک بگذارید.'));
    }).catch(function () {
      alert(msg('The card image could not be created. Please use Share Link, or try again with an internet connection.', 'ساخت تصویر آیه انجام نشد. لطفاً از گزینه اشتراک‌گذاری لینک استفاده کنید یا با اتصال اینترنت دوباره تلاش کنید.'));
    });
  }

  function makeButton(id, label, aria, click, extraStyle) {
    if (document.getElementById(id)) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = 'verse-refresh';
    button.innerHTML = label;
    button.setAttribute('aria-label', aria);
    button.style.marginInlineStart = '0.45rem';
    if (extraStyle) Object.keys(extraStyle).forEach(function (key) { button.style[key] = extraStyle[key]; });
    button.addEventListener('click', click);
    return button;
  }

  function addButtons() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh) return;
    var parent = refresh.parentNode;
    var share = document.getElementById(BUTTON_ID);
    if (!share) {
      share = makeButton(BUTTON_ID,
        '<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-inline-end:7px"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"></path></svg><span>' + msg('Share Link', 'اشتراک‌گذاری لینک') + '</span>',
        'Share the verse link using any app', shareLink);
      parent.insertBefore(share, refresh.nextSibling);
    }
    var imageButton = document.getElementById(IMAGE_BUTTON_ID);
    if (!imageButton) {
      imageButton = makeButton(IMAGE_BUTTON_ID,
        '<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-inline-end:7px"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path></svg><span>' + msg('Share Card', 'اشتراک‌گذاری تصویر آیه') + '</span>',
        'Share the complete Bible verse card as an image', shareCardImage,
        { marginTop: '0.4rem' });
      parent.insertBefore(imageButton, share ? share.nextSibling : refresh.nextSibling);
    }
  }

  function boot() {
    var oldButton = document.getElementById('daily-share');
    if (oldButton) oldButton.remove();
    var oldPanel = document.getElementById('vshare-overlay');
    if (oldPanel) oldPanel.remove();
    addButtons();
    if (!document.getElementById(BUTTON_ID) || !document.getElementById(IMAGE_BUTTON_ID)) {
      var observer = new MutationObserver(addButtons);
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { observer.disconnect(); }, 10000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
