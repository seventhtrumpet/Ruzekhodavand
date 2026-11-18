/* Share photo: profile + verse + website. WA/Messenger try image + tappable link together */
(function () {
  var FALLBACK_LOGO = 'https://iili.io/n8MSJBp.jpg';
  var logoReady = null;

  function isEn() {
    try { return (localStorage.getItem('cog_lang') || 'fa') === 'en'; } catch (e) { return false; }
  }
  function brand() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }
  function siteUrl() {
    return 'https://seventhtrumpet.org/';
  }
  function toast(msg) {
    var t = document.getElementById('vshare-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'vshare-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:8000;background:#0a2540;color:#fff;padding:0.7rem 1rem;border-radius:12px;font-size:0.88rem;font-weight:700;max-width:92%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function () { try { t.remove(); } catch (e) {} }, 3500);
  }

  function preloadLogo() {
    if (window.__stLogoImg) return Promise.resolve(window.__stLogoImg);
    if (logoReady) return logoReady;
    logoReady = new Promise(function (resolve) {
      function done(src) {
        if (!src) src = FALLBACK_LOGO;
        var im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = function () { window.__stLogoImg = im; resolve(im); };
        im.onerror = function () {
          if (src !== FALLBACK_LOGO) {
            var im2 = new Image();
            im2.crossOrigin = 'anonymous';
            im2.onload = function () { window.__stLogoImg = im2; resolve(im2); };
            im2.onerror = function () { resolve(null); };
            im2.src = FALLBACK_LOGO;
          } else resolve(null);
        };
        im.src = src;
      }
      if (window.__stLogoImg) { resolve(window.__stLogoImg); return; }
      var img = document.querySelector('img.logo-img');
      if (img && img.complete && img.naturalWidth > 10) { done(img.src); return; }
      if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 200) { done(window.ST_LOGO); return; }
      done(FALLBACK_LOGO);
    });
    return logoReady;
  }

  (function () {
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () { if (!window.__stLogoImg) window.__stLogoImg = im; };
    im.src = FALLBACK_LOGO;
  })();
  preloadLogo();

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
    if (!text) {
      var daily = document.getElementById('daily-verse-text') || document.querySelector('#daily-verse .verse-text, #daily-verse p');
      if (daily) text = (daily.textContent || '').trim().slice(0, 500);
      var dref = document.getElementById('daily-verse-ref') || document.querySelector('#daily-verse .verse-ref');
      if (dref) ref = (dref.textContent || '').trim();
    }
    return { text: text, ref: ref };
  }

  function captionFrom(p) {
    var parts = [];
    if (p && p.text) parts.push(String(p.text).slice(0, 220));
    if (p && p.ref) parts.push(p.ref);
    parts.push(brand());
    parts.push(siteUrl());
    return parts.join('\n\n');
  }

  function wrap(ctx, text, maxW) {
    var words = String(text || '').split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }

  function makeCanvas(payload) {
    var p = payload || versePayload();
    var W = 900, H = 1125;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a2540');
    g.addColorStop(1, '#123a5c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(201,162,39,.9)';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    return preloadLogo().then(function (logoImg) {
      var cy = 230, r = 180;
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logoImg, W / 2 - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(W / 2, cy, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#c9a227';
        ctx.lineWidth = 10;
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = '700 34px system-ui,Tahoma,sans-serif';
      ctx.fillText(brand(), W / 2, cy + r + 52);

      var verse = (p && p.text) || 'Seventh Trumpet';
      if (verse.length > 260) verse = verse.slice(0, 260) + '\u2026';
      ctx.fillStyle = '#f5f7fa';
      ctx.font = '500 36px system-ui,Tahoma,sans-serif';
      var lines = wrap(ctx, verse, W - 120);
      if (lines.length > 6) {
        lines = lines.slice(0, 6);
        lines[5] += '\u2026';
      }
      var y = cy + r + 100;
      lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y + i * 46); });
      if (p && p.ref) {
        ctx.fillStyle = '#c9a227';
        ctx.font = '700 30px system-ui,Tahoma,sans-serif';
        ctx.fillText(p.ref, W / 2, y + lines.length * 46 + 30);
      }

      var barTop = H - 170;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(48, barTop, W - 96, 120);
      ctx.strokeStyle = 'rgba(201,162,39,0.95)';
      ctx.lineWidth = 3;
      ctx.strokeRect(48, barTop, W - 96, 120);
      ctx.fillStyle = '#c9a227';
      ctx.font = '700 28px system-ui,Tahoma,sans-serif';
      ctx.fillText('seventhtrumpet.org', W / 2, barTop + 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 30px system-ui,Tahoma,sans-serif';
      ctx.fillText('@seventhtrumpet.media', W / 2, barTop + 82);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '600 20px system-ui,Tahoma,sans-serif';
      ctx.fillText(siteUrl(), W / 2, barTop + 108);
      return c;
    });
  }

  function ensureCss() {
    if (document.getElementById('st-photo-css')) return;
    var st = document.createElement('style');
    st.id = 'st-photo-css';
    st.textContent =
      '.st-photo-overlay{position:fixed;inset:0;z-index:7000;background:rgba(8,16,28,0.75);display:flex;align-items:center;justify-content:center;padding:1rem}' +
      '.st-photo-card{width:100%;max-width:380px;background:#fff;border-radius:16px;padding:1rem;box-shadow:0 12px 40px rgba(0,0,0,.35);text-align:center}' +
      'body.dark .st-photo-card{background:#152536;color:#e8eef5}' +
      '.st-photo-title{font-weight:800;font-size:1.05rem;margin:0 0 0.75rem;color:#0a2540}' +
      'body.dark .st-photo-title{color:#9ec5ea}' +
      '.st-photo-status{font-size:0.88rem;color:#5b6b7c;margin:0.45rem 0 0.9rem;line-height:1.4}' +
      '.st-photo-spin{width:36px;height:36px;border:3px solid #d8dee6;border-top-color:#c9a227;border-radius:50%;margin:0.75rem auto;animation:stspin .7s linear infinite}' +
      '@keyframes stspin{to{transform:rotate(360deg)}}' +
      '.st-photo-preview{width:100%;max-height:48vh;object-fit:contain;border-radius:12px;background:#0a2540;margin:0.4rem 0 0.8rem}' +
      '.st-photo-actions{display:flex;flex-direction:column;gap:0.45rem}' +
      '.st-photo-actions button{border:none;border-radius:12px;padding:0.85rem 0.75rem;font-family:inherit;font-weight:800;font-size:0.95rem;cursor:pointer}' +
      '.st-photo-save{background:#c9a227;color:#0a2540}' +
      '.st-photo-open{background:#0a2540;color:#fff}' +
      '.st-photo-close{background:transparent;color:#6b7785;font-weight:600}';
    document.head.appendChild(st);
  }

  function closePreview() {
    var el = document.getElementById('st-photo-overlay');
    if (el) try { el.remove(); } catch (e) {}
  }

  function showLoading() {
    ensureCss();
    closePreview();
    var en = isEn();
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    ov.innerHTML =
      '<div class="st-photo-card" role="dialog" aria-live="polite">' +
      '<p class="st-photo-title">' + (en ? 'Preparing picture\u2026' : '\u062f\u0631 \u062d\u0627\u0644 \u0633\u0627\u062e\u062a \u0639\u06a9\u0633\u2026') + '</p>' +
      '<div class="st-photo-spin"></div>' +
      '<p class="st-photo-status">' +
      (en ? 'Profile + verse + website link\u2026' : '\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0622\u06cc\u0647 + \u0644\u06cc\u0646\u06a9 \u0648\u0628\u0633\u0627\u06cc\u062a\u2026') +
      '</p></div>';
    document.body.appendChild(ov);
  }

  function showReady(dataUrl, blob, app, payload) {
    ensureCss();
    closePreview();
    var en = isEn();
    var ov = document.createElement('div');
    ov.id = 'st-photo-overlay';
    ov.className = 'st-photo-overlay';
    var saveLabel = en ? 'Share picture + link' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633 + \u0644\u06cc\u0646\u06a9';
    ov.innerHTML =
      '<div class="st-photo-card" role="dialog">' +
      '<p class="st-photo-title">' + (en ? 'Picture ready' : '\u0639\u06a9\u0633 \u0622\u0645\u0627\u062f\u0647 \u0627\u0633\u062a') + '</p>' +
      '<img class="st-photo-preview" alt="share" src="' + dataUrl + '" />' +
      '<p class="st-photo-status">' +
      (en
        ? 'Share sends profile photo + verse. The website link is included so people can open the site.'
        : '\u0639\u06a9\u0633 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0622\u06cc\u0647. \u0644\u06cc\u0646\u06a9 \u0648\u0628\u0633\u0627\u06cc\u062a \u0647\u0645 \u0647\u0633\u062a \u062a\u0627 \u0628\u062a\u0648\u0627\u0646\u0646\u062f \u0648\u0627\u0631\u062f \u0633\u0627\u06cc\u062a \u0634\u0648\u0646\u062f.') +
      '</p>' +
      '<div class="st-photo-actions">' +
      '<button type="button" class="st-photo-save" id="st-photo-save">' + saveLabel + '</button>' +
      '<button type="button" class="st-photo-close" id="st-photo-close">' +
      (en ? 'Done' : '\u062a\u0645\u0627\u0645') + '</button>' +
      '</div></div>';
    document.body.appendChild(ov);

    document.getElementById('st-photo-save').onclick = function () {
      shareBlob(blob, payload, app).then(function (ok) {
        if (!ok) {
          var a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'seventh-trumpet-share.jpg';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { try { a.remove(); } catch (e) {} }, 400);
          toast(en ? 'Picture saved — attach it and add the website link' : '\u0639\u06a9\u0633 \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f');
        }
      });
    };
    document.getElementById('st-photo-close').onclick = closePreview;
    ov.addEventListener('click', function (e) {
      if (e.target === ov) closePreview();
    });
  }

  function showError() {
    ensureCss();
    closePreview();
    var en = isEn();
    toast(en ? 'Could not make picture' : '\u0639\u06a9\u0633 \u0633\u0627\u062e\u062a\u0647 \u0646\u0634\u062f');
  }

  function shareBlob(blob, payload, app) {
    var en = isEn();
    var cap = captionFrom(payload || versePayload());
    if (!blob) return Promise.resolve(false);
    try {
      var file = new File([blob], 'seventh-trumpet-share.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: brand(),
          text: cap,
          url: siteUrl()
        }).then(function () {
          toast(en ? 'Shared: photo + website link' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0634\u062f: \u0639\u06a9\u0633 + \u0644\u06cc\u0646\u06a9');
          closePreview();
          return true;
        }).catch(function () {
          return navigator.share({
            files: [file],
            title: brand(),
            text: cap
          }).then(function () {
            toast(en ? 'Shared photo' : '\u0639\u06a9\u0633 \u0627\u0634\u062a\u0631\u0627\u06a9 \u0634\u062f');
            closePreview();
            return true;
          }).catch(function () { return false; });
        });
      }
    } catch (e) {}
    return Promise.resolve(false);
  }

  window.ST_sharePhoto = function (openIg, app, payload) {
    app = app || (openIg ? 'ig' : 'fb');
    payload = payload || null;
    var p = payload || versePayload();
    showLoading();
    makeCanvas(p).then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error('blob'));
          resolve({ blob: blob, dataUrl: URL.createObjectURL(blob) });
        }, 'image/jpeg', 0.8);
      });
    }).then(function (pack) {
      if (app === 'wa' || app === 'msg' || app === 'more' || app === 'system') {
        return shareBlob(pack.blob, p, app).then(function (ok) {
          if (!ok) showReady(pack.dataUrl, pack.blob, app, p);
        });
      }
      showReady(pack.dataUrl, pack.blob, app, p);
    }).catch(function () {
      showError();
    });
  };

  window.ST_shareWithPhoto = function (text, ref, app) {
    window.ST_sharePhoto(false, app || 'wa', { text: text || '', ref: ref || '' });
  };

  if (document.body && (document.body.getAttribute('data-page') === 'bible' || (location.pathname || '').indexOf('bible') >= 0)) {
    setTimeout(function () { preloadLogo(); }, 200);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('[data-go="ig"],[data-go="fb"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var go = btn.getAttribute('data-go');
    var ov = document.getElementById('vshare-overlay');
    if (ov) try { ov.remove(); } catch (err) {}
    setTimeout(function () {
      window.ST_sharePhoto(go === 'ig', go, null);
    }, 30);
  }, true);
})();
