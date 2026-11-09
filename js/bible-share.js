/* Seventh Trumpet — Deep links + daily verse share (lightweight, no observers) */
(function () {
  function isEn() {
    try {
      var L = localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa';
      return L === 'en';
    } catch (e) {
      return false;
    }
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
      if (tries < 40) setTimeout(tryScroll, 250);
    }
    setTimeout(tryScroll, 700);
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(t);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function setLabels() {
    var en = isEn();
    var share = document.getElementById('mb-share');
    var copy = document.getElementById('mb-copy');
    var clear = document.getElementById('mb-clear');
    var daily = document.getElementById('daily-share');
    if (share) share.textContent = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
    if (copy) copy.textContent = en ? 'Copy' : '\u06a9\u067e\u06cc';
    if (clear) clear.textContent = en ? 'Clear' : '\u067e\u0627\u06a9';
    if (daily) daily.textContent = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
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
          copyText(url);
        });
      } else {
        copyText((ref ? ref + '\n' : '') + text + '\n' + url);
      }
    });
  }

  function bindBibleShare() {
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
        lines.push(ch + ':' + vs + ' \u2014 ' + t);
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
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    bindBibleShare();
    setLabels();
    var lt = document.getElementById('lang-toggle');
    if (lt) {
      lt.addEventListener('click', function () {
        setTimeout(setLabels, 100);
        setTimeout(setLabels, 400);
      });
    }
    window.addEventListener('cog-lang-changed', setLabels);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
