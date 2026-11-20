/* Fresh Bread sharing: original profile photo + separate link and verse text. */
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
      url: SITE + 'v/' + Math.max(0, index)
    };
  }

  function getProfilePhoto() {
    return fetch(LOGO, { mode: 'cors', cache: 'force-cache' }).then(function (r) {
      if (!r.ok) throw new Error('photo-fetch');
      return r.blob();
    });
  }

  function shareToApp(app) {
    var data = verseData();
    if (!data || !data.text) {
      alert(msg('The daily verse is not ready yet. Please try again.', 'آیه روز هنوز آماده نیست. لطفاً دوباره تلاش کنید.'));
      return;
    }

    // The profile picture is the only image. Link and verse remain separate share text.
    getProfilePhoto().then(function (blob) {
      var file = new File([blob], 'seventh-trumpet-profile.jpg', { type: blob.type || 'image/jpeg' });
      var caption = data.url + '\n\n' + data.text +
        (data.reference ? '\n\n' + data.reference : '');
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: 'Seventh Trumpet | Daily Bible Verse',
          text: caption
        });
      }
      if (navigator.share) return navigator.share({ title: 'Seventh Trumpet', text: caption, url: data.url });
      throw new Error('share-unavailable');
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      alert(msg(
        'Your browser could not open the share options. Please try More apps from the share menu.',
        'مرورگر نتوانست گزینه‌های اشتراک‌گذاری را باز کند. لطفاً دوباره تلاش کنید.'
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
    panel.style.cssText = 'width:100%;max-width:420px;background:#fff;color:#172b3e;border-radius:18px;padding:18px 16px 14px;box-shadow:0 -8px 32px rgba(0,0,0,.25);font-family:inherit';
    if (document.body.classList.contains('dark')) { panel.style.background = '#152536'; panel.style.color = '#e8eef5'; }
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
    overlay.addEventListener('click', function (event) { if (event.target === overlay) overlay.remove(); });
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
    button.setAttribute('aria-label', msg('Share the profile photo, website link and Daily Verse', 'اشتراک‌گذاری عکس پروفایل، لینک وب‌سایت و آیه روز'));
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
