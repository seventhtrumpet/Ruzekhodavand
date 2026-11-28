/* Keep selected Bible verses below fixed header/search/version bars */
(function () {
  if (window.__stBibleScrollFix) return;
  window.__stBibleScrollFix = true;

  function visibleHeight(node) {
    if (!node) return 0;
    try {
      var cs = window.getComputedStyle(node);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      var r = node.getBoundingClientRect();
      return r.height > 0 ? r.height : 0;
    } catch (e) {
      return 0;
    }
  }

  function lowestBottom(nodes) {
    var bottom = 0;
    nodes.forEach(function (node) {
      if (!node) return;
      try {
        var cs = window.getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        var r = node.getBoundingClientRect();
        if (r.height > 0 && r.bottom > bottom) bottom = r.bottom;
      } catch (e) {}
    });
    return bottom;
  }

  function fixedStackOffset() {
    var header = document.querySelector('.header');
    var navBar = document.querySelector('.mb-bar');
    var searchBar = document.getElementById('mb-search-wrap');
    var engVer = document.getElementById('bible-version-wrap');
    var faVer = document.getElementById('persian-version-wrap');
    var bottom = lowestBottom([header, navBar, searchBar, engVer, faVer]);
    if (bottom > 80) return bottom + 14;
    return (
      visibleHeight(header) +
      visibleHeight(navBar) +
      visibleHeight(searchBar) +
      Math.max(visibleHeight(engVer), visibleHeight(faVer)) +
      16
    );
  }

  function updateSpacerAndPadding() {
    var offset = fixedStackOffset();
    try {
      document.documentElement.style.scrollPaddingTop = offset + 'px';
      document.documentElement.style.setProperty('--st-bible-offset', offset + 'px');
    } catch (e) {}
    var spacer = document.getElementById('bible-version-spacer');
    if (spacer) {
      spacer.style.display = 'block';
      spacer.style.height = offset + 'px';
      spacer.style.minHeight = offset + 'px';
      spacer.style.flex = '0 0 auto';
    }
    return offset;
  }

  function scrollVerseIntoView(ch, vs, smooth) {
    var el =
      document.getElementById('v-' + ch + '-' + vs) ||
      document.getElementById('ch-' + ch);
    if (!el) return false;
    var offset = updateSpacerAndPadding();
    var targetTop = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({ top: targetTop, behavior: smooth ? 'smooth' : 'auto' });
    try {
      document.querySelectorAll('.mb-verse.highlight').forEach(function (n) {
        n.classList.remove('highlight');
      });
      el.classList.add('highlight');
      setTimeout(function () {
        try { el.classList.remove('highlight'); } catch (e) {}
      }, 1800);
    } catch (e2) {}
    return true;
  }

  // Override the reader core function once it exists
  function installOverride() {
    try {
      if (typeof window.scrollToRef === 'function') {
        window.scrollToRef = function (ch, vs, smooth) {
          scrollVerseIntoView(ch, vs, !!smooth);
        };
      }
    } catch (e) {}
    // Also patch local scope function if exposed differently
    try {
      if (typeof scrollToRef === 'function') {
        // eslint-disable-next-line no-global-assign
        scrollToRef = function (ch, vs, smooth) {
          scrollVerseIntoView(ch, vs, !!smooth);
        };
      }
    } catch (e2) {}
  }

  function afterSelectionScroll() {
    // After book/chapter/verse picker closes, ensure current verse is visible
    setTimeout(function () {
      updateSpacerAndPadding();
      try {
        var st = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
        if (st && st.chapter) scrollVerseIntoView(st.chapter, st.verse || 1, true);
      } catch (e) {}
    }, 120);
    setTimeout(function () {
      updateSpacerAndPadding();
      try {
        var st2 = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
        if (st2 && st2.chapter) scrollVerseIntoView(st2.chapter, st2.verse || 1, false);
      } catch (e) {}
    }, 450);
  }

  function bindPicker() {
    var sel = document.getElementById('mb-sel');
    if (!sel || sel.__stScrollBound) return;
    sel.__stScrollBound = true;
    // When picker hides, re-scroll
    var obs = new MutationObserver(function () {
      if (sel.classList.contains('hidden') || sel.getAttribute('aria-hidden') === 'true') {
        afterSelectionScroll();
      }
    });
    obs.observe(sel, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    document.getElementById('mb-close')?.addEventListener('click', afterSelectionScroll);
    document.getElementById('mb-verses')?.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('[data-vs]')) afterSelectionScroll();
    });
    document.getElementById('mb-chapters')?.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('[data-ch]')) afterSelectionScroll();
    });
  }

  function boot() {
    updateSpacerAndPadding();
    installOverride();
    bindPicker();
    // Keep installing until reader core has defined scrollToRef
    var tries = 0;
    var t = setInterval(function () {
      tries += 1;
      installOverride();
      updateSpacerAndPadding();
      if (tries > 40) clearInterval(t);
    }, 250);
    window.addEventListener('resize', function () {
      updateSpacerAndPadding();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
