/* Daily Bread share:
   - IMAGE = profile picture only (not a composite)
   - CARD  = message text under the photo (verse + real tappable website link)
   WhatsApp shows photo on top and the text/link card under it — link stays tappable.
*/
(function () {
  'use strict';

  var SITE = 'https://seventhtrumpet.org/';
  var LOGO = 'https://iili.io/n8MSJBp.jpg';
  var BUTTON_ID = 'daily-status-share-card';
  var SIZE = 1080;

  var preparedPhoto = null;
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
      heading: isEn() ? 'Fresh Bread' : '\u0646\u0627\u0646 \u062a\u0627\u0632\u0647',
      brand: isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
      url: SITE
    };
  }

  /* Text card under the photo — NOT drawn into the image pixels */
  function buildCardCaption(data) {
    var lines = [];
    lines.push(data.heading);
    if (data.text) lines.push(data.text);
    if (data.reference) lines.push(data.reference);
    lines.push(data.brand);
    lines.push(data.url);
    return lines.filter(Boolean).join('\n\n');
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

  /* Profile picture ONLY — no verse or link baked into pixels */
  function makeProfilePhotoOnly() {
    return loadLogo().then(function (img) {
      var canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      var ctx = canvas.getContext('2d');

      var bg = ctx.createLinearGradient(0, 0, 0, SIZE);
      bg.addColorStop(0, '#0a2540');
      bg.addColorStop(1, '#163a5f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);

      if (img) {
        var side = Math.min(img.width, img.height);
        var sx = (img.width - side) / 2;
        var sy = (img.height - side) / 2;
        var out = 780;
        var ox = (SIZE - out) / 2;
        var oy = (SIZE - out) / 2 - 20;
        ctx.save();
        ctx.beginPath();
        ctx.arc(SIZE / 2, oy + out / 2, out / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, side, side, ox, oy, out, out);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(SIZE / 2, oy + out / 2, out / 2 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(201,162,39,0.9)';
        ctx.lineWidth = 10;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px "Vazirmatn", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645', SIZE / 2, SIZE - 56);

      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error('blob'));
        }, 'image/jpeg', 0.92);
      });
    });
  }

  function preparePhoto() {
    makeProfilePhotoOnly()
      .then(function (blob) {
        preparedPhoto = new File([blob], 'seventh-trumpet-profile.jpg', { type: 'image/jpeg' });
      })
      .catch(function (err) {
        console.warn('Profile photo prepare failed:', err);
      });
  }

  function shareFreshBread() {
    var data = verseData();
    if (!data || !data.text) {
      alert(msg(
        'The daily verse is not ready yet. Please try again.',
        '\u0622\u06cc\u0647 \u0631\u0648\u0632 \u0647\u0646\u0648\u0632 \u0622\u0645\u0627\u062f\u0647 \u0646\u06cc\u0633\u062a. \u0644\u0637\u0641\u0627\u064b \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0634 \u06a9\u0646\u06cc\u062f.'
      ));
      return;
    }

    var caption = buildCardCaption(data);

    function send(file) {
      if (!navigator.share) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(caption);
        }
        if (file) {
          try {
            var a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'seventh-trumpet-profile.jpg';
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
              try { a.remove(); URL.revokeObjectURL(a.href); } catch (e) {}
            }, 400);
          } catch (e) {}
        }
        alert(msg(
          'Profile photo saved. Link copied \u2014 paste under the photo.',
          '\u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f. \u0644\u06cc\u0646\u06a9 \u06a9\u067e\u06cc \u0634\u062f \u2014 \u0632\u06cc\u0631 \u0639\u06a9\u0633 \u062c\u0627\u06cc\u200c\u06af\u0630\u0627\u0631\u06cc \u06a9\u0646\u06cc\u062f.'
        ));
        return;
      }

      var payload = {
        title: data.brand + ' | ' + data.heading,
        text: caption,
        url: data.url
      };

      if (file) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            payload.files = [file];
          }
        } catch (e) {}
      }

      navigator.share(payload).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        var textOnly = { title: payload.title, text: caption, url: data.url };
        navigator.share(textOnly).catch(function () {});
      });
    }

    if (preparedPhoto) {
      send(preparedPhoto);
      return;
    }

    makeProfilePhotoOnly()
      .then(function (blob) {
        var file = new File([blob], 'seventh-trumpet-profile.jpg', { type: 'image/jpeg' });
        preparedPhoto = file;
        send(file);
      })
      .catch(function () {
        send(null);
      });
  }

  function addButton() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh) return;

    ['daily-status-share-card', 'daily-share', 'daily-status-share', 'daily-status-share-image'].forEach(function (id) {
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
        'Share profile photo with Fresh Bread card and tappable website link',
        '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0628\u0627 \u06a9\u0627\u0631\u062a \u0646\u0627\u0646 \u062a\u0627\u0632\u0647 \u0648 \u0644\u06cc\u0646\u06a9 \u0642\u0627\u0628\u0644 \u0644\u0645\u0633'
      )
    );
    button.addEventListener('click', function (e) {
      e.preventDefault();
      shareFreshBread();
    });
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() {
    addButton();
    loadLogo().then(function () { preparePhoto(); });
    setTimeout(preparePhoto, 800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
