/* Bible search with scope: All | Old Testament | New Testament | This book */
(function () {
  if (window.__mbSearchBooted) return;
  window.__mbSearchBooted = true;

  var path = (location.pathname || '').toLowerCase();
  if (document.body && document.body.getAttribute('data-page') !== 'bible' && path.indexOf('bible') < 0) return;

  var abortToken = 0;
  var debounceTimer = null;
  var CACHE = window.__bibleSearchCache = window.__bibleSearchCache || { fa: {}, en: null };
  var MAX_SHOW = 120;
  var SCOPE_KEY = 'cog_bible_search_scope';
  var NT_MIN = 470;

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
  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[\u064b-\u065f]/g, '').replace(/\s+/g, ' ').trim();
  }
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
        safe = safe.replace(new RegExp('(' + escapeRegex(term) + ')', 'gi'), '<mark class="mb-hit">$1</mark>');
      } catch (e) {}
    });
    return safe;
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
    bookId = Number(bookId);
    if (s === 'ot') return bookId > 0 && bookId < NT_MIN;
    if (s === 'nt') return bookId >= NT_MIN;
    if (s === 'book') return bookId === currentBookId();
    return true;
  }
  function scopeLabel() {
    var s = getScope();
    if (isEn()) {
      return { all: 'All Bible', ot: 'Old Testament', nt: 'New Testament', book: 'This book' }[s] || 'All Bible';
    }
    return {
      all: '\u0647\u0645\u0647 \u06a9\u062a\u0627\u0628',
      ot: '\u0639\u0647\u062f \u0639\u062a\u06cc\u0642',
      nt: '\u0639\u0647\u062f \u062c\u062f\u06cc\u062f',
      book: '\u0647\u0645\u06cc\u0646 \u06a9\u062a\u0627\u0628'
    }[s] || '\u0647\u0645\u0647 \u06a9\u062a\u0627\u0628';
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
        '.mb-search-btn:disabled{opacity:0.6;cursor:wait}' +
        '.mb-scope{display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.35rem}' +
        '.mb-scope button{border:1px solid var(--border,#d0d7e0);background:var(--bg,#f5f7fa);color:var(--text,#333);border-radius:999px;padding:0.22rem 0.55rem;font-size:0.72rem;font-weight:700;font-family:inherit;cursor:pointer}' +
        'body.dark .mb-scope button{background:#1a2b3c;border-color:#2a3a4c;color:#dbe7f3}' +
        '.mb-scope button.is-on{background:#0a2540;border-color:#0a2540;color:#fff}' +
        'body.dark .mb-scope button.is-on{background:#c9a227;border-color:#c9a227;color:#0a2540}' +
        '.mb-search-results{position:relative;margin-top:0.35rem;max-height:50vh;overflow:auto;background:var(--bg-card,#fff);border:1px solid var(--border,#d8dee6);border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.12);display:none}' +
        'body.dark .mb-search-results{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-results.open{display:block}' +
        '.mb-search-item{display:block;width:100%;text-align:start;padding:0.6rem 0.8rem;border:none;border-bottom:1px solid var(--border,#eee);background:transparent;font-family:inherit;font-size:0.86rem;color:var(--text,#1a1a1a);cursor:pointer;line-height:1.45}' +
        '.mb-search-item:hover{background:rgba(10,37,64,.07)}' +
        '.mb-search-item .mb-ref-line{display:block;font-weight:800;color:#5b9fd4;margin-bottom:0.15rem;font-size:0.88rem}' +
        '.mb-search-item mark.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.12em;border-radius:3px}' +
        'body.dark .mb-hit{background:#c9a227;color:#1a1200}' +
        '.mb-search-status{padding:0.65rem 0.8rem;font-size:0.8rem;color:#6b7785}';
      document.head.appendChild(st);
    }

    var wrap = document.createElement('div');
    wrap.id = 'mb-search-wrap';
    wrap.className = 'mb-search-wrap';
    var L = isEn()
      ? { all: 'All', ot: 'Old T.', nt: 'New T.', book: 'This book', go: 'Search', ph: 'Search\u2026 (word or John 3:16)' }
      : { all: '\u0647\u0645\u0647', ot: '\u0639\u062a\u06cc\u0642', nt: '\u062c\u062f\u06cc\u062f', book: '\u0647\u0645\u06cc\u0646 \u06a9\u062a\u0627\u0628', go: '\u062c\u0633\u062a\u062c\u0648', ph: '\u062c\u0633\u062a\u062c\u0648\u2026' };
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
    btn.addEventListener('click', function () { startSearch(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); startSearch(); }
    });
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var v = (input.value || '').trim();
      if (v.length < 2) {
        var box = document.getElementById('mb-search-results');
        if (box) box.classList.remove('open');
        return;
      }
      debounceTimer = setTimeout(function () { startSearch(); }, 450);
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
  function makeItem(label, ch, v, text, query, bookId) {
    var snip = String(text || '').replace(/\s+/g, ' ').trim();
    if (snip.length > 110) snip = snip.slice(0, 110).trim() + '\u2026';
    return {
      html: '<span class="mb-ref-line">' + escapeHtml(label) + ' ' + ch + ':' + v + '</span>' + highlightMatch(snip, query),
      action: function () { goTo(bookId, ch, v); }
    };
  }
  function renderItems(items, statusMsg) {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    var html = '';
    if (statusMsg) html += '<div class="mb-search-status">' + escapeHtml(statusMsg) + '</div>';
    if (!items.length && !statusMsg) {
      html = '<div class="mb-search-status">' + (isEn() ? 'No results' : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f') + '</div>';
    }
    items.forEach(function (it, i) {
      html += '<button type="button" class="mb-search-item" data-i="' + i + '">' + it.html + '</button>';
    });
    box.innerHTML = html;
    box.classList.add('open');
    box.querySelectorAll('.mb-search-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var it = items[Number(btn.getAttribute('data-i'))];
        if (it && it.action) it.action();
        box.classList.remove('open');
      });
    });
  }
  function extractVerses(pack, bookId) {
    var out = [];
    if (!pack || typeof pack !== 'object') return out;
    var data = pack[String(bookId)] || pack[bookId] || pack;
    var chapters = (data && data.chapters) ? data.chapters : data;
    if (!chapters || typeof chapters !== 'object') return out;
    Object.keys(chapters).forEach(function (ch) {
      if (!/^\d+$/.test(ch)) return;
      var verses = chapters[ch];
      if (!verses || typeof verses !== 'object') return;
      if (verses.verses) verses = verses.verses;
      Object.keys(verses).forEach(function (v) {
        if (!/^\d+$/.test(v)) return;
        var text = verses[v];
        if (typeof text === 'object' && text !== null) text = text.text || text.t || '';
        if (typeof text !== 'string') return;
        out.push({ ch: Number(ch), v: Number(v), text: text });
      });
    });
    return out;
  }
  function loadJson(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  async function ensureMetaManifest() {
    if (!window.__bibleMeta) {
      try {
        var meta = await loadJson('/data/bible-fa/meta.json');
        window.__bibleMeta = Array.isArray(meta) ? meta : [];
      } catch (e) { window.__bibleMeta = []; }
    }
    if (!window.__bibleManifest) {
      try {
        var man = await loadJson('/data/bible-fa/manifest.json');
        window.__bibleManifest = man && typeof man === 'object' ? man : {};
      } catch (e) { window.__bibleManifest = {}; }
    }
  }
  function bookLabel(b) {
    if (!b) return '';
    return isEn() ? (b.en || b.fa) : (b.fa || b.en);
  }
  async function mapPool(list, limit, fn) {
    var i = 0, results = new Array(list.length);
    async function worker() {
      while (i < list.length) {
        var idx = i++;
        results[idx] = await fn(list[idx], idx);
      }
    }
    var workers = [];
    for (var w = 0; w < Math.min(limit, list.length); w++) workers.push(worker());
    await Promise.all(workers);
    return results;
  }
  async function searchPersian(query, token) {
    await ensureMetaManifest();
    var nq = normalize(query);
    var items = [];
    var man = window.__bibleManifest || {};
    var meta = window.__bibleMeta || [];
    var metaById = {};
    meta.forEach(function (b) { metaById[String(b.id)] = b; });
    var bookIds = Object.keys(man);
    if (!bookIds.length) bookIds = meta.map(function (b) { return String(b.id); });
    bookIds = bookIds.filter(function (id) { return inScope(Number(id)); });
    bookIds.sort(function (a, b) { return Number(a) - Number(b); });
    var files = [];
    bookIds.forEach(function (id) {
      var list = man[String(id)] || man[id] || [];
      var seen = {};
      list.forEach(function (fn) {
        if (!seen[fn]) { seen[fn] = 1; files.push({ id: Number(id), file: fn }); }
      });
    });
    var checked = 0, total = files.length;
    await mapPool(files, 12, async function (job) {
      if (token !== abortToken) return;
      var key = job.id + ':' + job.file;
      var pack = CACHE.fa[key];
      if (!pack) {
        pack = await loadJson('/data/bible-fa/' + job.file);
        if (pack) CACHE.fa[key] = pack;
      }
      checked++;
      if (!pack) return;
      var verses = extractVerses(pack, job.id);
      var b = metaById[String(job.id)];
      var label = bookLabel(b) || ('Book ' + job.id);
      for (var i = 0; i < verses.length; i++) {
        var vs = verses[i];
        if (normalize(vs.text).indexOf(nq) < 0) continue;
        items.push(makeItem(label, vs.ch, vs.v, vs.text, query, job.id));
      }
      if (checked % 20 === 0) {
        renderItems(items.slice(0, MAX_SHOW), scopeLabel() + ' \u2014 ' + checked + '/' + total + (items.length ? ' \u2014 ' + items.length : ''));
      }
    });
    return items.slice(0, MAX_SHOW);
  }
  function loadKjv() {
    if (CACHE.en) return Promise.resolve(CACHE.en);
    var urls = [
      'https://cdn.jsdelivr.net/gh/thiagobodruk/bible/json/en_kjv.json',
      'https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json',
      'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
    ];
    return (async function () {
      for (var i = 0; i < urls.length; i++) {
        try {
          var r = await fetch(urls[i]);
          if (r.ok) { CACHE.en = await r.json(); return CACHE.en; }
        } catch (e) {}
      }
      return null;
    })();
  }
  async function searchEnglish(query, token) {
    await ensureMetaManifest();
    var nq = normalize(query);
    var items = [];
    var meta = window.__bibleMeta || [];
    var IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];
    renderItems([], (isEn() ? 'Loading\u2026 ' : '\u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc\u2026 ') + scopeLabel());
    var list = await loadKjv();
    if (token !== abortToken) return items;
    if (!list || !list.length) {
      renderItems([], isEn() ? 'Could not load English Bible' : '\u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc \u0646\u0634\u062f');
      return items;
    }
    var total = Math.min(list.length, 66);
    for (var idx = 0; idx < total; idx++) {
      if (token !== abortToken) break;
      var id = IDS[idx] || (idx + 1);
      if (!inScope(id)) continue;
      var book = list[idx];
      if (!book) continue;
      var label = book.name || (meta[idx] && (meta[idx].en || meta[idx].fa)) || ('Book ' + id);
      var chapters = book.chapters || [];
      for (var ci = 0; ci < chapters.length; ci++) {
        var verses = chapters[ci] || [];
        for (var vi = 0; vi < verses.length; vi++) {
          var text = verses[vi] || '';
          if (normalize(text).indexOf(nq) < 0) continue;
          items.push(makeItem(label, ci + 1, vi + 1, text, query, id));
        }
      }
      if (idx % 5 === 0) {
        renderItems(items.slice(0, MAX_SHOW), scopeLabel() + ' \u2014 ' + (idx + 1) + '/' + total + (items.length ? ' \u2014 ' + items.length : ''));
      }
    }
    return items.slice(0, MAX_SHOW);
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
    renderItems([], (isEn() ? 'Searching: ' : '\u062c\u0633\u062a\u062c\u0648: ') + scopeLabel() + '\u2026');
    try {
      var items = isEn() ? await searchEnglish(q, token) : await searchPersian(q, token);
      if (token === abortToken) {
        var msg = items.length
          ? (isEn() ? items.length + ' results \u00b7 ' + scopeLabel() : items.length + ' \u0646\u062a\u06cc\u062c\u0647 \u00b7 ' + scopeLabel())
          : (isEn() ? 'No results \u00b7 ' + scopeLabel() : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f \u00b7 ' + scopeLabel());
        renderItems(items, msg);
      }
    } catch (e) {
      console.warn(e);
      if (token === abortToken) renderItems([], isEn() ? 'Search error' : '\u062e\u0637\u0627');
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';
    }
  }
  function boot() {
    inject();
    placeSearch();
    window.addEventListener('resize', placeSearch);
    setTimeout(placeSearch, 400);
    if (isEn()) setTimeout(function () { loadKjv(); }, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
