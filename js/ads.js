/* Seventh Trumpet — ads + sponsors
   Publisher: ca-pub-3616286446774634
   Optional: set SLOTS after creating ad units in AdSense dashboard
   Sponsors: edit data/sponsors.json
*/
(function () {
  /* Set true only AFTER Google AdSense approves the site */
  const ADSENSE_ENABLED = false;
  const ADSENSE_CLIENT = 'ca-pub-3616286446774634';
  const SLOTS = {
    top: '',
    bottom: '',
    infeed: ''
  };

  function t(fa, en) {
    const lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
    return lang === 'en' ? en : fa;
  }

  function makeSlot(id, sizeClass) {
    const el = document.createElement('div');
    el.className = 'ad-slot ' + (sizeClass || '');
    el.id = id;
    el.setAttribute('role', 'complementary');
    el.setAttribute('aria-label', 'Advertisement');
    const label = document.createElement('span');
    label.className = 'ad-slot-label';
    label.textContent = t('\u062a\u0628\u0644\u06cc\u063a\u0627\u062a', 'Ad');
    el.appendChild(label);
    return el;
  }

  function injectSlots() {
    if (!ADSENSE_ENABLED) {
      return;
    }
    const main = document.querySelector('main.container, main.mb-reader, .home-links');
    const footer = document.querySelector('footer.footer');
    const daily = document.getElementById('daily-verse');

    if (daily && daily.parentNode) {
      const top = makeSlot('ad-slot-top', '');
      daily.parentNode.insertBefore(top, daily.nextSibling);
    } else if (main && main.parentNode) {
      const top = makeSlot('ad-slot-top', '');
      main.parentNode.insertBefore(top, main);
    }
    if (footer && footer.parentNode) {
      const bottom = makeSlot('ad-slot-bottom', '');
      footer.parentNode.insertBefore(bottom, footer);
    }
  }

  function loadAdSense() {
    if (!ADSENSE_ENABLED) return;
    if (document.querySelector('script[data-adsense-client]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-adsense-client', '1');
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadAdSense();
    injectSlots();
  });
})();
