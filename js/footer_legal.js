/* Add only missing Privacy | Terms | Teachings links to every footer */
(function () {
  function label(key, fa, en) {
    try {
      var lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
      if (typeof T !== 'undefined' && T[lang] && T[lang][key]) return T[lang][key];
      return lang === 'en' ? en : fa;
    } catch (e) { return fa; }
  }
  function enhance() {
    var footers = document.querySelectorAll('footer.footer');
    footers.forEach(function (f) {
      if (f.querySelector('.footer-legal')) return;
      var items = [
        { href: 'privacy.html', key: 'privacyNav', fa: '\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc', en: 'Privacy' },
        { href: 'terms.html', key: 'termsNav', fa: '\u0634\u0631\u0627\u06cc\u0637 \u0627\u0633\u062a\u0641\u0627\u062f\u0647', en: 'Terms' },
        { href: 'teachings.html', key: 'teachingsNav', fa: '\u0622\u0645\u0648\u0632\u0634\u200c\u0647\u0627', en: 'Teachings' },
        { href: 'about.html', key: 'about', fa: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627', en: 'About' },
        { href: 'contact.html', key: 'contact', fa: '\u062a\u0645\u0627\u0633', en: 'Contact' }
      ];
      var existing = Array.prototype.map.call(f.querySelectorAll('a[href]'), function (a) {
        return (a.getAttribute('href') || '').split(/[?#]/)[0].split('/').pop();
      });
      var missing = items.filter(function (item) { return existing.indexOf(item.href) < 0; });
      if (!missing.length) return;
      var row = document.createElement('p');
      row.className = 'footer-legal';
      row.style.cssText = 'margin-top:0.75rem;font-size:0.85rem;display:flex;flex-wrap:wrap;gap:0.5rem 1rem;justify-content:center;';
      row.innerHTML = missing.map(function (item) {
        return '<a href="' + item.href + '" style="color:inherit;opacity:0.9;text-decoration:underline;">' +
          label(item.key, item.fa, item.en) + '</a>';
      }).join('');
      f.appendChild(row);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
  document.getElementById('lang-toggle')?.addEventListener('click', function () {
    setTimeout(function () {
      document.querySelectorAll('.footer-legal').forEach(function (el) { el.remove(); });
      enhance();
    }, 100);
  });
})();