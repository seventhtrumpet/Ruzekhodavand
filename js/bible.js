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
    return String(s).replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
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
          if (ch === chapter) scrollToRef(chapter, verse, false);
        }
      }
    } catch (e) {
      box.innerHTML = '<p class="bible-loading">' + t('errNet') + '</p>';
      loadingBook = false;
    }
  }

  function showTab(name) {
    document.querySelectorAll('.mb-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === name);
    });
    document.getElementById('mb-books').classList.toggle('hidden', name !== 'books');
    document.getElementById('mb-chapters').classList.toggle('hidden', name !== 'chapters');
    document.getElementById('mb-verses').classList.toggle('hidden', name !== 'verses');
  }

  function renderBookGrid() {
    const box = document.getElementById('mb-books');
    if (!box) return;
    const list = availableBooks();
    let html = '';
    let lastGroup = '';
    list.forEach(b => {
      const group = b.id < 470 ? 'ot' : 'nt';
      if (group !== lastGroup) {
        html += '<div class="mb-group">' + t(group) + '</div>';
        lastGroup = group;
      }
      const active = b.id === bookId ? ' active' : '';
      const label = currentLang === 'fa' ? b.fa : b.en;
      html += '<button type="button" class="mb-cell' + active + '" data-book="' + b.id + '">' + label + '</button>';
    });
    box.innerHTML = html;
    box.querySelectorAll('[data-book]').forEach(btn => {
      btn.addEventListener('click', () => {
        bookId = Number(btn.getAttribute('data-book'));
        chapter = 1;
        verse = 1;
        renderBookGrid();
        renderChapterGrid();
        showTab('chapters');
        renderBook(true);
      });
      btn.addEventListener('contextmenu', e => {
        e.preventDefault();
        bookId = Number(btn.getAttribute('data-book'));
        chapter = 1;
        verse = 1;
        closeSel();
        renderBook(true);
      });
    });
  }

  function renderChapterGrid() {
    const box = document.getElementById('mb-chapters');
    if (!box) return;
    const max = CHAPTER_COUNTS[bookId] || 1;
    let html = '';
    for (let i = 1; i <= max; i++) {
      const active = i === chapter ? ' active' : '';
      html += '<button type="button" class="mb-cell' + active + '" data-ch="' + i + '">' + i + '</button>';
    }
    box.innerHTML = html;
    box.querySelectorAll('[data-ch]').forEach(btn => {
      btn.addEventListener('click', () => {
        chapter = Number(btn.getAttribute('data-ch'));
        verse = 1;
        renderChapterGrid();
        renderVerseGrid();
        showTab('verses');
        updateRef();
        saveState();
        scrollToRef(chapter, 1, true);
      });
      btn.addEventListener('contextmenu', e => {
        e.preventDefault();
        chapter = Number(btn.getAttribute('data-ch'));
        verse = 1;
        closeSel();
        updateRef();
        saveState();
        scrollToRef(chapter, 1, true);
      });
    });
  }

  function verseCountForChapter() {
    const block = document.getElementById('ch-' + chapter);
    if (block) return Number(block.getAttribute('data-max-verse') || 1);
    if (currentLang === 'fa' && faCache[bookId]) {
      const vs = faCache[bookId].chapters[String(chapter)] || {};
      const nums = Object.keys(vs).map(Number);
      return nums.length ? Math.max.apply(null, nums) : 1;
    }
    if (enCache[bookId] && enCache[bookId].chapters[String(chapter)]) {
      const vs = enCache[bookId].chapters[String(chapter)];
      const nums = Object.keys(vs).map(Number);
      return nums.length ? Math.max.apply(null, nums) : 1;
    }
    return 30;
  }

  function renderVerseGrid() {
    const box = document.getElementById('mb-verses');
    if (!box) return;
    const max = verseCountForChapter();
    let html = '';
    for (let i = 1; i <= max; i++) {
      const active = i === verse ? ' active' : '';
      html += '<button type="button" class="mb-cell' + active + '" data-vs="' + i + '">' + i + '</button>';
    }
    box.innerHTML = html;
    box.querySelectorAll('[data-vs]').forEach(btn => {
      btn.addEventListener('click', () => {
        verse = Number(btn.getAttribute('data-vs'));
        renderVerseGrid();
        updateRef();
        saveState();
        closeSel();
        scrollToRef(chapter, verse, true);
      });
    });
  }

  function openSel() {
    const el = document.getElementById('mb-sel');
    if (!el) return;
    el.classList.remove('hidden');
    el.setAttribute('aria-hidden', 'false');
    renderBookGrid();
    renderChapterGrid();
    renderVerseGrid();
    showTab('books');
  }
  function closeSel() {
    const el = document.getElementById('mb-sel');
    if (!el) return;
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
  }

  function shiftChapter(dir) {
    const max = CHAPTER_COUNTS[bookId] || 1;
    const next = chapter + dir;
    if (next < 1 || next > max) return;
    chapter = next;
    verse = 1;
    updateRef();
    saveState();
    scrollToRef(chapter, 1, true);
  }

  function clearSelection() {
    selected.clear();
    document.querySelectorAll('.mb-verse.selected').forEach(n => n.classList.remove('selected'));
    const bar = document.getElementById('mb-actions');
    if (bar) bar.classList.add('hidden');
  }

  function refreshSelectionUI() {
    document.querySelectorAll('.mb-verse').forEach(el => {
      const key = el.getAttribute('data-chapter') + ':' + el.getAttribute('data-verse');
      el.classList.toggle('selected', selected.has(key));
    });
    const bar = document.getElementById('mb-actions');
    const label = document.getElementById('mb-sel-label');
    if (!bar) return;
    if (!selected.size) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');
    const keys = Array.from(selected).sort((a,b) => {
      const [c1,v1] = a.split(':').map(Number);
      const [c2,v2] = b.split(':').map(Number);
      return c1 - c2 || v1 - v2;
    });
    if (label) label.textContent = bookLabel() + ' ' + keys.join(', ');
  }

  function toggleVerse(ch, vs) {
    const key = ch + ':' + vs;
    if (selected.has(key)) selected.delete(key);
    else selected.add(key);
    chapter = ch;
    verse = vs;
    updateRef();
    saveState();
    refreshSelectionUI();
  }

  function copySelected() {
    if (!selected.size) return;
    const keys = Array.from(selected).sort((a,b) => {
      const [c1,v1] = a.split(':').map(Number);
      const [c2,v2] = b.split(':').map(Number);
      return c1 - c2 || v1 - v2;
    });
    const lines = keys.map(k => {
      const [c, v] = k.split(':');
      const el = document.getElementById('v-' + c + '-' + v);
      const text = el ? el.textContent.replace(/^\d+\s*/, '').trim() : '';
      return bookLabel() + ' ' + c + ':' + v + ' — ' + text;
    });
    const out = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out).then(() => {
        const label = document.getElementById('mb-sel-label');
        if (label) { label.textContent = t('copied'); setTimeout(refreshSelectionUI, 900); }
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = out;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
    }
  }

  function bindVerseGestures() {
    const box = document.getElementById('bible-verses');
    if (!box || box._mbBound) return;
    box._mbBound = true;
    let pressTimer = null;

    box.addEventListener('click', e => {
      const verseEl = e.target.closest('.mb-verse');
      if (!verseEl) return;
      if (selected.size) {
        toggleVerse(Number(verseEl.getAttribute('data-chapter')), Number(verseEl.getAttribute('data-verse')));
      }
    });

    box.addEventListener('contextmenu', e => {
      const verseEl = e.target.closest('.mb-verse');
      if (!verseEl) return;
      e.preventDefault();
      toggleVerse(Number(verseEl.getAttribute('data-chapter')), Number(verseEl.getAttribute('data-verse')));
    });

    box.addEventListener('touchstart', e => {
      const verseEl = e.target.closest('.mb-verse');
      if (!verseEl) return;
      pressTimer = setTimeout(() => {
        toggleVerse(Number(verseEl.getAttribute('data-chapter')), Number(verseEl.getAttribute('data-verse')));
        pressTimer = null;
      }, 480);
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
    if (bookId == null) {
      const list = availableBooks();
      bookId = list[0] ? list[0].id : 480;
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
