/* Fresh Bread share: keep the native WhatsApp website preview (profile image + tappable link).
   The preview opens /v/:id, a clean bilingual verse card with the profile photo.
   The verse itself is not sent as a long caption. */
(function () {
  'use strict';

  var SITE = 'https://seventhtrumpet.org/';
  var BUTTON_ID = 'daily-status-share-card';

  function language() {
    try { return localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa'; }
    catch (e) { return document.documentElement.lang || 'fa'; }
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
          index: matchIndex,
          fa: match.fa || '',
          en: match.en || match.fa || '',
          refFa: match.ref_fa || match.refFa || match.ref || '',
          refEn: match.ref_en || match.refEn || match.ref || ''
        };
      }
    }
    return { index: 0, fa: text, en: text, refFa: ref, refEn: ref };
  }

  function shareFreshBread() {
    var data = verseData();
    if (!data.fa && !data.en) {
      alert(msg('The daily verse is not ready yet. Please try again.',
        'آیه امروز هنوز آماده نیست. لطفاً دوباره تلاش کنید.'));
      return;
    }

    var shareUrl = SITE + 'v/' + encodeURIComponent(String(data.index));
    var caption = 'Seventh Trumpet | شیپور هفتم';

    if (!navigator.share) {
      var fallback = caption + '\n\n' + shareUrl;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fallback);
      }
      alert(msg('Your bilingual verse card link is copied. Open WhatsApp Status and paste it.',
        'لینک کارت دوزبانه آیه کپی شد. آن را در وضعیت واتساپ جای‌گذاری کنید.'));
      return;
    }

    /* Keep sharing a real URL so WhatsApp retains its native tappable preview.
       The linked page displays the profile photo and the bilingual white verse card. */
    navigator.share({
      title: 'Seventh Trumpet | شیپور هفتم',
      text: caption,
      url: shareUrl
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      navigator.share({ title: 'Seventh Trumpet | شیپور هفتم', text: caption + '\n\n' + shareUrl })
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
      'Share the bilingual daily Bible verse card with a tappable website link',
      'اشتراک کارت دوزبانه آیه روز با لینک قابل لمس سایت'
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
