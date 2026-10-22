/* Admin: load Firebase + push after publish + Sync button */
(function () {
  function ensureFirebase() {
    if (window.firebase && firebase.apps && firebase.apps.length) return Promise.resolve();
    return new Promise(function (resolve) {
      // config matches app.js
      var cfg = {
        apiKey: "AIzaSyACmzOLWCtIBboDBTu8IbnjeS9NG-5Z87E",
        authDomain: "lalala-9a4b6.firebaseapp.com",
        projectId: "lalala-9a4b6",
        storageBucket: "lalala-9a4b6.firebasestorage.app",
        messagingSenderId: "304381949568",
        appId: "1:304381949568:web:2178a803c6950d448bd865"
      };
      function init() {
        try {
          if (!firebase.apps.length) firebase.initializeApp(cfg);
        } catch (e) {}
        resolve();
      }
      if (window.firebase) { init(); return; }
      var s1 = document.createElement('script');
      s1.src = 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js';
      s1.onload = function () {
        var s2 = document.createElement('script');
        s2.src = 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore-compat.js';
        s2.onload = init;
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
  }

  function addSyncButton() {
    var backup = document.getElementById('tab-backup');
    if (!backup || document.getElementById('cloud-sync-btn')) return;
    var box = document.createElement('div');
    box.style.cssText = 'margin-top:1.5rem;padding:1rem;background:#e3f2fd;border-radius:10px;border:1px solid #90caf9;';
    box.innerHTML =
      '<p style="margin:0 0 0.6rem;font-weight:600;" data-cloud-note="1">☁️ همگام‌سازی با همه گوشی‌ها / Sync to all phones</p>' +
      '<p style="margin:0 0 0.8rem;font-size:0.85rem;color:#555;">After you publish, click this so other phones can see the videos. YouTube links work on every device.</p>' +
      '<button type="button" id="cloud-sync-btn" class="btn btn-primary">Sync now / همگام‌سازی</button>' +
      '<span id="cloud-sync-status" style="margin-inline-start:0.75rem;font-size:0.9rem;"></span>';
    backup.appendChild(box);
    document.getElementById('cloud-sync-btn').addEventListener('click', function () {
      var st = document.getElementById('cloud-sync-status');
      st.textContent = '…';
      ensureFirebase().then(function () {
        if (typeof window.pushMediaToCloud !== 'function') {
          st.textContent = 'Script missing';
          return;
        }
        return window.pushMediaToCloud().then(function (ok) {
          st.textContent = ok ? '✓ OK' : 'Failed — enable Firestore (see instructions)';
          st.style.color = ok ? '#2e7d32' : '#c62828';
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    addSyncButton();
    ensureFirebase().then(function () {
      // load cloud_sync if needed
      if (typeof window.pushMediaToCloud !== 'function') {
        var s = document.createElement('script');
        s.src = 'js/cloud_sync.js';
        document.body.appendChild(s);
      }
    });
  });
})();
