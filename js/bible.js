/* Load known-good bible.js from commit 5b705c4, then enhance chapter discovery */
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
    // Inject single-chapter auto-discovery into loadFaBook
    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );
    (0, eval)(code);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('bible-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Refresh the page.</p>');
  }
})();
