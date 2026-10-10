/* Seventh Trumpet — Bible reader */
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
      bibleBook: 'کتاب', bibleChapter: 'باب', bibleLoading: 'در حال بارگذاری...',
      footer: 'شیپور هفتم — پیام سه فرشته مکاشفه 14',
      version: 'هزارۀ نو (FANMV)',
      note: 'ترجمۀ فارسی «هزارۀ نو» © Elam Ministries.',
      errLoad: 'این کتاب هنوز بارگذاری نشده است. کتاب دیگری را امتحان کنید (مثلاً روت یا یونس).',
      errNet: 'خطا در بارگذاری. اتصال اینترنت را بررسی کنید.'
    },
    en: {
      siteName: 'Seventh Trumpet', home: 'Home', bibleNav: 'Bible', langBtn: 'Persian',
      bibleBook: 'Book', bibleChapter: 'Chapter', bibleLoading: 'Loading...',
      footer: 'Seventh Trumpet — Three Angels Message, Revelation 14',
      version: 'King James Version (public domain)',
      note: 'English text: King James Version (public domain).',
      errLoad: 'Could not load this chapter.',
      errNet: 'Network error. Check your connection.'
    }
  };

  let meta = [];
  let currentLang = localStorage.getItem(LANG_KEY) || 'fa';
  let faCache = {};
  let bookId = null;
  let chapter = 1;

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
      const res = await fetch('data/bible-fa/meta.json');
      if (res.ok) { meta = await res.json(); return; }
    } catch (e) {}
    meta = [
      {id:10,fa:'پیدایش',en:'Genesis'},{id:80,fa:'روت',en:'Ruth'},{id:390,fa:'یونس',en:'Jonah'},
      {id:470,fa:'متی',en:'Matthew'},{id:500,fa:'یوحنا',en:'John'},{id:730,fa:'مکاشفه',en:'Revelation'}
    ];
  }

  function fillBooks() {
    const sel = document.getElementById('bible-book');
    if (!sel || !meta.length) return;
    sel.innerHTML = meta.map(b => {
      const label = currentLang === 'fa' ? b.fa : b.en;
      return '<option value="' + b.id + '">' + label + '</option>';
    }).join('');
    if (bookId == null || !meta.find(b => b.id === bookId)) bookId = meta[0].id;
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

  let packPromise = null;
  async function loadPack() {
    if (packPromise) return packPromise;
    packPromise = (async () => {
      const out = {};
      for (const name of ['pack-a.json', 'pack-b.json', 'pack.json']) {
        try {
          const res = await fetch('data/bible-fa/' + name);
          if (res.ok) Object.assign(out, await res.json());
        } catch (e) {}
      }
      return out;
    })();
    return packPromise;
  }

  async function loadFaBook(id) {
    if (faCache[id]) return faCache[id];
    try {
      const res = await fetch('data/bible-fa/' + id + '.json');
      if (res.ok) {
        const data = await res.json();
        faCache[id] = data;
        return data;
      }
    } catch (e) {}
    const pack = await loadPack();
    if (pack && pack[String(id)]) {
      faCache[id] = pack[String(id)];
      return faCache[id];
    }
    return null;
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
          escapeHtml((v.text || '').trim()) + '</p>'
        ).join('');
      }
    } catch (e) {
      box.innerHTML = '<p class="bible-loading">' + t('errNet') + '</p>';
    }
  }

  async function onBookChange() {
    bookId = Number(document.getElementById('bible-book').value);
    chapter = 1;
    fillChapters();
    await render();
  }

  async function onChapterChange() {
    chapter = Number(document.getElementById('bible-chapter').value);
    await render();
  }

  async function shiftChapter(delta) {
    const max = CHAPTER_COUNTS[bookId] || 1;
    let next = chapter + delta;
    if (next < 1) {
      const bi = meta.findIndex(x => x.id === bookId);
      if (bi > 0) {
        bookId = meta[bi - 1].id;
        chapter = CHAPTER_COUNTS[bookId] || 1;
        document.getElementById('bible-book').value = String(bookId);
        fillChapters();
        await render();
      }
      return;
    }
    if (next > max) {
      const bi = meta.findIndex(x => x.id === bookId);
      if (bi < meta.length - 1) {
        bookId = meta[bi + 1].id;
        chapter = 1;
        document.getElementById('bible-book').value = String(bookId);
        fillChapters();
        await render();
      }
      return;
    }
    chapter = next;
    document.getElementById('bible-chapter').value = String(chapter);
    await render();
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const dark = saved === 'dark';
    document.body.classList.toggle('dark', dark);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.addEventListener('click', () => {
        const next = !document.body.classList.contains('dark');
        document.body.classList.toggle('dark', next);
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
        btn.textContent = next ? '☀️' : '🌙';
      });
    }
  }

  async function boot() {
    initTheme();
    loadState();
    applyChrome();
    await loadMeta();
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
      applyChrome();
      fillBooks();
      fillChapters();
      await render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
