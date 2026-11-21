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
    var visibleText = (textEl && textEl.textContent || '').trim();
    var visibleRef = (refEl && refEl.textContent || '').trim();
    var verses = window.DAILY_VERSES || [];
    var match = null;

    if (verses.length) {
      for (var i = 0; i < verses.length; i++) {
        var v = verses[i];
        var refs = [v.ref_fa, v.ref_en, v.refFa, v.refEn, v.ref];
        var texts = [v.fa, v.en];
        var refHit = visibleRef && refs.some(function (r) { return r && String(r).trim() === visibleRef; });
        var textHit = visibleText && texts.some(function (t) { return t && String(t).trim() === visibleText; });
        if (refHit || textHit) { match = v; break; }
      }
      if (!match) {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var day = Math.floor((now - start) / 86400000);
        match = verses[Math.abs(now.getFullYear() * 366 + day) % verses.length];
      }
    }

    if (match) {
      return {
        enText: String(match.en || '').trim(),
        enRef: String(match.ref_en || match.refEn || match.ref || '').trim(),
        faText: String(match.fa || '').trim(),
        faRef: String(match.ref_fa || match.refFa || match.ref || '').trim(),
        text: visibleText,
        reference: visibleRef
      };
    }

    /* Safe fallback: preserve the currently displayed verse if bilingual
       source fields are not available; never invent a translation. */
    return {
      enText: isEn() ? visibleText : '',
      enRef: isEn() ? visibleRef : '',
      faText: isEn() ? '' : visibleText,
      faRef: isEn() ? '' : visibleRef,
      text: visibleText,
      reference: visibleRef
    };
  }

  function buildCaption(data) {
    var lines = [];
    if (data.enText) lines.push(data.enText);
    if (data.enRef) lines.push(data.enRef);
    if (data.faText) lines.push(data.faText);
    if (data.faRef) lines.push(data.faRef);
    if (!data.enText && !data.faText && data.text) lines.push(data.text);
    if (!data.enRef && !data.faRef && data.reference) lines.push(data.reference);
    lines.push('Seventh Trumpet | شیپور هفتم');
    return lines.filter(Boolean).join('\n\n');
  }

  function shareFreshBread() {
    var data = verseData();
    if (!data.enText && !data.faText && !data.text) {
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
