/* Language + missing core helpers */
function applyLanguage() {
  var lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : (localStorage.getItem('cog_lang') || 'fa');
  if (lang !== 'fa' && lang !== 'en') lang = 'fa';
  try { currentLang = lang; } catch (e) {}
  document.body.classList.toggle('lang-en', lang === 'en');
  document.body.classList.toggle('lang-fa', lang === 'fa');
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  var t = (typeof T !== 'undefined' && T[lang]) ? T[lang] : {};
  if (t.pageTitle) document.title = t.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (key && t[key] != null && t[key] !== '') el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key && t[key] != null) el.placeholder = t[key];
  });
  document.querySelectorAll('[data-lang-only]').forEach(function (el) {
    var only = el.getAttribute('data-lang-only');
    el.style.display = (only === lang) ? '' : 'none';
  });
  if (typeof updateLiveBadge === 'function') try { updateLiveBadge(); } catch (e) {}
  if (typeof updateAuthUI === 'function') try { updateAuthUI(); } catch (e) {}
  if (typeof window.updateSideMenuLang === 'function') try { window.updateSideMenuLang(); } catch (e) {}
  if (typeof applySignInLabels === 'function') try { applySignInLabels(); } catch (e) {}
  try {
    window.dispatchEvent(new CustomEvent('cog-lang-changed', { detail: { lang: lang } }));
  } catch (e) {}
}
window.applyLanguage = applyLanguage;

function toggleLanguage() {
  var lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : (localStorage.getItem('cog_lang') || 'fa');
  currentLang = lang === 'fa' ? 'en' : 'fa';
  try { localStorage.setItem(typeof LANG_KEY !== 'undefined' ? LANG_KEY : 'cog_lang', currentLang); } catch (e) {}
  applyLanguage();
  if (typeof renderMedia === 'function') try { renderMedia(); } catch (e) {}
  if (typeof renderAll === 'function') try { renderAll(); } catch (e) {}
}
window.toggleLanguage = toggleLanguage;

if (typeof renderAll !== 'function') {
  window.renderAll = function () {
    if (typeof renderMedia === 'function') renderMedia();
    if (typeof renderLive === 'function') renderLive();
    if (typeof updateLiveBadge === 'function') updateLiveBadge();
  };
}
if (typeof setupEventListeners !== 'function') {
  window.setupEventListeners = function () {
    var btn = document.getElementById('lang-toggle');
    if (btn && !btn._langBound) {
      btn._langBound = true;
      btn.addEventListener('click', toggleLanguage);
    }
    document.getElementById('filter-book')?.addEventListener('change', function () { if (typeof renderMedia === 'function') renderMedia(); });
    document.getElementById('filter-type')?.addEventListener('change', function () { if (typeof renderMedia === 'function') renderMedia(); });
    document.getElementById('filter-search')?.addEventListener('input', function () { if (typeof renderMedia === 'function') renderMedia(); });
  };
} else {
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('lang-toggle');
    if (btn && !btn._langBound) {
      btn._langBound = true;
      btn.addEventListener('click', function () {
        if (typeof toggleLanguage === 'function') toggleLanguage();
      });
    }
  });
}
if (typeof escapeHtml !== 'function') {
  window.escapeHtml = function (str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };
}
