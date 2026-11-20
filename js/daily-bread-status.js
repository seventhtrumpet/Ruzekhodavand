/* Daily Bread: generate a bilingual 9:16 verse image and open Android's share sheet. */
(function () {
  'use strict';

  var SITE = 'https://www.seventhtrumpet.org';
  var BUTTON_ID = 'daily-status-share';

  function language() {
    try { return localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa'; }
    catch (e) { return document.documentElement.lang || 'fa'; }
  }

  function dailyVerse() {
    var verses = window.DAILY_VERSES || [];
    if (!verses.length) return null;
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var day = Math.floor((now - start) / 86400000);
    var index = Math.abs(now.getFullYear() * 366 + day) % verses.length;
    return verses[index];
  }

  function addButton() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh || document.getElementById(BUTTON_ID)) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = BUTTON_ID;
    button.className = 'verse-refresh';
    button.textContent = language() === 'en' ? 'Share to WhatsApp Status' : 'اشتراک‌گذاری در وضعیت واتساپ';
    button.setAttribute('aria-label', 'Share the daily Bible verse image');
    button.style.marginInlineStart = '0.45rem';
    button.addEventListener('click', shareStatus);
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
    var help = document.createElement('p');
    help.id = 'daily-status-link-help';
    help.textContent = language() === 'en'
      ? 'To add a clickable website card, choose the image in WhatsApp Status, tap Stickers > Link, and paste the copied website address.'
      : 'برای افزودن کارت لینک قابل کلیک، تصویر را در وضعیت واتساپ انتخاب کنید، روی برچسب‌ها و سپس Link بزنید و نشانی کپی‌شده را جای‌گذاری کنید.';
    help.style.margin = '0.5rem 0';
    help.style.fontSize = '0.9em';
    help.style.opacity = '0.85';
    button.parentNode.insertBefore(help, button.nextSibling);
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

  function wrappedLines(ctx, text, maxWidth) {
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

  function drawParagraph(ctx, text, x, y, maxWidth, lineHeight, direction) {
    ctx.direction = direction;
    ctx.textAlign = 'center';
    var lines = wrappedLines(ctx, text, maxWidth);
    lines.forEach(function (line, i) { ctx.fillText(line, x, y + i * lineHeight, maxWidth); });
    return y + lines.length * lineHeight;
  }

  function makeImage(verse) {
    return new Promise(function (resolve, reject) {
      var canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      var ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas is unavailable'));

      var bg = ctx.createLinearGradient(0, 0, 1080, 1920);
      bg.addColorStop(0, '#071b31');
      bg.addColorStop(0.55, '#103653');
      bg.addColorStop(1, '#071827');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1080, 1920);

      var glow = ctx.createRadialGradient(540, 420, 20, 540, 420, 720);
      glow.addColorStop(0, 'rgba(201,162,39,0.22)');
      glow.addColorStop(1, 'rgba(201,162,39,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1080, 1250);

      ctx.strokeStyle = 'rgba(224,190,91,0.75)';
      ctx.lineWidth = 3;
      roundedRect(ctx, 42, 42, 996, 1836, 34);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(224,190,91,0.28)';
      ctx.lineWidth = 1.5;
      roundedRect(ctx, 60, 60, 960, 1800, 25);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.direction = 'ltr';
      ctx.fillStyle = '#f1d58a';
      ctx.font = '700 43px Inter, Vazirmatn, sans-serif';
      ctx.fillText('SEVENTH TRUMPET', 540, 170);
      ctx.direction = 'rtl';
      ctx.font = '600 38px Vazirmatn, Inter, sans-serif';
      ctx.fillText('شیپور هفتم', 540, 225);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 48px Inter, Vazirmatn, sans-serif';
      ctx.direction = 'ltr';
      ctx.fillText('DAILY BIBLE VERSE', 540, 345);
      ctx.direction = 'rtl';
      ctx.font = '700 43px Vazirmatn, Inter, sans-serif';
      ctx.fillText('آیه روز', 540, 410);

      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 465);
      ctx.lineTo(780, 465);
      ctx.stroke();

      var fa = (verse.fa || verse.en || '').trim();
      var en = (verse.en || verse.fa || '').trim();
      var faRef = (verse.ref_fa || verse.ref_en || '').trim();
      var enRef = (verse.ref_en || verse.ref_fa || '').trim();

      ctx.fillStyle = '#f1d58a';
      ctx.font = '700 34px Inter, Vazirmatn, sans-serif';
      ctx.direction = 'ltr';
      ctx.fillText('فارسی', 540, 555);
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 39px Vazirmatn, Tahoma, sans-serif';
      var y = drawParagraph(ctx, fa, 540, 635, 850, 62, 'rtl');
      ctx.fillStyle = '#e8d48b';
      ctx.font = '600 30px Vazirmatn, Tahoma, sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText(faRef, 540, y + 12);

      var dividerY = Math.max(y + 105, 980);
      ctx.strokeStyle = 'rgba(201,162,39,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(170, dividerY);
      ctx.lineTo(910, dividerY);
      ctx.stroke();

      ctx.fillStyle = '#f1d58a';
      ctx.font = '700 34px Inter, sans-serif';
      ctx.direction = 'ltr';
      ctx.fillText('ENGLISH', 540, dividerY + 88);
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 38px Inter, sans-serif';
      y = drawParagraph(ctx, en, 540, dividerY + 165, 850, 58, 'ltr');
      ctx.fillStyle = '#e8d48b';
      ctx.font = '600 30px Inter, sans-serif';
      ctx.direction = 'ltr';
      ctx.fillText(enRef, 540, y + 12);

      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 1665);
      ctx.lineTo(780, 1665);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 32px Inter, sans-serif';
      ctx.direction = 'ltr';
      ctx.fillText('www.seventhtrumpet.org', 540, 1740);
      ctx.fillStyle = '#cbd7e2';
      ctx.font = '400 25px Inter, sans-serif';
      ctx.fillText('The everlasting Gospel for all nations', 540, 1800);

      /* Add the site's existing social-preview logo as a circular profile mark. */
      var logo = new Image();
      logo.crossOrigin = 'anonymous';
      var logoFinished = false;
      var logoTimer = setTimeout(finishImage, 2500);
      logo.onload = function () {
        ctx.save();
        ctx.beginPath();
        ctx.arc(165, 170, 62, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, 103, 108, 124, 124);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(165, 170, 64, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8d48b';
        ctx.lineWidth = 5;
        ctx.stroke();
        finishImage();
      };
      logo.onerror = finishImage;
      logo.src = 'https://iili.io/n8MSJBp.jpg';

      function finishImage() {
        if (logoFinished) return;
        logoFinished = true;
        clearTimeout(logoTimer);
        canvas.toBlob(function (blob) {
          if (blob) resolve(new File([blob], 'seventh-trumpet-daily-verse.png', { type: 'image/png' }));
          else reject(new Error('Could not create the image'));
        }, 'image/png');
      }
    });
  }

  function shareStatus() {
    var verse = dailyVerse();
    if (!verse) {
      alert(language() === 'en' ? 'The daily verses are still loading. Please try again.' : 'آیات هنوز بارگذاری نشده‌اند. لطفاً دوباره تلاش کنید.');
      return;
    }
    var button = document.getElementById(BUTTON_ID);
    if (button) button.disabled = true;
    /* Copy the URL during the user's tap so it can be pasted into WhatsApp's Status text editor. */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SITE).catch(function () {});
    }
    Promise.resolve(document.fonts && document.fonts.ready).catch(function () {}).then(function () {
      return makeImage(verse);
    }).then(function (file) {
      var shareData = {
        files: [file],
        title: language() === 'en' ? 'Daily Bible Verse — Seventh Trumpet' : 'آیه روز — شیپور هفتم',
        text: 'Visit SeventhTrumpet.org: ' + SITE
      };
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        return navigator.share(shareData).catch(function (err) {
          if (err && err.name === 'AbortError') return;
          throw err;
        });
      }
      var url = URL.createObjectURL(file);
      var a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      alert(language() === 'en'
        ? 'Your verse image was saved and the website link was copied. In WhatsApp Status, choose the image, tap Stickers > Link, and paste the address to add a clickable link card: ' + SITE
        : 'تصویر آیه ذخیره و لینک وب‌سایت کپی شد. در وضعیت واتساپ، تصویر را انتخاب کنید، روی برچسب‌ها و سپس Link بزنید و نشانی را جای‌گذاری کنید تا کارت لینک قابل کلیک اضافه شود: ' + SITE);
    }).catch(function () {
      alert(language() === 'en' ? 'Sharing is not available on this browser. Please try another browser.' : 'اشتراک‌گذاری در این مرورگر در دسترس نیست. لطفاً مرورگر دیگری را امتحان کنید.');
    }).then(function () {
      if (button) button.disabled = false;
    });
  }

  function boot() {
    addButton();
    if (!document.getElementById(BUTTON_ID)) {
      var observer = new MutationObserver(addButton);
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { observer.disconnect(); }, 10000);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
