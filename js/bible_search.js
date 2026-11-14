/* Bible search: every result shows Book Name + chapter:verse */
(function () {
  if (window.__mbSearchBooted) return;
  window.__mbSearchBooted = true;

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeRegex(s) {
    return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function highlightMatch(text, query) {
    var raw = String(text == null ? '' : text);
    var q = String(query == null ? '' : query).trim();
    if (!q) return escapeHtml(raw);
    var safe = escapeHtml(raw);
    var terms = q.split(/\s+/).filter(function (t) { return t.length >= 2; });
    if (!terms.length) terms = [q];
    terms.forEach(function (term) {
      try {
        var re = new RegExp('(' + escapeRegex(term) + ')', 'gi');
        safe = safe.replace(re, '<mark class="mb-hit">$1</mark>');
      } catch (e) {}
    });
    return safe;
  }
  function injectCss() {
    if (document.getElementById('mb-hit-css')) return;
    var st = document.createElement('style');
    st.id = 'mb-hit-css';
    st.textContent =
      '.mb-search-item{text-align:start}' +
      '.mb-search-item .mb-ref-line{display:block;font-weight:800;color:#5b9fd4;margin-bottom:0.25rem;font-size:0.92rem}' +
      '.mb-search-item mark.mb-hit,.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.15em;border-radius:3px}' +
      'body.dark .mb-hit{background:#c9a227;color:#1a1200}';
    document.head.appendChild(st);
  }
  function currentBookName() {
    try {
      var t = document.querySelector('#mb-ref, .mb-ref');
      if (!t) return '';
      var s = (t.textContent || '').trim();
      if (!s || s === '\u2014') return '';
      var m = s.match(/^(.+?)\s+[\d\u06f0-\u06f9]/);
      return m ? m[1].trim() : s;
    } catch (e) { return ''; }
  }
  function hasBookLetters(s) {
    return /[A-Za-z\u0600-\u06FF]/.test(String(s || ''));
  }
  function cleanVerseText(text, verseNum) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    t = t.replace(/^[\s\u2014\u2013\-:|]+/, '').trim();
    if (verseNum) {
      var vn = String(verseNum);
      if (t.indexOf(vn) === 0) {
        t = t.slice(vn.length).replace(/^[\s:.\-]+/, '');
      }
    }
    return t.trim();
  }
  function polishResults() {
    injectCss();
    var input = document.getElementById('mb-search');
    var q = input ? (input.value || '').trim() : '';
    if (!q) return;
    var fallbackBook = currentBookName();
    var box = document.getElementById('mb-search-results');
    if (!box) return;

    box.querySelectorAll('.mb-search-item').forEach(function (btn) {
      var existing = btn.querySelector('.mb-ref-line');
      if (existing && hasBookLetters(existing.textContent) && btn.getAttribute('data-polished') === q) {
        return;
      }

      var strong = btn.querySelector('strong');
      var rawLabel = '';
      var bodyText = '';

      if (existing) {
        rawLabel = (existing.textContent || '').trim();
        bodyText = '';
        var n = existing.nextSibling;
        while (n) {
          bodyText += n.textContent || '';
          n = n.nextSibling;
        }
        if (!bodyText) {
          var clone = btn.cloneNode(true);
          var er = clone.querySelector('.mb-ref-line');
          if (er) er.remove();
          bodyText = (clone.textContent || '').trim();
        }
      } else if (strong) {
        rawLabel = (strong.textContent || '').trim();
        var n2 = strong.nextSibling;
        while (n2) {
          bodyText += n2.textContent || '';
          n2 = n2.nextSibling;
        }
        if (!bodyText) {
          var html = btn.innerHTML;
          var parts = html.split(/<br\s*\/?>/i);
          if (parts.length >= 2) {
            var tmp = document.createElement('div');
            tmp.innerHTML = parts.slice(1).join(' ');
            bodyText = (tmp.textContent || '').trim();
          }
        }
      } else {
        rawLabel = (btn.textContent || '').trim();
      }

      bodyText = bodyText.replace(/^[\s\u2014\u2013\-]+/, '').trim();

      var bookName = '';
      var ch = '';
      var vs = '';

      var m = rawLabel.match(/^(.+?)\s+(\d+):(\d+)\s*$/);
      if (m) {
        bookName = m[1].trim();
        ch = m[2];
        vs = m[3];
      } else {
        m = rawLabel.match(/^(\d+):(\d+)\s*$/);
        if (m) {
          ch = m[1];
          vs = m[2];
        } else {
          m = rawLabel.match(/^(.+?)\s+(\d+):(\d+)/);
          if (m) {
            bookName = m[1].trim();
            ch = m[2];
            vs = m[3];
          }
        }
      }

      if (!hasBookLetters(bookName)) bookName = fallbackBook;
      bodyText = cleanVerseText(bodyText, vs);

      var refLine = '';
      if (hasBookLetters(bookName) && ch && vs) {
        refLine = bookName + ' ' + ch + ':' + vs;
      } else if (hasBookLetters(bookName)) {
        refLine = bookName + (ch ? ' ' + ch + (vs ? ':' + vs : '') : '');
      } else if (ch && vs) {
        refLine = (fallbackBook ? fallbackBook + ' ' : '') + ch + ':' + vs;
      } else {
        refLine = rawLabel || fallbackBook || '\u2026';
      }
      refLine = refLine.replace(/\s+/g, ' ').trim();

      btn.setAttribute('data-polished', q);
      btn.innerHTML =
        '<span class="mb-ref-line">' + escapeHtml(refLine) + '</span>' +
        (bodyText ? highlightMatch(bodyText, q) : '');
    });
  }
  function observe() {
    injectCss();
    var box = document.getElementById('mb-search-results');
    if (box && !box._hiObs) {
      box._hiObs = true;
      new MutationObserver(function () {
        setTimeout(polishResults, 40);
      }).observe(box, { childList: true, subtree: true });
    }
    function run() {
      setTimeout(polishResults, 150);
      setTimeout(polishResults, 600);
      setTimeout(polishResults, 1500);
      setTimeout(polishResults, 3500);
      setTimeout(polishResults, 6000);
    }
    var btn = document.getElementById('mb-search-btn');
    if (btn && !btn._hiBound) {
      btn._hiBound = true;
      btn.addEventListener('click', run);
    }
    var input = document.getElementById('mb-search');
    if (input && !input._hiBound) {
      input._hiBound = true;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') run();
      });
    }
  }

  var CORE_URLS = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js',
    'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js'
  ];

  function patchSource(src) {
    src = src.replace(
      /return \(\(na >= 470 \? 0 : 1\) - \(nb >= 470 \? 0 : 1\)\) \|\| \(na - nb\);/g,
      'return ((na >= 470 ? 1 : 0) - (nb >= 470 ? 1 : 0)) || (na - nb);'
    );
    src = src.replace(
      /var pa = ida >= 470 \? 0 : 1, pb = idb >= 470 \? 0 : 1;/g,
      'var pa = ida >= 470 ? 1 : 0, pb = idb >= 470 ? 1 : 0;'
    );
    src = src.replace(/items\.length >= 50/g, 'items.length >= 100');
    src = src.replace(/slice\(0, 50\)/g, 'slice(0, 100)');
    src = src.replace(
      "html: '<strong>' + ch + ':' + vs + '</strong> — ' + escapeHtml(snip)",
      "html: '<strong>' + (function(){var t=document.getElementById('mb-ref');var s=t?(t.textContent||'').trim():'';var m=s.match(/^(.+?)\\s+[\\d\\u06f0-\\u06f9]/);return ((m?m[1]:s)||'').trim();})() + ' ' + ch + ':' + vs + '</strong><br>' + escapeHtml(snip)"
    );
    return src;
  }

  function runCore(src) {
    try {
      (0, eval)(patchSource(src));
    } catch (e) {
      console.warn('bible search eval failed', e);
    }
    setTimeout(observe, 200);
    setTimeout(observe, 800);
  }

  function load() {
    var i = 0;
    function next() {
      if (i >= CORE_URLS.length) return;
      var url = CORE_URLS[i++];
      fetch(url)
        .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
        .then(runCore)
        .catch(next);
    }
    next();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
