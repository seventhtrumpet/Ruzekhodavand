/* Fresh Bread share: share the verse in the visitor's selected site language.
   Keep the original native website preview (profile image + tappable homepage link). */
(function () {
  'use strict';

  var SITE = 'https://www.seventhtrumpet.org/';
  var BUTTON_ID = 'daily-status-share-card';

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

  function shareFreshBread() {
    var data = verseData();
    var english = isEn();
    var verse = english ? data.en : data.fa;
    var reference = english ? data.refEn : data.refFa;

    if (!verse) {
      alert(msg('The daily verse is not ready yet. Please try again.',
        'آیه امروز هنوز آماده نیست. لطفاً دوباره تلاش کنید.'));
      return;
    }

    var brand = english ? 'Seventh Trumpet' : 'شیپور هفتم';
    var caption = verse + (reference ? '\n\n' + reference : '') + '\n\n' + brand;

    if (!navigator.share) {
      var fallback = caption + '\n\n' + SITE;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fallback).then(function () {
          alert(msg('The English verse and website link have been copied.',
            'آیه فارسی و لینک وب‌سایت کپی شد.'));
        }).catch(function () {});
      }
      return;
    }

    /* Share the selected-language verse as text and the homepage as a real URL.
       This preserves WhatsApp's native profile-image preview and clickable link. */
    navigator.share({
      title: brand,
      text: caption,
      url: SITE
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      navigator.share({ title: brand, text: caption + '\n\n' + SITE })
        .catch(function () {});
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
    button.textContent = msg('Share', 'اشتراک');
    button.setAttribute('aria-label', msg(
      'Share the English daily Bible verse with the website link',
      'اشتراک آیه روز به زبان فارسی همراه با لینک سایت'
    ));
    button.addEventListener('click', function (event) {
      event.preventDefault();
      shareFreshBread();
    });
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() { addButton(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
