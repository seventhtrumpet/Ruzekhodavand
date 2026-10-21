/* Seventh Trumpet — MyBible-style reader */
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
      media: 'رسانه‌ها', live: 'پخش زنده',
      bibleBook: 'کتاب', bibleChapter: 'باب', bibleVerse: 'آیه',
      bibleLoading: 'در حال بارگذاری...', bibleDone: 'خواندن',
      footer: 'شیپور هفتم — پیام سه فرشته مکاشفه ۱۴',
      version: 'هزارۀ نو (FANMV)',
      errLoad: 'این کتاب در دسترس نیست.',
      errNet: 'خطا در بارگذاری.',
      chapterLabel: 'باب', copy: 'کپی', clear: 'پاک',
      ot: 'عهد عتیق', nt: 'عهد جدید',
      copied: 'کپی شد'
    },
    en: {
      siteName: 'Seventh Trumpet', home: 'Home', bibleNav: 'Bible', langBtn: 'Persian',
      media: 'Media', live: 'Live',
      bibleBook: 'Book', bibleChapter: 'Chapter', bibleVerse: 'Verse',
      bibleLoading: 'Loading...', bibleDone: 'Read',
      footer: 'Seventh Trumpet — Three Angels Message, Revelation 14',
      version: 'King James Version',
      errLoad: 'Could not load this book.',
      errNet: 'Network error.',
      chapterLabel: 'Chapter', copy: 'Copy', clear: 'Clear',
      ot: 'Old Testament', nt: 'New Testament',
      copied: 'Copied'
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
  let selected = new Set();

  function t(k) { return (I18N[currentLang] || I18N.fa)[k] || k; }

  function bookLabel() {
    const b = meta.find(x => x.id === bookId);
    if (!b) return '';
    return currentLang === 'fa' ? b.fa : b.en;
  }

  function updateRef() {
    const btn = document.getElementById('mb-ref');
    if (!btn) return;
    const name = bookLabel();
    btn.textContent = name ? (name + ' ' + chapter + ':' + verse) : '—';
  }

  function applyChrome() {
    document.documentElement.lang = currentLang === 'fa' ? 'fa' : 'en';
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-en', currentLang === 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (I18N.en[k] !== undefined) el.textContent = t(k);
    });
    const ver = document.getElementById('mb-version');
    if (ver) ver.textContent = t('version');
    const heading = document.getElementById('bible-heading');
    if (heading && bookId) heading.textContent = bookLabel();
    updateRef();
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
      {id:500,fa:'انجیل یوحنا',en:'John'},{id:690,fa:'نامهٔ یوحنا اوّل',en:'1 John'}
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

  function availableBooks() {
    if (currentLang === 'fa' && manifest && Object.keys(manifest).length) {
      const list = meta.filter(b => manifest[String(b.id)]);
      return list.length ? list : meta;
    }
    return meta;
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
    const merged = { id, name: '', chapters: {} };
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
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildChapterHtml(ch, versesObj) {
    const verses = versesObj || {};
    const vNums = Object.keys(verses).map(Number).sort((a, c) => a - c);
    let html = '<div class="mb-chapter" id="ch-' + ch + '" data-chapter="' + ch + '" data-max-verse="' + (vNums[vNums.length-1]||1) + '">';
    html += '<h2 class="mb-ch-title">' + t('chapterLabel') + ' ' + ch + '</h2>';
    vNums.forEach(n => {
      const key = ch + ':' + n;
      const sel = selected.has(key) ? ' selected' : '';
      html += '<p class="mb-verse' + sel + '" id="v-' + ch + '-' + n + '" data-chapter="' + ch + '" data-verse="' + n + '">' +
        '<span class="mb-vnum">' + n + '</span>' + escapeHtml(verses[String(n)]) + '</p>';
    });
    html += '</div>';
    return html;
  }

  function scrollToRef(ch, vs, smooth) {
    const el = document.getElementById('v-' + ch + '-' + vs) || document.getElementById('ch-' + ch);
    if (!el) return;
    scrollSync = false;
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    document.querySelectorAll('.mb-verse.highlight').forEach(n => n.classList.remove('highlight'));
    const verseEl = document.getElementById('v-' + ch + '-' + vs);
    if (verseEl) {
      verseEl.classList.add('highlight');
      setTimeout(() => verseEl.classList.remove('highlight'), 1800);
    }
    setTimeout(() => { scrollSync = true; }, 450);
  }

  function updateSelectorsFromScroll() {
    if (!scrollSync || loadingBook) return;
    const nodes = document.querySelectorAll('.mb-chapter');
    let current = null;
    const mid = window.scrollY + 130;
    nodes.forEach(n => { if (n.offsetTop <= mid) current = n; });
    if (!current) return;
    const ch = Number(current.getAttribute('data-chapter'));
    if (!ch) return;
    let nearest = 1;
    current.querySelectorAll('.mb-verse').forEach(v => {
      if (v.offsetTop <= mid + 30) nearest = Number(v.getAttribute('data-verse')) || nearest;
    });
    if (ch !== chapter || nearest !== verse) {
      chapter = ch;
      verse = nearest;
      updateRef();
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
    updateRef();
    saveState();
    clearSelection();

    if (forceReload || !box.querySelector('.mb-chapter')) {
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
        const chNums = Object.keys(data.chapters).map(Number).sort((a,c)=>a-c);
        box.innerHTML = chNums.map(ch => buildChapterHtml(ch, data.chapters[String(ch)])).join('');
        if (!chNums.includes(chapter)) chapter = chNums[0] || 1;
        loadingBook = false;
        updateRef();
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
        loadingBook = false;
        updateRef();
        if (chapter === 1) requestAnimationFrame(() => scrollToRef(1, verse, false));
        for (let ch = 2; ch <= max; ch++) {
          await loadEnChapter(bookId, ch);
          const chData = enCache[bookId].chapters[String(ch)];
          if (!chData || document.getElementById('ch-' + ch)) continue;
          box.insertAdjacentHTML('beforeend', buildChapterHtml(ch, chData));
        }
      }
    } catch (e) {
      box.innerHTML = '<p class="bible-loading">' + t('errNet') + '</p>';
      loadingBook = false;
    }
  }

  function clearSelection() {
    selected.clear();
    document.querySelectorAll('.mb-verse.selected').forEach(el => el.classList.remove('selected'));
    const bar = document.getElementById('mb-sel-actions');
    if (bar) bar.classList.add('hidden');
  }

  function copySelected() {
    if (!selected.size) return;
    const lines = [];
    Array.from(selected).sort((a,b) => {
      const [ac,av] = a.split(':').map(Number);
      const [bc,bv] = b.split(':').map(Number);
      return ac - bc || av - bv;
    }).forEach(key => {
      const [c, v] = key.split(':');
      const el = document.getElementById('v-' + c + '-' + v);
      if (el) lines.push(v + '. ' + el.textContent.replace(/^\d+/, '').trim());
    });
    const text = bookLabel() + ' ' + lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('mb-copy');
      if (btn) { const o = btn.textContent; btn.textContent = t('copied'); setTimeout(() => { btn.textContent = o; }, 1200); }
    }).catch(() => {});
  }

  function openSel() {
    const panel = document.getElementById('mb-sel');
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    renderBookGrid();
    showTab('books');
  }
  function closeSel() {
    const panel = document.getElementById('mb-sel');
    if (!panel) return;
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  }
  function showTab(name) {
    document.querySelectorAll('.mb-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === name));
    document.getElementById('mb-books')?.classList.toggle('hidden', name !== 'books');
    document.getElementById('mb-chapters')?.classList.toggle('hidden', name !== 'chapters');
    document.getElementById('mb-verses')?.classList.toggle('hidden', name !== 'verses');
  }

  function renderBookGrid() {
    const grid = document.getElementById('mb-books');
    if (!grid) return;
    const list = availableBooks();
    grid.innerHTML = list.map(b => {
      const active = b.id === bookId ? ' active' : '';
      const label = currentLang === 'fa' ? b.fa : b.en;
      return '<button type="button" class="mb-book-btn' + active + '" data-book="' + b.id + '">' + label + '</button>';
    }).join('');
    grid.querySelectorAll('[data-book]').forEach(btn => {
      btn.addEventListener('click', async () => {
        bookId = Number(btn.getAttribute('data-book'));
        chapter = 1; verse = 1;
        closeSel();
        await renderBook(true);
      });
    });
  }

  async function renderChapterGrid() {
    const grid = document.getElementById('mb-chapters');
    if (!grid) return;
    let max = CHAPTER_COUNTS[bookId] || 1;
    if (currentLang === 'fa' && faCache[bookId]) {
      max = Math.max(...Object.keys(faCache[bookId].chapters).map(Number), 1);
    }
    grid.innerHTML = Array.from({length: max}, (_, i) => {
      const n = i + 1;
      const active = n === chapter ? ' active' : '';
      return '<button type="button" class="mb-num-btn' + active + '" data-ch="' + n + '">' + n + '</button>';
    }).join('');
    grid.querySelectorAll('[data-ch]').forEach(btn => {
      btn.addEventListener('click', () => {
        chapter = Number(btn.getAttribute('data-ch'));
        verse = 1;
        updateRef();
        saveState();
        showTab('verses');
        renderVerseGrid();
        scrollToRef(chapter, verse, true);
      });
    });
  }

  function renderVerseGrid() {
    const grid = document.getElementById('mb-verses');
    if (!grid) return;
    let max = 1;
    if (currentLang === 'fa' && faCache[bookId]) {
      const vs = faCache[bookId].chapters[String(chapter)] || {};
      max = Math.max(...Object.keys(vs).map(Number), 1);
    } else if (enCache[bookId] && enCache[bookId].chapters[String(chapter)]) {
      max = Math.max(...Object.keys(enCache[bookId].chapters[String(chapter)]).map(Number), 1);
    } else {
      max = 30;
    }
    grid.innerHTML = Array.from({length: max}, (_, i) => {
      const n = i + 1;
      const active = n === verse ? ' active' : '';
      return '<button type="button" class="mb-num-btn' + active + '" data-vs="' + n + '">' + n + '</button>';
    }).join('');
    grid.querySelectorAll('[data-vs]').forEach(btn => {
      btn.addEventListener('click', () => {
        verse = Number(btn.getAttribute('data-vs'));
        updateRef();
        saveState();
        closeSel();
        scrollToRef(chapter, verse, true);
      });
    });
  }

  async function shiftChapter(dir) {
    const max = CHAPTER_COUNTS[bookId] || 1;
    let next = chapter + dir;
    if (currentLang === 'fa' && faCache[bookId]) {
      const chs = Object.keys(faCache[bookId].chapters).map(Number).sort((a,c)=>a-c);
      const idx = chs.indexOf(chapter);
      if (idx >= 0) next = chs[idx + dir] || chapter;
      else next = chapter;
    } else {
      if (next < 1) next = 1;
      if (next > max) next = max;
    }
    if (next === chapter) return;
    chapter = next; verse = 1;
    updateRef(); saveState();
    if (currentLang === 'en' && !document.getElementById('ch-' + chapter)) {
      await loadEnChapter(bookId, chapter);
      const chData = enCache[bookId].chapters[String(chapter)];
      if (chData) {
        const box = document.getElementById('bible-verses');
        if (box && !document.getElementById('ch-' + chapter)) {
          box.insertAdjacentHTML('beforeend', buildChapterHtml(chapter, chData));
        }
      }
    }
    scrollToRef(chapter, 1, true);
  }

  function bindVerseGestures() {
    const box = document.getElementById('bible-verses');
    if (!box || box._gesturesBound) return;
    box._gesturesBound = true;
    let pressTimer = null;
    box.addEventListener('click', e => {
      const p = e.target.closest('.mb-verse');
      if (!p) return;
      const ch = Number(p.getAttribute('data-chapter'));
      const vs = Number(p.getAttribute('data-verse'));
      if (!ch || !vs) return;
      chapter = ch; verse = vs; updateRef(); saveState();
      const key = ch + ':' + vs;
      if (selected.has(key)) { selected.delete(key); p.classList.remove('selected'); }
      else { selected.add(key); p.classList.add('selected'); }
      const bar = document.getElementById('mb-sel-actions');
      if (bar) bar.classList.toggle('hidden', selected.size === 0);
    });
    box.addEventListener('touchstart', e => {
      const p = e.target.closest('.mb-verse');
      if (!p) return;
      pressTimer = setTimeout(() => {
        p.click();
      }, 500);
    }, { passive: true });
    box.addEventListener('touchend', () => {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    });
    box.addEventListener('touchmove', () => {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    }, { passive: true });
  }

  function bindSwipe() {
    const reader = document.getElementById('mb-reader');
    if (!reader || reader._swipeBound) return;
    reader._swipeBound = true;
    let startX = 0, startY = 0;
    reader.addEventListener('touchstart', e => {
      if (!e.touches[0]) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    reader.addEventListener('touchend', e => {
      if (!e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      if (currentLang === 'fa') {
        if (dx > 0) shiftChapter(1);
        else shiftChapter(-1);
      } else {
        if (dx < 0) shiftChapter(1);
        else shiftChapter(-1);
      }
    }, { passive: true });
  }

  function initTheme() {
    document.body.classList.toggle('dark', localStorage.getItem(THEME_KEY) === 'dark');
  }

  async function boot() {
    initTheme();
    loadState();
    applyChrome();
    await loadMeta();
    await loadManifest();
    const list = availableBooks();
    const ids = list.map(b => b.id);
    if (bookId == null || !ids.includes(Number(bookId))) {
      bookId = ids.includes(480) ? 480 : (list[0] ? list[0].id : 480);
      chapter = 1;
      verse = 1;
      saveState();
    }
    await renderBook(true);
    bindVerseGestures();
    bindSwipe();

    document.getElementById('mb-ref')?.addEventListener('click', openSel);
    document.getElementById('mb-sel-bg')?.addEventListener('click', closeSel);
    document.getElementById('mb-close')?.addEventListener('click', closeSel);
    document.getElementById('mb-prev')?.addEventListener('click', () => shiftChapter(-1));
    document.getElementById('mb-next')?.addEventListener('click', () => shiftChapter(1));
    document.getElementById('mb-copy')?.addEventListener('click', copySelected);
    document.getElementById('mb-clear')?.addEventListener('click', clearSelection);
    document.querySelectorAll('.mb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.getAttribute('data-tab');
        if (name === 'chapters') renderChapterGrid();
        if (name === 'verses') renderVerseGrid();
        showTab(name);
      });
    });
    document.getElementById('lang-toggle')?.addEventListener('click', async () => {
      currentLang = currentLang === 'fa' ? 'en' : 'fa';
      localStorage.setItem(LANG_KEY, currentLang);
      applyChrome();
      await renderBook(true);
    });
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateSelectorsFromScroll);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
