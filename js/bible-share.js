/* Share: open picture first (not text-only link) */
(function () {
  var SITE = 'https://seventhtrumpet.org';
  var SOCIAL = {
    whatsapp: 'https://wa.me/442081333076',
    instagram: 'https://www.instagram.com/seventhtrumpet.media',
    facebook: 'https://www.facebook.com/share/1Ev7nyyXVu/',
    tiktok: 'https://www.tiktok.com/@seventhtrumpet.me',
    youtube: 'https://youtube.com/@seventhtrumpetmedia'
  };

  function isEn() {
    try { return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en'; }
    catch (e) { return false; }
  }

  function getParams() {
    try {
      var p = new URLSearchParams(location.search);
      var b = p.get('b') || p.get('book');
      var c = p.get('c') || p.get('chapter');
      var v = p.get('v') || p.get('verse');
      if (b && c) {
        var verse = 1;
        if (v) { var m = String(v).match(/^(\d+)/); if (m) verse = Number(m[1]); }
        return { bookId: Number(b), chapter: Number(c), verse: verse };
      }
    } catch (e) {}
    return null;
  }

  function sharePageUrl() {
    var params = getParams();
    if (!params) {
      try {
        var st = JSON.parse(localStorage.getItem('cog_bible_state') || '{}');
        if (st && st.bookId && st.chapter) params = { bookId: st.bookId, chapter: st.chapter, verse: st.verse || 1 };
      } catch (e) {}
    }
    if (params && params.bookId) {
      return SITE + '/bible.html?b=' + params.bookId + '&c=' + (params.chapter || 1) + '&v=' + (params.verse || 1);
    }
    return SITE + '/?from=share';
  }

  function applyDeepLink() {
    var params = getParams();
    if (!params) return;
    try { localStorage.setItem('cog_bible_state', JSON.stringify(params)); } catch (e) {}
    var tries = 0;
    function tryScroll() {
      tries++;
      var el = document.getElementById('v-' + params.chapter + '-' + params.verse);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(function () { el.classList.remove('highlight'); }, 2500);
        return;
      }
      if (tries < 40) setTimeout(tryScroll, 250);
    }
    setTimeout(tryScroll, 700);
  }

  function versePayload() {
    var text = (document.getElementById('verse-text') || {}).textContent || '';
    var ref = (document.getElementById('verse-ref') || {}).textContent || '';
    var selected = document.querySelectorAll('.mb-verse.selected');
    if (selected.length) {
      var lines = [];
      selected.forEach(function (el) { lines.push((el.textContent || '').trim()); });
      text = lines.join('\n');
      var first = selected[0];
      ref = (first.getAttribute('data-chapter') || '') + ':' + (first.getAttribute('data-verse') || '');
    }
    return { text: text, ref: ref };
  }

  function openPictureShare() {
    var p = versePayload();
    if (typeof window.ST_shareBeautifulCard === 'function') {
      window.ST_shareBeautifulCard({
        title: isEn() ? 'Seventh Trumpet' : '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
        body: p.text,
        ref: p.ref,
        url: sharePageUrl(),
        filename: 'seventh-trumpet-verse.png'
      });
    } else {
      alert(isEn() ? 'Please wait a second and try again' : '\u0644\u0637\u0641\u0627 \u06cc\u06a9 \u0644\u062d\u0638\u0647 \u0635\u0628\u0631 \u06a9\u0646\u06cc\u062f \u0648 \u062f\u0648\u0628\u0627\u0631\u0647 \u062a\u0645\u0627\u0633 \u06a9\u0646\u06cc\u062f');
    }
  }

  function setLabels() {
    var en = isEn();
    var share = document.getElementById('mb-share');
    var daily = document.getElementById('daily-share');
    if (share) share.textContent = en ? 'Share picture' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633';
    if (daily) daily.textContent = en ? 'Share picture' : '\u0627\u0634\u062a\u0631\u0627\u06a9 \u0639\u06a9\u0633';
  }

  function initDailyShare() {
    var section = document.getElementById('daily-verse');
    if (!section) return;
    var btn = document.getElementById('daily-share');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'daily-share';
      btn.className = 'verse-refresh';
      btn.style.marginInlineStart = '0.5rem';
      var refresh = document.getElementById('verse-refresh');
      if (refresh && refresh.parentNode) refresh.parentNode.insertBefore(btn, refresh.nextSibling);
      else {
        var inner = section.querySelector('.daily-verse-inner');
        if (inner) inner.appendChild(btn);
      }
    }
    btn.onclick = function (e) { e.preventDefault(); openPictureShare(); };
    setLabels();
  }

  function bindBibleShare() {
    var btn = document.getElementById('mb-share');
    if (!btn || btn._picBound) return;
    btn._picBound = true;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openPictureShare();
    });
  }

  function bindVerseTap() {
    var textEl = document.getElementById('verse-text');
    if (!textEl || textEl._picBound) return;
    textEl._picBound = true;
    textEl.style.cursor = 'pointer';
    textEl.addEventListener('click', openPictureShare);
  }

  function boot() {
    applyDeepLink();
    initDailyShare();
    bindBibleShare();
    bindVerseTap();
    setLabels();
    setTimeout(bindBibleShare, 500);
    setTimeout(bindBibleShare, 1500);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(setLabels, 150); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
