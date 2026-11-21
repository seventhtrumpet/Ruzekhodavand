/* Fresh Bread share: one native website preview (Open Graph image + white tappable card)
   followed by the Bible verse in the WhatsApp Status caption.
   Nothing is composited into an image and no separate photo attachment is sent. */
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
    var englishText = '';
    var persianText = '';
    var englishRef = '';
    var persianRef = '';

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
        englishText = String(match.en || '').trim();
        persianText = String(match.fa || '').trim();
        englishRef = String(match.ref_en || match.refEn || match.ref || '').trim();
        persianRef = String(match.ref_fa || match.refFa || match.ref || '').trim();
      }
    }
    if (!englishText && isEn()) { englishText = text; englishRef = ref; }
    if (!persianText && !isEn()) { persianText = text; persianRef = ref; }
    return {
      text: text,
      reference: ref,
      englishText: englishText,
      persianText: persianText,
      englishRef: englishRef,
      persianRef: persianRef
    };
  }

  function buildCaption(data) {
    var parts = [];
    if (data.englishText) {
      parts.push(data.englishText);
      if (data.englishRef) parts.push(data.englishRef);
    }
    if (data.persianText) {
      parts.push(data.persianText);
      if (data.persianRef) parts.push(data.persianRef);
    }
    if (!parts.length) parts.push(data.text, data.reference);
    parts.push('Seventh Trumpet | شیپور هفتم');
    return parts.filter(Boolean).join('\n\n');
  }

  function shareFreshBread() {
    var data = verseData();
    if (!data.text) {
      alert(msg('The daily verse is not ready yet. Please try again.',
        'آیه امروز هنوز آماده نیست. لطفاً دوباره تلاش کنید.'));
      return;
    }

    var caption = buildCaption(data);
    if (!navigator.share) {
      var fallback = caption + '\n\n' + SITE;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fallback);
      }
      alert(msg('Verse and website link copied. Open WhatsApp Status and paste them.',
        'آیه و لینک سایت کپی شد. در وضعیت واتساپ آن‌ها را جای‌گذاری کنید.'));
      return;
    }

    /* Share the URL as a real URL, not as pixels or a photo attachment.
       WhatsApp builds the image + attached white link card from the site's OG tags.
       The verse remains ordinary editable Status text below that preview. */
    navigator.share({
      title: 'Seventh Trumpet | شیپور هفتم',
      text: caption,
      url: SITE
    }).catch(function (err) {
      if (err && err.name === 'AbortError') return;
      navigator.share({ title: 'Seventh Trumpet | شیپور هفتم', text: caption + '\n\n' + SITE })
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
      'Share website preview with tappable link and Bible verse',
      'اشتراک پیش‌نمایش سایت با لینک قابل لمس و آیه کتاب مقدس'
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
