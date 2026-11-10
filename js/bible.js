/* Seventh Trumpet Bible — load core + safe fixes + flat JSON support */
(async function () {
  try {
    var urls = [
      'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@5b705c41b170e9bf44d18bc046ce2ddfe7547f5d/js/bible.js',
      'https://raw.githubusercontent.com/seventhtrumpet/Ruzekhodavand/5b705c41b170e9bf44d18bc046ce2ddfe7547f5d/js/bible.js'
    ];
    var code = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i] + (urls[i].indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now());
        if (r.ok) { code = await r.text(); break; }
      } catch (e) {}
    }
    if (!code) throw new Error('Could not load bible core');

    code = code.replace(/mb-sel-actions/g, 'mb-actions');
    code = code.replace(/mb-book-btn/g, 'mb-cell');
    code = code.replace(/mb-num-btn/g, 'mb-cell');

    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );

    code = code.replace(
      "const data = pack[String(id)] || pack[id];\n        if (!data) return;",
      "let data = pack[String(id)] || pack[id];\n        if (!data && pack.chapters) data = pack;\n        if (!data && pack.id != null && Number(pack.id) === Number(id) && pack.chapters) data = pack;\n        if (!data) return;"
    );

    code = code.replace(
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        closeSel();\n        await renderBook(true);",
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        updateRef(); saveState();\n        showTab('chapters');\n        renderChapterGrid();"
    );

    code = code.replace(
      "showTab('verses');\n        renderVerseGrid();\n        scrollToRef(chapter, verse, true);",
      "showTab('verses');\n        renderVerseGrid();"
    );

    code = code.replace(
      "verse = Number(btn.getAttribute('data-vs'));\n        updateRef();\n        saveState();\n        closeSel();\n        scrollToRef(chapter, verse, true);",
      "verse = Number(btn.getAttribute('data-vs'));\n        updateRef();\n        saveState();\n        closeSel();\n        Promise.resolve(renderBook(true)).then(function(){ scrollToRef(chapter, verse, true); });"
    );

    code = code.replace(
      "document.getElementById('mb-close')?.addEventListener('click', closeSel);",
      "document.getElementById('mb-close')?.addEventListener('click', function(){ closeSel(); Promise.resolve(renderBook(true)).then(function(){ scrollToRef(chapter, verse, true); }); });"
    );

    (0, eval)(code);

    function isEn() {
      try { return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en'; }
      catch (e) { return false; }
    }
    function setLabels() {
      var en = isEn();
      var pairs = {
        'mb-share': en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9',
        'mb-copy': en ? 'Copy' : '\u06a9\u067e\u06cc',
        'mb-clear': en ? 'Clear' : '\u067e\u0627\u06a9',
        'mb-close': en ? 'Read' : '\u062e\u0648\u0627\u0646\u062f\u0646'
      };
      Object.keys(pairs).forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = pairs[id];
      });
    }
    function shareSelectedVerses() {
      var nodes = document.querySelectorAll('.mb-verse.selected');
      if (!nodes.length) {
        alert(isEn() ? 'Tap verses first, then Share' : '\u0627\u0628\u062a\u062f\u0627 \u0622\u06cc\u0647\u200c\u0647\u0627 \u0631\u0627 \u0644\u0645\u0633 \u06a9\u0646\u06cc\u062f');
        return;
      }
      var lines = [], firstCh = null, firstV = null, lastV = null;
      nodes.forEach(function (el) {
        var ch = el.getAttribute('data-chapter');
        var vs = el.getAttribute('data-verse');
        if (firstCh == null) { firstCh = ch; firstV = vs; }
        lastV = vs;
        lines.push(ch + ':' + vs + ' — ' + (el.textContent || '').replace(/^\\d+\\s*/, '').trim());
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
      setLabels();
    }
    bindShare();
    setTimeout(bindShare, 400);
    setTimeout(setLabels, 400);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(setLabels, 150); });
    window.addEventListener('cog-lang-changed', setLabels);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('mb-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Please refresh.</p>');
  }
})();
