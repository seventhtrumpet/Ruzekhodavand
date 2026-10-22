/* Seventh Trumpet — side menu (page links + theme) */
(function () {
  const THEME_KEY = 'cog_theme';
  function getLang() {
    return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
  }
  function labels() {
    const fa = getLang() === 'fa';
    return {
      title: fa ? 'شیپور هفتم' : 'Seventh Trumpet',
      questions: fa ? 'سوالات' : 'Questions',
      feedback: fa ? 'بازخورد' : 'Feedback',
      admin: fa ? 'مدیریت' : 'Admin',
      theme: fa ? 'حالت شب / روز' : 'Dark / Light mode',
      playlists: fa ? 'پلی‌لیست‌ها' : 'Playlists',
      subscribe: fa ? 'آیه روزانه' : 'Daily verse',
      contact: fa ? 'تماس' : 'Contact',
      sponsors: fa ? 'حامیان' : 'Sponsors'
    };
  }
  function applyThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    const btn = document.getElementById('theme-toggle');
    const emoji = theme === 'dark' ? '☀️' : '🌙';
    if (icon) icon.textContent = emoji;
    if (btn && btn.tagName === 'BUTTON' && !btn.querySelector('#theme-icon')) btn.textContent = emoji;
    document.body.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }
  function refreshMenuLabels() {
    const L = labels();
    const head = document.querySelector('.side-menu-head span');
    if (head) head.textContent = L.title;
    const map = {
      'menu-link-questions': L.questions,
      'menu-link-feedback': L.feedback,
      'menu-link-admin': L.admin,
      'menu-link-playlists': L.playlists,
      'menu-link-subscribe': L.subscribe,
      'menu-link-contact': L.contact,
      'menu-link-sponsors': L.sponsors
    };
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) themeLabel.textContent = L.theme;
  }
  function ensureMenu() {
    if (document.getElementById('side-menu')) return;
    const L = labels();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'menu-toggle';
    btn.className = 'menu-toggle';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
    document.body.appendChild(btn);

    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.id = 'side-menu';
    panel.className = 'side-menu';
    panel.innerHTML =
      '<div class="side-menu-head"><span>' + L.title + '</span><button type="button" id="menu-close" aria-label="Close">&times;</button></div>' +
      '<nav class="side-menu-nav">' +
      '<a id="menu-link-playlists" href="playlists.html">' + L.playlists + '</a>' +
      '<a id="menu-link-questions" href="questions.html">' + L.questions + '</a>' +
      '<a id="menu-link-feedback" href="feedback.html">' + L.feedback + '</a>' +
      '<a id="menu-link-subscribe" href="index.html#daily-verse">' + L.subscribe + '</a>' +
      '<a id="menu-link-contact" href="contact.html">' + L.contact + '</a>' +
      '<a id="menu-link-sponsors" href="sponsors.html">' + L.sponsors + '</a>' +
      '<a id="menu-link-admin" href="admin.html">' + L.admin + '</a>' +
      '<button type="button" id="theme-toggle" class="theme-toggle-btn"><span id="theme-icon">🌙</span> <span id="theme-label">' + L.theme + '</span></button>' +
      '</nav>';
    document.body.appendChild(panel);

    function openMenu() {
      panel.classList.add('open');
      overlay.classList.add('open');
      document.body.classList.add('menu-open');
    }
    function closeMenu() {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      document.body.classList.remove('menu-open');
    }
    btn.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
    document.getElementById('menu-close').addEventListener('click', closeMenu);
    document.getElementById('theme-toggle').addEventListener('click', function () {
      const next = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyThemeIcon(next);
    });
  }

  function boot() {
    try {
      const saved = localStorage.getItem(THEME_KEY) || 'light';
      applyThemeIcon(saved);
    } catch (e) {}
    ensureMenu();
    refreshMenuLabels();
    document.getElementById('lang-toggle')?.addEventListener('click', function () {
      setTimeout(refreshMenuLabels, 80);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Load ads helper if present
  try {
    if (!document.querySelector('script[data-ads-js]')) {
      var ads = document.createElement('script');
      ads.src = 'js/ads.js';
      ads.setAttribute('data-ads-js', '1');
      ads.async = true;
      document.body.appendChild(ads);
    }
  } catch (e) {}

  // Load social icons + styles site-wide
  (function loadSocial() {
    if (!document.querySelector('link[data-social-css]')) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/social.css';
      l.setAttribute('data-social-css', '1');
      document.head.appendChild(l);
    }
    if (!document.querySelector('script[data-social-js]')) {
      var s = document.createElement('script');
      s.src = 'js/social.js';
      s.setAttribute('data-social-js', '1');
      document.body.appendChild(s);
    }
  })();
})();
