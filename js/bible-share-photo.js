/* Photo share: profile picture + verse + seventhtrumpet.org on one image */
(function () {
  function isEn() {
    try { return (localStorage.getItem('cog_lang') || 'fa') === 'en'; } catch (e) { return false; }
  }
  function toast(msg) {
    var t = document.getElementById('vshare-toast');
    if (t) t.remove();
    t = document.createElement('div');
    t.id = 'vshare-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:6000;background:#0a2540;color:#fff;padding:0.7rem 1rem;border-radius:12px;font-size:0.88rem;font-weight:700;max-width:92%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    document.body.appendChild(t);
    setTimeout(function () { try { t.remove(); } catch (e) {} }, 3800);
  }
  function getLogo() {
    if (typeof window.ST_LOGO === 'string' && window.ST_LOGO.length > 100) return window.ST_LOGO;
    var img = document.querySelector('img.logo-img');
    return (img && img.src) || '';
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
  function brand() { return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645'; }
  function loadImg(src) {
    return new Promise(function (res) {
      if (!src) return res(null);
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { res(im); };
      im.onerror = function () { res(null); };
      im.src = src;
    });
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
  function makeCanvas() {
    var p = versePayload();
    var W = 1080, H = 1350;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0a2540'); g.addColorStop(1, '#123a5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(201,162,39,.9)'; ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    return loadImg(getLogo()).then(function (logo) {
      var cy = 220, r = 150;
      if (logo) {
        ctx.save();
        ctx.beginPath(); ctx.arc(W / 2, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        ctx.drawImage(logo, W / 2 - r, cy - r, r * 2, r * 2);
        ctx.restore();
        ctx.beginPath(); ctx.arc(W / 2, cy, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 10; ctx.stroke();
      }
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '700 42px system-ui,Tahoma,sans-serif';
      ctx.fillText(brand(), W / 2, cy + r + 70);
      var verse = p.text || 'Seventh Trumpet';
      if (verse.length > 300) verse = verse.slice(0, 300) + '\u2026';
      ctx.fillStyle = '#f5f7fa';
      ctx.font = '500 44px system-ui,Tahoma,sans-serif';
      var lines = wrap(ctx, verse, W - 140);
      if (lines.length > 8) { lines = lines.slice(0, 8); lines[7] += '\u2026'; }
      var y = cy + r + 150;
      lines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, y + i * 58); });
      if (p.ref) {
        ctx.fillStyle = '#c9a227';
        ctx.font = '700 36px system-ui,Tahoma,sans-serif';
        ctx.fillText(p.ref, W / 2, y + lines.length * 58 + 40);
      }
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.font = '700 34px system-ui,Tahoma,sans-serif';
      ctx.fillText('seventhtrumpet.org', W / 2, H - 90);
      return c;
    });
  }
  function saveOrShare(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        if (!blob) return resolve(false);
        var file = new File([blob], 'seventh-trumpet-verse.jpg', { type: 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: brand(), text: 'seventhtrumpet.org' })
            .then(function () { resolve(true); })
            .catch(function () {
              var a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'seventh-trumpet-verse.jpg';
              a.click();
              resolve(true);
            });
        } else {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'seventh-trumpet-verse.jpg';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { try { a.remove(); } catch (e) {} }, 800);
          resolve(true);
        }
      }, 'image/jpeg', 0.92);
    });
  }
  window.ST_sharePhoto = function (openIg) {
    var en = isEn();
    toast(en ? 'Preparing picture with profile\u2026' : '\u062f\u0631 \u062d\u0627\u0644 \u0633\u0627\u062e\u062a \u0639\u06a9\u0633 \u0628\u0627 \u067e\u0631\u0648\u0641\u0627\u06cc\u0644\u2026');
    makeCanvas().then(function (c) {
      return saveOrShare(c).then(function () {
        toast(en
          ? 'Picture ready: profile + verse. Add to Instagram Story.'
          : '\u0639\u06a9\u0633 \u0622\u0645\u0627\u062f\u0647: \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0622\u06cc\u0647. \u062f\u0631 \u0627\u0633\u062a\u0648\u0631\u06cc \u0628\u06af\u0630\u0627\u0631\u06cc\u062f.');
        if (openIg) setTimeout(function () {
          window.open('https://www.instagram.com/seventhtrumpet.media', '_blank', 'noopener');
        }, 500);
      });
    }).catch(function () {
      toast(en ? 'Could not make picture' : '\u0639\u06a9\u0633 \u0633\u0627\u062e\u062a\u0647 \u0646\u0634\u062f');
    });
  };

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('[data-go="ig"],[data-go="img"]');
    if (!btn) return;
    var go = btn.getAttribute('data-go');
    if (go !== 'ig' && go !== 'img') return;
    e.preventDefault();
    e.stopPropagation();
    var ov = document.getElementById('vshare-overlay');
    if (ov) try { ov.remove(); } catch (err) {}
    setTimeout(function () { window.ST_sharePhoto(go === 'ig'); }, 60);
  }, true);

  var obs = new MutationObserver(function () {
    var grid = document.querySelector('.vshare-grid');
    if (!grid || grid.querySelector('[data-go="img"]')) return;
    var en = isEn();
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'vshare-btn img';
    b.setAttribute('data-go', 'img');
    b.textContent = en ? 'Photo (profile + verse)' : '\u0639\u06a9\u0633 (\u067e\u0631\u0648\u0641\u0627\u06cc\u0644 + \u0622\u06cc\u0647)';
    b.style.cssText = 'background:#c9a227;color:#0a2540;grid-column:1/-1';
    var more = grid.querySelector('[data-go="more"]');
    if (more) grid.insertBefore(b, more);
    else grid.appendChild(b);
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
