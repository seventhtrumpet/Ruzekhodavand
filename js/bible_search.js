/* Full Bible search: OT+NT, gold highlight, always show book name */
(function () {
  if (window.__mbSearchBooted) return;
  window.__mbSearchBooted = true;

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
      '.mb-search-item mark.mb-hit,.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.15em;border-radius:3px}' +
      'body.dark .mb-hit{background:#c9a227;color:#1a1200}';
    document.head.appendChild(st);
  }
  function patchResults() {
    injectCss();
    var input = document.getElementById('mb-search');
    var q = input ? (input.value || '').trim() : '';
    if (!q) return;
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    box.querySelectorAll('.mb-search-item').forEach(function (btn) {
      if (btn.getAttribute('data-hi') === q) return;
      btn.setAttribute('data-hi', q);
      var html = btn.innerHTML;
      var parts = html.split(/<br\s*\/?>/i);
      if (parts.length >= 2) {
        var head = parts[0];
        var tmp = document.createElement('div');
        tmp.innerHTML = parts.slice(1).join('<br>');
        btn.innerHTML = head + '<br>' + highlightMatch(tmp.textContent || '', q);
        return;
      }
      var strong = btn.querySelector('strong');
      if (strong) {
        var rest = '';
        var node = strong.nextSibling;
        while (node) {
          rest += node.textContent || '';
          node = node.nextSibling;
        }
        rest = rest.trim();
        if (rest) {
          while (strong.nextSibling) strong.parentNode.removeChild(strong.nextSibling);
          strong.insertAdjacentHTML('afterend', ' — ' + highlightMatch(rest, q));
        }
      }
    });
  }
  function observe() {
    injectCss();
    var box = document.getElementById('mb-search-results');
    if (box && !box._hiObs) {
      box._hiObs = true;
      new MutationObserver(function () { setTimeout(patchResults, 20); }).observe(box, { childList: true, subtree: true });
    }
    var btn = document.getElementById('mb-search-btn');
    if (btn && !btn._hiBound) {
      btn._hiBound = true;
      btn.addEventListener('click', function () {
        setTimeout(patchResults, 300);
        setTimeout(patchResults, 1000);
        setTimeout(patchResults, 2500);
        setTimeout(patchResults, 5000);
      });
    }
    var input = document.getElementById('mb-search');
    if (input && !input._hiBound) {
      input._hiBound = true;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          setTimeout(patchResults, 300);
          setTimeout(patchResults, 1200);
          setTimeout(patchResults, 3000);
        }
      });
    }
  }

  var CORE_URLS = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js',
    'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js'
  ];

  function patchSource(src) {
    // Whole Bible: Old Testament first, then New Testament
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

    // Always include current book name for on-page hits that only showed chapter:verse
    src = src.replace(
      "html: '<strong>' + ch + ':' + vs + '</strong> — ' + escapeHtml(snip)",
      "html: '<strong>' + ((document.querySelector('.mb-book-title,.mb-title,#mb-book-name')||{}).textContent||'').trim() + ' ' + ch + ':' + vs + '</strong> — ' + escapeHtml(snip)"
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
    setTimeout(observe, 1500);
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
