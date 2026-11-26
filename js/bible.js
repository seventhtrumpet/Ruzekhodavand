/* Seventh Trumpet Bible — load core + safe fixes + flat JSON support */
(function () {
  var slugById = {"10":"genesis","20":"exodus","30":"leviticus","40":"numbers","50":"deuteronomy","60":"josue","70":"judges","80":"ruth","90":"1-kings","100":"2-kings","110":"3-kings","120":"4-kings","130":"1-paralipomenon","140":"2-paralipomenon","150":"1-esdras","160":"2-esdras","190":"esther","220":"job","230":"psalms","240":"proverbs","250":"ecclesiastes","260":"canticle-of-canticles","290":"isaie","300":"jeremie","310":"lamentations","330":"ezechiel","340":"daniel","350":"osee","360":"joel","370":"amos","380":"abdias","390":"jonas","400":"micheas","410":"nahum","420":"habacuc","430":"sophonias","440":"aggeus","450":"zacharias","460":"malachie","470":"matthew","480":"mark","490":"luke","500":"john","510":"acts","520":"romans","530":"1-corinthians","540":"2-corinthians","550":"galatians","560":"ephesians","570":"philippians","580":"colossians","590":"1-thessalonians","600":"2-thessalonians","610":"1-timothy","620":"2-timothy","630":"titus","640":"philemon","650":"hebrews","660":"james","670":"1-peter","680":"2-peter","690":"1-john","700":"2-john","710":"3-john","720":"jude","730":"apocalypse","740":"tobias","750":"judith","760":"wisdom","770":"ecclesiasticus","780":"baruch","790":"1-machabees","800":"2-machabees"};
  var idBySlug = {};
  Object.keys(slugById).forEach(function (id) { idBySlug[slugById[id]] = Number(id); });
  window.__stBibleSlugByCanonicalId = slugById;
  window.__stBibleCanonicalIdBySlug = idBySlug;
  try { window.history.scrollRestoration = 'manual'; } catch (e0) {}
  try {
    var route = new URLSearchParams(window.location.search);
    var lang = route.get('lang');
    var version = route.get('version');
    var englishVersions = ['kjv','web','asv','rv1885','ylt','webster','bbe','bsb','msb','webbe','darby','dra','gnv','odr','odr-original'];
    var persianVersions = ['opv','opcb'];
    var routeLanguage = (lang === 'fa' || lang === 'en') ? lang
      : englishVersions.indexOf(version) >= 0 ? 'en'
      : persianVersions.indexOf(version) >= 0 ? 'fa' : null;
    if (routeLanguage) window.__stBibleRoute = { lang: routeLanguage, version: version || null };
    if (englishVersions.indexOf(version) >= 0 && (!lang || lang === 'en')) {
      localStorage.setItem('cog_lang', 'en');
      localStorage.setItem('cog_bible_en_version', version);
    } else if (persianVersions.indexOf(version) >= 0 && (!lang || lang === 'fa')) {
      localStorage.setItem('cog_lang', 'fa');
      localStorage.setItem('cog_bible_fa_version', version);
    } else if (lang === 'en' || lang === 'fa') {
      localStorage.setItem('cog_lang', lang);
    }
    var slug = route.get('slug');
    if (slug) localStorage.setItem('cog_bible_book_slug', slug);
    else if (route.has('b') || route.has('book')) localStorage.removeItem('cog_bible_book_slug');
    var bookId = Number(route.get('b') || route.get('book'));
    var chapter = Number(route.get('c') || route.get('chapter'));
    var verseText = route.get('v') || route.get('verse') || '1';
    var verseMatch = String(verseText).match(/^(\d+)/);
    var verse = verseMatch ? Number(verseMatch[1]) : 1;
    if (Number.isSafeInteger(bookId) && bookId > 0 && Number.isSafeInteger(chapter) && chapter > 0) {
      var sharedRoute = {
        bookId: bookId,
        chapter: chapter,
        verse: Number.isSafeInteger(verse) && verse > 0 ? verse : 1
      };
      localStorage.setItem('cog_bible_state', JSON.stringify(sharedRoute));
      // Preserve the exact incoming verse before the reader core normalizes its
      // navigation state; share links must keep the verse the visitor opened.
      localStorage.setItem('cog_bible_share_route', JSON.stringify(sharedRoute));
    }
    if (route.has('lang') || route.has('version') || route.has('slug') || route.has('b') || route.has('book')) {
      window.history.replaceState(window.history.state, document.title, window.location.pathname + window.location.hash);
    }
  } catch (e) {}
})();
(async function () {
  try {
    // Load the reviewed, pinned reader core from this site (no CDN/GitHub runtime dependency).
    var urls = ['/js/bible-core-pinned.js'];
    var code = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i] + (urls[i].indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now());
        if (r.ok) { code = await r.text(); break; }
      } catch (e) {}
    }
    if (!code) throw new Error('Could not load bible core');

    // Replace the pinned core's chapter loader as one complete unit. The pinned
    // core's historical requestUrl reference is undefined; patching a smaller
    // fragment is fragile and can silently leave every English chapter blank.
    code = code.replace(/  async function loadEnChapter\(id, ch\) \{[\s\S]*?\n  \}\n\n  function escapeHtml/, `  const localEnglishBookCache = {};\n  async function loadEnChapter(id, ch) {
    const b = meta.find(x => x.id === id);
    if (!b) return null;
    if (!enCache[id]) enCache[id] = { id, name: b.en, chapters: {} };
    if (enCache[id].chapters[String(ch)]) return enCache[id];
    try {
      const selectedTranslation = localStorage.getItem('cog_bible_en_version') || 'kjv';
      const localEnglishIds = ['web','asv','ylt','webster','darby','gnv','bsb','dra','webbe','rv1885','msb'];
      const isOdr = selectedTranslation === 'odr' || selectedTranslation === 'odr-original';
      const isLocalEnglish = localEnglishIds.indexOf(selectedTranslation) >= 0;
      const isFreeBible = selectedTranslation === 'kjv' || selectedTranslation === 'bbe';
      const bookSlug = b.en === 'Song of Songs' ? 'song-of-solomon' : b.en.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const odrSlugById = {10:'genesis',20:'exodus',30:'leviticus',40:'numbers',50:'deuteronomy',60:'josue',70:'judges',80:'ruth',90:'1-kings',100:'2-kings',110:'3-kings',120:'4-kings',130:'1-paralipomenon',140:'2-paralipomenon',150:'1-esdras',160:'2-esdras',190:'esther',220:'job',230:'psalms',240:'proverbs',250:'ecclesiastes',260:'canticle-of-canticles',290:'isaie',300:'jeremie',310:'lamentations',330:'ezechiel',340:'daniel',350:'osee',360:'joel',370:'amos',380:'abdias',390:'jonas',400:'micheas',410:'nahum',420:'habacuc',430:'sophonias',440:'aggeus',450:'zacharias',460:'malachie',470:'matthew',480:'mark',490:'luke',500:'john',510:'acts',520:'romans',530:'1-corinthians',540:'2-corinthians',550:'galatians',560:'ephesians',570:'philippians',580:'colossians',590:'1-thessalonians',600:'2-thessalonians',610:'1-timothy',620:'2-timothy',630:'titus',640:'philemon',650:'hebrews',660:'james',670:'1-peter',680:'2-peter',690:'1-john',700:'2-john',710:'3-john',720:'jude',730:'apocalypse',740:'tobias',750:'judith',760:'wisdom',770:'ecclesiasticus',780:'baruch',790:'1-machabees',800:'2-machabees'};
      const odrPath = selectedTranslation === 'odr-original' ? 'original-spelling/bible/raw/' : 'bible/raw/';
      const odrBookSlug = b.slug || odrSlugById[id];
      const requestUrl = isOdr
        ? '/data/bible-en/odr/' + odrPath + odrBookSlug + '.json'
        : isLocalEnglish
          ? '/data/bible-en/local/' + selectedTranslation + '/b' + id + '.json'
          : isFreeBible
            ? 'https://free.bible/bible/' + selectedTranslation + '/' + bookSlug + '/' + ch + '.json'
            : '';
      if (!requestUrl) throw new Error('Unsupported Bible edition: ' + selectedTranslation);
      const cacheKey = selectedTranslation + ':' + id;
      let data;
      if ((isOdr || isLocalEnglish) && localEnglishBookCache[cacheKey]) {
        data = localEnglishBookCache[cacheKey];
      } else {
        const res = await fetch(requestUrl);
        if (!res.ok) throw new Error('Chapter request failed: ' + res.status);
        data = await res.json();
        if (isOdr || isLocalEnglish) localEnglishBookCache[cacheKey] = data;
      }
      let rows = [];
      if (isOdr) {
        const entry = (data.chapters || []).find(item => Number(item.chapter) === Number(ch));
        rows = (entry && entry.verses) || [];
      } else if (isLocalEnglish) {
        const localBook = data[String(id)] || data[id] || data;
        const localChapter = localBook && localBook.chapters && localBook.chapters[String(ch)];
        rows = Object.keys(localChapter || {}).map(n => ({ verse: n, text: localChapter[n] }));
      } else {
        rows = Array.isArray(data) ? data : (data.verses || []);
      }
      const verses = {};
      rows.forEach(v => {
        const n = v.verse != null ? v.verse : v.v;
        const text = v.text != null ? v.text : v.t;
        if (n != null && Number(n) > 0) verses[String(n)] = String(text || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').trim();
      });
      if (Object.keys(verses).length) enCache[id].chapters[String(ch)] = verses;
    } catch (e) {
      console.error('Bible chapter load failed', { book: b.en, chapter: ch, edition: localStorage.getItem('cog_bible_en_version') || 'kjv', error: e });
    }
    return enCache[id];
  }

  function escapeHtml`);
    if (code.indexOf('async function loadEnChapter(id, ch)') < 0 || code.indexOf('const requestUrl = isOdr') < 0) {
      throw new Error('Reader core chapter-loader patch did not apply');
    }

    code = code.replace(/  async function renderBook\(forceReload\) \{[\s\S]*?\n  \}\n\n  function clearSelection/, "  async function renderBook(forceReload) {\n    const box = document.getElementById('bible-verses');\n    const heading = document.getElementById('bible-heading');\n    const b = meta.find(x => x.id === bookId);\n    if (!b || !box) return;\n    loadingBook = true;\n    heading.textContent = bookLabel();\n    updateRef();\n    saveState();\n    clearSelection();\n    if (forceReload || !box.querySelector('.mb-chapter')) {\n      box.innerHTML = '<p class=\"bible-loading\">' + t('bibleLoading') + '</p>';\n    }\n    try {\n      if (currentLang === 'fa') {\n        const data = await loadFaBook(bookId);\n        if (!data || !data.chapters) {\n          box.innerHTML = '<p class=\"bible-loading\">' + t('errLoad') + '</p>';\n          loadingBook = false;\n          return;\n        }\n        const chNums = Object.keys(data.chapters).map(Number).sort((a,c)=>a-c);\n        box.innerHTML = chNums.map(ch => buildChapterHtml(ch, data.chapters[String(ch)])).join('');\n        if (!chNums.includes(chapter)) chapter = chNums[0] || 1;\n        loadingBook = false;\n        updateRef();\n        requestAnimationFrame(() => scrollToRef(chapter, verse, false));\n      } else {\n        const chapterStart = CHAPTER_STARTS[bookId] || 1;\n        const chapterMax = CHAPTER_COUNTS[bookId] || chapterStart;\n        if (!Number.isInteger(chapter) || chapter < chapterStart || chapter > chapterMax) chapter = chapterStart;\n        await loadEnChapter(bookId, chapter);\n        const bookData = enCache[bookId];\n        const chapterData = bookData && bookData.chapters[String(chapter)];\n        if (!chapterData) {\n          box.innerHTML = '<p class=\"bible-loading\">' + t('errLoad') + '</p>';\n          loadingBook = false;\n          return;\n        }\n        box.innerHTML = buildChapterHtml(chapter, chapterData);\n        loadingBook = false;\n        updateRef();\n        requestAnimationFrame(() => scrollToRef(chapter, verse, false));\n      }\n    } catch (e) {\n      box.innerHTML = '<p class=\"bible-loading\">' + t('errNet') + '</p>';\n      loadingBook = false;\n    }\n  }\n\n  function clearSelection");
    if (code.indexOf("const chapterData = bookData && bookData.chapters[String(chapter)];") < 0) {
      throw new Error('Requested-chapter-first reader patch did not apply');
    }

    code = code.replace("    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });", "    const root = document.documentElement; const oldScrollBehavior = root.style.scrollBehavior; if (!smooth) root.style.scrollBehavior = 'auto'; el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' }); if (!smooth) root.style.scrollBehavior = oldScrollBehavior;");
    if (code.indexOf("const oldScrollBehavior = root.style.scrollBehavior") < 0) {
      throw new Error('Instant deep-link scrolling patch did not apply');
    }

    // Expose each edition's complete source canon without duplicating shared metadata.
    code = code.replace(/  function availableBooks\(\) \{[\s\S]*?\n  \}/, `  function availableBooks() {
    const selectedTranslation = localStorage.getItem('cog_bible_en_version') || 'kjv';
    const hasDeuterocanon = ['dra','webbe','web','rv1885','odr','odr-original'].indexOf(selectedTranslation) >= 0;
    if (currentLang === 'fa' && manifest && Object.keys(manifest).length) {
      const list = meta.filter(b => manifest[String(b.id)]);
      return list.length ? list : meta.filter(b => b.id < 740);
    }
    return hasDeuterocanon ? meta : meta.filter(b => b.id < 740);
  }`);
    if (code.indexOf("hasDeuterocanon") < 0) throw new Error('Bible canon filter patch did not apply');
    code = code.replace("  const CHAPTER_COUNTS = {", "  const CHAPTER_STARTS = {};\n\n  const CHAPTER_COUNTS = {");
    if (code.indexOf("const CHAPTER_STARTS = {}") < 0) throw new Error('Bible chapter-start catalogue patch did not apply');
    code = code.replace("    let max = CHAPTER_COUNTS[bookId] || 1;\n    if (currentLang === 'fa' && faCache[bookId]) {", "    const chapterStart = currentLang === 'en' ? (CHAPTER_STARTS[bookId] || 1) : 1;\n    let max = CHAPTER_COUNTS[bookId] || chapterStart;\n    if (currentLang === 'fa' && faCache[bookId]) {");
    code = code.replace("grid.innerHTML = Array.from({length: max}, (_, i) => {\n      const n = i + 1;", "grid.innerHTML = Array.from({length: max - chapterStart + 1}, (_, i) => {\n      const n = i + chapterStart;");
    code = code.replace("    const max = CHAPTER_COUNTS[bookId] || 1;\n    let next = chapter + dir;", "    const chapterStart = currentLang === 'en' ? (CHAPTER_STARTS[bookId] || 1) : 1;\n    const max = CHAPTER_COUNTS[bookId] || chapterStart;\n    let next = chapter + dir;");
    code = code.replace("      if (next < 1) next = 1;", "      if (next < chapterStart) next = chapterStart;");
    code = code.replace("      applyChrome();\n      await renderBook(true);", "      applyChrome();\n      const availableIds = availableBooks().map(b => b.id);\n      if (!availableIds.includes(Number(bookId))) { bookId = availableIds.includes(480) ? 480 : (availableIds[0] || 480); chapter = 1; verse = 1; saveState(); }\n      await renderBook(true);");
    if (code.indexOf("const availableIds = availableBooks().map(b => b.id)") < 0) throw new Error('Language-toggle canon fallback patch did not apply');

    code = code.replace(/mb-sel-actions/g, 'mb-selection-tools');
    code = code.replace(/mb-book-btn/g, 'mb-cell');
    code = code.replace(/mb-num-btn/g, 'mb-cell');

    code = code.replace("version: 'هزارۀ نو (FANMV)',", "version: (localStorage.getItem('cog_bible_fa_version') === 'opv' ? 'ترجمه قدیم فارسی (OPV)' : 'ترجمه معاصر فارسی (OPCB)'),");
    code = code.replace("version: 'King James Version',", "version: ({kjv:'King James Version',web:'World English Bible Classic (81 texts)',asv:'American Standard Version (1901)',rv1885:'English Revised Version (1885, 80 texts)',ylt:\"Young's Literal Translation (1898)\",webster:\"Webster's Bible (1833)\",bbe:'Bible in Basic English',bsb:'Berean Standard Bible',msb:'Majority Standard Bible',webbe:'World English Bible British Edition (81 texts)',darby:'Darby Translation (1884)',dra:'Douay-Rheims 1899',gnv:'Geneva Bible (1599)',odr:'Original Douay-Rheims (1582/1609–1610) — modern spelling','odr-original':'Original Douay-Rheims — original spelling'})[localStorage.getItem('cog_bible_en_version') || 'kjv'] || 'King James Version',");
    code = code.replace(/const ref = encodeURIComponent\(b\.en \+ ' ' \+ ch\);\s*const res = await fetch\([^;]+\);/, "const selectedTranslation = localStorage.getItem('cog_bible_en_version') || 'kjv';\n      const localEnglishIds = ['web','asv','ylt','webster','darby','gnv','bsb','dra','webbe','rv1885','msb'];\n      const freeBibleIds = ['kjv','bbe'];\n      const bookSlug = b.en === 'Song of Songs' ? 'song-of-solomon' : b.en.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');\n      \n      const isOdr = selectedTranslation === 'odr' || selectedTranslation === 'odr-original';\n      const isLocalEnglish = localEnglishIds.indexOf(selectedTranslation) >= 0;\n      const odrPath = selectedTranslation === 'odr-original' ? 'original-spelling/bible/raw/' : 'bible/raw/';\n      const requestUrl = isOdr\n        ? '/data/bible-en/odr/' + odrPath + b.slug + '.json'\n        : isLocalEnglish\n          ? '/data/bible-en/local/' + selectedTranslation + '/b' + id + '.json'\n          : freeBibleIds.indexOf(selectedTranslation) >= 0\n            ? 'https://free.bible/bible/' + selectedTranslation + '/' + bookSlug + '/' + ch + '.json'\n            : '/data/bible-en/local/' + selectedTranslation + '/b' + id + '.json';\n      const res = await fetch(requestUrl);");
    code = code.replace("(data.verses || []).forEach(v => { verses[String(v.verse)] = (v.text || '').trim(); });", "const localBook = isLocalEnglish ? (data[String(id)] || data[id] || data) : null;\n      const chapterData = isOdr ? (data.chapters || []).find(item => Number(item.chapter) === Number(ch)) : null;\n      const localChapter = isLocalEnglish ? ((localBook && localBook.chapters) || {})[String(ch)] : null;\n      const rows = isOdr ? ((chapterData && chapterData.verses) || [])\n        : isLocalEnglish ? Object.keys(localChapter || {}).map(verse => ({verse: verse, text: localChapter[verse]}))\n        : (Array.isArray(data) ? data : (data.verses || []));\n      rows.forEach(v => { const n = v.verse != null ? v.verse : v.v; const verseText = v.text != null ? v.text : v.t; if (n != null && Number(n) > 0) verses[String(n)] = String(verseText || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').trim(); });");
    code = code.replace(
      "const res = await fetch('/data/bible-fa/' + fname);",
      "const dataDir = localStorage.getItem('cog_bible_fa_version') === 'opv' ? '/data/bible-fa/opv/' : '/data/bible-fa/opcb/';\n        const res = await fetch(dataDir + fname);"
    );
    code = code.replace("await loadMeta();\n    await loadManifest();", "await loadMeta();\n    const selectedEnglishVersion = localStorage.getItem('cog_bible_en_version') || 'kjv';\n    if (currentLang === 'en' && ['dra','webbe','web','rv1885'].includes(selectedEnglishVersion)) {\n      // meta.json stores the seven shared deuterocanonical labels for Persian manifest filtering.\n      // Remove all expanded IDs first, then insert only the selected edition's source catalogue.\n      meta = meta.filter(b => b.id < 740 || b.id > 910);\n      const commonBooks = [\n        {id:740,fa:'توبیت',en:'Tobit'},\n        {id:750,fa:'یهودیت',en:'Judith'},\n        {id:760,fa:'حکمت سلیمان',en:'Wisdom'},\n        {id:770,fa:'حکمت سیراخ',en:'Sirach'},\n        {id:780,fa:'باروک',en:'Baruch'},\n        {id:790,fa:'مکابیان اوّل',en:'1 Maccabees'},\n        {id:800,fa:'مکابیان دوّم',en:'2 Maccabees'}\n      ];\n      const webBooks = [\n        {id:740,fa:'توبیت',en:'Tobit'},\n        {id:750,fa:'یهودیت',en:'Judith'},\n        {id:810,fa:'اِستر (یونانی)',en:'Esther (Greek)'},\n        {id:820,fa:'دانیال (یونانی)',en:'Daniel (Greek)'},\n        {id:760,fa:'حکمت سلیمان',en:'Wisdom'},\n        {id:770,fa:'حکمت سیراخ',en:'Sirach'},\n        {id:780,fa:'باروک',en:'Baruch'},\n        {id:790,fa:'مکابیان اوّل',en:'1 Maccabees'},\n        {id:800,fa:'مکابیان دوّم',en:'2 Maccabees'},\n        {id:830,fa:'عزرا اوّل',en:'1 Esdras'},\n        {id:840,fa:'دعای منسی',en:'Prayer of Manasses'},\n        {id:850,fa:'مزمور ۱۵۱',en:'Psalm 151'},\n        {id:860,fa:'مکابیان سوّم',en:'3 Maccabees'},\n        {id:870,fa:'عزرا دوّم',en:'2 Esdras'},\n        {id:880,fa:'مکابیان چهارم',en:'4 Maccabees'}\n      ];\n      const ervBooks = [\n        {id:740,fa:'توبیت',en:'Tobit'},\n        {id:750,fa:'یهودیت',en:'Judith'},\n        {id:810,fa:'افزوده‌های استر (یونانی)',en:'Esther (Greek additions)'},\n        {id:760,fa:'حکمت سلیمان',en:'Wisdom'},\n        {id:770,fa:'حکمت سیراخ',en:'Sirach'},\n        {id:780,fa:'باروک',en:'Baruch'},\n        {id:790,fa:'مکابیان اوّل',en:'1 Maccabees'},\n        {id:800,fa:'مکابیان دوّم',en:'2 Maccabees'},\n        {id:830,fa:'عزرا اوّل',en:'1 Esdras'},\n        {id:840,fa:'دعای منسی',en:'Prayer of Manasses'},\n        {id:870,fa:'عزرا دوّم',en:'2 Esdras'},\n        {id:890,fa:'بل و اژدها',en:'Bel and the Dragon'},\n        {id:900,fa:'دعای عزریا',en:'Prayer of Azariah'},\n        {id:910,fa:'سوسانا',en:'Susanna'}\n      ];\n      const expandedBooks = ['web','webbe'].includes(selectedEnglishVersion) ? webBooks : selectedEnglishVersion === 'rv1885' ? ervBooks : commonBooks;\n      meta.splice(39, 0, ...expandedBooks);\n      if (selectedEnglishVersion === 'dra') { CHAPTER_COUNTS[190] = 16; CHAPTER_COUNTS[340] = 14; }\n      if (['web','webbe'].includes(selectedEnglishVersion)) { CHAPTER_STARTS[810] = 1; Object.assign(CHAPTER_COUNTS, {810:10,820:14,830:9,840:1,850:1,860:7,870:16,880:18}); }\n      if (selectedEnglishVersion === 'rv1885') {\n        Object.assign(CHAPTER_COUNTS, {810:16,830:9,840:1,870:16,890:1,900:1,910:1});\n        CHAPTER_STARTS[810] = 10;\n        if (bookId === 810 && Number(chapter) < 10) chapter = 10;\n      }\n    }\n    if (currentLang === 'en' && ['odr','odr-original'].includes(selectedEnglishVersion)) {\n      const odrResponse = await fetch('/data/bible-en/odr/manifest.json');\n      if (!odrResponse.ok) throw new Error('Original Douay-Rheims catalogue unavailable');\n      const odrManifest = await odrResponse.json();\n      const odrNames = {'josue':'Josue','1-kings':'1 Kings (1 Samuel)','2-kings':'2 Kings (2 Samuel)','3-kings':'3 Kings (1 Kings)','4-kings':'4 Kings (2 Kings)','1-paralipomenon':'1 Paralipomenon (1 Chronicles)','2-paralipomenon':'2 Paralipomenon (2 Chronicles)','1-esdras':'1 Esdras (Ezra)','2-esdras':'2 Esdras (Nehemiah)','tobias':'Tobias','1-machabees':'1 Machabees','2-machabees':'2 Machabees','canticle-of-canticles':'Canticle of Canticles (Song of Songs)','ecclesiasticus':'Ecclesiasticus (Sirach)','isaie':'Isaias (Isaiah)','jeremie':'Jeremias (Jeremiah)','ezechiel':'Ezechiel (Ezekiel)','osee':'Osee (Hosea)','abdias':'Abdias (Obadiah)','jonas':'Jonas (Jonah)','micheas':'Micheas (Micah)','habacuc':'Habacuc (Habakkuk)','sophonias':'Sophonias (Zephaniah)','aggeus':'Aggeus (Haggai)','zacharias':'Zacharias (Zechariah)','malachie':'Malachias (Malachi)','prayer-of-manasses':'Prayer of Manasses','3-esdras':'3 Esdras (Appendix)','4-esdras':'4 Esdras (Appendix)','apocalypse':'Apocalypse (Revelation)'};\n      meta = odrManifest.books.map((book, index) => {\n        const label = odrNames[book.slug] || book.slug.replace(/(^|-)([a-z])/g, (_, sep, letter) => (sep ? ' ' : '') + letter.toUpperCase());\n        return {id:1001 + index, slug:book.slug, chapters:(book.slug === 'tobias' ? book.chapters - 1 : book.chapters), fa:label, en:label};\n      });\n      meta.forEach(book => { CHAPTER_COUNTS[book.id] = book.chapters; });\n    }\n    const savedBookSlug = localStorage.getItem('cog_bible_book_slug');\n    if (savedBookSlug) {\n      const slugMatch = meta.find(b => b.slug === savedBookSlug);\n      const canonicalId = window.__stBibleCanonicalIdBySlug && window.__stBibleCanonicalIdBySlug[savedBookSlug];\n      if (slugMatch) bookId = slugMatch.id;\n      else if (canonicalId) bookId = canonicalId;\n    }\n    await loadManifest();");
    code = code.replace("function saveState() {\n    try { localStorage.setItem(STATE_KEY, JSON.stringify({ bookId, chapter, verse })); } catch (e) {}\n  }", "function saveState() {\n    try {\n      localStorage.setItem(STATE_KEY, JSON.stringify({ bookId, chapter, verse }));\n      const currentBook = meta.find(b => b.id === bookId);\n      const slug = (currentBook && currentBook.slug) ||\n        (window.__stBibleSlugByCanonicalId && window.__stBibleSlugByCanonicalId[bookId]);\n      if (slug) localStorage.setItem('cog_bible_book_slug', slug);\n      else localStorage.removeItem('cog_bible_book_slug');\n    } catch (e) {}\n  }");
    code = code.replace("670:5,680:3,690:5,700:1,710:1,720:1,730:22", "670:5,680:3,690:5,700:1,710:1,720:1,730:22,740:14,750:16,760:19,770:51,780:6,790:16,800:15");
    code = code.replace("(data.verses || []).forEach(v => { verses[String(v.verse)] = (v.text || '').trim(); });", "(data.verses || []).forEach(v => { const n = v.verse != null ? v.verse : v.v; const text = v.text != null ? v.text : v.t; if (n != null) verses[String(n)] = String(text || '').trim(); });");
    code = code.replace("      } else {\n        const max = CHAPTER_COUNTS[bookId] || 1;\n        await loadEnChapter(bookId, 1);\n        const first = enCache[bookId];\n        if (!first || !first.chapters['1']) {\n          box.innerHTML = '<p class=\"bible-loading\">' + t('errLoad') + '</p>';\n          loadingBook = false;\n          return;\n        }\n        box.innerHTML = buildChapterHtml(1, first.chapters['1']);\n        loadingBook = false;\n        updateRef();\n        if (chapter === 1) requestAnimationFrame(() => scrollToRef(1, verse, false));\n        for (let ch = 2; ch <= max; ch++) {\n          await loadEnChapter(bookId, ch);\n          const chData = enCache[bookId].chapters[String(ch)];\n          if (!chData || document.getElementById('ch-' + ch)) continue;\n          box.insertAdjacentHTML('beforeend', buildChapterHtml(ch, chData));\n        }\n      }", "      } else {\n        const chapterStart = CHAPTER_STARTS[bookId] || 1;\n        const max = CHAPTER_COUNTS[bookId] || chapterStart;\n        const selectedChapter = Math.min(Math.max(Number(chapter) || chapterStart, chapterStart), max);\n        chapter = selectedChapter;\n        await loadEnChapter(bookId, selectedChapter);\n        const data = enCache[bookId];\n        const selected = data && data.chapters[String(selectedChapter)];\n        if (!selected) {\n          box.innerHTML = '<p class=\"bible-loading\">' + t('errLoad') + '</p>';\n          loadingBook = false;\n          return;\n        }\n        box.innerHTML = buildChapterHtml(selectedChapter, selected);\n        loadingBook = false;\n        updateRef();\n        renderVerseGrid();\n        requestAnimationFrame(() => scrollToRef(selectedChapter, verse, false));\n      }");
    code = code.replace("btn.addEventListener('click', () => {\n        chapter = Number(btn.getAttribute('data-ch'));\n        verse = 1;\n        updateRef();\n        saveState();\n        showTab('verses');\n        renderVerseGrid();\n        scrollToRef(chapter, verse, true);\n      });", "btn.addEventListener('click', async () => {\n        chapter = Number(btn.getAttribute('data-ch'));\n        verse = 1;\n        updateRef();\n        saveState();\n        showTab('verses');\n        await renderBook(true);\n        renderVerseGrid();\n      });");

    code = code.replace(
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = 1; verse = 1;\n        closeSel();\n        await renderBook(true);",
      "bookId = Number(btn.getAttribute('data-book'));\n        chapter = CHAPTER_STARTS[bookId] || 1; verse = 1;\n        closeSel();\n        await renderBook(true);"
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
      "window.__stSetBibleLanguage = async function (lang) {\n      var nextLanguage = lang === 'en' ? 'en' : 'fa';\n      if (nextLanguage !== currentLang && ['odr','odr-original'].includes(localStorage.getItem('cog_bible_en_version'))) { localStorage.setItem(LANG_KEY, nextLanguage); location.reload(); return; }\n      currentLang = nextLanguage;\n      if (currentLang === 'fa' && [740,750,760,770,780,790,800,810,820,830,840,850,860,870,880,890,900,910].includes(bookId)) { bookId = 480; chapter = 1; verse = 1; }\n      localStorage.setItem(LANG_KEY, currentLang);\n      applyChrome();\n      await renderBook(true);\n    };"
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
      var url = 'https://seventhtrumpet.org/bible.html?b=' + encodeURIComponent(state.bookId || '') + '&c=' + encodeURIComponent(firstCh) + '&v=' + encodeURIComponent(firstV) + (lastV !== firstV ? '-' + encodeURIComponent(lastV) : '');
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
      if (['kjv','web','asv','rv1885','ylt','webster','bbe','bsb','msb','webbe','darby','dra','gnv','odr','odr-original'].indexOf(savedEnglishVersion) < 0) savedEnglishVersion = 'kjv';
      if (versionSelect) versionSelect.value = savedEnglishVersion;
      if (persianVersionSelect) persianVersionSelect.value = localStorage.getItem('cog_bible_fa_version') || 'opcb';
      var translationNote = document.getElementById('bible-translation-note');
      if (translationNote) translationNote.textContent = english
        ? (['odr','odr-original'].includes(savedEnglishVersion)
          ? "Original Douay-Rheims (1582/1609–1610), 76 listed texts: the 73-book Catholic canon plus three appendix texts. Both spelling forms are served from this website's own files. This beta dataset is marked CC0; only Scripture verses are displayed, not study notes or front matter. Both spelling forms use their own local verse search index. See Sources and Licences for details."
          : "Read and compare translations here without leaving SeventhTrumpet.org. Eleven English editions, plus both Original Douay-Rheims spelling forms, are served from this website's own files. KJV and BBE chapter text is fetched in the background from Free.Bible; these two editions are not self-hosted. Bible search follows the selected local edition, including both Original Douay-Rheims spelling forms; only KJV and BBE use the KJV fallback index. See Sources and Licences for details.")
        : "متن دو نسخهٔ فارسی OPV و OPCB از فایل‌های خودِ SeventhTrumpet.org بارگذاری می‌شود و برای خواندن آن‌ها به وب‌سایت دیگری منتقل نمی‌شوید. نسخه‌های انگلیسیِ میزبانی‌شده روی سایت و دو نگارش Douay-Rheims نیز از فایل‌های خود سایت خوانده می‌شوند؛ فقط متن فصل‌های KJV و BBE در پس‌زمینه از Free.Bible دریافت می‌شود. جست‌وجوی فارسی از همان نسخهٔ فارسی انتخاب‌شده استفاده می‌کند و جست‌وجوی انگلیسی نیز برای نسخه‌های دارای نمایهٔ داخلی با نسخهٔ انتخاب‌شده هماهنگ است؛ فقط KJV و BBE فعلاً از نمایهٔ جایگزین KJV استفاده می‌کنند. برای جزئیات منبع و شرایط استفاده، صفحهٔ منابع و مجوزها را ببینید.";
      var nmvLink = document.getElementById('nmv-external-link');
      if (nmvLink) nmvLink.textContent = english
        ? 'New Millennium Version (NMV) — read on the publisher’s website'
        : 'هزارهٔ نو (NMV) — مطالعه در وب‌سایت ناشر';
    }
    syncVersionControl();
    if (versionSelect) versionSelect.addEventListener('change', function () {
      var allowed = ['kjv','web','asv','rv1885','ylt','webster','bbe','bsb','msb','webbe','darby','dra','gnv','odr','odr-original'];
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
