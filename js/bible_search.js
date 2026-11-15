/* Whole Bible search (all 66 books) — never stop early mid-scan */
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
      '.mb-search-item .mb-ref-line, .mb-search-item strong{display:block;font-weight:800;color:#5b9fd4;margin-bottom:0.2rem}' +
      '.mb-search-item mark.mb-hit,.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.12em;border-radius:3px}' +
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
  function polishResults() {
    injectCss();
    var input = document.getElementById('mb-search');
    var q = input ? (input.value || '').trim() : '';
    if (!q) return;
    var book = currentBookName();
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    box.querySelectorAll('.mb-search-item').forEach(function (btn) {
      if (btn.getAttribute('data-ok') === q) return;
      var strong = btn.querySelector('strong, .mb-ref-line');
      var label = strong ? (strong.textContent || '').trim() : '';
      var body = '';
      if (strong) {
        var n = strong.nextSibling;
        while (n) { body += n.textContent || ''; n = n.nextSibling; }
      }
      if (!body) {
        var parts = btn.innerHTML.split(/<br\s*\/?>/i);
        if (parts.length >= 2) {
          var tmp = document.createElement('div');
          tmp.innerHTML = parts.slice(1).join(' ');
          body = (tmp.textContent || '').trim();
          if (!label) {
            tmp.innerHTML = parts[0];
            label = (tmp.textContent || '').trim();
          }
        }
      }
      body = body.replace(/^[\s\u2014\u2013\-]+/, '').trim();
      var ch = '', vs = '', bookName = '';
      var m = label.match(/^(.+?)\s+(\d+):(\d+)\s*$/);
      if (m) { bookName = m[1].trim(); ch = m[2]; vs = m[3]; }
      else {
        m = label.match(/^(\d+):(\d+)\s*$/);
        if (m) { ch = m[1]; vs = m[2]; }
      }
      if (!/[A-Za-z\u0600-\u06FF]/.test(bookName)) bookName = book;
      if (vs && body.indexOf(vs) === 0) body = body.slice(vs.length).replace(/^[\s:.]+/, '');
      var ref = (bookName ? bookName + ' ' : '') + (ch && vs ? ch + ':' + vs : label);
      ref = ref.replace(/\s+/g, ' ').trim();
      btn.setAttribute('data-ok', q);
      btn.innerHTML = '<strong class="mb-ref-line">' + escapeHtml(ref) + '</strong>' +
        (body ? highlightMatch(body, q) : '');
    });
  }
  function observe() {
    injectCss();
    var box = document.getElementById('mb-search-results');
    if (box && !box._obs) {
      box._obs = true;
      new MutationObserver(function () { setTimeout(polishResults, 30); }).observe(box, { childList: true, subtree: true });
    }
    function run() {
      [200, 700, 1500, 3000, 6000, 10000].forEach(function (ms) {
        setTimeout(polishResults, ms);
      });
    }
    var btn = document.getElementById('mb-search-btn');
    if (btn && !btn._w) { btn._w = true; btn.addEventListener('click', run); }
    var input = document.getElementById('mb-search');
    if (input && !input._w) {
      input._w = true;
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
    }
  }

  var CORE_URLS = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js',
    'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js'
  ];

  function patchSource(src) {
    /* NEVER stop mid-scan because of result count — scan ALL 66 books */
    src = src.replace(/token !== abortToken \|\| items\.length >= \d+/g, 'token !== abortToken');
    src = src.replace(/if \(items\.length >= \d+\) break;/g, '/* scan all books */');
    src = src.replace(/if \(items\.length >= \d+\) return;/g, '/* scan all */');
    src = src.replace(/items\.length >= 50/g, 'false');
    src = src.replace(/items\.length >= 80/g, 'false');
    src = src.replace(/items\.length >= 100/g, 'false');
    src = src.replace(/slice\(0,\s*50\)/g, 'slice(0, 150)');
    src = src.replace(/slice\(0,\s*80\)/g, 'slice(0, 150)');
    src = src.replace(/slice\(0,\s*100\)/g, 'slice(0, 150)');
    /* Genesis to Revelation order */
    src = src.replace(
      /return \(\(na >= 470 \? 0 : 1\) - \(nb >= 470 \? 0 : 1\)\) \|\| \(na - nb\);/g,
      'return Number(a) - Number(b);'
    );
    src = src.replace(
      /var pa = ida >= 470 \? 0 : 1, pb = idb >= 470 \? 0 : 1;\s*return pa - pb \|\| a - b;/g,
      'return a - b;'
    );
    src = src.replace(
      /var pa = ida >= 470 \? 1 : 0, pb = idb >= 470 \? 1 : 0;\s*return pa - pb \|\| a - b;/g,
      'return a - b;'
    );
    src = src.replace(
      "html: '<strong>' + ch + ':' + vs + '</strong> — ' + escapeHtml(snip)",
      "html: '<strong>' + (function(){var t=document.getElementById('mb-ref');var s=t?(t.textContent||'').trim():'';var m=s.match(/^(.+?)\\s+[\\d\\u06f0-\\u06f9]/);return ((m?m[1]:s)||'').trim();})() + ' ' + ch + ':' + vs + '</strong><br>' + escapeHtml(snip)"
    );
    return src;
  }

  function runCore(src) {
    try { (0, eval)(patchSource(src)); }
    catch (e) { console.warn('bible search failed', e); }
    setTimeout(observe, 250);
    setTimeout(observe, 1000);
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
