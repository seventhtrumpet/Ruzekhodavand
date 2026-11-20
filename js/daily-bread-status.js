/* Daily Bread: share a live HTML verse card link through Android's share sheet. */
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

    // Use the verse currently shown on the page, including a verse chosen
    // with the "New verse" button, rather than independently recalculating it.
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
          (visibleText && [v.fa, v.en].some(function (t) {
            return t && String(t).trim() === visibleText;
          }));
      });
      if (match) return match;
    }

    // Fallback to the same calendar-day selection used by the homepage.
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var day = Math.floor((now - start) / 86400000);
    return verses[Math.abs(now.getFullYear() * 366 + day) % verses.length];
  }
  function shareStatus() {
    var verse = dailyVerse();
    if (!verse) {
      alert(language() === 'en' ? 'The daily verse is not ready yet. Please try again.' : 'آیه روز هنوز آماده نیست. لطفاً دوباره تلاش کنید.');
      return;
    }
    var params = new URLSearchParams();
    params.set('fa', verse.fa || '');
    params.set('en', verse.en || '');
    params.set('rf', verse.ref_fa || '');
    params.set('re', verse.ref_en || '');
    var url = SITE + '/daily-bread-share.html?' + params.toString();
    var text = (verse.fa || '') + '\n' + (verse.ref_fa || '') + '\n\n' +
      (verse.en || '') + '\n' + (verse.ref_en || '') + '\n\n' +
      'Seventh Trumpet | www.seventhtrumpet.org';
    if (navigator.share) {
      try {
        var p = navigator.share({ title: 'Daily Bible Verse | Seventh Trumpet', text: text, url: url });
        if (p && p.catch) p.catch(function (err) {
          if (err && err.name !== 'AbortError') alert(language() === 'en' ? 'Android could not open the share menu. Please try again.' : 'منوی اشتراک‌گذاری اندروید باز نشد. لطفاً دوباره تلاش کنید.');
        });
      } catch (err) {
        alert(language() === 'en' ? 'Android could not open the share menu. Please try again.' : 'منوی اشتراک‌گذاری اندروید باز نشد. لطفاً دوباره تلاش کنید.');
      }
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        alert(language() === 'en' ? 'Share link copied.' : 'لینک اشتراک‌گذاری کپی شد.');
      }).catch(function () { window.prompt('Copy this share link:', url); });
    } else window.prompt('Copy this share link:', url);
  }
  function addButton() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh || document.getElementById(BUTTON_ID)) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.id = BUTTON_ID;
    button.className = 'verse-refresh';
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-inline-end:7px"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"></path></svg><span>' + (language() === 'en' ? 'Share' : 'اشتراک‌گذاری') + '</span>';
    button.setAttribute('aria-label', 'Share the daily Bible verse card');
    button.style.marginInlineStart = '0.45rem';
    button.addEventListener('click', shareStatus);
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }
  function boot() {
    var oldButton = document.getElementById('daily-share');
    if (oldButton) oldButton.remove();
    var oldPanel = document.getElementById('vshare-overlay');
    if (oldPanel) oldPanel.remove();
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