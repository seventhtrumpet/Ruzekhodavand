/* Seventh Trumpet — Bible reader (FA: FANMV JSON packs / EN: KJV API) */
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
      siteName: '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645', home: '\u062e\u0627\u0646\u0647', bibleNav: '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633', langBtn: 'English',
      bibleBook: '\u06a9\u062a\u0627\u0628', bibleChapter: '\u0628\u0627\u0628', bibleLoading: '\u062f\u0631 \u062d\u0627\u0644 \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc...',
      footer: '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645 \u2014 \u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647 \u0645\u06a9\u0627\u0634\u0641\u0647 14',
      version: '\u0647\u0632\u0627\u0631\u06c0 \u0646\u0648 (FANMV)',
      note: '\u062a\u0631\u062c\u0645\u06c0 \u0641\u0627\u0631\u0633\u06cc \u00ab\u0647\u0632\u0627\u0631\u06c0 \u0646\u0648\u00bb \u00a9 Elam Ministries. \u0641\u0642\u0637 \u06a9\u062a\u0627\u0628\u200c\u0647\u0627\u06cc \u0645\u0648\u062c\u0648\u062f \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u0646\u062f.',
      errLoad: '\u0627\u06cc\u0646 \u06a9\u062a\u0627\u0628 \u062f\u0631 \u062f\u0633\u062a\u0631\u0633 \u0646\u06cc\u0633\u062a.',
      errNet: '\u062e\u0637\u0627 \u062f\u0631 \u0628\u0627\u0631\u06af\u0630\u0627\u0631\u06cc. \u0627\u062a\u0635\u0627\u0644 \u0627\u06cc\u0646\u062a\u0631\u0646\u062a \u0631\u0627 \u0628\u0631\u0631\u0633\u06cc \u06a9\u0646\u06cc\u062f.'
    },
    en: {
      siteName: 'Seventh Trumpet', home: 'Home', bibleNav: 'Bible', langBtn: 'Persian',
      bibleBook: 'Book', bibleChapter: 'Chapter', bibleLoading: 'Loading...',
      footer: 'Seventh Trumpet \u2014 Three Angels Message, Revelation 14',
      version: 'King James Version (public domain)',
      note: 'English text: King James Version (public domain). All 66 books available.',
      errLoad: 'Could not load this chapter.',
      errNet: 'Network error. Check your connection.'
    }
  };

  let meta = [];
  let currentLang = localStorage.getItem(LANG_KEY) || 'fa';
  let bookId = null;
  let chapter = 1;
  let faCache = {};
  let manifest = null;

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
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ bookId, chapter })); } catch (e) {}
  }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      if (s.bookId) bookId = Number(s.bookId);
      if (s.chapter) chapter = Number(s.chapter);
    } catch (e) {}
  }

  async function loadMeta() {
    try {
      const res = await fetch('/data/bible-fa/meta.json');
      if (res.ok) { meta = await res.json(); return; }
    } catch (e) {}
    meta = [
      {id:10,fa:'\u067e\u06cc\u062f\u0627\u06cc\u0634',en:'Genesis'},{id:80,fa:'\u0631\u0648\u062a',en:'Ruth'},
      {id:470,fa:'\u0645\u062a\u06cc',en:'Matthew'},{id:500,fa:'\u06cc\u0648\u062d\u0646\u0627',en:'John'},
      {id:730,fa:'\u0645\u06a9\u0627\u0634\u0641\u0647',en:'Revelation'}
    ];
  }

  async function loadManifest() {
    if (manifest) return manifest;
    try {
      const res = await fetch('/data/bible-fa/manifest.json');
      if (res.ok) {
        manifest = await res.json();
        return manifest;
      }
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

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
  }

  async function render() {
    const box = document.getElementById('bible-verses');
    const heading = document.getElementById('bible-heading');
    const b = meta.find(x => x.id === bookId);
    if (!b || !box) return;
    box.innerHTML = '<p class="bible-loading">' + t('bibleLoading') + '</p>';
    heading.textContent = (currentLang === 'fa' ? b.fa : b.en) + ' ' + chapter;
    saveState();

    try {
      if (currentLang === 'fa') {
        const data = await loadFaBook(bookId);
        if (!data) {
          box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
          return;
        }
        const verses = (data.chapters && data.chapters[String(chapter)]) || {};
        const nums = Object.keys(verses).map(Number).sort((a, c) => a - c);
        if (!nums.length) {
          box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
          return;
        }
        box.innerHTML = nums.map(n =>
          '<p class="bible-verse"><span class="bible-verse-num">' + n + '</span>' +
          escapeHtml(verses[String(n)]) + '</p>'
        ).join('');
      } else {
        const ref = encodeURIComponent(b.en + ' ' + chapter);
        const res = await fetch('https://bible-api.com/' + ref + '?translation=kjv');
        if (!res.ok) throw new Error('api');
        const data = await res.json();
        const verses = data.verses || [];
        if (!verses.length) {
          box.innerHTML = '<p class="bible-loading">' + t('errLoad') + '</p>';
          return;
        }
        box.innerHTML = verses.map(v =>
          '<p class="bible-verse"><span class="bible-verse-num">' + v.verse + '</span>' +
          escapeHtml(v.text) + '</p>'
        ).join('');
      }
    } catch (e) {
      box.innerHTML = '<p class="bible-loading">' + t('errNet') + '</p>';
    }
  }

  function onBookChange(e) {
    bookId = Number(e.target.value);
    chapter = 1;
    fillChapters();
    render();
  }

  function onChapterChange(e) {
    chapter = Number(e.target.value);
    render();
  }

  function shiftChapter(dir) {
    const max = CHAPTER_COUNTS[bookId] || 1;
    const next = chapter + dir;
    if (next < 1 || next > max) return;
    chapter = next;
    fillChapters();
    render();
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const dark = saved === 'dark';
    document.body.classList.toggle('dark', dark);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = dark ? '\u2600\uFE0F' : '\u1F319';
      btn.addEventListener('click', () => {
        const next = !document.body.classList.contains('dark');
        document.body.classList.toggle('dark', next);
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
        btn.textContent = next ? '\u2600\uFE0F' : '\u1F319';
      });
    }
  }

  async function boot() {
    initTheme();
    loadState();
    applyChrome();
    await loadMeta();
    await loadManifest();
    fillBooks();
    fillChapters();
    await render();

    document.getElementById('bible-book')?.addEventListener('change', onBookChange);
    document.getElementById('bible-chapter')?.addEventListener('change', onChapterChange);
    document.getElementById('bible-prev')?.addEventListener('click', () => shiftChapter(-1));
    document.getElementById('bible-next')?.addEventListener('click', () => shiftChapter(1));
    document.getElementById('lang-toggle')?.addEventListener('click', async () => {
      currentLang = currentLang === 'fa' ? 'en' : 'fa';
      localStorage.setItem(LANG_KEY, currentLang);
      faCache = {};
      applyChrome();
      fillBooks();
      fillChapters();
      await render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
