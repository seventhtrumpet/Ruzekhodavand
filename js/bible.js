/* Seventh Trumpet — continuous Bible reader */
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
      bibleBook: 'کتاب', bibleChapter: 'باب', bibleVerse: 'آیه', bibleLoading: 'در حال بارگذاری...',
      footer: 'شیپور هفتم — پیام سه فرشته مکاشفه ۱۴',
      version: 'هزارۀ نو (FANMV)',
      note: 'ترجمه فارسی «هزارۀ نو» © Elam Ministries. فقط کتاب‌های موجود نمایش داده می‌شوند. می‌توانید تا پایان کتاب اسکرول کنید.',
      errLoad: 'این کتاب در دسترس نیست.',
      errNet: 'خطا در بارگذاری. اتصال اینترنت را بررسی کنید.',
      chapterLabel: 'باب', jump: 'برو'
    },
    en: {
      siteName: 'Seventh Trumpet', home: 'Home', bibleNav: 'Bible', langBtn: 'Persian',
      bibleBook: 'Book', bibleChapter: 'Chapter', bibleVerse: 'Verse', bibleLoading: 'Loading...',
      footer: 'Seventh Trumpet — Three Angels Message, Revelation 14',
      version: 'King James Version (public domain)',
      note: 'English: King James Version (public domain). Scroll through the whole book.',
      errLoad: 'Could not load this book.',
      errNet: 'Network error. Check your connection.',
      chapterLabel: 'Chapter', jump: 'Go'
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

  function t(k) { return (I18N[currentLang] || I18N.fa)[k] || k; }

  function applyChrome() {
    document.documentElement.lang = currentLang === 'fa' ? 'fa' : 'en';
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-en', currentLang === 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (I18N.en[k] !== undefined) el.textContent = t(k);
    });
    const ver = document.getElementById('bible-version-label');
    if (ver) ver.textContent = t('version');
    const note = document.getElementById('bible-note');
    if (note) note.textContent = t('note');
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
      {id:480,fa:'انجیل مَرقُس',en:'Mark'},{id:500,fa:'انجیل یوحنا',en:'John'},
      {id:690,fa:'نامۀ یوحنا اوّل',en:'1 John'},{id:730,fa:'مکاشفۀ یوحنا',en:'Revelation'}
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
    for (const fname of files) {
      try {
        const res = await fetch('/data/bible-fa/' + fname);
        if (!res.ok) continue;
        const pack = await res.json();
        const data = pack[String(id)] || pack[id];
        if (!data) continue;
        any = true;
        if (data.name) merged.name = data.name;
        deepMergeChapters(merged.chapters, data.chapters || {});
      } catch (e) {}
    }
    if (!any) return null;
    faCache[id] = merged;
    return merged;
  }

  async function loadEnBook(id) {
    if (enCache[id]) return enCache[id];
    const b = meta.find(x => x.id === id);
    if (!b) return null;
    const max = CHAPTER_COUNTS[id] || 1;
    const chapters = {};
    for (let ch = 1; ch <= max; ch++) {
      try {
        const ref = encodeURIComponent(b.en + ' ' + ch);
        const res = await fetch('https://bible-api.com/' + ref + '?translation=kjv');
        if (!res.ok) continue;
        const data = await res.json();
        const verses = {};
        (data.verses || []).forEach(v => { verses[String(v.verse)] = (v.text || '').trim(); });
        if (Object.keys(verses).length) chapters[String(ch)] = verses;
      } catch (e) {}
    }
    if (!Object.keys(chapters).length) return null;
    const book = { id, name: b.en, chapters };
    enCache[id] = book;
    return book;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
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
      setTimeout(() => verseEl.classList.remove('highlight'), 2500);
    }
    setTimeout(() => { scrollSync = true; }, 600);
  }

  function updateSelectorsFromScroll() {
    if (!scrollSync) return;
    const nodes = document.querySelectorAll('.bible-chapter-block');
    let current = null;
    const mid = window.scrollY + 120;
    nodes.forEach(n => {
      if (n.offsetTop <= mid) current = n;
    });
    if (!current) return;
    const ch = Number(current.getAttribute('data-chapter'));
    if (ch && ch !== chapter) {
      chapter = ch;
      const csel = document.getElementById('bible-chapter');
      if (csel) csel.value = String(ch);
      const maxV = Number(current.getAttribute('data-max-verse') || 1);
      fillVerses(maxV);
      saveState();
    }
  }

  async function renderBook() {
    const box = document.getElementById('bible-verses');
    const heading = document.getElementById('bible-heading');
    const b = meta.find(x => x.id === bookId);
    if (!b || !box) return;
    box.innerHTML = '<p class="bible-loading">' + t('bibleLoading') + '</p>';
    heading.textContent = currentLang === 'fa' ? b.fa : b.en;
    saveState();

    try {
      let data;
      if (currentLang === 'fa') data = await loadFaBook(bookId);
      else data = await loadEnBook(bookId);

      if (!data || !data.chapters) {
        box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
        return;
      }

      const chNums = Object.keys(data.chapters).map(Number).sort((a, c) => a - c);
      if (!chNums.length) {
        box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
        return;
      }

      let html = '';
      chNums.forEach(ch => {
        const verses = data.chapters[String(ch)] || {};
        const vNums = Object.keys(verses).map(Number).sort((a, c) => a - c);
        const maxV = vNums.length ? vNums[vNums.length - 1] : 1;
        html += '<div class="bible-chapter-block" id="ch-' + ch + '" data-chapter="' + ch + '" data-max-verse="' + maxV + '">';
        html += '<h2 class="bible-chapter-title">' + t('chapterLabel') + ' ' + ch + '</h2>';
        vNums.forEach(n => {
          html += '<p class="bible-verse" id="v-' + ch + '-' + n + '" data-chapter="' + ch + '" data-verse="' + n + '">' +
            '<span class="bible-verse-num">' + n + '</span>' + escapeHtml(verses[String(n)]) + '</p>';
        });
        html += '</div>';
      });
      box.innerHTML = html;

      const firstCh = chNums[0];
      if (!chNums.includes(chapter)) chapter = firstCh;
      const verses0 = data.chapters[String(chapter)] || {};
      const vMax = Object.keys(verses0).map(Number).sort((a,c)=>a-c);
      fillVerses(vMax.length ? vMax[vMax.length - 1] : 1);
      const csel = document.getElementById('bible-chapter');
      if (csel) csel.value = String(chapter);
      scrollToRef(chapter, verse, false);
    } catch (e) {
      box.innerHTML = '<p class="bible-loading">' + t('errNet') + '</p>';
    }
  }

  function onBookChange(e) {
    bookId = Number(e.target.value);
    chapter = 1;
    verse = 1;
    fillChapters();
    fillVerses(1);
    renderBook();
  }

  function onChapterChange(e) {
    chapter = Number(e.target.value);
    verse = 1;
    const block = document.getElementById('ch-' + chapter);
    const maxV = block ? Number(block.getAttribute('data-max-verse') || 1) : 1;
    fillVerses(maxV);
    scrollToRef(chapter, 1, true);
    saveState();
  }

  function onVerseChange(e) {
    verse = Number(e.target.value);
    scrollToRef(chapter, verse, true);
    saveState();
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
    scrollToRef(chapter, 1, true);
    saveState();
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
    await renderBook();

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
      await renderBook();
    });
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateSelectorsFromScroll);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
