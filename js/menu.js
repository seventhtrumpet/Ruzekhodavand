/* Seventh Trumpet — side menu (secondary links + theme) */
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
      contact: fa ? 'تماس' : 'Contact'
    };
  }

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
      'menu-link-contact': L.contact
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) themeLabel.textContent = L.theme;
  }
  window.updateSideMenuLang = refreshMenuLabels;

  function initSideMenu() {
    if (document.getElementById('menu-toggle')) return;

    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    // Remove theme from main nav — it lives in secondary menu
    const themeInNav = document.querySelector('.nav #theme-toggle, .nav-main #theme-toggle');
    if (themeInNav) themeInNav.remove();

    const langBtn = document.getElementById('lang-toggle');
    const liveBadge = document.getElementById('live-badge');

    let actions = headerInner.querySelector('.header-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      headerInner.appendChild(actions);
    }
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

    const L = labels();
    const panel = document.createElement('aside');
    panel.id = 'side-menu';
    panel.className = 'side-menu';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="side-menu-head"><span>' + L.title + '</span>' +
      '<button type="button" id="menu-close" class="menu-close" aria-label="Close">×</button></div>' +
      '<nav class="side-menu-nav">' +
      '<a href="#questions" id="menu-link-questions" data-menu-link>' + L.questions + '</a>' +
      '<a href="#feedback" id="menu-link-feedback" data-menu-link>' + L.feedback + '</a>' +
      '<a href="admin.html" id="menu-link-admin">' + L.admin + '</a>' +
      '<button type="button" id="theme-toggle" class="side-menu-btn">' +
      '<span id="theme-icon">🌙</span> <span id="theme-label">' + L.theme + '</span></button>' +
      '<hr class="side-menu-hr">' +
      '<a href="#playlists" id="menu-link-playlists" data-menu-link>' + L.playlists + '</a>' +
      '<a href="#subscribe" id="menu-link-subscribe" data-menu-link>' + L.subscribe + '</a>' +
      '<a href="#contact" id="menu-link-contact" data-menu-link>' + L.contact + '</a>' +
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

    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      setTimeout(refreshMenuLabels, 30);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSideMenu);
  else initSideMenu();
})();
