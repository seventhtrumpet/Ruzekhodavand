/* Full-Bible search — any word/name across whole Bible */
(function () {
  var path = (location.pathname || '').toLowerCase();
  if (document.body && document.body.getAttribute('data-page') !== 'bible' && path.indexOf('bible') < 0) return;

  var searching = false;
  var abortToken = 0;

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function placeholder() {
    return isEn()
      ? 'Search whole Bible… (name, word, or John 3:16)'
      : '\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u06a9\u0644 \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633\u2026 (\u0646\u0627\u0645\u060c \u06a9\u0644\u0645\u0647 \u06cc\u0627 \u06cc\u0648\u062d\u0646\u0627 \u06f3:\u06f1\u06f6)';
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
    wrap.innerHTML =
      '<div class="mb-search-inner">' +
      '<input type="search" id="mb-search" class="mb-search-input" autocomplete="off" enterkeyhint="search" />' +
      '<button type="button" id="mb-search-btn" class="mb-search-btn"></button>' +
      '<div id="mb-search-results" class="mb-search-results" role="listbox"></div>' +
      '</div>';

    var bar = document.querySelector('.mb-bar');
    if (bar && bar.parentNode) {
      if (bar.nextSibling) bar.parentNode.insertBefore(wrap, bar.nextSibling);
      else bar.parentNode.appendChild(wrap);
    } else {
      document.body.insertBefore(wrap, document.body.firstChild);
    }

    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    input.placeholder = placeholder();
    btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); startFullSearch(); }
    });
    btn.addEventListener('click', startFullSearch);

    document.addEventListener('click', function (e) {
      var res = document.getElementById('mb-search-results');
      if (res && !wrap.contains(e.target)) res.classList.remove('open');
    });

    placeSearch();
    window.addEventListener('resize', placeSearch);
    setTimeout(placeSearch, 300);
    setTimeout(placeSearch, 1000);

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

  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[\u06f0-\u06f9]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      .replace(/[\u064b-\u065f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
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
    try {
      localStorage.setItem('cog_bible_state', JSON.stringify({
        bookId: bookId, chapter: chapter || 1, verse: verse || 1
      }));
    } catch (e) {}
    location.href = 'bible.html?b=' + bookId + '&c=' + (chapter || 1) + '&v=' + (verse || 1);
  }

  function setStatus(msg) {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    var el = box.querySelector('.mb-search-status');
    if (!el) {
      el = document.createElement('div');
      el.className = 'mb-search-status';
      box.insertBefore(el, box.firstChild);
    }
    el.textContent = msg;
  }

  function renderItems(items, statusMsg) {
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    var html = '';
    if (statusMsg) html += '<div class="mb-search-status">' + escapeHtml(statusMsg) + '</div>';
    if (!items.length && !statusMsg) {
      html = '<div class="mb-search-empty">' + (isEn() ? 'No results' : '\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u06cc\u0627\u0641\u062a \u0646\u0634\u062f') + '</div>';
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

  /* Extract verses from various JSON shapes */
  function extractVerses(pack, bookId) {
    var out = []; // {ch, v, text}
    if (!pack || typeof pack !== 'object') return out;

    var data = pack[String(bookId)] || pack[bookId] || pack;
    if (data && data.chapters) data = data;
    else if (pack.chapters) data = pack;

    var chapters = null;
    if (data && data.chapters) chapters = data.chapters;
    else if (pack.chapters) chapters = pack.chapters;
    else {
      // maybe chapter-keyed object: { "1": { "1": "..." } }
      var keys = Object.keys(pack);
      var numeric = keys.filter(function (k) { return /^\d+$/.test(k); });
      if (numeric.length && typeof pack[numeric[0]] === 'object') {
        chapters = pack;
      }
    }
    if (!chapters || typeof chapters !== 'object') return out;

    Object.keys(chapters).forEach(function (ch) {
      if (!/^\d+$/.test(ch)) return;
      var verses = chapters[ch];
      if (!verses || typeof verses !== 'object') return;
      // sometimes nested { verses: {...} }
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
    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=1')
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
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

  function matchBookName(q) {
    var nq = normalize(q);
    var hits = [];
    (window.__bibleMeta || []).forEach(function (b) {
      var fa = normalize(b.fa);
      var en = normalize(b.en);
      if (fa.indexOf(nq) >= 0 || en.indexOf(nq) >= 0 || nq.indexOf(fa) >= 0 || nq.indexOf(en) >= 0) {
        hits.push(b);
      }
    });
    return hits;
  }

  /* Search all FA local files */
  async function searchPersianFull(query, token) {
    await ensureMetaManifest();
    var nq = normalize(query);
    var items = [];
    var man = window.__bibleManifest || {};
    var meta = window.__bibleMeta || [];
    var bookIds = Object.keys(man);
    if (!bookIds.length) bookIds = meta.map(function (b) { return String(b.id); });

    var checked = 0;
    var total = bookIds.length;

    for (var bi = 0; bi < bookIds.length; bi++) {
      if (token !== abortToken) return items;
      var id = Number(bookIds[bi]);
      var files = man[String(id)] || man[id] || ['b' + id + '.json'];
      // unique files
      var seenF = {};
      files = files.filter(function (f) { if (seenF[f]) return false; seenF[f] = 1; return true; });

      var bookMeta = meta.find(function (x) { return Number(x.id) === id; });
      var label = bookLabel(bookMeta) || ('Book ' + id);

      for (var fi = 0; fi < files.length; fi++) {
        if (token !== abortToken) return items;
        var pack = await loadJson('/data/bible-fa/' + files[fi]);
        if (!pack) continue;
        var verses = extractVerses(pack, id);
        for (var vi = 0; vi < verses.length; vi++) {
          var vs = verses[vi];
          if (normalize(vs.text).indexOf(nq) >= 0) {
            var snip = vs.text.length > 100 ? vs.text.slice(0, 100) + '…' : vs.text;
            items.push({
              html: '<strong>' + escapeHtml(label) + ' ' + vs.ch + ':' + vs.v + '</strong><br>' + escapeHtml(snip),
              action: (function (bid, ch, v) {
                return function () { goTo(bid, ch, v); };
              })(id, vs.ch, vs.v)
            });
            if (items.length >= 60) {
              renderItems(items, isEn() ? 'Showing first 60 matches…' : '\u06f6\u06f0 \u0646\u062a\u06cc\u062c\u0647\u0650 \u0627\u0648\u0644\u2026');
              return items;
            }
          }
        }
      }
      checked++;
      if (checked % 2 === 0) {
        renderItems(items,
          (isEn() ? 'Searching… ' : '\u062f\u0631 \u062d\u0627\u0644 \u062c\u0633\u062a\u062c\u0648\u2026 ') +
          checked + '/' + total +
          (items.length ? (isEn() ? ' — ' + items.length + ' found' : ' — ' + items.length + ' \u06cc\u0627\u0641\u062a \u0634\u062f') : '')
        );
      }
    }
    return items;
  }

  /* English: search via bible-api.com chapter by chapter (progressive) */
  async function searchEnglishFull(query, token) {
    await ensureMetaManifest();
    var nq = normalize(query);
    var items = [];
    var meta = window.__bibleMeta || [];
    var CHAPTER_COUNTS = {
      10:50,20:40,30:27,40:36,50:34,60:24,70:21,80:4,90:31,100:24,
      110:22,120:25,130:29,140:36,150:10,160:13,190:10,220:42,230:150,240:31,
      250:12,260:8,290:66,300:52,310:5,330:48,340:12,350:14,360:3,370:9,
      380:1,390:4,400:7,410:3,420:3,430:3,440:2,450:14,460:4,
      470:28,480:16,490:24,500:21,510:28,520:16,530:16,540:13,550:6,560:6,
      570:4,580:4,590:5,600:3,610:6,620:4,630:3,640:1,650:13,660:5,
      670:5,680:3,690:5,700:1,710:1,720:1,730:22
    };

    for (var bi = 0; bi < meta.length; bi++) {
      if (token !== abortToken) return items;
      var b = meta[bi];
      var id = Number(b.id);
      var maxCh = CHAPTER_COUNTS[id] || 1;
      var label = b.en || b.fa;
      var refName = (b.en || '').replace(/\s+/g, '+');
      if (!refName) continue;

      for (var ch = 1; ch <= maxCh; ch++) {
        if (token !== abortToken) return items;
        if (items.length >= 60) {
          renderItems(items, 'Showing first 60 matches…');
          return items;
        }
        try {
          var res = await fetch('https://bible-api.com/' + encodeURIComponent(refName + '+' + ch) + '?translation=kjv');
          if (!res.ok) continue;
          var data = await res.json();
          var verses = data.verses || [];
          for (var i = 0; i < verses.length; i++) {
            var vv = verses[i];
            var text = vv.text || '';
            if (normalize(text).indexOf(nq) >= 0) {
              var snip = text.length > 100 ? text.slice(0, 100).trim() + '…' : text.trim();
              items.push({
                html: '<strong>' + escapeHtml(label) + ' ' + ch + ':' + vv.verse + '</strong><br>' + escapeHtml(snip),
                action: (function (bid, c, v) {
                  return function () { goTo(bid, c, v); };
                })(id, ch, vv.verse)
              });
              if (items.length >= 60) {
                renderItems(items, 'Showing first 60 matches…');
                return items;
              }
            }
          }
        } catch (e) {}
        if (ch % 5 === 0) {
          renderItems(items,
            'Searching ' + label + '… ' + ch + '/' + maxCh +
            (items.length ? ' — ' + items.length + ' found' : '')
          );
        }
      }
      renderItems(items,
        'Searching… ' + (bi + 1) + '/' + meta.length +
        (items.length ? ' — ' + items.length + ' found' : '')
      );
    }
    return items;
  }

  async function startFullSearch() {
    var input = document.getElementById('mb-search');
    var btn = document.getElementById('mb-search-btn');
    if (!input) return;
    var q = (input.value || '').trim();
    if (!q) return;
    if (searching) {
      abortToken++; // cancel previous
    }
    searching = true;
    var token = ++abortToken;
    if (btn) { btn.disabled = true; btn.textContent = isEn() ? '…' : '\u2026'; }

    var items = [];

    // 1) Reference jump
    var ref = parseRef(q);
    await ensureMetaManifest();
    if (ref) {
      matchBookName(ref.bookQuery).forEach(function (b) {
        items.push({
          html: '<strong>' + escapeHtml(bookLabel(b)) + ' ' + ref.chapter + (ref.verse ? ':' + ref.verse : '') + '</strong>',
          action: function () { goTo(b.id, ref.chapter, ref.verse || 1); }
        });
      });
    }

    // 2) Book name matches
    matchBookName(q).forEach(function (b) {
      items.push({
        html: '<strong>' + escapeHtml(bookLabel(b)) + '</strong> — ' + (isEn() ? 'Open book' : '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u06a9\u062a\u0627\u0628'),
        action: function () { goTo(b.id, 1, 1); }
      });
    });

    // 3) Text in currently open book (fast)
    var nq = normalize(q);
    document.querySelectorAll('.mb-verse').forEach(function (el) {
      if (normalize(el.textContent).indexOf(nq) >= 0) {
        var ch = el.getAttribute('data-chapter');
        var vs = el.getAttribute('data-verse');
        var snip = (el.textContent || '').trim();
        if (snip.length > 100) snip = snip.slice(0, 100) + '…';
        items.push({
          html: '<strong>' + ch + ':' + vs + '</strong> — ' + escapeHtml(snip),
          action: function () {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight');
            setTimeout(function () { el.classList.remove('highlight'); }, 2000);
          }
        });
      }
    });

    renderItems(items, isEn() ? 'Searching whole Bible…' : '\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u06a9\u0644 \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633\u2026');

    // 4) Full Bible text search
    try {
      var more;
      if (isEn()) more = await searchEnglishFull(q, token);
      else more = await searchPersianFull(q, token);
      if (token === abortToken) {
        // merge unique
        var seen = {};
        items.forEach(function (it) { seen[it.html] = 1; });
        more.forEach(function (it) {
          if (!seen[it.html]) { seen[it.html] = 1; items.push(it); }
        });
        renderItems(items.slice(0, 60),
          items.length
            ? (isEn() ? items.length + ' result(s)' : items.length + ' \u0646\u062a\u06cc\u062c\u0647')
            : (isEn() ? 'No results in whole Bible' : '\u062f\u0631 \u06a9\u0644 \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633 \u067e\u06cc\u062f\u0627 \u0646\u0634\u062f')
        );
      }
    } catch (e) {
      console.error(e);
      if (token === abortToken) renderItems(items, isEn() ? 'Search error' : '\u062e\u0637\u0627 \u062f\u0631 \u062c\u0633\u062a\u062c\u0648');
    }

    searching = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = isEn() ? 'Search' : '\u062c\u0633\u062a\u062c\u0648';
    }
  }

  function boot() {
    inject();
    ensureMetaManifest();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
