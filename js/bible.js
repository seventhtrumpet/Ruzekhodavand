/* Load known-good bible.js core + fixes for actions bar and multi-verse share */
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

    // Fix wrong toolbar id in old core
    code = code.replace(/mb-sel-actions/g, 'mb-actions');

    // Auto-discover per-chapter Persian files
    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );

    (0, eval)(code);

    // Multi-verse share (after core is live)
    function isEn() {
      try {
        return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
      } catch (e) {
        return false;
      }
    }

    function setLabels() {
      var en = isEn();
      var s = document.getElementById('mb-share');
      var c = document.getElementById('mb-copy');
      var x = document.getElementById('mb-clear');
      if (s) s.textContent = en ? 'Share' : '\u0627\u0634\u062a\u0631\u0627\u06a9';
      if (c) c.textContent = en ? 'Copy' : '\u06a9\u067e\u06cc';
      if (x) x.textContent = en ? 'Clear' : '\u067e\u0627\u06a9';
    }

    function shareSelectedVerses() {
      var nodes = document.querySelectorAll('.mb-verse.selected');
      if (!nodes.length) {
        alert(isEn() ? 'Select one or more verses first' : '\u0627\u0628\u062a\u062f\u0627 \u06cc\u06a9 \u06cc\u0627 \u0686\u0646\u062f \u0622\u06cc\u0647 \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f');
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
        lines.push(ch + ':' + vs + ' \u2014 ' + t);
      });
      var state = {};
      try { state = JSON.parse(localStorage.getItem('cog_bible_state') || '{}'); } catch (e) {}
      var bookId = state.bookId || '';
      var base = (location.origin || 'https://seventhtrumpet.org') + '/bible.html';
      var vParam = firstV + (lastV && lastV !== firstV ? ('-' + lastV) : '');
      var url = base + '?b=' + bookId + '&c=' + firstCh + '&v=' + vParam;
      var body = lines.join('\n') + '\n\n' + url;
      function ok() {
        var l = document.getElementById('mb-sel-label');
        if (l) l.textContent = isEn() ? 'Link ready' : '\u0644\u06cc\u0646\u06a9 \u0622\u0645\u0627\u062f\u0647 \u0634\u062f';
      }
      if (navigator.share) {
        navigator.share({ title: 'Bible', text: body, url: url }).then(ok).catch(function () {
          if (navigator.clipboard) navigator.clipboard.writeText(body).then(ok);
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(body).then(ok);
      } else {
        var ta = document.createElement('textarea');
        ta.value = body;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove();
        ok();
      }
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
    setLabels();
    setTimeout(bindShare, 500);
    setTimeout(setLabels, 500);

    var lt = document.getElementById('lang-toggle');
    if (lt) {
      lt.addEventListener('click', function () {
        setTimeout(setLabels, 100);
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
