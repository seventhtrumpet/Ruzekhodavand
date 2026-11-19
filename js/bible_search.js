/* Fast Bible search — ALL matches, progressive Load more */
(function () {
  if (window.__mbSearchBooted) return;
  window.__mbSearchBooted = true;

  var path = (location.pathname || '').toLowerCase();
  if (document.body && document.body.getAttribute('data-page') !== 'bible' && path.indexOf('bible') < 0) return;

  var BATCH = 150;
  var abortToken = 0;
  var debounceTimer = null;
  var SCOPE_KEY = 'cog_bible_search_scope';
  var NT_MIN = 470;

  var IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];

  var FA_VERSES = null;
  var EN_VERSES = null;
  var faLoadPromise = null;
  var enLoadPromise = null;
  var _allItems = [];
  var _shown = 0;
  var _statusMsg = '';

  function isEn() {
    try {
      return ((typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa') === 'en';
    } catch (e) { return false; }
  }
  function getScope() {
    try { return localStorage.getItem(SCOPE_KEY) || 'all'; } catch (e) { return 'all'; }
  }
  function setScope(s) {
    if (['all', 'ot', 'nt', 'book'].indexOf(s) < 0) s = 'all';
    try { localStorage.setItem(SCOPE_KEY, s); } catch (e) {}
    syncScopeUi();
  }
  function currentBookId() {
    try {
      var p = new URLSearchParams(location.search);
      var b = p.get('b');
      if (b) return Number(b);
    } catch (e) {}
    try {
      var st = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
      if (st.bookId) return Number(st.bookId);
    } catch (e2) {}
    return 10;
  }
  function inScope(bookId) {
    var s = getScope();
    bookId = Number(bookId) || 0;
    if (s === 'ot') return bookId >= 10 && bookId < NT_MIN;
    if (s === 'nt') return bookId >= NT_MIN && bookId <= 730;
    if (s === 'book') return bookId === currentBookId();
    return bookId >= 10 && bookId <= 730;
  }
  function scopeLabel() {
    var s = getScope();
    if (isEn()) return { all: 'All Bible', ot: 'Old Testament', nt: 'New Testament', book: 'This book' }[s] || 'All Bible';
    return {
      all: '\u0647\u0645\u0647 \u06a9\u062a\u0627\u0628',
      ot: '\u0639\u0647\u062f \u0639\u062a\u06cc\u0642',
      nt: '\u0639\u0647\u062f \u062c\u062f\u06cc\u062f',
      book: '\u0647\u0645\u06cc\u0646 \u06a9\u062a\u0627\u0628'
    }[s] || '\u0647\u0645\u0647 \u06a9\u062a\u0627\u0628';
  }

  function normalize(s) {
    s = String(s || '');
    s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    s = s.replace(/\u0640/g, '');
    s = s.replace(/\u064A|\u0649|\u06D2/g, '\u06CC');
    s = s.replace(/\u0643/g, '\u06A9');
    s = s.replace(/\u0629|\u06C1/g, '\u0647');
    s = s.replace(/[\u0622\u0623\u0625]/g, '\u0627');
    s = s.replace(/\u0624/g, '\u0648');
    s = s.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '');
    s = s.replace(/\u200C/g, ' ');
    s = s.toLowerCase().replace(/\s+/g, ' ').trim();
    return s;
  }
  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
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
        safe = safe.replace(new RegExp('(' + escapeRegex(term) + ')', 'gi'), '<mark class="mb-hit">$1</mark>');
      } catch (e) {}
    });
    return safe;
  }

  function inject() {
    if (document.getElementById('mb-search-wrap')) return;
    if (!document.getElementById('mb-search-css')) {
      var st = document.createElement('style');
      st.id = 'mb-search-css';
      st.textContent =
        '.mb-search-wrap{position:fixed;left:0;right:0;z-index:1140;padding:0.3rem 0.55rem 0.4rem;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#d8dee6);box-shadow:0 2px 10px rgba(10,37,64,.06)}' +
        'body.dark .mb-search-wrap{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-inner{max-width:720px;margin:0 auto}' +
        '.mb-search-row{display:flex;gap:0.35rem;align-items:center}' +
        '.mb-search-input{flex:1;min-width:0;padding:0.5rem 0.75rem;border:1px solid var(--border,#d8dee6);border-radius:10px;font-family:inherit;font-size:0.9rem;background:var(--bg,#f5f7fa);color:var(--text,#1a1a1a)}' +
        'body.dark .mb-search-input{background:#1a2b3c;border-color:#2a3a4c;color:#e8eef5}' +
        '.mb-search-btn{flex-shrink:0;border:none;background:var(--primary,#0a2540);color:#fff;padding:0.5rem 0.8rem;border-radius:10px;font-family:inherit;font-weight:700;font-size:0.85rem;cursor:pointer}' +
        '.mb-search-btn:disabled{opacity:0.65;cursor:wait}' +
        '.mb-scope{display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.35rem}' +
        '.mb-scope button{border:1px solid var(--border,#d0d7e0);background:var(--bg,#f5f7fa);color:var(--text,#333);border-radius:999px;padding:0.22rem 0.55rem;font-size:0.72rem;font-weight:700;font-family:inherit;cursor:pointer}' +
        'body.dark .mb-scope button{background:#1a2b3c;border-color:#2a3a4c;color:#dbe7f3}' +
        '.mb-scope button.is-on{background:#0a2540;border-color:#0a2540;color:#fff}' +
        'body.dark .mb-scope button.is-on{background:#c9a227;border-color:#c9a227;color:#0a2540}' +
        '.mb-search-results{position:relative;margin-top:0.35rem;max-height:50vh;overflow:auto;background:var(--bg-card,#fff);border:1px solid var(--border,#d8dee6);border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.12);display:none}' +
        'body.dark .mb-search-results{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-results.open{display:block}' +
        '.mb-search-item{display:block;width:100%;text-align:start;padding:0.55rem 0.75rem;border:none;border-bottom:1px solid var(--border,#eee);background:transparent;font-family:inherit;font-size:0.86rem;color:var(--text,#1a1a1a);cursor:pointer;line-height:1.45}' +
        '.mb-search-item:hover{background:rgba(10,37,64,.07)}' +
        '.mb-search-item .mb-ref-line{display:block;font-weight:800;color:#5b9fd4;margin-bottom:0.12rem;font-size:0.88rem}' +
        '.mb-search-item mark.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.12em;border-radius:3px}' +
        'body.dark .mb-hit{background:#c9a227;color:#1a1200}' +
        '.mb-search-status{padding:0.6rem 0.75rem;font-size:0.8rem;color:#6b7785}';
      document.head.appendChild(st);
    }

    var L = isEn()
      ? { all: 'All', ot: 'Old T.', nt: 'New T.', book: 'This book', go: 'Search', ph: 'Search whole Bible\u2026' }
      : { all: '\u0647\u0645\u0647', ot: '\u0639\u062a\u06cc\u0642', nt: '\u062c\u062f\u06cc\u062f', book: '\u0647\u0645\u06cc\u0646 \u06a9\u062a\u0627\u0628', go: '\u062c\u0633\u062a\u062c\u0648', ph: '\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u06a9\u0644 \u06a9\u062a\u0627\u0628\u2026' };

    var wrap = document.createElement('div');
    wrap.id = 'mb-search-wrap';
    wrap.className = 'mb-search-wrap';
    wrap.innerHTML =
      '<div class="mb-search-inner">' +
      '<div class="mb-search-row">' +
      '<input type="search" id="mb-search" class="mb-search-input" autocomplete="off" enterkeyhint="search" placeholder="' + L.ph + '" />' +
      '<button type="button" id="mb-search-btn" class="mb-search-btn">' + L.go + '</button>' +
      '</div>' +
      '<div class="mb-scope" id="mb-scope" role="group">' +
      '<button type="button" data-scope="all">' + L.all + '</button>' +
      '<button type="button" data-scope="ot">' + L.ot + '</button>' +
      '<button type="button" data-scope="nt">' + L.nt + '</button>' +
      '<button type="button" data-scope="book">' + L.book + '</button>' +
      '</div>' +
      '<div id="mb-search-results" class="mb-search-results" role="listbox"></div>' +
      '</div>';
    document.body.appendChild(wrap);
    placeSearch();

    document.getElementById('mb-scope').addEventListener('click', function (e) {
      var b = e.target.closest('[data-scope]');
      if (!b) return;
      setScope(b.getAttribute('data-scope'));
      var input = document.getElementById('mb-search');
      if (input && (input.value || '').trim().length >= 2) startSearch();
    });
    syncScopeUi();

    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    btn.addEventListener('click', function () { clearTimeout(debounceTimer); startSearch(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(debounceTimer); startSearch(); }
    });
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var v = (input.value || '').trim();
      if (v.length < 2) {
        var box = document.getElementById('mb-search-results');
        if (box) box.classList.remove('open');
        return;
      }
      debounceTimer = setTimeout(startSearch, 350);
    });
    document.addEventListener('click', function (e) {
      var res = document.getElementById('mb-search-results');
      var w = document.getElementById('mb-search-wrap');
      if (res && w && !w.contains(e.target)) res.classList.remove('open');
    });
  }

  function syncScopeUi() {
    var s = getScope();
    document.querySelectorAll('#mb-scope [data-scope]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-scope') === s);
    });
  }

  function placeSearch() {
    var wrap = document.getElementById('mb-search-wrap');
    if (!wrap) return;
    var bar = document.querySelector('.mb-bar');
    var top = bar ? Math.max(bar.getBoundingClientRect().bottom, 48) : 56;
    wrap.style.top = top + 'px';
    var sp = document.getElementById('mb-search-spacer');
    if (!sp) {
      sp = document.createElement('div');
      sp.id = 'mb-search-spacer';
      var reader = document.getElementById('mb-reader') || document.querySelector('main');
      if (reader && reader.parentNode) reader.parentNode.insertBefore(sp, reader);
      else document.body.appendChild(sp);
    }
    sp.style.height = (wrap.offsetHeight || 88) + 'px';
  }

  function goTo(bookId, chapter, verse) {
    try {
      localStorage.setItem('cog_bible_state', JSON.stringify({ bookId: bookId, chapter: chapter || 1, verse: verse || 1 }));
    } catch (e) {}
    location.href = 'bible.html?b=' + bookId + '&c=' + (chapter || 1) + '&v=' + (verse || 1);
  }

  function renderItems(items, statusMsg) {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    _allItems = items || [];
    _shown = 0;
    _statusMsg = statusMsg || '';
    box.innerHTML = '';
    box.classList.add('open');
    if (statusMsg) {
      var st = document.createElement('div');
      st.className = 'mb-search-status';
      st.id = 'mb-search-status';
      st.textContent = statusMsg;
      box.appendChild(st);
    }
    if (!_allItems.length && !statusMsg) {
      var empty = document.createElement('div');
      empty.className = 'mb-search-status';
      empty.textContent = isEn() ? 'No results' : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f';
      box.appendChild(empty);
      return;
    }
    appendBatch();
  }

  function appendBatch() {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    var oldMore = document.getElementById('mb-search-more');
    if (oldMore) oldMore.remove();
    var end = Math.min(_shown + BATCH, _allItems.length);
    for (var i = _shown; i < end; i++) {
      (function (it) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mb-search-item';
        btn.innerHTML = it.html;
        btn.addEventListener('click', function () {
          if (it.action) it.action();
          box.classList.remove('open');
        });
        box.appendChild(btn);
      })(_allItems[i]);
    }
    _shown = end;
    var st = document.getElementById('mb-search-status');
    if (st && _statusMsg) {
      var extra = _shown < _allItems.length
        ? (isEn()
          ? ' \u00b7 showing ' + _shown + ' / ' + _allItems.length
          : ' \u00b7 \u0646\u0645\u0627\u06cc\u0634 ' + _shown + ' / ' + _allItems.length)
        : '';
      st.textContent = _statusMsg + extra;
    }
    if (_shown < _allItems.length) {
      var more = document.createElement('button');
      more.type = 'button';
      more.id = 'mb-search-more';
      more.className = 'mb-search-item';
      more.style.cssText = 'font-weight:800;text-align:center;background:rgba(10,37,64,.06);color:#0a2540';
      more.textContent = isEn()
        ? 'Show more (' + (_allItems.length - _shown) + ' left)'
        : '\u0646\u0645\u0627\u06cc\u0634 \u0628\u06cc\u0634\u062a\u0631 (' + (_allItems.length - _shown) + ' \u0628\u0627\u0642\u06cc\u0645\u0627\u0646\u062f\u0647)';
      more.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        appendBatch();
      });
      box.appendChild(more);
    }
  }

  function makeItem(label, ch, v, text, query, bookId) {
    var snip = String(text || '').replace(/\s+/g, ' ').trim();
    if (snip.length > 110) snip = snip.slice(0, 110).trim() + '\u2026';
    return {
      html: '<span class="mb-ref-line">' + escapeHtml(label) + ' ' + ch + ':' + v + '</span>' + highlightMatch(snip, query),
      action: function () { goTo(bookId, ch, v); }
    };
  }

  function flattenOpcb(list) {
    var out = [];
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length && i < 66; i++) {
      var book = list[i];
      if (!book) continue;
      var id = IDS[i];
      var label = book.name || ('Book ' + id);
      var chapters = book.chapters || [];
      for (var ci = 0; ci < chapters.length; ci++) {
        var verses = chapters[ci] || [];
        for (var vi = 0; vi < verses.length; vi++) {
          var text = verses[vi] || '';
          if (typeof text !== 'string') text = String(text || '');
          out.push({ id: id, ch: ci + 1, v: vi + 1, text: text, label: label, norm: normalize(text) });
        }
      }
    }
    return out;
  }

  function flattenKjv(list, meta) {
    var out = [];
    if (!Array.isArray(list)) return out;
    for (var i = 0; i < list.length && i < 66; i++) {
      var book = list[i];
      if (!book) continue;
      var id = IDS[i];
      var label = book.name || (meta[i] && meta[i].en) || ('Book ' + id);
      var chapters = book.chapters || [];
      for (var ci = 0; ci < chapters.length; ci++) {
        var verses = chapters[ci] || [];
        for (var vi = 0; vi < verses.length; vi++) {
          var text = verses[vi] || '';
          out.push({ id: id, ch: ci + 1, v: vi + 1, text: text, label: label, norm: normalize(text) });
        }
      }
    }
    return out;
  }

  function loadFa() {
    if (FA_VERSES) return Promise.resolve(FA_VERSES);
    if (faLoadPromise) return faLoadPromise;
    var urls = [
      'https://cdn.jsdelivr.net/gh/thiagobodruk/bible/json/fa_opcb.json',
      'https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/fa_opcb.json',
      'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/fa_opcb.json'
    ];
    faLoadPromise = (async function () {
      for (var i = 0; i < urls.length; i++) {
        try {
          var r = await fetch(urls[i]);
          if (!r.ok) continue;
          var list = await r.json();
          FA_VERSES = flattenOpcb(list);
          return FA_VERSES;
        } catch (e) {}
      }
      faLoadPromise = null;
      return [];
    })();
    return faLoadPromise;
  }

  function loadEn() {
    if (EN_VERSES) return Promise.resolve(EN_VERSES);
    if (enLoadPromise) return enLoadPromise;
    var urls = [
      'https://cdn.jsdelivr.net/gh/thiagobodruk/bible/json/en_kjv.json',
      'https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json',
      'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
    ];
    enLoadPromise = (async function () {
      var meta = [];
      try {
        var mr = await fetch('/data/bible-fa/meta.json');
        if (mr.ok) meta = await mr.json();
      } catch (e) {}
      for (var i = 0; i < urls.length; i++) {
        try {
          var r = await fetch(urls[i]);
          if (!r.ok) continue;
          var list = await r.json();
          EN_VERSES = flattenKjv(list, meta || []);
          return EN_VERSES;
        } catch (e) {}
      }
      enLoadPromise = null;
      return [];
    })();
    return enLoadPromise;
  }

  function searchMemory(verses, query, token) {
    var nq = normalize(query);
    if (!nq || nq.length < 2) return { items: [], total: 0, books: 0 };
    var items = [];
    var seenBooks = {};
    var bookCount = 0;
    for (var i = 0; i < verses.length; i++) {
      if (token !== abortToken) break;
      var row = verses[i];
      if (!inScope(row.id)) continue;
      if (row.norm.indexOf(nq) < 0) continue;
      items.push(makeItem(row.label, row.ch, row.v, row.text, query, row.id));
      if (!seenBooks[row.id]) {
        seenBooks[row.id] = true;
        bookCount++;
      }
    }
    return { items: items, total: items.length, books: bookCount };
  }

  async function startSearch() {
    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    if (!input) return;
    var q = (input.value || '').trim();
    if (q.length < 2) return;
    abortToken++;
    var token = abortToken;
    if (btn) { btn.disabled = true; btn.textContent = '\u2026'; }

    var en = isEn();
    renderItems([], (en ? 'Loading Bible\u2026 ' : '\u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u06a9\u062a\u0627\u0628\u2026 ') + scopeLabel());

    try {
      var verses = en ? await loadEn() : await loadFa();
      if (token !== abortToken) return;
      if (!verses || !verses.length) {
        renderItems([], en ? 'Could not load Bible text' : '\u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u0646\u0634\u062f');
      } else {
        renderItems([], (en ? 'Searching\u2026 ' : '\u062c\u0633\u062a\u062c\u0648\u2026 ') + scopeLabel());
        await new Promise(function (r) { setTimeout(r, 10); });
        if (token !== abortToken) return;
        var result = searchMemory(verses, q, token);
        if (token !== abortToken) return;
        var items = result.items || [];
        var total = result.total || 0;
        var books = result.books || 0;
        var msg;
        if (!total) {
          msg = en ? 'No results \u00b7 ' + scopeLabel() : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f \u00b7 ' + scopeLabel();
        } else {
          msg = en
            ? total + ' results in ' + books + ' books \u00b7 ' + scopeLabel()
            : total + ' \u0646\u062a\u06cc\u062c\u0647 \u062f\u0631 ' + books + ' \u06a9\u062a\u0627\u0628 \u00b7 ' + scopeLabel();
        }
        renderItems(items, msg);
      }
    } catch (e) {
      console.warn(e);
      if (token === abortToken) renderItems([], en ? 'Search error' : '\u062e\u0637\u0627');
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = en ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';
    }
  }

  function boot() {
    inject();
    placeSearch();
    window.addEventListener('resize', placeSearch);
    setTimeout(placeSearch, 400);
    setTimeout(function () {
      if (isEn()) loadEn();
      else loadFa();
    }, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
