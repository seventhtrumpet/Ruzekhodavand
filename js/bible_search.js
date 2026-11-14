/* Bible search loader + gold word highlight (restores engine from last good commit) */
(function () {
  var DONE = false;
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
      '.mb-search-item mark.mb-hit,.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.12em;border-radius:3px}' +
      'body.dark .mb-hit{background:#c9a227;color:#1a1200}' +
      '#mb-reader mark.mb-hit,.mb-verse mark.mb-hit{background:#ffd54f;color:#6b1a1a;font-weight:700;padding:0 0.12em;border-radius:3px}';
    document.head.appendChild(st);
  }
  function patchResults() {
    injectCss();
    var input = document.getElementById('mb-search');
    var q = input ? (input.value || '').trim() : '';
    if (!q) {
      try { q = sessionStorage.getItem('cog_bible_search_q') || ''; } catch (e) {}
    }
    if (!q) return;
    try { sessionStorage.setItem('cog_bible_search_q', q); } catch (e2) {}
    var box = document.getElementById('mb-search-results');
    if (!box) return;
    box.querySelectorAll('.mb-search-item').forEach(function (btn) {
      if (btn.getAttribute('data-hi')) return;
      btn.setAttribute('data-hi', '1');
      var html = btn.innerHTML;
      var parts = html.split(/<br\s*\/?>/i);
      if (parts.length < 2) return;
      var rest = parts.slice(1).join('<br>');
      var tmp = document.createElement('div');
      tmp.innerHTML = rest;
      var text = tmp.textContent || '';
      btn.innerHTML = parts[0] + '<br>' + highlightMatch(text, q);
    });
  }
  function observe() {
    injectCss();
    var box = document.getElementById('mb-search-results');
    if (box && !box._hiObs) {
      box._hiObs = true;
      var mo = new MutationObserver(function () { setTimeout(patchResults, 30); });
      mo.observe(box, { childList: true, subtree: true });
    }
    var input = document.getElementById('mb-search');
    if (input && !input._hiBound) {
      input._hiBound = true;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') setTimeout(patchResults, 400);
      });
    }
    var btn = document.getElementById('mb-search-btn');
    if (btn && !btn._hiBound) {
      btn._hiBound = true;
      btn.addEventListener('click', function () {
        setTimeout(patchResults, 400);
        setTimeout(patchResults, 1200);
        setTimeout(patchResults, 2500);
      });
    }
    setTimeout(patchResults, 500);
    setTimeout(patchResults, 1500);
    setTimeout(patchResults, 3000);
  }
  function loadCore() {
    if (DONE) return;
    DONE = true;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js';
    s.onload = function () { setTimeout(observe, 200); setTimeout(observe, 800); };
    s.onerror = function () {
      var s2 = document.createElement('script');
      s2.src = 'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/8e538f58cd8b719584c4caef3bba3608d3920b29/js/bible_search.js';
      s2.onload = function () { setTimeout(observe, 200); };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadCore);
  else loadCore();
})();
