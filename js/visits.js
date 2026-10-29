/* Site visit counter
 * - +1 once per browser session when a visitor opens the site
 * - NEVER decreases when someone leaves
 * - -1 only when admin logs in successfully (so the admin's own visit is not counted)
 * - After admin login, this browser is marked so future visits from admin are not counted
 */
(function () {
  var COUNT_KEY = 'cog_visitor_count';
  var SESSION_KEY = 'cog_visit_session';
  var SESSION_COUNTED = 'cog_visit_counted_this_session';
  var ADMIN_SKIP = 'cog_admin_skip_visit';
  var ADMIN_UNDO_DONE = 'cog_admin_visit_undone';

  function getLocal() {
    try {
      return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0;
    } catch (e) { return 0; }
  }

  function setLocal(n) {
    n = Math.max(0, parseInt(n, 10) || 0);
    try { localStorage.setItem(COUNT_KEY, String(n)); } catch (e) {}
    return n;
  }

  function isAdminBrowser() {
    try {
      return localStorage.getItem(ADMIN_SKIP) === '1';
    } catch (e) { return false; }
  }

  function hasFirestore() {
    try {
      return typeof firebase !== 'undefined' && firebase.firestore;
    } catch (e) { return false; }
  }

  function cloudGet() {
    if (!hasFirestore()) return Promise.resolve(null);
    return firebase.firestore().collection('site').doc('stats').get()
      .then(function (snap) {
        if (!snap.exists) return null;
        var d = snap.data() || {};
        var v = parseInt(d.visits, 10);
        return isNaN(v) ? null : v;
      })
      .catch(function () { return null; });
  }

  function cloudSet(n) {
    if (!hasFirestore()) return Promise.resolve(false);
    n = Math.max(0, n);
    return firebase.firestore().collection('site').doc('stats').set(
      { visits: n, updatedAt: Date.now() },
      { merge: true }
    ).then(function () { return true; }).catch(function () { return false; });
  }

  window.recordSiteVisit = function recordSiteVisit() {
    try {
      if (isAdminBrowser()) return;
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;

      sessionStorage.setItem(SESSION_KEY, '1');

      var n = getLocal() + 1;
      setLocal(n);
      try { sessionStorage.setItem(SESSION_COUNTED, '1'); } catch (e) {}

      cloudGet().then(function (remote) {
        var next = n;
        if (remote != null) {
          next = Math.max(remote + 1, n);
        }
        setLocal(next);
        return cloudSet(next);
      });
    } catch (e) {}
  };

  window.undoAdminVisit = function undoAdminVisit() {
    try {
      localStorage.setItem(ADMIN_SKIP, '1');

      var alreadyUndone = sessionStorage.getItem(ADMIN_UNDO_DONE) === '1';
      var counted = sessionStorage.getItem(SESSION_COUNTED) === '1';
      if (alreadyUndone || !counted) {
        return getVisitCount();
      }

      sessionStorage.setItem(ADMIN_UNDO_DONE, '1');
      sessionStorage.setItem(SESSION_COUNTED, '0');

      var n = Math.max(0, getLocal() - 1);
      setLocal(n);

      cloudGet().then(function (remote) {
        var next = n;
        if (remote != null) next = Math.max(0, remote - 1);
        next = Math.min(getLocal(), next);
        setLocal(next);
        return cloudSet(next);
      });

      return getVisitCount();
    } catch (e) {
      return getVisitCount();
    }
  };

  window.getVisitCount = function getVisitCount() {
    return getLocal();
  };

  window.refreshAdminVisitorDisplay = function refreshAdminVisitorDisplay() {
    var el = document.getElementById('admin-visitor-count');
    if (!el) return;
    el.textContent = getLocal().toLocaleString();
    cloudGet().then(function (remote) {
      if (remote == null) return;
      var local = getLocal();
      var show = Math.max(local, remote);
      if (show !== local) setLocal(show);
      el.textContent = show.toLocaleString();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    var path = (location.pathname || '').toLowerCase();
    var isAdminPage = path.indexOf('admin') >= 0;
    if (!isAdminPage) {
      window.recordSiteVisit();
    }
  });
})();
