/* Share the actual Daily Bible Verse card image through the Android share sheet. */
(function () {
  'use strict';
  var SITE = 'https://www.seventhtrumpet.org';
  var LOGO = 'https://iili.io/n8MSJBp.jpg';
  var BUTTON_ID = 'daily-status-share-card';

  function language() {
    try { return localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa'; }
    catch (e) { return document.documentElement.lang || 'fa'; }
  }
  function msg(en, fa) { return language() === 'en' ? en : fa; }

  function dailyVerse() {
    var verses = window.DAILY_VERSES || [];
    if (!verses.length) return null;
    var visibleText = (document.getElementById('verse-text') || {}).textContent || '';
    var visibleRef = (document.getElementById('verse-ref') || {}).textContent || '';
    visibleText = visibleText.trim();
    visibleRef = visibleRef.trim();
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
    var verses = window.DAILY_VERSES || [];
    var verse = dailyVerse();
    if (!verse) return null;
    var index = verses.indexOf(verse);
    if (index < 0) index = 0;
    var isEnglish = language() === 'en';
    return {
      text: isEnglish ? (verse.en || verse.fa || '') : (verse.fa || verse.en || ''),
      reference: isEnglish
        ? (verse.ref_en || verse.refEn || verse.ref || '')
        : (verse.ref_fa || verse.refFa || verse.ref || ''),
      url: SITE + '/v/' + index
    };
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
      var candidate = line ? line + ' ' + word : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
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
      canvas.height = 1920;
      var ctx = canvas.getContext('2d');
      var bg = ctx.createLinearGradient(0, 0, 1080, 1920);
      bg.addColorStop(0, '#071b31');
      bg.addColorStop(0.55, '#123b58');
      bg.addColorStop(1, '#071827');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.shadowColor = 'rgba(0,0,0,.28)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 14;
      roundedRect(ctx, 58, 250, 964, 1480, 34);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 270, 112, 0, Math.PI * 2);
      ctx.clip();
      var side = Math.min(logo.naturalWidth, logo.naturalHeight);
      ctx.drawImage(logo,
        (logo.naturalWidth - side) / 2, (logo.naturalHeight - side) / 2, side, side,
        428, 158, 224, 224);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(540, 270, 112, 0, Math.PI * 2);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#d4b45d';
      ctx.stroke();

      var isEnglish = language() === 'en';
      ctx.textAlign = 'center';
      ctx.direction = isEnglish ? 'ltr' : 'rtl';
      ctx.fillStyle = '#0a2540';
      ctx.font = 'bold 42px system-ui, sans-serif';
      ctx.fillText(isEnglish ? 'SEVENTH TRUMPET' : 'شیپور هفتم', 540, 455);

      ctx.fillStyle = '#9b7824';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText(isEnglish ? 'DAILY BIBLE VERSE' : 'آیه روز کتاب مقدس', 540, 555);

      var fontSize = isEnglish ? 40 : 43;
      ctx.fillStyle = '#172b3e';
      ctx.font = fontSize + 'px system-ui, sans-serif';
      var lines = wrapText(ctx, data.text, 820);
      var lineHeight = isEnglish ? 62 : 72;
      var maxLines = Math.floor(700 / lineHeight);
      if (lines.length > maxLines) {
        fontSize -= 5;
        ctx.font = fontSize + 'px system-ui, sans-serif';
        lines = wrapText(ctx, data.text, 850);
        lineHeight -= 7;
      }
      var y = 680;
      lines.forEach(function (line) {
        ctx.fillText(line, 540, y);
        y += lineHeight;
      });

      ctx.fillStyle = '#8a6a20';
      ctx.font = 'bold 31px system-ui, sans-serif';
      ctx.fillText(data.reference, 540, Math.min(y + 42, 1510));

      ctx.beginPath();
      ctx.moveTo(155, 1580);
      ctx.lineTo(925, 1580);
      ctx.strokeStyle = '#d8c58e';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#0b3859';
      ctx.direction = 'ltr';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText('www.seventhtrumpet.org', 540, 1650);
      ctx.fillStyle = '#687887';
      ctx.font = '23px system-ui, sans-serif';
      ctx.fillText(isEnglish ? 'Read the Bible • Share the Gospel' : 'کتاب مقدس را بخوانید • انجیل را به اشتراک بگذارید', 540, 1695);

      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('image-create'));
        }, 'image/png');
      });
    });
  }

  function shareToApp(app) {
    var data = verseData();
    if (!data || !data.text) {
      alert(msg('The daily verse is not ready yet. Please try again.', 'آیه روز هنوز آماده نیست. لطفاً دوباره تلاش کنید.'));
      return;
    }
    makeCardBlob(data).then(function (blob) {
      var file = new File([blob], 'Seventh-Trumpet-Daily-Verse.png', { type: 'image/png' });
      var shareText = (language() === 'en'
        ? data.text + '\\n\\n' + data.reference + '\\n\\nSeventh Trumpet\\n' + data.url
        : data.text + '\\n\\n' + data.reference + '\\n\\nشیپور هفتم\\n' + data.url);
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: 'Daily Bible Verse | Seventh Trumpet',
          text: shareText,
          url: data.url
        }).catch(function (err) {
          if (err && err.name !== 'AbortError') {
            alert(msg('Sharing could not be opened. Please try another app.', 'اشتراک‌گذاری باز نشد. لطفاً برنامه دیگری را امتحان کنید.'));
          }
        });
      }
      var objectUrl = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'Seventh-Trumpet-Daily-Verse.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 60000);
      alert(msg(
        'Your phone does not support sharing the image directly. The card was saved to Gallery.',
        'گوشی شما اشتراک‌گذاری مستقیم تصویر را پشتیبانی نمی‌کند. کارت در گالری ذخیره شد.'
      ));
    }).catch(function () {
      alert(msg(
        'The image could not be prepared. Please check your internet connection and try again.',
        'ساخت تصویر انجام نشد. لطفاً اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'
      ));
    });
  }

  function openDailySharePanel() {
    var old = document.getElementById('daily-bread-share-overlay');
    if (old) old.remove();
    var en = language() === 'en';
    var overlay = document.createElement('div');
    overlay.id = 'daily-bread-share-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(8,16,28,.62);display:flex;align-items:flex-end;justify-content:center;padding:12px';
    var panel = document.createElement('div');
    panel.style.cssText = 'width:100%;max-width:420px;background:#fff;color:#172b3e;border-radius:18px 18px 14px 14px;padding:18px 16px 14px;box-shadow:0 -8px 32px rgba(0,0,0,.25);font-family:inherit';
    if (document.body.classList.contains('dark')) {
      panel.style.background = '#152536';
      panel.style.color = '#e8eef5';
    }
    var heading = document.createElement('p');
    heading.textContent = en ? 'Share Daily Verse' : 'اشتراک‌گذاری آیه روز';
    heading.style.cssText = 'font-weight:800;font-size:1.1rem;text-align:center;margin:0 0 14px';
    panel.appendChild(heading);
    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:9px';
    var apps = [
      { id: 'wa', label: 'WhatsApp', color: '#25D366' },
      { id: 'msg', label: 'Messenger', color: '#087CFA' },
      { id: 'signal', label: 'Signal', color: '#3A76F0' },
      { id: 'tg', label: 'Telegram', color: '#0088cc' },
      { id: 'fb', label: 'Facebook', color: '#1877F2' },
      { id: 'ig', label: 'Instagram', color: '#C13584' },
      { id: 'tt', label: 'TikTok', color: '#202020' },
      { id: 'more', label: en ? 'More apps…' : 'برنامه‌های بیشتر…', color: '#5b6b7c' }
    ];
    apps.forEach(function (app) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = app.label;
      button.style.cssText = 'border:0;border-radius:12px;padding:13px 8px;color:#fff;font:700 .92rem inherit;cursor:pointer;background:' + app.color;
      button.addEventListener('click', function () {
        overlay.remove();
        shareToApp(app.id);
      });
      grid.appendChild(button);
    });
    panel.appendChild(grid);
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = en ? 'Close' : 'بستن';
    close.style.cssText = 'display:block;width:100%;border:0;background:transparent;color:inherit;opacity:.75;font:600 .95rem inherit;padding:13px 8px 2px;cursor:pointer';
    close.addEventListener('click', function () { overlay.remove(); });
    panel.appendChild(close);
    overlay.appendChild(panel);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
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
    button.setAttribute('aria-label', msg('Choose WhatsApp, Messenger, Signal or another app to share the Daily Verse', 'برای اشتراک‌گذاری آیه روز، واتساپ، مسنجر، سیگنال یا برنامه دیگری را انتخاب کنید'));
    button.addEventListener('click', openDailySharePanel);
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() {
    ['daily-share', 'vshare-overlay', 'daily-status-share', 'daily-status-share-image'].forEach(function (id) {
      var old = document.getElementById(id);
      if (old) old.remove();
    });
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