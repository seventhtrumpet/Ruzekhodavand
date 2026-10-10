/* Seventh Trumpet — Bible reader (FA: FANMV / EN: KJV via API + NKJV Gateway link) */
(function () {
  const LANG_KEY = 'cog_lang';
  const THEME_KEY = 'cog_theme';
  const STATE_KEY = 'cog_bible_state';

  const I18N = {
    fa: {
      siteName: 'شیپور هفتم', home: 'خانه', bibleNav: 'کتاب مقدس', langBtn: 'English',
      bibleBook: 'کتاب', bibleChapter: 'باب', bibleLoading: 'در حال بارگذاری...',
      footer: 'شیپور هفتم — پیام سه فرشته مکاشفه 14',
      version: 'هزارۀ نو (FANMV)',
      note: 'ترجمۀ فارسی «هزارۀ نو» © Elam Ministries.',
      nkjv: ''
    },
    en: {
      siteName: 'Seventh Trumpet', home: 'Home', bibleNav: 'Bible', langBtn: 'Persian',
      bibleBook: 'Book', bibleChapter: 'Chapter', bibleLoading: 'Loading...',
      footer: 'Seventh Trumpet — Three Angels Message, Revelation 14',
      version: 'King James Version (public domain)',
      note: 'Full NKJV text is copyrighted by Thomas Nelson and cannot be hosted here. Use the button for NKJV on Bible Gateway. In-page text uses public-domain KJV.',
      nkjv: 'Open this chapter in NKJV (Bible Gateway)'
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
    const nkjv = document.getElementById('nkjv-link');
    if (nkjv) {
      if (currentLang === 'en') {
        nkjv.classList.remove('hidden');
        nkjv.textContent = t('nkjv');
      } else {
        nkjv.classList.add('hidden');
      }
    }
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify({ bookId, chapter, lang: currentLang })); } catch (e) {}
  }

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      if (s.bookId) bookId = s.bookId;
      if (s.chapter) chapter = s.chapter;
    } catch (e) {}
  }

  async function loadMeta() {
    const res = await fetch('data/bible-fa/meta.json');
    meta = await res.json();
  }

  function fillBooks() {
    const sel = document.getElementById('bible-book');
    if (!sel) return;
    sel.innerHTML = meta.map(b => {
      const label = currentLang === 'fa' ? b.fa : b.en;
      return '<option value="' + b.id + '">' + label + '</option>';
    }).join('');
    if (bookId == null) bookId = meta[0].id;
    if (!meta.find(b => b.id === bookId)) bookId = meta[0].id;
    sel.value = String(bookId);
  }

  async function loadFaBook(id) {
    if (faCache[id]) return faCache[id];
    const res = await fetch('data/bible-fa/' + id + '.json');
    if (!res.ok) throw new Error('Book not found');
    const data = await res.json();
    faCache[id] = data;
    return data;
  }

  function chapterCountFa(data) {
    return Object.keys(data.chapters || {}).map(Number).sort((a, b) => a - b);
  }

  async function fillChapters() {
    const sel = document.getElementById('bible-chapter');
    if (!sel) return;
    const data = await loadFaBook(bookId);
    const chs = chapterCountFa(data);
    const max = chs[chs.length - 1] || 1;
    sel.innerHTML = chs.map(c => '<option value="' + c + '">' + c + '</option>').join('');
    if (chapter > max) chapter = 1;
    sel.value = String(chapter);
  }

  function updateNkjvLink() {
    const b = meta.find(x => x.id === bookId);
    const nkjv = document.getElementById('nkjv-link');
    if (!b || !nkjv) return;
    const q = encodeURIComponent(b.en + ' ' + chapter);
    nkjv.href = 'https://www.biblegateway.com/passage/?search=' + q + '&version=NKJV';
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  async function render() {
    const box = document.getElementById('bible-verses');
    const heading = document.getElementById('bible-heading');
    const b = meta.find(x => x.id === bookId);
    if (!b || !box) return;
    box.innerHTML = '<p class="bible-loading">' + t('bibleLoading') + '</p>';
    heading.textContent = (currentLang === 'fa' ? b.fa : b.en) + ' ' + chapter;
    updateNkjvLink();
    saveState();

    try {
      if (currentLang === 'fa') {
        const data = await loadFaBook(bookId);
        const verses = data.chapters[String(chapter)] || {};
        const nums = Object.keys(verses).map(Number).sort((a, c) => a - c);
        box.innerHTML = nums.map(n =>
          '<p class="bible-verse"><span class="bible-verse-num">' + n + '</span>' + escapeHtml(verses[String(n)]) + '</p>'
        ).join('') || '<p class="bible-loading">—</p>';
      } else {
        const ref = encodeURIComponent(b.en + ' ' + chapter);
        const res = await fetch('https://bible-api.com/' + ref + '?translation=kjv');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const verses = data.verses || [];
        box.innerHTML = verses.map(v =>
          '<p class="bible-verse"><span class="bible-verse-num">' + v.verse + '</span>' + escapeHtml(v.text.trim()) + '</p>'
        ).join('') || '<p class="bible-loading">—</p>';
      }
    } catch (e) {
      box.innerHTML = '<p class="bible-loading">' + (currentLang === 'fa' ? 'خطا در بارگذاری' : 'Could not load chapter') + '</p>';
    }
  }

  async function onBookChange() {
    bookId = Number(document.getElementById('bible-book').value);
    chapter = 1;
    await fillChapters();
    await render();
  }

  async function onChapterChange() {
    chapter = Number(document.getElementById('bible-chapter').value);
    await render();
  }

  async function shiftChapter(delta) {
    const sel = document.getElementById('bible-chapter');
    const opts = [...sel.options].map(o => Number(o.value));
    let idx = opts.indexOf(chapter) + delta;
    if (idx < 0) {
      const bi = meta.findIndex(x => x.id === bookId);
      if (bi > 0) {
        bookId = meta[bi - 1].id;
        document.getElementById('bible-book').value = String(bookId);
        await fillChapters();
        const opts2 = [...document.getElementById('bible-chapter').options].map(o => Number(o.value));
        chapter = opts2[opts2.length - 1];
        document.getElementById('bible-chapter').value = String(chapter);
        await render();
      }
      return;
    }
    if (idx >= opts.length) {
      const bi = meta.findIndex(x => x.id === bookId);
      if (bi < meta.length - 1) {
        bookId = meta[bi + 1].id;
        chapter = 1;
        document.getElementById('bible-book').value = String(bookId);
        await fillChapters();
        await render();
      }
      return;
    }
    chapter = opts[idx];
    sel.value = String(chapter);
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
    await fillChapters();
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
      await fillChapters();
      await render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
