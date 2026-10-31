/* Cross-device media sync via Firestore — pull aggressively so all phones see posts */
(function () {
  var POSTS_KEY = 'cog_posts_v1';
  var PL_KEY = 'cog_playlists_v1';
  var LIVE_KEY = 'cog_live_v1';
  var SYNC_META = 'cog_cloud_sync_at';
  var pushTimer = null;
  var pulling = false;

  function hasFirestore() {
    try {
      return typeof firebase !== 'undefined' && firebase.firestore;
    } catch (e) {
      return false;
    }
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
    pushTimer = setTimeout(function () {
      window.pushMediaToCloud();
    }, 1200);
  }

  function applyPosts(merged) {
    if (!merged) return;
    try {
      if (typeof posts !== 'undefined') posts = merged;
    } catch (e) {}
    try {
      window.posts = merged;
    } catch (e) {}
    try {
      if (typeof window.renderMedia === 'function') window.renderMedia();
    } catch (e) {}
    try {
      if (typeof window.renderPlaylistsPublic === 'function') window.renderPlaylistsPublic();
    } catch (e) {}
    try {
      if (typeof window.renderAll === 'function') window.renderAll();
    } catch (e) {}
    try {
      if (typeof window.refreshMediaRotator === 'function') window.refreshMediaRotator();
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('cog-posts-updated', { detail: { posts: merged } }));
    } catch (e) {}
  }

  window.pushMediaToCloud = function pushToCloud() {
    if (!hasFirestore()) return Promise.resolve(false);
    var postsList = [];
    var playlists = [];
    var live = {};
    try {
      postsList = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    } catch (e) {}
    try {
      playlists = JSON.parse(localStorage.getItem(PL_KEY) || '[]');
    } catch (e) {}
    try {
      live = JSON.parse(localStorage.getItem(LIVE_KEY) || '{}');
    } catch (e) {}
    var payload = {
      posts: stripHeavy(postsList),
      playlists: playlists,
      live: live,
      updatedAt: Date.now()
    };
    return firebase
      .firestore()
      .collection('site')
      .doc('media')
      .set(payload)
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
    return firebase
      .firestore()
      .collection('site')
      .doc('media')
      .get()
      .then(function (snap) {
        pulling = false;
        if (!snap.exists) return null;
        var data = snap.data() || {};
        var remoteAt = data.updatedAt || 0;
        var localAt = parseInt(localStorage.getItem(SYNC_META) || '0', 10) || 0;
        var localPosts = [];
        try {
          localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
        } catch (e) {}
        var remotePosts = Array.isArray(data.posts) ? data.posts : [];

        // Always take cloud if it has posts and local is empty OR cloud is newer OR cloud has more
        var useCloud =
          remotePosts.length > 0 &&
          (localPosts.length === 0 ||
            remoteAt >= localAt ||
            remotePosts.length >= localPosts.length);

        if (!useCloud) return null;

        var byId = {};
        // Start from remote (source of truth for other phones)
        remotePosts.forEach(function (p) {
          if (p && p.id) byId[p.id] = p;
        });
        // Keep local-only posts (not yet pushed) and local dataUrls
        localPosts.forEach(function (p) {
          if (!p || !p.id) return;
          if (!byId[p.id]) {
            byId[p.id] = p;
          } else if (p.dataUrl && !byId[p.id].dataUrl) {
            byId[p.id].dataUrl = p.dataUrl;
          }
        });

        var merged = Object.keys(byId).map(function (k) {
          return byId[k];
        });
        merged.sort(function (a, b) {
          return (
            new Date(b.date || b.createdAt || b.created || 0) -
            new Date(a.date || a.createdAt || a.created || 0)
          );
        });

        localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
        if (Array.isArray(data.playlists)) {
          localStorage.setItem(PL_KEY, JSON.stringify(data.playlists));
        }
        if (data.live && typeof data.live === 'object') {
          localStorage.setItem(LIVE_KEY, JSON.stringify(data.live));
        }
        localStorage.setItem(SYNC_META, String(Math.max(remoteAt, Date.now())));
        console.log('[cloud] pulled', merged.length, 'posts');
        return merged;
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

  function tryPull(attempt) {
    attempt = attempt || 0;
    if (!hasFirestore()) {
      if (attempt < 15) {
        setTimeout(function () {
          tryPull(attempt + 1);
        }, 400);
      }
      return;
    }
    window.pullMediaFromCloud().then(function (merged) {
      if (merged) applyPosts(merged);
    });
  }

  function boot() {
    tryPull(0);
    // Extra pulls for slow networks / late Firebase init
    setTimeout(function () {
      tryPull(0);
    }, 2500);
    setTimeout(function () {
      tryPull(0);
    }, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
