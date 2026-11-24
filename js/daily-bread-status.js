/* Fresh Bread + site share: profile photo + verse + real tappable website link */
(function () {
  'use strict';

  var SITE = 'https://seventhtrumpet.org/';
  var LOGO = 'https://iili.io/n8MSJBp.jpg';
  var BUTTON_ID = 'daily-status-share-card';
  var preparedPhoto = null;
  var logoImg = null;

  function language() {
    try {
      var saved = localStorage.getItem('cog_lang');
      if (saved === 'en' || saved === 'fa') return saved;
    } catch (e) {}
    return document.documentElement.lang === 'en' ? 'en' : 'fa';
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
      var matchIndex = -1;
      for (var i = 0; i < verses.length; i++) {
        var v = verses[i];
        var refs = [v.ref_fa, v.ref_en, v.refFa, v.refEn, v.ref];
        var texts = [v.fa, v.en];
        var refHit = ref && refs.some(function (r) { return r && String(r).trim() === ref; });
        var textHit = text && texts.some(function (t) { return t && String(t).trim() === text; });
        if (refHit || textHit) { matchIndex = i; break; }
      }
      if (matchIndex < 0) {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var day = Math.floor((now - start) / 86400000);
        matchIndex = Math.abs(now.getFullYear() * 366 + day) % verses.length;
      }
      var match = verses[matchIndex];
      if (match) {
        return {
          fa: match.fa || '',
          en: match.en || '',
          refFa: match.ref_fa || match.refFa || match.ref || '',
          refEn: match.ref_en || match.refEn || match.ref || ''
        };
      }
    }
    return {
      fa: isEn() ? '' : text,
      en: isEn() ? text : '',
      refFa: isEn() ? '' : ref,
      refEn: isEn() ? ref : ''
    };
  }

  function brand() {
    return isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }

  function buildCaption() {
    var data = verseData();
    var verse = isEn() ? data.en : data.fa;
    var reference = isEn() ? data.refEn : data.refFa;
    var lines = [];
    lines.push(isEn() ? 'Fresh Bread' : '\u0646\u0627\u0646 \u062a\u0627\u0632\u0647');
    if (verse) lines.push(verse);
    if (reference) lines.push(reference);
    lines.push(brand());
    lines.push(SITE);
    return { verse: verse, caption: lines.filter(Boolean).join('\n\n') };
  }

  function copyFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        alert(msg(
          'Copied: verse + website link. Paste under the photo if needed.',
          '\u06a9\u067e\u06cc \u0634\u062f: \u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a. \u062f\u0631 \u0635\u0648\u0631\u062a \u0646\u06cc\u0627\u0632 \u0632\u06cc\u0631 \u0639\u06a9\u0633 \u062c\u0627\u06cc\u200c\u06af\u0630\u0627\u0631\u06cc \u06a9\u0646\u06cc\u062f.'
        ));
      }).catch(function () {
        try { prompt(msg('Copy:', '\u06a9\u067e\u06cc:'), text); } catch (e) {}
      });
    } else {
      try { prompt(msg('Copy:', '\u06a9\u067e\u06cc:'), text); } catch (e) {}
    }
  }

  function loadLogo() {
    if (logoImg) return Promise.resolve(logoImg);
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { logoImg = img; resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = LOGO;
    });
  }

  function makeProfileFile() {
    return loadLogo().then(function (img) {
      var size = 1080;
      var canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext('2d');
      var bg = ctx.createLinearGradient(0, 0, 0, size);
      bg.addColorStop(0, '#0a2540');
      bg.addColorStop(1, '#163a5f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      if (img) {
        var side = Math.min(img.width, img.height);
        var sx = (img.width - side) / 2;
        var sy = (img.height - side) / 2;
        var out = 780;
        var ox = (size - out) / 2;
        var oy = (size - out) / 2 - 24;
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, oy + out / 2, out / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, side, side, ox, oy, out, out);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(size / 2, oy + out / 2, out / 2 + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(201,162,39,0.9)';
        ctx.lineWidth = 10;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px "Vazirmatn", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(brand(), size / 2, size - 52);

      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('blob'));
          resolve(new File([blob], 'seventh-trumpet-profile.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
      });
    });
  }

  function preparePhoto() {
    makeProfileFile()
      .then(function (file) { preparedPhoto = file; })
      .catch(function () { preparedPhoto = null; });
  }

  function shareWithPhotoAndLink(file, caption) {
    var payload = {
      title: brand() + ' | Fresh Bread',
      text: caption,
      url: SITE
    };

    function shareTextOnly() {
      return navigator.share({
        title: payload.title,
        text: caption,
        url: SITE
      });
    }

    if (!navigator.share) {
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
      copyFallback(caption);
      return;
    }

    if (file) {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          var withFile = {
            title: payload.title,
            text: caption,
            files: [file]
          };
          try { withFile.url = SITE; } catch (e) {}
          return navigator.share(withFile).catch(function (err) {
            if (err && err.name === 'AbortError') return;
            return shareTextOnly().catch(function () { copyFallback(caption); });
          });
        }
      } catch (e) {}
    }

    return shareTextOnly().catch(function (err) {
      if (err && err.name === 'AbortError') return;
      copyFallback(caption);
    });
  }

  function shareFreshBread() {
    var built = buildCaption();
    if (!built.verse) {
      alert(msg(
        'The daily verse is not ready yet. Please try again.',
        '\u0622\u06cc\u0647 \u0627\u0645\u0631\u0648\u0632 \u0647\u0646\u0648\u0632 \u0622\u0645\u0627\u062f\u0647 \u0646\u06cc\u0633\u062a. \u0644\u0637\u0641\u0627\u064b \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0634 \u06a9\u0646\u06cc\u062f.'
      ));
      return;
    }

    var caption = built.caption;

    if (preparedPhoto) {
      shareWithPhotoAndLink(preparedPhoto, caption);
      return;
    }

    makeProfileFile()
      .then(function (file) {
        preparedPhoto = file;
        shareWithPhotoAndLink(file, caption);
      })
      .catch(function () {
        shareWithPhotoAndLink(null, caption);
      });
  }

  window.ST_shareFreshBread = shareFreshBread;
  window.ST_shareSiteWithProfile = function (extraText) {
    var caption = [extraText || brand(), SITE].filter(Boolean).join('\n\n');
    if (preparedPhoto) return shareWithPhotoAndLink(preparedPhoto, caption);
    return makeProfileFile().then(function (file) {
      preparedPhoto = file;
      return shareWithPhotoAndLink(file, caption);
    }).catch(function () {
      return shareWithPhotoAndLink(null, caption);
    });
  };

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
    button.setAttribute('aria-label', msg(
      'Share profile photo with verse and tappable website link',
      '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0628\u0627 \u0622\u06cc\u0647 \u0648 \u0644\u06cc\u0646\u06a9 \u0642\u0627\u0628\u0644 \u0644\u0645\u0633 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a'
    ));
    button.addEventListener('click', function (event) {
      event.preventDefault();
      shareFreshBread();
    });
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() {
    addButton();
    preparePhoto();
    setTimeout(preparePhoto, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
