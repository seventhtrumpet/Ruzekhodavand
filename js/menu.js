/* Seventh Trumpet — side menu (hamburger) */
(function () {
  const THEME_KEY = 'cog_theme';

  function applyThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    const emoji = theme === 'dark' ? '☀️' : '🌙';
    if (icon) icon.textContent = emoji;
    document.body.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function initSideMenu() {
    if (document.getElementById('menu-toggle')) return;

    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    const oldNav = headerInner.querySelector('.nav');
    const langBtn = document.getElementById('lang-toggle');
    const liveBadge = document.getElementById('live-badge');
    const oldTheme = document.getElementById('theme-toggle');

    const actions = document.createElement('div');
    actions.className = 'header-actions';
    if (langBtn) actions.appendChild(langBtn);
    if (liveBadge) actions.appendChild(liveBadge);

    const toggle = document.createElement('button');
    toggle.id = 'menu-toggle';
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
    actions.appendChild(toggle);
    headerInner.appendChild(actions);
    if (oldNav) oldNav.style.display = 'none';
    if (oldTheme && oldTheme.parentNode) oldTheme.remove();

    if (!document.querySelector('link[href*="menu.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/menu.css';
      document.head.appendChild(link);
    }

    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.className = 'menu-overlay';
    overlay.hidden = true;
    document.body.appendChild(overlay);

    const panel = document.createElement('aside');
    panel.id = 'side-menu';
    panel.className = 'side-menu';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="side-menu-head"><span>شیپور هفتم</span>' +
      '<button type="button" id="menu-close" class="menu-close" aria-label="Close">×</button></div>' +
      '<nav class="side-menu-nav">' +
      '<a href="#media" data-menu-link>رسانه‌ها / Media</a>' +
      '<a href="#questions" data-menu-link>سوالات / Questions</a>' +
      '<a href="#feedback" data-menu-link>بازخورد / Feedback</a>' +
      '<button type="button" id="theme-toggle" class="side-menu-btn">' +
      '<span id="theme-icon">🌙</span> حالت شب / روز</button>' +
      '<a href="admin.html">مدیریت / Admin</a>' +
      '<hr class="side-menu-hr">' +
      '<a href="#home" data-menu-link>خانه / Home</a>' +
      '<a href="bible.html">کتاب مقدس / Bible</a>' +
      '<a href="#playlists" data-menu-link>پلی‌لیست‌ها / Playlists</a>' +
      '<a href="#live" data-menu-link>پخش زنده / Live</a>' +
      '<a href="#subscribe" data-menu-link>آیه روزانه / Daily verse</a>' +
      '<a href="#contact" data-menu-link>تماس / Contact</a>' +
      '</nav>';
    document.body.appendChild(panel);

    function openMenu() {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      overlay.hidden = false;
      document.body.classList.add('menu-open');
    }
    function closeMenu() {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      overlay.hidden = true;
      document.body.classList.remove('menu-open');
    }
    toggle.addEventListener('click', () => panel.classList.contains('open') ? closeMenu() : openMenu());
    document.getElementById('menu-close').addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    panel.querySelectorAll('[data-menu-link]').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyThemeIcon(next);
    });
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || document.body.classList.contains('dark')) applyThemeIcon('dark');
    else applyThemeIcon(saved || 'light');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSideMenu);
  else initSideMenu();
})();
