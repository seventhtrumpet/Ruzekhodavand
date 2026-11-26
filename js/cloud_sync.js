/* Cross-device media sync via Firestore — public read required on site/media */
(function () {
  var POSTS_KEY = 'cog_posts_v1';
  var PL_KEY = 'cog_playlists_v1';
  var LIVE_KEY = 'cog_live_v1';
  var SYNC_META = 'cog_cloud_sync_at';
  var STATIC_URLS = ['/data/media-posts.json', 'data/media-posts.json'];
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
      localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
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

  function loadStaticPosts() {
    var chain = Promise.resolve(null);
    STATIC_URLS.forEach(function (url) {
      chain = chain.then(function (prev) {
        if (prev && prev.length) return prev;
        return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now())
          .then(function (r) {
            if (!r.ok) return null;
            return r.json();
          })
          .then(function (data) {
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.posts)) return data.posts;
            return null;
          })
          .catch(function () {
            return null;
          });
      });
    });
    return chain;
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
        console.log('[cloud] pushed', payload.posts.length, 'posts');
        try {
          localStorage.setItem(SYNC_META, String(Date.now()));
        } catch (e) {}
        return true;
      })
      .catch(function (err) {
        console.warn('[cloud] push failed', err && (err.code || err.message));
        return false;
      });
  };

  window.pullMediaFromCloud = function pullFromCloud() {
    if (pulling) return Promise.resolve(null);
    pulling = true;

    var localPosts = [];
    try {
      localPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    } catch (e) {}
    var localAt = 0;
    try {
      localAt = Number(localStorage.getItem(SYNC_META) || 0) || 0;
    } catch (e) {}

    function finish(merged) {
      pulling = false;
      return merged;
    }

    function mergeRemote(remotePosts, remoteAt) {
      remotePosts = remotePosts || [];
      remoteAt = remoteAt || 0;
      var useCloud =
        remotePosts.length > 0 &&
        (localPosts.length === 0 ||
          remoteAt >= localAt ||
          remotePosts.length >= localPosts.length);
      if (!useCloud) return null;

      var byId = {};
      remotePosts.forEach(function (p) {
        if (p && p.id) byId[p.id] = p;
      });
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
      try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(merged));
        localStorage.setItem(SYNC_META, String(Math.max(remoteAt, Date.now())));
      } catch (e) {}
      console.log('[cloud] pulled', merged.length, 'posts');
      return merged;
    }

    if (!hasFirestore()) {
      return loadStaticPosts()
        .then(function (staticPosts) {
          if (staticPosts && staticPosts.length) {
            return finish(mergeRemote(staticPosts, Date.now()));
          }
          return finish(null);
        })
        .catch(function () {
          return finish(null);
        });
    }

    return firebase
      .firestore()
      .collection('site')
      .doc('media')
      .get()
      .then(function (snap) {
        if (!snap.exists) {
          console.warn('[cloud] site/media missing — try static fallback');
          return loadStaticPosts().then(function (staticPosts) {
            return finish(staticPosts && staticPosts.length ? mergeRemote(staticPosts, Date.now()) : null);
          });
        }
        var data = snap.data() || {};
        var remotePosts = Array.isArray(data.posts) ? data.posts : [];
        var remoteAt = Number(data.updatedAt || 0) || 0;
        if (Array.isArray(data.playlists)) {
          try {
            localStorage.setItem(PL_KEY, JSON.stringify(data.playlists));
          } catch (e) {}
        }
        if (data.live && typeof data.live === 'object') {
          try {
            localStorage.setItem(LIVE_KEY, JSON.stringify(data.live));
          } catch (e) {}
        }
        return finish(mergeRemote(remotePosts, remoteAt));
      })
      .catch(function (err) {
        console.warn('[cloud] pull failed', err && (err.code || err.message));
        window.__stCloudMediaError = (err && (err.code || err.message)) || 'permission-denied';
        return loadStaticPosts().then(function (staticPosts) {
          if (staticPosts && staticPosts.length) {
            return finish(mergeRemote(staticPosts, Date.now()));
          }
          return finish(null);
        });
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
    if (!hasFirestore() && attempt < 8) {
      setTimeout(function () {
        tryPull(attempt + 1);
      }, 400);
      return;
    }
    window.pullMediaFromCloud().then(function (merged) {
      if (merged) applyPosts(merged);
    });
  }

  function boot() {
    tryPull(0);
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
