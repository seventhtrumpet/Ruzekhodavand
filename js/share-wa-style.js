/* WhatsApp-style share: real profile/branding image + verse text + tappable website link */
(function () {
  var SITE = 'https://seventhtrumpet.org/';
  var BRAND_IMG = 'https://iili.io/n8MSJBp.jpg';

  function isEn() {
    try { return (localStorage.getItem('cog_lang') || 'fa') === 'en'; } catch (e) { return false; }
  }
  function brand() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }
  function toast(msg) {
    var t = document.getElementById('vshare-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'vshare-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:8000;background:#0a2540;color:#fff;padding:0.7rem 1rem;border-radius:12px;font-size:0.88rem;font-weight:700;max-width:92%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function () { try { t.remove(); } catch (e) {} }, 3200);
  }

  function versePayload() {
    var text = '', ref = '';
    try {
      var vt = document.getElementById('verse-text');
      if (vt) text = (vt.textContent || '').trim();
      var vr = document.getElementById('verse-ref');
      if (vr) ref = (vr.textContent || '').trim();
    } catch (e) {}
    var selected = document.querySelectorAll('.mb-verse.selected');
    if (selected.length) {
      var lines = [];
      selected.forEach(function (el) { lines.push((el.textContent || '').trim()); });
      text = lines.join('\n');
      var f = selected[0];
      ref = (f.getAttribute('data-chapter') || '') + ':' + (f.getAttribute('data-verse') || '');
    }
    return { text: text, ref: ref };
  }

  function buildCaption() {
    var p = versePayload();
    var parts = [];
    if (p.text) parts.push(p.text);
    if (p.ref) parts.push(p.ref);
    parts.push(brand());
    parts.push(SITE);
    return parts.join('\n\n');
  }

  function logoSrc() {
    if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 200) return window.ST_LOGO;
    var img = document.querySelector('img.logo-img');
    if (img && img.src) return img.src;
    return BRAND_IMG;
  }

  function srcToBlob(src) {
    return new Promise(function (resolve) {
      if (!src) return resolve(null);
      if (src.indexOf('data:') === 0) {
        try {
          var arr = src.split(',');
          var mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
          var bstr = atob(arr[1]);
          var n = bstr.length;
          var u8 = new Uint8Array(n);
          while (n--) u8[n] = bstr.charCodeAt(n);
          resolve(new Blob([u8], { type: mime }));
        } catch (e) {
          resolve(null);
        }
        return;
      }
      fetch(src, { mode: 'cors' }).then(function (r) {
        return r.blob();
      }).then(function (b) {
        resolve(b);
      }).catch(function () {
        fetch(BRAND_IMG, { mode: 'cors' }).then(function (r) {
          return r.blob();
        }).then(resolve).catch(function () { resolve(null); });
      });
    });
  }

  /* Like before: profile picture + verse + tappable https://seventhtrumpet.org/ */
  window.ST_shareWhatsAppStyle = function () {
    var en = isEn();
    var caption = buildCaption();
    toast(en ? 'Preparing share\u2026' : '\u062f\u0631 \u062d\u0627\u0644 \u0622\u0645\u0627\u062f\u0647\u200c\u0633\u0627\u0632\u06cc\u2026');

    srcToBlob(logoSrc()).then(function (blob) {
      function textOnly() {
        if (navigator.share) {
          navigator.share({
            title: brand(),
            text: caption,
            url: SITE
          }).catch(function () {
            window.open('https://wa.me/?text=' + encodeURIComponent(caption), '_blank', 'noopener');
          });
        } else {
          window.open('https://wa.me/?text=' + encodeURIComponent(caption), '_blank', 'noopener');
        }
      }

      if (blob && navigator.canShare) {
        try {
          var file = new File([blob], 'seventh-trumpet.jpg', { type: blob.type || 'image/jpeg' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: brand(),
              text: caption,
              url: SITE
            }).then(function () {
              toast(en ? 'Shared: photo + verse + link' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0634\u062f');
            }).catch(function () {
              navigator.share({
                files: [file],
                title: brand(),
                text: caption
              }).then(function () {
                toast(en ? 'Shared' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0634\u062f');
              }).catch(function () {
                textOnly();
              });
            });
            return;
          }
        } catch (e) {}
      }
      textOnly();
    });
  };
})();
