/* Bible core loader: Book → Chapter → Verse → Read */
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

    code = code.replace(/mb-sel-actions/g, 'mb-actions');

    // Style classes used by CSS
    code = code.replace(/mb-book-btn/g, 'mb-cell');
    code = code.replace(/mb-num-btn/g, 'mb-cell');

    // Discover chapter files
    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );

    // Book click: go to chapter list (do NOT open book yet)
    code = code.replace(
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        closeSel();\n        await renderBook(true);",
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        updateRef(); saveState();\n        showTab('chapters');\n        await renderChapterGrid();\n        try { if (currentLang === 'fa') await loadFaBook(bookId); } catch(__e){}"
    );

    // Chapter click: go to verse list only (no scroll while picker open)
    code = code.replace(
      "showTab('verses');\n        renderVerseGrid();\n        scrollToRef(chapter, verse, true);",
      "showTab('verses');\n        renderVerseGrid();"
    );

    // Verse click: close + load book + jump
    code = code.replace(
      "verse = Number(btn.getAttribute('data-vs'));\n        updateRef();\n        saveState();\n        closeSel();\n        scrollToRef(chapter, verse, true);",
      "verse = Number(btn.getAttribute('data-vs'));\n        updateRef(); saveState();\n        closeSel();\n        await renderBook(true);\n        scrollToRef(chapter, verse, true);"
    );

    // Done/Read button: close + load at current book/chapter/verse
    code = code.replace(
      "document.getElementById('mb-close')?.addEventListener('click', closeSel);",
      "document.getElementById('mb-close')?.addEventListener('click', async () => { closeSel(); await renderBook(true); scrollToRef(chapter, verse, true); });"
    );

    (0, eval)(code);

    function isEn() {
      try { return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en'; }
      catch (e) { return false; }
    }
    function setLabels() {
      var en = isEn();
      var map = {
        'mb-share': en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9',
        'mb-copy': en ? 'Copy' : '\u06a9\u067e\u06cc',
        'mb-clear': en ? 'Clear' : '\u067e\u0627\u06a9',
        'mb-close': en ? 'Read' : '\u062e\u0648\u0627\u0646\u062f\u0646'
      };
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = map[id];
      });
    }
    function shareSelectedVerses() {
      var nodes = document.querySelectorAll('.mb-verse.selected');
      if (!nodes.length) {
        alert(isEn()
          ? 'Tap verses to select them, then press Share'
          : '\u0622\u06cc\u0647\u200c\u0647\u0627 \u0631\u0627 \u0644\u0645\u0633 \u06a9\u0646\u06cc\u062f\u060c \u0628\u0639\u062f \u0627\u0634\u062a\u0631\u0627\u06a9');
        return;
      }
      var lines = [], firstCh = null, firstV = null, lastV = null;
      nodes.forEach(function (el) {
        var ch = el.getAttribute('data-chapter');
        var vs = el.getAttribute('data-verse');
        if (firstCh == null) { firstCh = ch; firstV = vs; }
        lastV = vs;
        lines.push(ch + ':' + vs + ' — ' + (el.textContent || '').replace(/^\d+\s*/, '').trim());
      });
      var state = {};
      try { state = JSON.parse(localStorage.getItem('cog_bible_state') || '{}'); } catch (e) {}
      var url = (location.origin || 'https://seventhtrumpet.org') + '/bible.html?b=' + (state.bookId || '') + '&c=' + firstCh + '&v=' + firstV + (lastV !== firstV ? '-' + lastV : '');
      var body = lines.join('\n') + '\n\n' + url;
      if (navigator.share) navigator.share({ title: 'Bible', text: body, url: url }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(body);
    }
    window.shareSelected = shareSelectedVerses;

    function bindShare() {
      var btn = document.getElementById('mb-share');
      if (!btn || btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', shareSelectedVerses);
    }
    bindShare();
    setLabels();
    setTimeout(function () { bindShare(); setLabels(); }, 500);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(setLabels, 150); });
    window.addEventListener('cog-lang-changed', setLabels);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('mb-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Refresh.</p>');
  }
})();
