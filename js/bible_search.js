/* Bible search bar — book names, refs like John 3:16, text in open book */
(function () {
  if (!document.body || document.body.getAttribute('data-page') !== 'bible') {
    // also allow path check
    var path = (location.pathname || '').toLowerCase();
    if (path.indexOf('bible') < 0) return;
  }

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function placeholder() {
    return isEn()
      ? 'Search book or verse… (e.g. John 3:16)'
      : '\u062c\u0633\u062a\u062c\u0648 \u06a9\u062a\u0627\u0628 \u06cc\u0627 \u0622\u06cc\u0647\u2026 (\u0645\u062b\u0627\u0644: \u06cc\u0648\u062d\u0646\u0627 \u06f3:\u06f1\u06f6)';
  }

  function inject() {
    if (document.getElementById('mb-search-wrap')) return;

    if (!document.getElementById('mb-search-css')) {
      var st = document.createElement('style');
      st.id = 'mb-search-css';
      st.textContent =
        '.mb-search-wrap{position:fixed;left:0;right:0;z-index:1140;padding:0.35rem 0.65rem 0.45rem;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#d8dee6);box-shadow:0 2px 10px rgba(10,37,64,.06)}' +
        'body.dark .mb-search-wrap{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-inner{max-width:720px;margin:0 auto;display:flex;gap:0.4rem;align-items:center}' +
        '.mb-search-input{flex:1;min-width:0;padding:0.55rem 0.85rem;border:1px solid var(--border,#d8dee6);border-radius:10px;font-family:inherit;font-size:0.92rem;background:var(--bg,#f5f7fa);color:var(--text,#1a1a1a)}' +
        'body.dark .mb-search-input{background:#1a2b3c;border-color:#2a3a4c;color:#e8eef5}' +
        '.mb-search-input:focus{outline:2px solid var(--primary,#0a2540);outline-offset:1px}' +
        '.mb-search-btn{flex-shrink:0;border:none;background:var(--primary,#0a2540);color:#fff;padding:0.55rem 0.9rem;border-radius:10px;font-family:inherit;font-weight:700;font-size:0.88rem;cursor:pointer}' +
        '.mb-search-results{position:absolute;left:0.65rem;right:0.65rem;max-width:720px;margin:0 auto;top:100%;max-height:50vh;overflow:auto;background:var(--bg-card,#fff);border:1px solid var(--border,#d8dee6);border-radius:0 0 12px 12px;box-shadow:0 10px 28px rgba(0,0,0,.15);z-index:1145;display:none}' +
        'body.dark .mb-search-results{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-wrap{position:fixed}' +
        '.mb-search-results.open{display:block}' +
        '.mb-search-item{display:block;width:100%;text-align:start;padding:0.65rem 0.85rem;border:none;border-bottom:1px solid var(--border,#eee);background:transparent;font-family:inherit;font-size:0.9rem;color:var(--text,#1a1a1a);cursor:pointer}' +
        '.mb-search-item:hover,.mb-search-item:focus{background:rgba(10,37,64,.07)}' +
        'body.dark .mb-search-item:hover{background:rgba(255,255,255,.06)}' +
        '.mb-search-item strong{color:var(--primary,#0a2540)}' +
        '.mb-search-empty{padding:0.85rem;color:var(--text-muted,#6b7785);font-size:0.88rem;text-align:center}';
      document.head.appendChild(st);
    }

    var wrap = document.createElement('div');
    wrap.id = 'mb-search-wrap';
    wrap.className = 'mb-search-wrap';
    wrap.innerHTML =
      '<div class="mb-search-inner" style="position:relative">' +
      '<input type="search" id="mb-search" class="mb-search-input" autocomplete="off" enterkeyhint="search" />' +
      '<button type="button" id="mb-search-btn" class="mb-search-btn"></button>' +
      '<div id="mb-search-results" class="mb-search-results" role="listbox"></div>' +
      '</div>';

    var bar = document.querySelector('.mb-bar');
    if (bar && bar.parentNode) {
      // place after bible ref bar
      if (bar.nextSibling) bar.parentNode.insertBefore(wrap, bar.nextSibling);
      else bar.parentNode.appendChild(wrap);
    } else {
      var header = document.querySelector('.header');
      if (header && header.nextSibling) header.parentNode.insertBefore(wrap, header.nextSibling);
      else document.body.insertBefore(wrap, document.body.firstChild);
    }

    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    input.placeholder = placeholder();
    btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';

    input.addEventListener('input', function () {
      debounceSearch();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        runSearch(true);
      }
    });
    btn.addEventListener('click', function () { runSearch(true); });

    document.addEventListener('click', function (e) {
      var res = document.getElementById('mb-search-results');
      if (!res) return;
      if (!wrap.contains(e.target)) res.classList.remove('open');
    });

    placeSearch();
    window.addEventListener('resize', placeSearch);
    setTimeout(placeSearch, 300);
    setTimeout(placeSearch, 900);

    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () {
      setTimeout(function () {
        input.placeholder = placeholder();
        btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';
      }, 200);
    });
  }

  function placeSearch() {
    var wrap = document.getElementById('mb-search-wrap');
    if (!wrap) return;
    var header = document.querySelector('.header');
    var bar = document.querySelector('.mb-bar');
    var top = 0;
    if (header) top += header.offsetHeight || 0;
    if (bar) top += bar.offsetHeight || 0;
    wrap.style.top = top + 'px';

    // spacer so content not covered
    var sp = document.getElementById('mb-search-spacer');
    if (!sp) {
      sp = document.createElement('div');
      sp.id = 'mb-search-spacer';
      sp.setAttribute('aria-hidden', 'true');
      if (wrap.nextSibling) wrap.parentNode.insertBefore(sp, wrap.nextSibling);
      else wrap.parentNode.appendChild(sp);
    }
    sp.style.height = (wrap.offsetHeight + 4) + 'px';
  }

  var tmr = null;
  function debounceSearch() {
    clearTimeout(tmr);
    tmr = setTimeout(function () { runSearch(false); }, 220);
  }

  function getBooks() {
    // from DOM book buttons if picker was opened, else known list from meta fetch cache
    var books = [];
    document.querySelectorAll('#mb-books [data-book]').forEach(function (btn) {
      books.push({ id: Number(btn.getAttribute('data-book')), name: (btn.textContent || '').trim() });
    });
    if (books.length) return books;
    // fallback static common set (ids match site)
    return [
      { id: 10, name: isEn() ? 'Genesis' : '\u067e\u06cc\u062f\u0627\u06cc\u0634' },
      { id: 20, name: isEn() ? 'Exodus' : '\u062e\u0631\u0648\u062c' },
      { id: 30, name: isEn() ? 'Leviticus' : '\u0644\u0627\u0648\u06cc\u0627\u0646' },
      { id: 40, name: isEn() ? 'Numbers' : '\u0627\u0639\u062f\u0627\u062f' },
      { id: 50, name: isEn() ? 'Deuteronomy' : '\u062a\u062b\u0646\u06cc\u0647' },
      { id: 70, name: isEn() ? 'Judges' : '\u062f\u0627\u0648\u0631\u0627\u0646' },
      { id: 80, name: isEn() ? 'Ruth' : '\u0631\u0648\u062a' },
      { id: 230, name: isEn() ? 'Psalms' : '\u0645\u0632\u0627\u0645\u06cc\u0631' },
      { id: 290, name: isEn() ? 'Isaiah' : '\u0627\u0634\u0639\u06cc\u0627' },
      { id: 470, name: isEn() ? 'Matthew' : '\u0645\u062a\u06cc' },
      { id: 480, name: isEn() ? 'Mark' : '\u0645\u0631\u0642\u0633' },
      { id: 490, name: isEn() ? 'Luke' : '\u0644\u0648\u0642\u0627' },
      { id: 500, name: isEn() ? 'John' : '\u06cc\u0648\u062d\u0646\u0627' },
      { id: 520, name: isEn() ? 'Romans' : '\u0631\u0648\u0645\u06cc\u0627\u0646' },
      { id: 730, name: isEn() ? 'Revelation' : '\u0645\u06a9\u0627\u0634\u0641\u0647' }
    ];
  }

  function loadMeta(cb) {
    fetch('/data/bible-fa/meta.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (meta) {
        if (Array.isArray(meta) && meta.length) {
          window.__bibleMeta = meta.map(function (b) {
            return { id: b.id, name: isEn() ? (b.en || b.fa) : (b.fa || b.en), en: b.en, fa: b.fa };
          });
        }
        cb();
      })
      .catch(function () { cb(); });
  }

  function booksForSearch() {
    if (window.__bibleMeta && window.__bibleMeta.length) {
      return window.__bibleMeta.map(function (b) {
        return { id: b.id, name: isEn() ? (b.en || b.fa) : (b.fa || b.en), en: b.en, fa: b.fa };
      });
    }
    return getBooks();
  }

  function parseRef(q) {
    // "John 3:16", "John 3", "یوحنا ۳:۱۶", "خروج 4:13"
    q = String(q || '').trim();
    var m = q.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
    if (!m) return null;
    return { bookQuery: m[1].trim(), chapter: Number(m[2]), verse: m[3] ? Number(m[3]) : 1 };
  }

  function normalize(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u06f0-\u06f9]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      .replace(/\s+/g, ' ')
      .trim();
  }

  function matchBook(query) {
    var nq = normalize(query);
    var books = booksForSearch();
    var hits = [];
    books.forEach(function (b) {
      var fa = normalize(b.fa || b.name);
      var en = normalize(b.en || b.name);
      var name = normalize(b.name);
      if (fa.indexOf(nq) >= 0 || en.indexOf(nq) >= 0 || name.indexOf(nq) >= 0 ||
          nq.indexOf(fa) >= 0 || nq.indexOf(en) >= 0) {
        hits.push(b);
      }
    });
    return hits;
  }

  function searchInOpenBook(q) {
    var nq = normalize(q);
    if (nq.length < 2) return [];
    var hits = [];
    document.querySelectorAll('.mb-verse').forEach(function (el) {
      var text = normalize(el.textContent);
      if (text.indexOf(nq) >= 0) {
        hits.push({
          chapter: el.getAttribute('data-chapter'),
          verse: el.getAttribute('data-verse'),
          text: (el.textContent || '').trim(),
          el: el
        });
      }
    });
    return hits.slice(0, 30);
  }

  function showResults(items) {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    if (!items.length) {
      box.innerHTML = '<div class="mb-search-empty">' +
        (isEn() ? 'No results' : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f') +
        '</div>';
      box.classList.add('open');
      return;
    }
    box.innerHTML = items.map(function (it, i) {
      return '<button type="button" class="mb-search-item" data-i="' + i + '">' + it.html + '</button>';
    }).join('');
    box.classList.add('open');
    box.querySelectorAll('.mb-search-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var it = items[Number(btn.getAttribute('data-i'))];
        if (it && it.action) it.action();
        box.classList.remove('open');
      });
    });
  }

  function goToBook(bookId, chapter, verse) {
    try {
      localStorage.setItem('cog_bible_state', JSON.stringify({
        bookId: bookId,
        chapter: chapter || 1,
        verse: verse || 1
      }));
    } catch (e) {}
    var url = 'bible.html?b=' + bookId + '&c=' + (chapter || 1) + '&v=' + (verse || 1);
    location.href = url;
  }

  function runSearch(fromEnter) {
    var input = document.getElementById('mb-search');
    if (!input) return;
    var q = (input.value || '').trim();
    if (!q) {
      document.getElementById('mb-search-results').classList.remove('open');
      return;
    }

    var items = [];
    var ref = parseRef(q);

    if (ref) {
      var bookHits = matchBook(ref.bookQuery);
      bookHits.forEach(function (b) {
        items.push({
          html: '<strong>' + (b.name || b.fa || b.en) + '</strong> ' + ref.chapter + (ref.verse ? (':' + ref.verse) : ''),
          action: function () { goToBook(b.id, ref.chapter, ref.verse || 1); }
        });
      });
    }

    // book name only
    matchBook(q).forEach(function (b) {
      items.push({
        html: '<strong>' + (b.name || b.fa || b.en) + '</strong>',
        action: function () { goToBook(b.id, 1, 1); }
      });
    });

    // text in current open book
    searchInOpenBook(q).forEach(function (h) {
      var snippet = h.text.length > 90 ? h.text.slice(0, 90) + '…' : h.text;
      items.push({
        html: '<strong>' + h.chapter + ':' + h.verse + '</strong> — ' + snippet.replace(/</g, '&lt;'),
        action: function () {
          if (h.el) {
            h.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            h.el.classList.add('highlight');
            setTimeout(function () { h.el.classList.remove('highlight'); }, 2000);
          }
        }
      });
    });

    // de-dupe by html
    var seen = {};
    items = items.filter(function (it) {
      if (seen[it.html]) return false;
      seen[it.html] = 1;
      return true;
    }).slice(0, 25);

    showResults(items);

    // If Enter and exactly one book ref hit, go immediately
    if (fromEnter && items.length === 1) items[0].action();
  }

  function boot() {
    inject();
    loadMeta(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
