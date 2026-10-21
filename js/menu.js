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
    Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = map[id]; });
    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) themeLabel.textContent = L.theme;
  }
  window.updateSideMenuLang = refreshMenuLabels;
  function initSideMenu() {
    if (document.getElementById('menu-toggle')) return;
    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;
    const L = labels();
    let actions = headerInner.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      headerInner.insertBefore(actions, headerInner.firstChild);
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'menu-toggle';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
    actions.insertBefore(toggle, actions.firstChild);
    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.className = 'menu-overlay';
    overlay.hidden = true;
    const panel = document.createElement('aside');
    panel.id = 'side-menu';
    panel.className = 'side-menu';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="side-menu-head"><span>' + L.title + '</span>' +
      '<button type="button" id="menu-close" class="menu-close" aria-label="Close">&times;</button></div>' +
      '<nav class="side-menu-nav">' +
      '<a href="questions.html" id="menu-link-questions">' + L.questions + '</a>' +
      '<a href="feedback.html" id="menu-link-feedback">' + L.feedback + '</a>' +
      '<a href="admin.html" id="menu-link-admin">' + L.admin + '</a>' +
      '<a href="playlists.html" id="menu-link-playlists">' + L.playlists + '</a>' +
      '<button type="button" id="theme-toggle" class="side-menu-btn">' +
      '<span id="theme-icon">🌙</span> <span id="theme-label">' + L.theme + '</span></button>' +
      '<hr class="side-menu-hr">' +
      '<a href="subscribe.html" id="menu-link-subscribe">' + L.subscribe + '</a>' +
      '<a href="contact.html" id="menu-link-contact">' + L.contact + '</a>' +
      '<a href="sponsors.html" id="menu-link-sponsors">' + L.sponsors + '</a>' +
      '</nav>';
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    function openMenu() {
      panel.classList.add('open');
      overlay.hidden = false;
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }
    function closeMenu() {
      panel.classList.remove('open');
      overlay.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
    toggle.addEventListener('click', openMenu);
    document.getElementById('menu-close').addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    var saved = localStorage.getItem(THEME_KEY) || 'light';
    applyThemeIcon(saved);
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var next = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyThemeIcon(next);
    });
    refreshMenuLabels();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSideMenu);
  else initSideMenu();
})();

/* Auto-load ads + perf */
(function loadAdsAssets() {
  if (!document.querySelector('link[href*="ads.css"]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/ads.css';
    document.head.appendChild(l);
  }
  if (!document.querySelector('script[src*="ads.js"]')) {
    var s = document.createElement('script');
    s.src = 'js/ads.js';
    s.defer = true;
    document.body.appendChild(s);
  }
  if (!document.querySelector('script[src*="perf.js"]')) {
    var p = document.createElement('script');
    p.src = 'js/perf.js';
    p.defer = true;
    document.body.appendChild(p);
  }
})();
