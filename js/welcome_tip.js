/* First-visit welcome: 3 clear paths — easy for new users */
(function () {
  var KEY = 'cog_welcome_seen_v1';
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}

  var path = (location.pathname || '').toLowerCase();
  var isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path === '' ||
    (document.body && document.body.getAttribute('data-page') === 'home');
  if (!isHome) return;

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function show() {
    if (document.getElementById('welcome-tip')) return;
    var en = isEn();
    var st = document.createElement('style');
    st.id = 'welcome-tip-css';
    st.textContent =
      '.welcome-tip{position:fixed;inset:0;z-index:4000;display:flex;align-items:flex-end;justify-content:center;padding:1rem;background:rgba(8,16,28,0.45)}' +
      '.welcome-card{width:100%;max-width:400px;background:#fff;border-radius:16px 16px 12px 12px;padding:1.25rem 1.1rem 1.1rem;box-shadow:0 -8px 32px rgba(0,0,0,0.25)}' +
      'body.dark .welcome-card{background:#152536;color:#e8eef5}' +
      '.welcome-title{font-weight:800;font-size:1.1rem;margin:0 0 0.85rem;color:var(--primary,#0a2540);text-align:center}' +
      'body.dark .welcome-title{color:#9ec5ea}' +
      '.welcome-actions{display:flex;flex-direction:column;gap:0.5rem}' +
      '.welcome-actions a{display:block;text-align:center;padding:0.85rem 1rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem}' +
      '.welcome-actions a.w-bible{background:#c9a227;color:#0a2540}' +
      '.welcome-actions a.w-angels{background:#0a2540;color:#fff}' +
      '.welcome-actions a.w-media{background:#f0f2f5;color:#0a2540}' +
      'body.dark .welcome-actions a.w-media{background:#1a2b3c;color:#e8eef5}' +
      '.welcome-close{display:block;width:100%;margin-top:0.75rem;border:none;background:transparent;color:#6b7785;font-weight:600;font-size:0.9rem;padding:0.5rem;cursor:pointer;font-family:inherit}';
    document.head.appendChild(st);

    var tip = document.createElement('div');
    tip.id = 'welcome-tip';
    tip.className = 'welcome-tip';
    tip.innerHTML =
      '<div class="welcome-card" role="dialog" aria-label="Welcome">' +
      '<p class="welcome-title">' + (en ? 'Welcome! Start here:' : '\u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f! \u0627\u0632 \u0627\u06cc\u0646\u062c\u0627 \u0634\u0631\u0648\u0639 \u06a9\u0646\u06cc\u062f:') + '</p>' +
      '<div class="welcome-actions">' +
      '<a class="w-bible" href="bible.html">' + (en ? 'Read the Bible' : '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633 \u0631\u0627 \u0628\u062e\u0648\u0627\u0646\u06cc\u062f') + '</a>' +
      '<a class="w-angels" href="angel.html?n=1">' + (en ? 'Three Angels message' : '\u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647') + '</a>' +
      '<a class="w-media" href="media.html">' + (en ? 'Videos & audio' : '\u0648\u06cc\u062f\u06cc\u0648 \u0648 \u0635\u062f\u0627') + '</a>' +
      '</div>' +
      '<button type="button" class="welcome-close" id="welcome-close">' + (en ? 'OK' : '\u0628\u0627\u0634\u062f') + '</button>' +
      '</div>';
    document.body.appendChild(tip);

    function dismiss() {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      tip.remove();
    }
    document.getElementById('welcome-close').addEventListener('click', dismiss);
    tip.addEventListener('click', function (e) {
      if (e.target === tip) dismiss();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(show, 600); });
  else setTimeout(show, 600);
})();
