/* Seventh Trumpet — side menu (hamburger) — secondary links only */
(function () {
  const THEME_KEY = 'cog_theme';

  function applyThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    const btn = document.getElementById('theme-toggle');
    const emoji = theme === 'dark' ? '☀️' : '🌙';
    if (icon) icon.textContent = emoji;
    if (btn && btn.tagName === 'BUTTON' && !btn.querySelector('#theme-icon')) {
      btn.textContent = emoji;
    }
    document.body.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function initSideMenu() {
    if (document.getElementById('menu-toggle')) return;

    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    // Keep main nav visible — only add hamburger next to it
    const langBtn = document.getElementById('lang-toggle');
    const liveBadge = document.getElementById('live-badge');
    const themeBtn = document.getElementById('theme-toggle');

    let actions = headerInner.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      headerInner.appendChild(actions);
    }

    // Move lang + live badge into actions if still in nav (keeps them on the right)
    if (langBtn && langBtn.parentNode && langBtn.parentNode.classList.contains('nav')) {
      actions.appendChild(langBtn);
    }
    if (liveBadge && liveBadge.parentNode && liveBadge.parentNode.classList.contains('nav')) {
      actions.appendChild(liveBadge);
    }

    const toggle = document.createElement('button');
    toggle.id = 'menu-toggle';
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>';
    actions.appendChild(toggle);

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
    // Secondary only — important links stay in the top bar
    panel.innerHTML =
      '<div class="side-menu-head"><span>شیپور هفتم</span>' +
      '<button type="button" id="menu-close" class="menu-close" aria-label="Close">×</button></div>' +
      '<nav class="side-menu-nav">' +
      '<a href="#questions" data-menu-link>سوالات / Questions</a>' +
      '<a href="#feedback" data-menu-link>بازخورد / Feedback</a>' +
      '<a href="admin.html">مدیریت / Admin</a>' +
      '<hr class="side-menu-hr">' +
      '<a href="#playlists" data-menu-link>پلی‌لیست‌ها / Playlists</a>' +
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

    // Theme button in main nav
    if (themeBtn && !themeBtn.dataset.bound) {
      themeBtn.dataset.bound = '1';
      themeBtn.addEventListener('click', () => {
        const next = document.body.classList.contains('dark') ? 'light' : 'dark';
        applyThemeIcon(next);
      });
    }
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || document.body.classList.contains('dark')) applyThemeIcon('dark');
    else applyThemeIcon(saved || 'light');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSideMenu);
  else initSideMenu();
})();
