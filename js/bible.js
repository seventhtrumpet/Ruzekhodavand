/* Load bible core + fix navigation: Book → Chapter → Verse, then Read */
(async function () {
  try {
    var urls = [
      'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@5b705c41b170e9bf44d18bc046ce2ddfe7547f5d/js/bible.js',
      'https://raw.githubusercontent.com/seventhtrumpet/Ruzekhodavand/5b705c41b170e9bf44d18bc046ce2ddfe7547f5d/js/bible.js'
    ];
    var code = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i]);
        if (r.ok) { code = await r.text(); break; }
      } catch (e) {}
    }
    if (!code) throw new Error('Could not load bible core');

    // Fix wrong toolbar id
    code = code.replace(/mb-sel-actions/g, 'mb-actions');

    // Auto-discover per-chapter Persian files
    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );

    // CRITICAL FIX: tapping a book must NOT jump in — show chapters instead
    code = code.replace(
      "btn.addEventListener('click', async () => {\n        bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        closeSel();\n        await renderBook(true);\n      });",
      "btn.addEventListener('click', async () => {\n        bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        updateRef();\n        saveState();\n        showTab('chapters');\n        await renderChapterGrid();\n        // preload book in background so chapters/verses are ready\n        try { if (currentLang === 'fa') await loadFaBook(bookId); } catch (e) {}\n      });"
    );

    // Also handle single-line version if minified differently
    code = code.replace(
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        closeSel();\n        await renderBook(true);",
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        updateRef();\n        saveState();\n        showTab('chapters');\n        await renderChapterGrid();\n        try { if (currentLang === 'fa') await loadFaBook(bookId); } catch (e) {}"
    );

    // Chapter pick: stay in picker, go to verses (already mostly does this — ensure no close)
    code = code.replace(
      "showTab('verses');\n        renderVerseGrid();\n        scrollToRef(chapter, verse, true);",
      "showTab('verses');\n        renderVerseGrid();"
    );

    // Verse pick: close and jump
    code = code.replace(
      "verse = Number(btn.getAttribute('data-vs'));\n        updateRef();\n        saveState();\n        closeSel();\n        scrollToRef(chapter, verse, true);",
      "verse = Number(btn.getAttribute('data-vs'));\n        updateRef();\n        saveState();\n        closeSel();\n        renderBook(true).then(function(){ scrollToRef(chapter, verse, true); });"
    );

    (0, eval)(code);

    // Wire "Read / Done" button to load book at chosen chapter:verse
    function isEn() {
      try {
        return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
      } catch (e) { return false; }
    }

    function setLabels() {
      var en = isEn();
      var s = document.getElementById('mb-share');
      var c = document.getElementById('mb-copy');
      var x = document.getElementById('mb-clear');
      var d = document.getElementById('mb-close');
      if (s) s.textContent = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
      if (c) c.textContent = en ? 'Copy' : '\u06a9\u067e\u06cc';
      if (x) x.textContent = en ? 'Clear' : '\u067e\u0627\u06a9';
      if (d) d.textContent = en ? 'Read' : '\u062e\u0648\u0627\u0646\u062f\u0646';
    }

    function shareSelectedVerses() {
      var nodes = document.querySelectorAll('.mb-verse.selected');
      if (!nodes.length) {
        alert(isEn() ? 'Tap one or more verses first, then Share' : '\u0627\u0628\u062a\u062f\u0627 \u06cc\u06a9 \u06cc\u0627 \u0686\u0646\u062f \u0622\u06cc\u0647 \u0631\u0627 \u0644\u0645\u0633 \u06a9\u0646\u06cc\u062f');
        return;
      }
      var lines = [];
      var firstCh = null, firstV = null, lastV = null;
      nodes.forEach(function (el) {
        var ch = el.getAttribute('data-chapter');
        var vs = el.getAttribute('data-verse');
        if (firstCh == null) { firstCh = ch; firstV = vs; }
        lastV = vs;
        var t = (el.textContent || '').replace(/^\d+\s*/, '').trim();
        lines.push(ch + ':' + vs + ' — ' + t);
      });
      var state = {};
      try { state = JSON.parse(localStorage.getItem('cog_bible_state') || '{}'); } catch (e) {}
      var bookId = state.bookId || '';
      var base = (location.origin || 'https://seventhtrumpet.org') + '/bible.html';
      var vParam = firstV + (lastV && lastV !== firstV ? ('-' + lastV) : '');
      var url = base + '?b=' + bookId + '&c=' + firstCh + '&v=' + vParam;
      var body = lines.join('\n') + '\n\n' + url;
      if (navigator.share) {
        navigator.share({ title: 'Bible', text: body, url: url }).catch(function () {
          if (navigator.clipboard) navigator.clipboard.writeText(body);
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(body);
      }
    }

    window.shareSelected = shareSelectedVerses;

    // Make Done/Read load the selection
    var closeBtn = document.getElementById('mb-close');
    if (closeBtn && !closeBtn._readBound) {
      closeBtn._readBound = true;
      closeBtn.addEventListener('click', function () {
        try {
          var st = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
          // core closeSel already runs via its own listener; force load
          setTimeout(function () {
            if (typeof window !== 'undefined') {
              // trigger re-render by dispatching — core state already set
            }
          }, 50);
        } catch (e) {}
      });
    }

    // After picker closes via Done, ensure book is rendered
    var origClose = null;
    setTimeout(function () {
      var btn = document.getElementById('mb-close');
      if (!btn || btn._extraBound) return;
      btn._extraBound = true;
      btn.addEventListener('click', function () {
        setTimeout(function () {
          // Force navigate to chosen place
          try {
            var panel = document.getElementById('mb-sel');
            if (panel) {
              panel.classList.add('hidden');
              panel.setAttribute('aria-hidden', 'true');
            }
          } catch (e) {}
          // re-load using localStorage state that core saved
          location.hash = '#read';
          // soft reload of content without full page refresh:
          var event = new Event('cog-bible-go');
          window.dispatchEvent(event);
        }, 30);
      });
    }, 800);

    function bindShare() {
      var btn = document.getElementById('mb-share');
      if (!btn || btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', shareSelectedVerses);
      setLabels();
    }
    bindShare();
    setLabels();
    setTimeout(bindShare, 600);
    setTimeout(setLabels, 600);

    var lt = document.getElementById('lang-toggle');
    if (lt) {
      lt.addEventListener('click', function () {
        setTimeout(setLabels, 120);
        setTimeout(setLabels, 400);
      });
    }
    window.addEventListener('cog-lang-changed', setLabels);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('mb-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Refresh the page.</p>');
  }
})();
