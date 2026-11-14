/* Fast full-Bible search — parallel FA + in-memory KJV for English */
(function () {
  var path = (location.pathname || '').toLowerCase();
  if (document.body && document.body.getAttribute('data-page') !== 'bible' && path.indexOf('bible') < 0) return;

  var abortToken = 0;
  var searching = false;
  var debounceTimer = null;
  var CACHE = window.__bibleSearchCache = window.__bibleSearchCache || { fa: {}, en: {} };

  function isEn() {
    try { return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en'; }
    catch (e) { return false; }
  }

  function placeholder() {
    return isEn() ? 'Search Bible… (word or John 3:16)' : '\u062c\u0633\u062a\u062c\u0648\u2026 (\u06a9\u0644\u0645\u0647 \u06cc\u0627 \u06cc\u0648\u062d\u0646\u0627 \u06f3:\u06f1\u06f6)';
  }

  function inject() {
    if (document.getElementById('mb-search-wrap')) return;
    if (!document.getElementById('mb-search-css')) {
      var st = document.createElement('style');
      st.id = 'mb-search-css';
      st.textContent =
        '.mb-search-wrap{position:fixed;left:0;right:0;z-index:1140;padding:0.35rem 0.65rem 0.45rem;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#d8dee6);box-shadow:0 2px 10px rgba(10,37,64,.06)}' +
        'body.dark .mb-search-wrap{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-inner{max-width:720px;margin:0 auto;display:flex;gap:0.4rem;align-items:center;position:relative}' +
        '.mb-search-input{flex:1;min-width:0;padding:0.55rem 0.85rem;border:1px solid var(--border,#d8dee6);border-radius:10px;font-family:inherit;font-size:0.92rem;background:var(--bg,#f5f7fa);color:var(--text,#1a1a1a)}' +
        'body.dark .mb-search-input{background:#1a2b3c;border-color:#2a3a4c;color:#e8eef5}' +
        '.mb-search-input:focus{outline:2px solid var(--primary,#0a2540);outline-offset:1px}' +
        '.mb-search-btn{flex-shrink:0;border:none;background:var(--primary,#0a2540);color:#fff;padding:0.55rem 0.9rem;border-radius:10px;font-family:inherit;font-weight:700;font-size:0.88rem;cursor:pointer}' +
        '.mb-search-btn:disabled{opacity:0.6;cursor:wait}' +
        '.mb-search-results{position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:55vh;overflow:auto;background:var(--bg-card,#fff);border:1px solid var(--border,#d8dee6);border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.15);z-index:1145;display:none}' +
        'body.dark .mb-search-results{background:#152536;border-color:#2a3a4c}' +
        '.mb-search-results.open{display:block}' +
        '.mb-search-item{display:block;width:100%;text-align:start;padding:0.65rem 0.85rem;border:none;border-bottom:1px solid var(--border,#eee);background:transparent;font-family:inherit;font-size:0.88rem;color:var(--text,#1a1a1a);cursor:pointer;line-height:1.45}' +
        '.mb-search-item:hover,.mb-search-item:focus{background:rgba(10,37,64,.07)}' +
        'body.dark .mb-search-item:hover{background:rgba(255,255,255,.06)}' +
        '.mb-search-item strong{color:var(--primary,#0a2540)}' +
        '.mb-search-status{padding:0.7rem 0.85rem;font-size:0.82rem;color:var(--text-muted,#6b7785)}' +
        '.mb-search-empty{padding:0.85rem;color:var(--text-muted,#6b7785);font-size:0.88rem;text-align:center}';
      document.head.appendChild(st);
    }
    var wrap = document.createElement('div');
    wrap.id = 'mb-search-wrap';
    wrap.className = 'mb-search-wrap';
    wrap.innerHTML = '<div class="mb-search-inner"><input type="search" id="mb-search" class="mb-search-input" autocomplete="off" enterkeyhint="search" /><button type="button" id="mb-search-btn" class="mb-search-btn"></button><div id="mb-search-results" class="mb-search-results" role="listbox"></div></div>';
    document.body.appendChild(wrap);
    placeSearch();
    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    input.placeholder = placeholder();
    btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';
    btn.addEventListener('click', function () { startSearch(); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); startSearch(); } });
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var v = (input.value || '').trim();
      if (v.length < 2) { var box = document.getElementById('mb-search-results'); if (box) box.classList.remove('open'); return; }
      debounceTimer = setTimeout(function () { startSearch(); }, 350);
    });
    document.addEventListener('click', function (e) {
      var res = document.getElementById('mb-search-results');
      var w = document.getElementById('mb-search-wrap');
      if (res && w && !w.contains(e.target)) res.classList.remove('open');
    });
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () {
      setTimeout(function () {
        var inp = document.getElementById('mb-search');
        var b = document.getElementById('mb-search-btn');
        if (inp) inp.placeholder = placeholder();
        if (b && !b.disabled) b.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';
        if (isEn()) loadKjv();
      }, 200);
    });
  }

  function placeSearch() {
    var wrap = document.getElementById('mb-search-wrap');
    if (!wrap) return;
    var bar = document.querySelector('.mb-bar');
    var top = 56;
    if (bar) { var r = bar.getBoundingClientRect(); top = Math.max(r.bottom, 48); }
    wrap.style.top = top + 'px';
    var sp = document.getElementById('mb-search-spacer');
    if (!sp) {
      sp = document.createElement('div');
      sp.id = 'mb-search-spacer';
      var reader = document.getElementById('mb-reader') || document.querySelector('main');
      if (reader && reader.parentNode) reader.parentNode.insertBefore(sp, reader);
      else document.body.appendChild(sp);
    }
    sp.style.height = (wrap.offsetHeight + 8) + 'px';
  }

  function normalize(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u06f0-\u06f9]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      .replace(/[\u064b-\u065f]/g, '').replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function parseRef(q) {
    q = String(q || '').trim();
    var m = q.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
    if (!m) return null;
    return { bookQuery: m[1].trim(), chapter: Number(m[2]), verse: m[3] ? Number(m[3]) : 1 };
  }

  function goTo(bookId, chapter, verse) {
    try { localStorage.setItem('cog_bible_state', JSON.stringify({ bookId: bookId, chapter: chapter || 1, verse: verse || 1 })); } catch (e) {}
    location.href = 'bible.html?b=' + bookId + '&c=' + (chapter || 1) + '&v=' + (verse || 1);
  }

  function renderItems(items, statusMsg) {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    var html = '';
    if (statusMsg) html += '<div class="mb-search-status">' + escapeHtml(statusMsg) + '</div>';
    if (!items.length && !statusMsg) html = '<div class="mb-search-empty">' + (isEn() ? 'No results' : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f') + '</div>';
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
      try { var meta = await loadJson('/data/bible-fa/meta.json'); window.__bibleMeta = Array.isArray(meta) ? meta : []; }
      catch (e) { window.__bibleMeta = []; }
    }
    if (!window.__bibleManifest) {
      try { var man = await loadJson('/data/bible-fa/manifest.json'); window.__bibleManifest = man && typeof man === 'object' ? man : {}; }
      catch (e) { window.__bibleManifest = {}; }
    }
  }

  function bookLabel(b) {
    if (!b) return '';
    return isEn() ? (b.en || b.fa) : (b.fa || b.en);
  }

  function matchBookName(q) {
    var nq = normalize(q);
    var hits = [];
    (window.__bibleMeta || []).forEach(function (b) {
      var fa = normalize(b.fa);
      var en = normalize(b.en);
      if ((fa && (fa.indexOf(nq) >= 0 || nq.indexOf(fa) >= 0)) || (en && (en.indexOf(nq) >= 0 || nq.indexOf(en) >= 0))) hits.push(b);
    });
    return hits;
  }

  async function mapPool(list, limit, fn) {
    var i = 0, results = new Array(list.length);
    async function worker() {
      while (i < list.length) { var idx = i++; results[idx] = await fn(list[idx], idx); }
    }
    var workers = [];
    for (var w = 0; w < Math.min(limit, list.length); w++) workers.push(worker());
    await Promise.all(workers);
    return results;
  }

  async function searchPersianFast(query, token) {
    await ensureMetaManifest();
    var nq = normalize(query);
    var items = [];
    var man = window.__bibleManifest || {};
    var meta = window.__bibleMeta || [];
    var metaById = {};
    meta.forEach(function (b) { metaById[String(b.id)] = b; });
    var bookIds = Object.keys(man);
    if (!bookIds.length) bookIds = meta.map(function (b) { return String(b.id); });
    bookIds.sort(function (a, b) {
      var na = Number(a), nb = Number(b);
      return ((na >= 470 ? 0 : 1) - (nb >= 470 ? 0 : 1)) || (na - nb);
    });
    var files = [];
    bookIds.forEach(function (id) {
      var list = man[String(id)] || man[id] || [];
      var seen = {};
      list.forEach(function (fn) { if (!seen[fn]) { seen[fn] = 1; files.push({ id: Number(id), file: fn }); } });
    });
    var checked = 0, total = files.length;
    await mapPool(files, 12, async function (job) {
      if (token !== abortToken || items.length >= 50) return;
      var key = job.id + ':' + job.file;
      var pack = CACHE.fa[key];
      if (!pack) { pack = await loadJson('/data/bible-fa/' + job.file); if (pack) CACHE.fa[key] = pack; }
      checked++;
      if (!pack) return;
      var verses = extractVerses(pack, job.id);
      var b = metaById[String(job.id)];
      var label = bookLabel(b) || ('Book ' + job.id);
      for (var i = 0; i < verses.length; i++) {
        if (items.length >= 50) break;
        var vs = verses[i];
        if (normalize(vs.text).indexOf(nq) >= 0) {
          var snip = vs.text.length > 100 ? vs.text.slice(0, 100).trim() + '\u2026' : vs.text.trim();
          items.push({
            html: '<strong>' + escapeHtml(label) + ' ' + vs.ch + ':' + vs.v + '</strong><br>' + escapeHtml(snip),
            action: (function (bid, ch, v) { return function () { goTo(bid, ch, v); }; })(job.id, vs.ch, vs.v)
          });
        }
      }
      if (checked % 20 === 0 || items.length >= 50) {
        renderItems(items.slice(0, 50), (isEn() ? 'Searching… ' : '\u062f\u0631 \u062d\u0627\u0644 \u062c\u0633\u062a\u062c\u0648\u2026 ') + Math.min(checked, total) + '/' + total + (items.length ? (isEn() ? ' — ' + items.length + ' found' : ' — ' + items.length + ' \u06cc\u0627\u0641\u062a \u0634\u062f') : ''));
      }
    });
    return items.slice(0, 50);
  }

  var kjvPromise = null;
  var kjvList = null;

  function loadKjv() {
    if (kjvList) return Promise.resolve(kjvList);
    if (!kjvPromise) {
      var urls = [
        'https://cdn.jsdelivr.net/gh/thiagobodruk/bible/json/en_kjv.json',
        'https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/en_kjv.json',
        'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
      ];
      kjvPromise = (async function () {
        for (var i = 0; i < urls.length; i++) {
          try {
            var r = await fetch(urls[i]);
            if (r.ok) {
              kjvList = await r.json();
              return kjvList;
            }
          } catch (e) {}
        }
        console.warn('KJV load failed');
        kjvPromise = null;
        return null;
      })();
    }
    return kjvPromise;
  }

  async function searchEnglishFast(query, token) {
    await ensureMetaManifest();
    var nq = normalize(query);
    var items = [];
    var meta = window.__bibleMeta || [];
    var IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];

    renderItems(items, 'Loading English Bible…');
    var list = await loadKjv();
    if (token !== abortToken) return items;
    if (!list || !list.length) {
      renderItems(items, 'English Bible could not load — try again');
      return items;
    }

    var order = [];
    for (var i = 0; i < list.length; i++) order.push(i);
    order.sort(function (a, b) {
      var ida = IDS[a] || 0, idb = IDS[b] || 0;
      var pa = ida >= 470 ? 0 : 1, pb = idb >= 470 ? 0 : 1;
      return pa - pb || a - b;
    });

    for (var oi = 0; oi < order.length; oi++) {
      if (token !== abortToken || items.length >= 50) break;
      var idx = order[oi];
      var book = list[idx];
      if (!book) continue;
      var id = IDS[idx];
      var label = book.name || (meta[idx] && (meta[idx].en || meta[idx].fa)) || ('Book ' + id);
      var chapters = book.chapters || [];
      for (var ci = 0; ci < chapters.length; ci++) {
        if (items.length >= 50) break;
        var verses = chapters[ci] || [];
        for (var vi = 0; vi < verses.length; vi++) {
          if (items.length >= 50) break;
          var text = verses[vi] || '';
          if (normalize(text).indexOf(nq) < 0) continue;
          var snip = text.length > 100 ? text.slice(0, 100).trim() + '\u2026' : text.trim();
          items.push({
            html: '<strong>' + escapeHtml(label) + ' ' + (ci + 1) + ':' + (vi + 1) + '</strong><br>' + escapeHtml(snip),
            action: (function (bid, c, v) {
              return function () { goTo(bid, c, v); };
            })(id, ci + 1, vi + 1)
          });
        }
      }
      if (oi % 5 === 0 || items.length >= 50) {
        renderItems(items.slice(0, 50),
          'Searching… ' + (oi + 1) + '/' + order.length +
          (items.length ? ' — ' + items.length + ' found' : '')
        );
      }
    }
    return items.slice(0, 50);
  }

  async function startSearch() {
    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    if (!input) return;
    var q = (input.value || '').trim();
    if (!q) return;
    abortToken++;
    searching = true;
    var token = abortToken;
    if (btn) { btn.disabled = true; btn.textContent = isEn() ? '…' : '\u2026'; }
    var items = [];
    await ensureMetaManifest();
    var ref = parseRef(q);
    if (ref) {
      matchBookName(ref.bookQuery).forEach(function (b) {
        items.push({ html: '<strong>' + escapeHtml(bookLabel(b)) + ' ' + ref.chapter + (ref.verse ? ':' + ref.verse : '') + '</strong>', action: function () { goTo(b.id, ref.chapter, ref.verse || 1); } });
      });
    }
    matchBookName(q).forEach(function (b) {
      items.push({ html: '<strong>' + escapeHtml(bookLabel(b)) + '</strong> — ' + (isEn() ? 'Open book' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u06a9\u062a\u0627\u0628'), action: function () { goTo(b.id, 1, 1); } });
    });
    var nq = normalize(q);
    document.querySelectorAll('.mb-verse').forEach(function (el) {
      if (normalize(el.textContent).indexOf(nq) >= 0) {
        var ch = el.getAttribute('data-chapter');
        var vs = el.getAttribute('data-verse');
        var snip = (el.textContent || '').trim();
        if (snip.length > 100) snip = snip.slice(0, 100) + '\u2026';
        items.push({ html: '<strong>' + ch + ':' + vs + '</strong> — ' + escapeHtml(snip), action: function () { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('highlight'); setTimeout(function () { el.classList.remove('highlight'); }, 2000); } });
      }
    });
    renderItems(items, isEn() ? 'Searching…' : '\u062f\u0631 \u062d\u0627\u0644 \u062c\u0633\u062a\u062c\u0648\u2026');
    try {
      var more = isEn() ? await searchEnglishFast(q, token) : await searchPersianFast(q, token);
      if (token === abortToken) {
        var seen = {};
        items.forEach(function (it) { seen[it.html] = 1; });
        more.forEach(function (it) { if (!seen[it.html]) { seen[it.html] = 1; items.push(it); } });
        renderItems(items.slice(0, 50), items.length ? (isEn() ? items.length + ' results' : items.length + ' \u0646\u062a\u06cc\u062c\u0647') : (isEn() ? 'No results' : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f'));
      }
    } catch (e) {
      if (token === abortToken) renderItems(items, isEn() ? 'Search error — try again' : '\u062e\u0637\u0627 \u062c\u0633\u062a\u062c\u0648');
    }
    searching = false;
    if (btn) { btn.disabled = false; btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648'; }
  }

  function boot() {
    inject();
    if (isEn()) setTimeout(function () { loadKjv(); }, 800);
    placeSearch();
    window.addEventListener('resize', placeSearch);
    setTimeout(placeSearch, 300);
    setTimeout(placeSearch, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
