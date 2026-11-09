/* Seventh Trumpet — Deep links + daily verse share + language-aware labels */
(function () {
  function isEn() {
    try {
      var L = localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa';
      return L === 'en';
    } catch (e) {
      return document.documentElement.lang === 'en';
    }
  }

  function applyActionLabels() {
    var en = isEn();
    var map = {
      'mb-share': en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9',
      'mb-copy': en ? 'Copy' : '\u06a9\u067e\u06cc',
      'mb-clear': en ? 'Clear' : '\u067e\u0627\u06a9',
      'daily-share': en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9'
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function getParams() {
    try {
      var p = new URLSearchParams(location.search);
      var b = p.get('b') || p.get('book');
      var c = p.get('c') || p.get('chapter');
      var v = p.get('v') || p.get('verse');
      if (b && c) {
        var verse = 1;
        if (v) {
          var m = String(v).match(/^(\d+)/);
          if (m) verse = Number(m[1]);
        }
        return { bookId: Number(b), chapter: Number(c), verse: verse };
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
      if (tries < 50) setTimeout(tryScroll, 200);
    }
    setTimeout(tryScroll, 500);
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function initDailyShare() {
    var section = document.getElementById('daily-verse');
    if (!section || document.getElementById('daily-share')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'daily-share';
    btn.className = 'verse-refresh';
    btn.style.marginInlineStart = '0.5rem';
    btn.textContent = isEn() ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
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
      var shareText = (ref ? ref + '\n' : '') + text;
      if (navigator.share) {
        navigator.share({ title: ref || 'Daily Verse', text: shareText, url: url }).catch(function () {
          copyText((ref ? ref + ' — ' : '') + url);
        });
      } else {
        copyText((ref ? ref + '\n' : '') + text + '\n' + url).then(function () {
          var old = btn.textContent;
          btn.textContent = isEn() ? 'Copied' : '\u06a9\u067e\u06cc \u0634\u062f';
          setTimeout(function () { applyActionLabels(); }, 1500);
        });
      }
    });
  }

  function ensureShareClick() {
    var btn = document.getElementById('mb-share');
    if (!btn || btn._shareBound) return;
    btn._shareBound = true;
    btn.addEventListener('click', function () {
      if (typeof window.shareSelected === 'function') {
        window.shareSelected();
        return;
      }
      var nodes = document.querySelectorAll('.mb-verse.selected');
      if (!nodes.length) {
        alert(isEn() ? 'Select one or more verses first' : '\u0627\u0628\u062a\u062f\u0627 \u06cc\u06a9 \u06cc\u0627 \u0686\u0646\u062f \u0622\u06cc\u0647 \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f');
        return;
      }
      var lines = [];
      var firstCh = null, firstV = null, lastV = null;
      nodes.forEach(function (el) {
        var ch = el.getAttribute('data-chapter');
        var vs = el.getAttribute('data-verse');
        if (firstCh == null) { firstCh = ch; firstV = vs; }
        lastV = vs;
        var t = (el.textContent || '').replace(/^\d+\s*/, '').trim();
        lines.push(ch + ':' + vs + ' — ' + t);
      });
      var state = {};
      try { state = JSON.parse(localStorage.getItem('cog_bible_state') || '{}'); } catch (e) {}
      var bookId = state.bookId || '';
      var url = (location.origin || 'https://seventhtrumpet.org') + '/bible.html?b=' + bookId + '&c=' + firstCh + '&v=' + firstV + (lastV !== firstV ? '-' + lastV : '');
      var body = lines.join('\n') + '\n\n' + url;
      if (navigator.share) {
        navigator.share({ title: 'Bible', text: body, url: url }).catch(function () { copyText(body); });
      } else {
        copyText(body);
      }
    });
    applyActionLabels();
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    ensureShareClick();
    applyActionLabels();
    var obs = new MutationObserver(function () {
      ensureShareClick();
      applyActionLabels();
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('cog-lang-changed', applyActionLabels);
    document.getElementById('lang-toggle')?.addEventListener('click', function () {
      setTimeout(applyActionLabels, 50);
      setTimeout(applyActionLabels, 300);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
