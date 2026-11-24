/* Fresh Bread share — OG profile card + tappable link (no image file).
   This is the only Daily Bread share button on the home page. */
(function () {
  'use strict';

  var SITE = 'https://seventhtrumpet.org/';
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

  function brand() {
    return 'Seventh Trumpet | \u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645';
  }

  function buildSharePayload() {
    var data = verseData();
    var verse = isEn() ? data.en : data.fa;
    var reference = isEn() ? data.refEn : data.refFa;
    if (!verse) return null;

    var textParts = [verse];
    if (reference) textParts.push(reference);
    textParts.push(brand());

    return {
      title: brand(),
      text: textParts.join('\n\n'),
      url: SITE,
      full: textParts.join('\n\n') + '\n\n' + SITE
    };
  }

  function copyFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        alert(msg('Verse and website link copied.', '\u0622\u06cc\u0647 \u0648 \u0644\u06cc\u0646\u06a9 \u0648\u0628\u200c\u0633\u0627\u06cc\u062a \u06a9\u067e\u06cc \u0634\u062f.'));
      }).catch(function () {
        try { prompt(msg('Copy:', '\u06a9\u067e\u06cc:'), text); } catch (e) {}
      });
    } else {
      try { prompt(msg('Copy:', '\u06a9\u067e\u06cc:'), text); } catch (e) {}
    }
  }

  function shareFreshBread() {
    var p = buildSharePayload();
    if (!p) {
      alert(msg('The daily verse is not ready yet. Please try again.', '\u0622\u06cc\u0647 \u0627\u0645\u0631\u0648\u0632 \u0647\u0646\u0648\u0632 \u0622\u0645\u0627\u062f\u0647 \u0646\u06cc\u0633\u062a. \u0644\u0637\u0641\u0627\u064b \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0644\u0627\u0634 \u06a9\u0646\u06cc\u062f.'));
      return;
    }

    if (navigator.share) {
      navigator.share({ title: p.title, text: p.text, url: p.url }).catch(function (err) {
        if (err && err.name === 'AbortError') return;
        try { window.location.href = 'https://wa.me/?text=' + encodeURIComponent(p.full); }
        catch (e) { copyFallback(p.full); }
      });
      return;
    }

    try { window.location.href = 'https://wa.me/?text=' + encodeURIComponent(p.full); }
    catch (e) { copyFallback(p.full); }
  }

  window.ST_shareFreshBread = shareFreshBread;

  function removeRivals() {
    ['daily-share', 'daily-status-share', 'daily-status-share-image'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) try { el.remove(); } catch (e) {}
    });
  }

  function addButton() {
    var section = document.getElementById('daily-verse');
    var refresh = document.getElementById('verse-refresh');
    if (!section || !refresh) return;

    removeRivals();
    var existing = document.getElementById(BUTTON_ID);
    if (existing) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.id = BUTTON_ID;
    button.className = 'verse-refresh';
    button.style.marginInlineStart = '0.45rem';
    button.style.marginTop = '0.4rem';
    button.textContent = msg('Share', '\u0627\u0634\u062a\u0631\u0627\u06a9');
    button.setAttribute('aria-label', msg(
      'Share daily verse with profile card and tappable website link',
      '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0622\u06cc\u0647 \u0631\u0648\u0632 \u0628\u0627 \u06a9\u0627\u0631\u062a \u067e\u0631\u0648\u0641\u0627\u06cc\u0644 \u0648 \u0644\u06cc\u0646\u06a9 \u0642\u0627\u0628\u0644 \u0644\u0645\u0633'
    ));
    button.addEventListener('click', function (event) {
      event.preventDefault();
      shareFreshBread();
    });
    refresh.parentNode.insertBefore(button, refresh.nextSibling);
  }

  function boot() {
    addButton();
    [200, 600, 1500].forEach(function (ms) {
      setTimeout(function () {
        removeRivals();
        if (!document.getElementById(BUTTON_ID)) addButton();
      }, ms);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
