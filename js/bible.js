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

    code = code.replace("version: 'هزارۀ نو (FANMV)',", "version: (localStorage.getItem('cog_bible_fa_version') === 'opv' ? 'ترجمه قدیم فارسی (OPV)' : 'ترجمه معاصر فارسی (OPCB)'),");
    code = code.replace("version: 'King James Version',", "version: ({kjv:'King James Version',web:'World English Bible',asv:'American Standard Version (1901)',rv1885:'English Revised Version (1885)',ylt:\"Young's Literal Translation (1898)\",webster:\"Webster's Bible (1833)\",bbe:'Bible in Basic English',bsb:'Berean Standard Bible',webbe:'World English Bible (British Edition)',darby:'Darby Translation (1884)',dra:'Douay-Rheims 1899',gnv:'Geneva Bible (1599)'})[localStorage.getItem('cog_bible_en_version') || 'kjv'] || 'King James Version',");
    code = code.replace("const res = await fetch('https://bible-api.com/' + ref + '?translation=kjv');", "const selectedTranslation = localStorage.getItem('cog_bible_en_version') || 'kjv';\n      const freeBibleIds = ['kjv','web','asv','bbe','rv1885','ylt','webster'];\n      const bookSlug = b.en === 'Song of Songs' ? 'song-of-solomon' : b.en.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');\n      const bookOrder = meta.findIndex(x => x.id === id) + 1;\n      const requestUrl = selectedTranslation === 'gnv'\n        ? 'https://bolls.life/get-text/GNV/' + bookOrder + '/' + ch + '/'\n        : freeBibleIds.indexOf(selectedTranslation) >= 0\n          ? 'https://free.bible/bible/' + selectedTranslation + '/' + bookSlug + '/' + ch + '.json'\n          : 'https://bible-api.com/' + ref + '?translation=' + encodeURIComponent(selectedTranslation) + '&single_chapter_book_matching=indifferent';\n      const res = await fetch(requestUrl);");
    code = code.replace("(data.verses || []).forEach(v => { verses[String(v.verse)] = (v.text || '').trim(); });", "const rows = Array.isArray(data) ? data : (data.verses || []);\n      rows.forEach(v => { const n = v.verse != null ? v.verse : v.v; const text = v.text != null ? v.text : v.t; if (n != null) verses[String(n)] = String(text || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').trim(); });");
    code = code.replace("await loadMeta();\n    await loadManifest();", "await loadMeta();\n    if (currentLang === 'en' && localStorage.getItem('cog_bible_en_version') === 'dra') {\n      meta.splice(39, 0,\n        {id:740,fa:'توبیت',en:'Tobit'},\n        {id:750,fa:'یهودیت',en:'Judith'},\n        {id:760,fa:'حکمت سلیمان',en:'Wisdom'},\n        {id:770,fa:'حکمت سیراخ',en:'Sirach'},\n        {id:780,fa:'باروک',en:'Baruch'},\n        {id:790,fa:'مکابیان اوّل',en:'1 Maccabees'},\n        {id:800,fa:'مکابیان دوّم',en:'2 Maccabees'}\n      );\n    }\n    await loadManifest();");
    code = code.replace("670:5,680:3,690:5,700:1,710:1,720:1,730:22", "670:5,680:3,690:5,700:1,710:1,720:1,730:22,740:14,750:16,760:19,770:51,780:6,790:16,800:15");
    code = code.replace("(data.verses || []).forEach(v => { verses[String(v.verse)] = (v.text || '').trim(); });", "(data.verses || []).forEach(v => { const n = v.verse != null ? v.verse : v.v; const text = v.text != null ? v.text : v.t; if (n != null) verses[String(n)] = String(text || '').trim(); });");
    code = code.replace("      } else {\n        const max = CHAPTER_COUNTS[bookId] || 1;\n        await loadEnChapter(bookId, 1);\n        const first = enCache[bookId];\n        if (!first || !first.chapters['1']) {\n          box.innerHTML = '<p class=\"bible-loading\">' + t('errLoad') + '</p>';\n          loadingBook = false;\n          return;\n        }\n        box.innerHTML = buildChapterHtml(1, first.chapters['1']);\n        loadingBook = false;\n        updateRef();\n        if (chapter === 1) requestAnimationFrame(() => scrollToRef(1, verse, false));\n        for (let ch = 2; ch <= max; ch++) {\n          await loadEnChapter(bookId, ch);\n          const chData = enCache[bookId].chapters[String(ch)];\n          if (!chData || document.getElementById('ch-' + ch)) continue;\n          box.insertAdjacentHTML('beforeend', buildChapterHtml(ch, chData));\n        }\n      }", "      } else {\n        const max = CHAPTER_COUNTS[bookId] || 1;\n        const selectedChapter = Math.min(Math.max(Number(chapter) || 1, 1), max);\n        chapter = selectedChapter;\n        await loadEnChapter(bookId, selectedChapter);\n        const data = enCache[bookId];\n        const selected = data && data.chapters[String(selectedChapter)];\n        if (!selected) {\n          box.innerHTML = '<p class=\"bible-loading\">' + t('errLoad') + '</p>';\n          loadingBook = false;\n          return;\n        }\n        box.innerHTML = buildChapterHtml(selectedChapter, selected);\n        loadingBook = false;\n        updateRef();\n        renderVerseGrid();\n        requestAnimationFrame(() => scrollToRef(selectedChapter, verse, false));\n      }");
    code = code.replace("btn.addEventListener('click', () => {\n        chapter = Number(btn.getAttribute('data-ch'));\n        verse = 1;\n        updateRef();\n        saveState();\n        showTab('verses');\n        renderVerseGrid();\n        scrollToRef(chapter, verse, true);\n      });", "btn.addEventListener('click', async () => {\n        chapter = Number(btn.getAttribute('data-ch'));\n        verse = 1;\n        updateRef();\n        saveState();\n        showTab('verses');\n        await renderBook(true);\n        renderVerseGrid();\n      });");

    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "const files = (man[String(id)] || ['b' + id + '.json']).slice();"
    );

    code = code.replace(
      "const data = pack[String(id)] || pack[id];\n        if (!data) return;",
      "let data = pack[String(id)] || pack[id];\n        if (!data && pack.chapters) data = pack;\n        if (!data && pack.id != null && Number(pack.id) === Number(id) && pack.chapters) data = pack;\n        if (!data) return;"
    );
    code = code.replace("const res = await fetch('/data/bible-fa/' + fname);", "const dataDir = localStorage.getItem('cog_bible_fa_version') === 'opv' ? '/data/bible-fa/opv/' : '/data/bible-fa/';\n        const res = await fetch(dataDir + fname);");

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

    code = code.replace(
      "document.getElementById('lang-toggle')?.addEventListener('click', async () => {\n      currentLang = currentLang === 'fa' ? 'en' : 'fa';\n      localStorage.setItem(LANG_KEY, currentLang);\n      applyChrome();\n      await renderBook(true);\n    });",
      "window.__stSetBibleLanguage = async function (lang) {\n      currentLang = lang === 'en' ? 'en' : 'fa';\n      if (currentLang === 'fa' && [740,750,760,770,780,790,800].includes(bookId)) { bookId = 480; chapter = 1; verse = 1; }\n      localStorage.setItem(LANG_KEY, currentLang);\n      applyChrome();\n      await renderBook(true);\n    };"
    );

    (0, eval)(code);

    // lang_fix.js handles the visible toggle in capture phase; mirror its event
    // into the Bible reader's private language state and reload the selected text.
    window.addEventListener('cog-lang-changed', function (event) {
      var language = event && event.detail && event.detail.lang || localStorage.getItem('cog_lang') || 'fa';
      if (typeof window.__stSetBibleLanguage === 'function') {
        window.__stSetBibleLanguage(language);
      }
    });

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
      // The dedicated bible-share.js module owns the Share button.
      // Do not attach a second click handler here: it caused two share flows
      // (the share panel plus the legacy direct-share handler) on one tap.
      setLabels();
    }
    bindShare();
    setTimeout(bindShare, 400);
    setTimeout(setLabels, 400);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(setLabels, 150); });
    window.addEventListener('cog-lang-changed', setLabels);

    var versionWrap = document.getElementById('bible-version-wrap');
    var versionSelect = document.getElementById('bible-version-select');
    var persianVersionWrap = document.getElementById('persian-version-wrap');
    var persianVersionSelect = document.getElementById('persian-version-select');
    function syncVersionControl() {
      var english = isEn();
      if (versionWrap) versionWrap.style.display = english ? 'flex' : 'none';
      if (persianVersionWrap) persianVersionWrap.style.display = english ? 'none' : 'flex';
      var savedEnglishVersion = localStorage.getItem('cog_bible_en_version') || 'kjv';
      if (['kjv','web','asv','rv1885','ylt','webster','bbe','bsb','webbe','darby','dra','gnv'].indexOf(savedEnglishVersion) < 0) savedEnglishVersion = 'kjv';
      if (versionSelect) versionSelect.value = savedEnglishVersion;
      if (persianVersionSelect) persianVersionSelect.value = localStorage.getItem('cog_bible_fa_version') || 'opcb';
      var translationNote = document.getElementById('bible-translation-note');
      if (translationNote) translationNote.textContent = english
        ? "Compare these translations freely. Geneva uses Bolls chapter delivery; Darby and Douay-Rheims use Bible API chapter delivery. The search index remains KJV. See sources and licences for details."
        : 'این فهرست شامل ترجمه‌های کامل فارسی است که متن آن‌ها با مجوز اعلام‌شده قابل میزبانی است. برای آگاهی از منبع و شرایط استفاده، صفحهٔ منابع و مجوزها را ببینید.';
      var nmvLink = document.getElementById('nmv-external-link');
      if (nmvLink) nmvLink.textContent = english
        ? 'New Millennium Version (NMV) — read on the publisher’s website'
        : 'هزارهٔ نو (NMV) — مطالعه در وب‌سایت ناشر';
    }
    syncVersionControl();
    if (versionSelect) versionSelect.addEventListener('change', function () {
      var allowed = ['kjv','web','asv','rv1885','ylt','webster','bbe','bsb','webbe','darby','dra','gnv'];
      var value = allowed.indexOf(versionSelect.value) >= 0 ? versionSelect.value : 'kjv';
      localStorage.setItem('cog_bible_en_version', value);
      location.reload();
    });
    if (persianVersionSelect) persianVersionSelect.addEventListener('change', function () {
      var value = persianVersionSelect.value === 'opv' ? 'opv' : 'opcb';
      localStorage.setItem('cog_bible_fa_version', value);
      location.reload();
    });
    window.addEventListener('cog-lang-changed', syncVersionControl);
    if (lt) lt.addEventListener('click', function () { setTimeout(syncVersionControl, 150); });
  } catch (e) {
    console.error(e);
    var el = document.getElementById('mb-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Please refresh.</p>');
  }
})();
