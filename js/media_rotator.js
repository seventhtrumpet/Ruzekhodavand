/* Home page rotating showcase of posts (video / audio / text / image) — 3s each, random order */
(function () {
  var POSTS_KEY = 'cog_posts_v1';
  var INTERVAL_MS = 3000;
  var card = null;
  var titleEl = null;
  var textEl = null;
  var typeEl = null;
  var mediaEl = null;
  var dotsEl = null;
  var items = [];
  var order = [];
  var idx = 0;
  var timer = null;

  function lang() {
    try {
      return localStorage.getItem('cog_lang') || 'fa';
    } catch (e) {
      return 'fa';
    }
  }

  function pickTitle(p) {
    var L = lang();
    if (L === 'fa') return p.title_fa || p.title_en || p.title || '';
    return p.title_en || p.title_fa || p.title || '';
  }

  function pickText(p) {
    var L = lang();
    var t = '';
    if (L === 'fa') t = p.desc_fa || p.desc_en || p.description || p.text || p.body || '';
    else t = p.desc_en || p.desc_fa || p.description || p.text || p.body || '';
    t = String(t).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length > 160) t = t.slice(0, 157) + '\u2026';
    return t;
  }

  function mediaUrl(p) {
    return (p.externalUrl || p.dataUrl || p.fileUrl || p.url || '').trim();
  }

  function isYouTube(url) {
    return /youtu\.be|youtube\.com/i.test(url || '');
  }

  function ytId(url) {
    if (!url) return null;
    try {
      var u = new URL(url);
      if (u.hostname.indexOf('youtu.be') >= 0) return u.pathname.slice(1).split('/')[0] || null;
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      var parts = u.pathname.split('/').filter(Boolean);
      var i = parts.indexOf('embed');
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
      i = parts.indexOf('shorts');
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
    } catch (e) {}
    return null;
  }

  function isAudio(p, url) {
    if (p.type === 'audio') return true;
    return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(url || '') ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(p.filename || '');
  }

  function isImage(p, url) {
    if (p.type === 'image' || p.type === 'photo') return true;
    return /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url || '') ||
      (url && url.indexOf('data:image') === 0);
  }

  function isVideo(p, url) {
    if (p.type === 'video') return true;
    if (isYouTube(url)) return true;
    return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url || '');
  }

  function typeLabel(kind) {
    var L = lang();
    var map = {
      fa: { video: '\u0648\u06cc\u062f\u06cc\u0648', audio: '\u0635\u0648\u062a', image: '\u0639\u06a9\u0633', text: '\u0645\u062a\u0646', file: '\u0641\u0627\u06cc\u0644' },
      en: { video: 'Video', audio: 'Audio', image: 'Photo', text: 'Text', file: 'File' }
    };
    return (map[L] || map.en)[kind] || kind;
  }

  function typeIcon(kind) {
    return { video: '\u25b6', audio: '\u266a', image: '\ud83d\uddbc', text: '\u2709', file: '\ud83d\udcc4' }[kind] || '\u2022';
  }

  function classify(p) {
    var url = mediaUrl(p);
    if (isVideo(p, url)) return 'video';
    if (isAudio(p, url)) return 'audio';
    if (isImage(p, url)) return 'image';
    if (pickText(p) || p.type === 'text' || p.type === 'writing') return 'text';
    return 'file';
  }

  function loadLocal() {
    try {
      var arr = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function normalize(list) {
    return (list || []).filter(function (p) {
      if (!p) return false;
      return !!(pickTitle(p) || pickText(p) || mediaUrl(p));
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderDots() {
    if (!dotsEl) return;
    if (items.length < 2) {
      dotsEl.innerHTML = '';
      return;
    }
    var n = Math.min(items.length, 8);
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<span class="media-rotator-dot' + (i === (idx % n) ? ' active' : '') + '"></span>';
    }
    dotsEl.innerHTML = html;
  }

  function showItem(p) {
    if (!card || !p) return;
    var kind = classify(p);
    var url = mediaUrl(p);
    var title = pickTitle(p) || typeLabel(kind);
    var text = pickText(p);
    var hasVisual = false;

    card.classList.remove('is-visible');
    setTimeout(function () {
      typeEl.textContent = typeIcon(kind) + ' ' + typeLabel(kind);
      titleEl.textContent = title;
      textEl.textContent = text;
      mediaEl.innerHTML = '';

      if (kind === 'video' && isYouTube(url)) {
        var id = ytId(url);
        if (id) {
          var img = document.createElement('img');
          img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
          img.alt = title;
          img.loading = 'lazy';
          mediaEl.appendChild(img);
          hasVisual = true;
        }
      } else if (kind === 'image' && url && ((!url.startsWith('data:')) || (url.indexOf('data:image') === 0 && url.length < 200000))) {
        var im = document.createElement('img');
        im.src = url;
        im.alt = title;
        im.loading = 'lazy';
        mediaEl.appendChild(im);
        hasVisual = true;
      } else if (kind === 'audio') {
        mediaEl.innerHTML = '<div class="media-rotator-audio-icon" aria-hidden="true">\u266a</div>';
        hasVisual = true;
      } else if (kind === 'text') {
        mediaEl.innerHTML = '<div class="media-rotator-quote" aria-hidden="true">\u201c</div>';
        hasVisual = true;
      }

      // Balanced layout: no empty half
      if (hasVisual) {
        card.classList.remove('no-media');
      } else {
        card.classList.add('no-media');
      }

      card.href = 'media.html';
      card.setAttribute('data-id', p.id || '');
      card.classList.add('is-visible');
      renderDots();
    }, 180);
  }

  function next() {
    if (!items.length) return;
    if (order.length === 0) order = shuffle(items.map(function (_, i) { return i; }));
    idx = order.shift();
    showItem(items[idx]);
  }

  function start() {
    stop();
    if (!items.length) {
      if (card) {
        card.classList.add('is-empty');
        card.classList.add('no-media');
        typeEl.textContent = '';
        titleEl.textContent = lang() === 'fa' ? '\u0647\u0646\u0648\u0632 \u0631\u0633\u0627\u0646\u0647\u200c\u0627\u06cc \u0646\u06cc\u0633\u062a' : 'No media yet';
        textEl.textContent = lang() === 'fa' ? '\u067e\u0633 \u0627\u0632 \u0627\u0646\u062a\u0634\u0627\u0631 \u062f\u0631 \u0627\u062f\u0645\u06cc\u0646\u060c \u0627\u06cc\u0646\u062c\u0627 \u0646\u0645\u0627\u06cc\u0634 \u062f\u0627\u062f\u0647 \u0645\u06cc\u200c\u0634\u0648\u062f.' : 'Posts will appear here after you publish them.';
        mediaEl.innerHTML = '';
        card.classList.add('is-visible');
      }
      return;
    }
    if (card) {
      card.classList.remove('is-empty');
    }
    order = shuffle(items.map(function (_, i) { return i; }));
    next();
    timer = setInterval(next, INTERVAL_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function applyPosts(list) {
    items = normalize(list);
    start();
  }

  function initFromSources() {
    applyPosts(loadLocal());

    function tryCloud() {
      if (typeof window.pullMediaFromCloud === 'function') {
        window.pullMediaFromCloud().then(function () {
          applyPosts(loadLocal());
        }).catch(function () {});
        return;
      }
      try {
        if (window.firebase && firebase.firestore) {
          firebase.firestore().collection('site').doc('media').get().then(function (snap) {
            if (!snap.exists) return;
            var data = snap.data() || {};
            if (Array.isArray(data.posts) && data.posts.length) {
              try {
                localStorage.setItem(POSTS_KEY, JSON.stringify(data.posts));
              } catch (e) {}
              applyPosts(data.posts);
            }
          }).catch(function () {});
        }
      } catch (e) {}
    }
    setTimeout(tryCloud, 600);
    setTimeout(tryCloud, 2000);
  }

  function boot() {
    card = document.getElementById('media-rotator-card');
    titleEl = document.getElementById('media-rotator-title');
    textEl = document.getElementById('media-rotator-text');
    typeEl = document.getElementById('media-rotator-type');
    mediaEl = document.getElementById('media-rotator-media');
    dotsEl = document.getElementById('media-rotator-dots');
    if (!card) return;
    initFromSources();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (items.length) start();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
