/* Seventh Trumpet — Verse share + deep links */
(function () {
  var BASE = (location.origin || 'https://seventhtrumpet.org') + '/bible.html';

  function getParams() {
    try {
      var p = new URLSearchParams(location.search);
      var b = p.get('b') || p.get('book');
      var c = p.get('c') || p.get('chapter');
      var v = p.get('v') || p.get('verse');
      if (b && c) {
        return {
          bookId: Number(b),
          chapter: Number(c),
          verse: v ? Number(v) : 1
        };
      }
    } catch (e) {}
    return null;
  }

  function applyDeepLink() {
    var params = getParams();
    if (!params) return;
    try {
      localStorage.setItem('cog_bible_state', JSON.stringify(params));
    } catch (e) {}
    var tries = 0;
    function tryScroll() {
      tries++;
      var el = document.getElementById('v-' + params.chapter + '-' + params.verse);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(function () { el.classList.remove('highlight'); }, 2500);
        return;
      }
      if (tries < 40) setTimeout(tryScroll, 250);
    }
    setTimeout(tryScroll, 600);
  }

  function buildShareUrl(bookId, chapter, verse) {
    return BASE + '?b=' + bookId + '&c=' + chapter + '&v=' + verse;
  }

  function getSelectedVerses() {
    var selected = document.querySelectorAll('.mb-verse.selected');
    if (selected.length) {
      var first = selected[0];
      return {
        chapter: Number(first.getAttribute('data-chapter')),
        verse: Number(first.getAttribute('data-verse')),
        count: selected.length
      };
    }
    var highlight = document.querySelector('.mb-verse.highlight');
    if (highlight) {
      return {
        chapter: Number(highlight.getAttribute('data-chapter')),
        verse: Number(highlight.getAttribute('data-verse')),
        count: 1
      };
    }
    try {
      var s = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
      if (s.bookId && s.chapter) {
        return { chapter: Number(s.chapter), verse: Number(s.verse || 1), count: 1, bookId: Number(s.bookId) };
      }
    } catch (e) {}
    return null;
  }

  function getCurrentBookId() {
    try {
      var s = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
      if (s.bookId) return Number(s.bookId);
    } catch (e) {}
    return null;
  }

  function shareVerse() {
    var sel = getSelectedVerses();
    if (!sel) {
      alert(document.documentElement.lang === 'en' ? 'Select a verse first' : 'ابتدا یک آیه را انتخاب کنید');
      return;
    }
    var bookId = sel.bookId || getCurrentBookId();
    if (!bookId) {
      alert(document.documentElement.lang === 'en' ? 'Open a book first' : 'ابتدا یک کتاب باز کنید');
      return;
    }
    var url = buildShareUrl(bookId, sel.chapter, sel.verse);
    var refText = (document.getElementById('mb-ref') || {}).textContent || '';
    var title = refText || ('Bible ' + sel.chapter + ':' + sel.verse);

    if (navigator.share) {
      navigator.share({ title: title, text: title, url: url }).catch(function () {
        copyLink(url);
      });
    } else {
      copyLink(url);
    }
  }

  function copyLink(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        flashShare(document.documentElement.lang === 'en' ? 'Link copied' : 'لینک کپی شد');
      }).catch(function () {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(url) {
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashShare(document.documentElement.lang === 'en' ? 'Link copied' : 'لینک کپی شد'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function flashShare(msg) {
    var el = document.getElementById('mb-share');
    if (!el) return;
    var old = el.textContent;
    el.textContent = msg;
    setTimeout(function () { el.textContent = old; }, 1800);
  }

  function ensureShareButton() {
    var actions = document.getElementById('mb-actions');
    if (!actions || document.getElementById('mb-share')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'mb-share';
    btn.setAttribute('data-i18n', 'share');
    btn.textContent = document.documentElement.lang === 'en' ? 'Share' : 'اشتراک';
    var clearBtn = document.getElementById('mb-clear');
    if (clearBtn) actions.insertBefore(btn, clearBtn);
    else actions.appendChild(btn);
    btn.addEventListener('click', shareVerse);
  }

  function initDailyShare() {
    var section = document.getElementById('daily-verse');
    if (!section || document.getElementById('daily-share')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'daily-share';
    btn.className = 'verse-refresh';
    btn.style.marginInlineStart = '0.5rem';
    btn.textContent = document.documentElement.lang === 'en' ? 'Share' : 'اشتراک';
    var refresh = document.getElementById('verse-refresh');
    if (refresh && refresh.parentNode) {
      refresh.parentNode.insertBefore(btn, refresh.nextSibling);
    } else {
      var inner = section.querySelector('.daily-verse-inner');
      if (inner) inner.appendChild(btn);
    }
    btn.addEventListener('click', function () {
      var text = (document.getElementById('verse-text') || {}).textContent || '';
      var ref = (document.getElementById('verse-ref') || {}).textContent || '';
      var url = (location.origin || 'https://seventhtrumpet.org') + '/';
      var shareText = (ref ? ref + '\n' : '') + text + '\n\n' + url;
      if (navigator.share) {
        navigator.share({ title: ref || 'Daily Verse', text: shareText, url: url }).catch(function () {
          copyLink(shareText);
        });
      } else {
        copyLink(shareText);
      }
    });
  }

  function boot() {
    applyDeepLink();
    ensureShareButton();
    initDailyShare();
    var obs = new MutationObserver(function () { ensureShareButton(); });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
