/* Seventh Trumpet — continuous Bible reader (fast, no flash) */
(function () {
  const LANG_KEY = 'cog_lang';
  const THEME_KEY = 'cog_theme';
  const STATE_KEY = 'cog_bible_state';

  const CHAPTER_COUNTS = {
    10:50,20:40,30:27,40:36,50:34,60:24,70:21,80:4,90:31,100:24,
    110:22,120:25,130:29,140:36,150:10,160:13,190:10,220:42,230:150,240:31,
    250:12,260:8,290:66,300:52,310:5,330:48,340:12,350:14,360:3,370:9,
    380:1,390:4,400:7,410:3,420:3,430:3,440:2,450:14,460:4,
    470:28,480:16,490:24,500:21,510:28,520:16,530:16,540:13,550:6,560:6,
    570:4,580:4,590:5,600:3,610:6,620:4,630:3,640:1,650:13,660:5,
    670:5,680:3,690:5,700:1,710:1,720:1,730:22
  };

  const I18N = {
    fa: {
      siteName: 'شیپور هفتم', home: 'خانه', bibleNav: 'کتاب مقدس', langBtn: 'English',
      media: 'رسانه‌ها', live: 'پخش زنده', liveBadge: 'زنده',
      bibleBook: 'کتاب', bibleChapter: 'باب', bibleVerse: 'آیه',
      bibleLoading: 'در حال بارگذاری...',
      footer: 'شیپور هفتم — پیام سه فرشته مکاشفه ۱۴',
      version: 'هزارۀ نو (FANMV)',
      note: 'ترجمهٔ فارسی «هزارۀ نو» © Elam Ministries. فقط کتاب‌های موجود نشان داده می‌شوند. می‌توانید تا پایان کتاب اسکرول کنید.',
      errLoad: 'این کتاب در دسترس نیست.',
      errNet: 'خطا در بارگذاری. اتصال اینترنت را بررسی کنید.',
      chapterLabel: 'باب', bibleDone: 'خواندن'
    },
    en: {
      siteName: 'Seventh Trumpet', home: 'Home', bibleNav: 'Bible', langBtn: 'Persian',
      media: 'Media', live: 'Live', liveBadge: 'LIVE',
      bibleBook: 'Book', bibleChapter: 'Chapter', bibleVerse: 'Verse',
      bibleLoading: 'Loading...',
      footer: 'Seventh Trumpet — Three Angels Message, Revelation 14',
      version: 'King James Version (public domain)',
      note: 'English: King James Version (public domain). Scroll through the whole book.',
      errLoad: 'Could not load this book.',
      errNet: 'Network error. Check your connection.',
      chapterLabel: 'Chapter', bibleDone: 'Read'
    }
  };

  let meta = [];
  let currentLang = localStorage.getItem(LANG_KEY) || 'fa';
  let bookId = null;
  let chapter = 1;
  let verse = 1;
  let faCache = {};
  let enCache = {};
  let manifest = null;
  let scrollSync = true;
  let loadingBook = false;

  function t(k) { return (I18N[currentLang] || I18N.fa)[k] || k; }

  function bookLabel() {
    const b = meta.find(x => x.id === bookId);
    if (!b) return '';
    return currentLang === 'fa' ? b.fa : b.en;
  }

  function updatePill() {
    const name = bookLabel();
    const text = name ? (name + '  ·  ' + chapter + ':' + verse) : '';
    const refBtn = document.getElementById('bible-ref-btn');
    if (refBtn) refBtn.textContent = text || (currentLang === 'fa' ? 'کتاب / باب / آیه' : 'Book / Chapter / Verse');
    const pill = document.getElementById('bible-pill');
    if (pill) {
      if (text) { pill.textContent = text; pill.classList.remove('hidden'); }
      else pill.classList.add('hidden');
    }
  }

  function collapsePanel() {
    const app = document.getElementById('bible-app');
    const btn = document.getElementById('bible-ref-btn');
    if (app) app.classList.add('panel-collapsed');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    updatePill();
  }

  function expandPanel() {
    const app = document.getElementById('bible-app');
    const btn = document.getElementById('bible-ref-btn');
    if (app) app.classList.remove('panel-collapsed');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function togglePanel() {
    const app = document.getElementById('bible-app');
    if (app && app.classList.contains('panel-collapsed')) expandPanel();
    else collapsePanel();
  }

  function applyChrome() {
    document.documentElement.lang = currentLang === 'fa' ? 'fa' : 'en';
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-en', currentLang === 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if ((I18N.en || {})[k] !== undefined) el.textContent = t(k);
    });
    const ver = document.getElementById('bible-version-label');
    if (ver) ver.textContent = t('version');
    const note = document.getElementById('bible-note');
    if (note) note.textContent = t('note');
    const heading = document.getElementById('bible-heading');
    if (heading && bookId) heading.textContent = bookLabel();
    updatePill();
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ bookId, chapter, verse })); } catch (e) {}
  }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      if (s.bookId) bookId = Number(s.bookId);
      if (s.chapter) chapter = Number(s.chapter);
      if (s.verse) verse = Number(s.verse);
    } catch (e) {}
  }

  async function loadMeta() {
    try {
      const res = await fetch('/data/bible-fa/meta.json');
      if (res.ok) { meta = await res.json(); return; }
    } catch (e) {}
    meta = [
      {id:80,fa:'روت',en:'Ruth'},{id:480,fa:'انجیل مَرقُس',en:'Mark'},
      {id:500,fa:'انجیل یوحنا',en:'John'},{id:690,fa:'نامۀ یوحنا اوّل',en:'1 John'}
    ];
  }

  async function loadManifest() {
    if (manifest) return manifest;
    try {
      const res = await fetch('/data/bible-fa/manifest.json');
      if (res.ok) { manifest = await res.json(); return manifest; }
    } catch (e) {}
    manifest = {};
    return manifest;
  }

  function fillBooks() {
    const sel = document.getElementById('bible-book');
    if (!sel || !meta.length) return;
    let list = meta;
    if (currentLang === 'fa' && manifest && Object.keys(manifest).length) {
      list = meta.filter(b => manifest[String(b.id)]);
      if (!list.length) list = meta;
    }
    sel.innerHTML = list.map(b => {
      const label = currentLang === 'fa' ? b.fa : b.en;
      return '<option value="' + b.id + '">' + label + '</option>';
    }).join('');
    if (bookId == null || !list.find(b => b.id === bookId)) bookId = list[0].id;
    sel.value = String(bookId);
  }

  function fillChapters() {
    const sel = document.getElementById('bible-chapter');
    if (!sel) return;
    const max = CHAPTER_COUNTS[bookId] || 1;
    let opts = '';
    for (let i = 1; i <= max; i++) opts += '<option value="' + i + '">' + i + '</option>';
    sel.innerHTML = opts;
    if (chapter < 1 || chapter > max) chapter = 1;
    sel.value = String(chapter);
  }

  function fillVerses(maxV) {
    const sel = document.getElementById('bible-verse');
    if (!sel) return;
    const max = maxV || 1;
    let opts = '';
    for (let i = 1; i <= max; i++) opts += '<option value="' + i + '">' + i + '</option>';
    sel.innerHTML = opts;
    if (verse < 1 || verse > max) verse = 1;
    sel.value = String(verse);
  }

  function deepMergeChapters(target, source) {
    if (!source) return target;
    for (const ch of Object.keys(source)) {
      if (!target[ch]) target[ch] = {};
      const verses = source[ch];
      if (verses && typeof verses === 'object') {
        for (const v of Object.keys(verses)) target[ch][v] = verses[v];
      }
    }
    return target;
  }

  async function loadFaBook(id) {
    if (faCache[id]) return faCache[id];
    const man = await loadManifest();
    const files = man[String(id)] || ['b' + id + '.json'];
    const merged = { id: id, name: '', chapters: {} };
    let any = false;
    await Promise.all(files.map(async (fname) => {
      try {
        const res = await fetch('/data/bible-fa/' + fname);
        if (!res.ok) return;
        const pack = await res.json();
        const data = pack[String(id)] || pack[id];
        if (!data) return;
        any = true;
        if (data.name) merged.name = data.name;
        deepMergeChapters(merged.chapters, data.chapters || {});
      } catch (e) {}
    }));
    if (!any) return null;
    faCache[id] = merged;
    return merged;
  }

  async function loadEnChapter(id, ch) {
    const b = meta.find(x => x.id === id);
    if (!b) return null;
    if (!enCache[id]) enCache[id] = { id, name: b.en, chapters: {} };
    if (enCache[id].chapters[String(ch)]) return enCache[id];
    try {
      const ref = encodeURIComponent(b.en + ' ' + ch);
      const res = await fetch('https://bible-api.com/' + ref + '?translation=kjv');
      if (!res.ok) return enCache[id];
      const data = await res.json();
      const verses = {};
      (data.verses || []).forEach(v => { verses[String(v.verse)] = (v.text || '').trim(); });
      if (Object.keys(verses).length) enCache[id].chapters[String(ch)] = verses;
    } catch (e) {}
    return enCache[id];
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
  }

  function buildChapterHtml(ch, versesObj) {
    const verses = versesObj || {};
    const vNums = Object.keys(verses).map(Number).sort((a, c) => a - c);
    const maxV = vNums.length ? vNums[vNums.length - 1] : 1;
    let html = '<div class="bible-chapter-block" id="ch-' + ch + '" data-chapter="' + ch + '" data-max-verse="' + maxV + '">';
    html += '<h2 class="bible-chapter-title">' + t('chapterLabel') + ' ' + ch + '</h2>';
    vNums.forEach(n => {
      html += '<p class="bible-verse" id="v-' + ch + '-' + n + '" data-chapter="' + ch + '" data-verse="' + n + '">' +
        '<span class="bible-verse-num">' + n + '</span>' + escapeHtml(verses[String(n)]) + '</p>';
    });
    html += '</div>';
    return html;
  }

  function scrollToRef(ch, vs, smooth) {
    const id = 'v-' + ch + '-' + vs;
    const el = document.getElementById(id) || document.getElementById('ch-' + ch);
    if (!el) return;
    scrollSync = false;
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    document.querySelectorAll('.bible-verse.highlight').forEach(n => n.classList.remove('highlight'));
    const verseEl = document.getElementById(id);
    if (verseEl) {
      verseEl.classList.add('highlight');
      setTimeout(() => verseEl.classList.remove('highlight'), 2000);
    }
    setTimeout(() => { scrollSync = true; }, 500);
  }

  function updateSelectorsFromScroll() {
    if (!scrollSync || loadingBook) return;
    const nodes = document.querySelectorAll('.bible-chapter-block');
    let current = null;
    const mid = window.scrollY + 140;
    nodes.forEach(n => {
      if (n.offsetTop <= mid) current = n;
    });
    if (!current) return;
    const ch = Number(current.getAttribute('data-chapter'));
    if (!ch) return;
    let nearestVerse = 1;
    current.querySelectorAll('.bible-verse').forEach(v => {
      if (v.offsetTop <= mid + 40) nearestVerse = Number(v.getAttribute('data-verse')) || nearestVerse;
    });
    if (ch !== chapter || nearestVerse !== verse) {
      chapter = ch;
      verse = nearestVerse;
      const csel = document.getElementById('bible-chapter');
      if (csel && csel.value !== String(ch)) csel.value = String(ch);
      const maxV = Number(current.getAttribute('data-max-verse') || 1);
      const vsel = document.getElementById('bible-verse');
      if (vsel && vsel.options.length !== maxV) fillVerses(maxV);
      else if (vsel) vsel.value = String(verse);
      updatePill();
      saveState();
    }
  }

  async function renderBook(forceReload) {
    const box = document.getElementById('bible-verses');
    const heading = document.getElementById('bible-heading');
    const b = meta.find(x => x.id === bookId);
    if (!b || !box) return;

    loadingBook = true;
    heading.textContent = bookLabel();
    updatePill();
    saveState();

    const showLoader = forceReload || !box.querySelector('.bible-chapter-block');
    if (showLoader) {
      box.innerHTML = '<p class="bible-loading">' + t('bibleLoading') + '</p>';
    }

    try {
      if (currentLang === 'fa') {
        const data = await loadFaBook(bookId);
        if (!data || !data.chapters) {
          box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
          loadingBook = false;
          return;
        }
        const chNums = Object.keys(data.chapters).map(Number).sort((a, c) => a - c);
        let html = '';
        chNums.forEach(ch => { html += buildChapterHtml(ch, data.chapters[String(ch)]); });
        box.innerHTML = html;
        if (!chNums.includes(chapter)) chapter = chNums[0] || 1;
        const verses0 = data.chapters[String(chapter)] || {};
        const vMax = Object.keys(verses0).map(Number).sort((a,c)=>a-c);
        fillVerses(vMax.length ? vMax[vMax.length - 1] : 1);
        const csel = document.getElementById('bible-chapter');
        if (csel) csel.value = String(chapter);
        loadingBook = false;
        updatePill();
        requestAnimationFrame(() => scrollToRef(chapter, verse, false));
      } else {
        const max = CHAPTER_COUNTS[bookId] || 1;
        await loadEnChapter(bookId, 1);
        const first = enCache[bookId];
        if (!first || !first.chapters['1']) {
          box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
          loadingBook = false;
          return;
        }
        box.innerHTML = buildChapterHtml(1, first.chapters['1']);
        const vMax1 = Object.keys(first.chapters['1']).map(Number).sort((a,c)=>a-c);
        if (chapter === 1) fillVerses(vMax1.length ? vMax1[vMax1.length - 1] : 1);
        loadingBook = false;
        updatePill();
        if (chapter === 1) requestAnimationFrame(() => scrollToRef(1, verse, false));

        for (let ch = 2; ch <= max; ch++) {
          await loadEnChapter(bookId, ch);
          const chData = enCache[bookId].chapters[String(ch)];
          if (!chData || document.getElementById('ch-' + ch)) continue;
          box.insertAdjacentHTML('beforeend', buildChapterHtml(ch, chData));
          if (ch === chapter) {
            const vMax = Object.keys(chData).map(Number).sort((a,c)=>a-c);
            fillVerses(vMax.length ? vMax[vMax.length - 1] : 1);
            scrollToRef(chapter, verse, false);
          }
        }
      }
    } catch (e) {
      if (showLoader) box.innerHTML = '<p class="bible-loading">' + t('errNet') + '</p>';
      loadingBook = false;
    }
  }

  function onBookChange(e) {
    bookId = Number(e.target.value);
    chapter = 1;
    verse = 1;
    fillChapters();
    fillVerses(1);
    expandPanel();
    renderBook(true);
  }

  function onChapterChange(e) {
    chapter = Number(e.target.value);
    verse = 1;
    const block = document.getElementById('ch-' + chapter);
    const maxV = block ? Number(block.getAttribute('data-max-verse') || 1) : 1;
    fillVerses(maxV);
    updatePill();
    saveState();
    expandPanel();
    if (block) scrollToRef(chapter, 1, true);
    else if (currentLang === 'en') {
      loadEnChapter(bookId, chapter).then(() => {
        const chData = enCache[bookId] && enCache[bookId].chapters[String(chapter)];
        const box = document.getElementById('bible-verses');
        if (chData && box && !document.getElementById('ch-' + chapter)) {
          box.insertAdjacentHTML('beforeend', buildChapterHtml(chapter, chData));
        }
        scrollToRef(chapter, 1, true);
      });
    }
  }

  function onVerseChange(e) {
    verse = Number(e.target.value);
    updatePill();
    saveState();
    scrollToRef(chapter, verse, true);
  }

  function shiftChapter(dir) {
    const max = CHAPTER_COUNTS[bookId] || 1;
    const next = chapter + dir;
    if (next < 1 || next > max) return;
    chapter = next;
    verse = 1;
    const csel = document.getElementById('bible-chapter');
    if (csel) csel.value = String(chapter);
    const block = document.getElementById('ch-' + chapter);
    const maxV = block ? Number(block.getAttribute('data-max-verse') || 1) : 1;
    fillVerses(maxV);
    updatePill();
    saveState();
    if (block) scrollToRef(chapter, 1, true);
    else onChapterChange({ target: { value: String(chapter) } });
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    document.body.classList.toggle('dark', saved === 'dark');
  }

  async function boot() {
    initTheme();
    loadState();
    applyChrome();
    await loadMeta();
    await loadManifest();
    fillBooks();
    fillChapters();
    fillVerses(1);
    await renderBook(true);

    document.getElementById('bible-book')?.addEventListener('change', onBookChange);
    document.getElementById('bible-chapter')?.addEventListener('change', onChapterChange);
    document.getElementById('bible-verse')?.addEventListener('change', onVerseChange);
    document.getElementById('bible-prev')?.addEventListener('click', () => shiftChapter(-1));
    document.getElementById('bible-next')?.addEventListener('click', () => shiftChapter(1));
    document.getElementById('lang-toggle')?.addEventListener('click', async () => {
      currentLang = currentLang === 'fa' ? 'en' : 'fa';
      localStorage.setItem(LANG_KEY, currentLang);
      applyChrome();
      fillBooks();
      fillChapters();
      await renderBook(true);
    });
    document.getElementById('bible-ref-btn')?.addEventListener('click', () => {
      expandPanel();
    });
    document.getElementById('bible-done')?.addEventListener('click', () => {
      collapsePanel();
      scrollToRef(chapter, verse, true);
    });
    document.getElementById('bible-verse')?.addEventListener('change', () => {
      setTimeout(collapsePanel, 280);
    });
    setTimeout(collapsePanel, 400);
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateSelectorsFromScroll);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
