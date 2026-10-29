/* Cross-device media sync via Firestore */
(function () {
  const POSTS_KEY = 'cog_posts_v1';
  const PL_KEY = 'cog_playlists_v1';
  const LIVE_KEY = 'cog_live_v1';
  const SYNC_META = 'cog_cloud_sync_at';
  var pushTimer = null;
  var pulling = false;

  function hasFirestore() {
    try {
      return typeof firebase !== 'undefined' && firebase.firestore;
    } catch (e) { return false; }
  }

  function stripHeavy(list) {
    return (list || []).map(function (p) {
      if (!p || typeof p !== 'object') return p;
      var o = {};
      Object.keys(p).forEach(function (k) {
        if (k === 'dataUrl' && typeof p[k] === 'string' && p[k].length > 50000) return;
        o[k] = p[k];
      });
      return o;
    });
  }

  function scheduleCloudPush() {
    if (!hasFirestore()) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { window.pushMediaToCloud(); }, 1200);
  }

  window.pushMediaToCloud = function pushToCloud() {
    if (!hasFirestore()) return Promise.resolve(false);
    var posts = [];
    var playlists = [];
    var live = {};
    try { posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); } catch (e) {}
    try { playlists = JSON.parse(localStorage.getItem(PL_KEY) || '[]'); } catch (e) {}
    try { live = JSON.parse(localStorage.getItem(LIVE_KEY) || '{}'); } catch (e) {}
    var payload = {
      posts: stripHeavy(posts),
      playlists: playlists,
      live: live,
      updatedAt: Date.now()
    };
    return firebase.firestore().collection('site').doc('media').set(payload)
      .then(function () {
        localStorage.setItem(SYNC_META, String(payload.updatedAt));
        console.log('[cloud] pushed', payload.posts.length, 'posts');
        return true;
      })
      .catch(function (err) {
        console.warn('[cloud] push failed', err && err.message);
        return false;
      });
  };

  window.pullMediaFromCloud = function pullFromCloud() {
    if (!hasFirestore() || pulling) return Promise.resolve(null);
    pulling = true;
    return firebase.firestore().collection('site').doc('media').get()
      .then(function (snap) {
        pulling = false;
        if (!snap.exists) return null;
        var data = snap.data() || {};
        var remoteAt = data.updatedAt || 0;
        var localAt = parseInt(localStorage.getItem(SYNC_META) || '0', 10) || 0;
        var localPosts = [];
        try { localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); } catch (e) {}
        var remotePosts = Array.isArray(data.posts) ? data.posts : [];
        var useCloud = remotePosts.length > localPosts.length || remoteAt > localAt;
        if (!useCloud && remotePosts.length === 0) return null;
        if (useCloud || (remotePosts.length && !localPosts.length)) {
          var byId = {};
          localPosts.forEach(function (p) { if (p && p.id) byId[p.id] = p; });
          remotePosts.forEach(function (p) {
            if (!p || !p.id) return;
            var loc = byId[p.id];
            if (loc && loc.dataUrl && !p.dataUrl) p.dataUrl = loc.dataUrl;
            byId[p.id] = p;
          });
          var merged = Object.keys(byId).map(function (k) { return byId[k]; });
          merged.sort(function (a, b) {
            return new Date(b.date || b.created || 0) - new Date(a.date || a.created || 0);
          });
          localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
          if (Array.isArray(data.playlists)) {
            localStorage.setItem(PL_KEY, JSON.stringify(data.playlists));
          }
          if (data.live && typeof data.live === 'object') {
            localStorage.setItem(LIVE_KEY, JSON.stringify(data.live));
          }
          localStorage.setItem(SYNC_META, String(remoteAt || Date.now()));
          console.log('[cloud] pulled', merged.length, 'posts');
          return merged;
        }
        return null;
      })
      .catch(function (err) {
        pulling = false;
        console.warn('[cloud] pull failed', err && err.message);
        return null;
      });
  };

  try {
    var _setItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      _setItem(key, value);
      if (key === POSTS_KEY || key === PL_KEY || key === LIVE_KEY) {
        scheduleCloudPush();
      }
    };
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', function () {
    if (!hasFirestore()) return;
    var path = (location.pathname || '').toLowerCase();
    var isAdmin = path.indexOf('admin') >= 0;
    window.pullMediaFromCloud().then(function (merged) {
      if (!merged) return;
      try { if (typeof posts !== 'undefined') posts = merged; } catch (e) {}
      try { window.posts = merged; } catch (e) {}
      if (typeof window.renderMedia === 'function') {
        try { window.renderMedia(); } catch (e) {}
      }
      if (typeof window.renderPlaylistsPublic === 'function') {
        try { window.renderPlaylistsPublic(); } catch (e) {}
      }
      if (typeof window.renderAll === 'function' && !isAdmin) {
        try { window.renderAll(); } catch (e) {}
      }
      try {
        window.dispatchEvent(new CustomEvent('cog-posts-updated', { detail: { posts: merged } }));
      } catch (e) {}
    });
  });
})();
