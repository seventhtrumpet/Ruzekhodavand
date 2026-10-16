/* Fill gaps if app_core was truncated */
if (typeof applyLanguage !== 'function') {
  function applyLanguage() {
    document.body.classList.toggle('lang-en', currentLang === 'en');
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    const t = (typeof T !== 'undefined' && T[currentLang]) ? T[currentLang] : {};
    if (t.pageTitle) document.title = t.pageTitle;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.placeholder = t[key];
    });
    if (typeof updateLiveBadge === 'function') updateLiveBadge();
    if (typeof updateAuthUI === 'function') updateAuthUI();
    if (typeof window.updateSideMenuLang === 'function') window.updateSideMenuLang();
    if (typeof applySignInLabels === 'function') applySignInLabels();
  }
  window.applyLanguage = applyLanguage;
}
if (typeof toggleLanguage !== 'function') {
  function toggleLanguage() {
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    localStorage.setItem(typeof LANG_KEY !== 'undefined' ? LANG_KEY : 'cog_lang', currentLang);
    applyLanguage();
    if (typeof renderMedia === 'function') renderMedia();
  }
  window.toggleLanguage = toggleLanguage;
}
if (typeof renderAll !== 'function') {
  window.renderAll = function () {
    if (typeof renderMedia === 'function') renderMedia();
    if (typeof renderLive === 'function') renderLive();
    if (typeof updateLiveBadge === 'function') updateLiveBadge();
  };
}
if (typeof setupEventListeners !== 'function') {
  window.setupEventListeners = function () {
    document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);
    document.getElementById('filter-book')?.addEventListener('change', function () { if (typeof renderMedia === 'function') renderMedia(); });
    document.getElementById('filter-type')?.addEventListener('change', function () { if (typeof renderMedia === 'function') renderMedia(); });
    document.getElementById('filter-search')?.addEventListener('input', function () { if (typeof renderMedia === 'function') renderMedia(); });
  };
}
if (typeof escapeHtml !== 'function') {
  window.escapeHtml = function (str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };
}
