/* Seventh Trumpet — ads + sponsors
   1) Replace ADSENSE_CLIENT with your publisher ID from Google AdSense
   2) Set slot IDs after creating ad units in AdSense
   3) Edit data/sponsors.json for banner sponsors
*/
(function () {
  const ADSENSE_CLIENT = ''; // e.g. 'ca-pub-1234567890123456'
  const SLOTS = {
    top: '',      // e.g. '1234567890'
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
    label.textContent = t('تبلیغات', 'Ad');
    el.appendChild(label);
    return el;
  }

  function injectSlots() {
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

    if (document.body.getAttribute('data-page') === 'media') {
      const feed = document.getElementById('posts-list') || document.querySelector('.posts-grid, #media-list');
      if (feed) {
        const infeed = makeSlot('ad-slot-infeed', 'ad-slot-infeed');
        feed.parentNode.insertBefore(infeed, feed);
      }
    }
  }

  function loadAdSense() {
    if (!ADSENSE_CLIENT || !ADSENSE_CLIENT.startsWith('ca-pub-')) return;
    if (document.getElementById('adsense-script')) return;

    const s = document.createElement('script');
    s.id = 'adsense-script';
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ADSENSE_CLIENT);
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);

    function fill(slotElId, adSlotId) {
      const host = document.getElementById(slotElId);
      if (!host || !adSlotId) return;
      host.classList.add('ready');
      host.innerHTML = '';
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
      ins.setAttribute('data-ad-slot', adSlotId);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      host.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }

    setTimeout(function () {
      fill('ad-slot-top', SLOTS.top);
      fill('ad-slot-bottom', SLOTS.bottom);
      fill('ad-slot-infeed', SLOTS.infeed);
    }, 400);
  }

  function loadSponsors() {
    const mount =
      document.getElementById('sponsors-mount') ||
      (function () {
        const footer = document.querySelector('footer.footer');
        if (!footer) return null;
        const sec = document.createElement('section');
        sec.className = 'sponsors-section';
        sec.id = 'sponsors-mount';
        footer.parentNode.insertBefore(sec, footer);
        return sec;
      })();
    if (!mount) return;

    fetch('data/sponsors.json?v=' + Date.now())
      .then(function (r) { return r.ok ? r.json() : { sponsors: [] }; })
      .catch(function () { return { sponsors: [] }; })
      .then(function (data) {
        const list = (data.sponsors || []).filter(function (s) { return s.active !== false && (s.image || s.name); });
        const lang = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
        mount.innerHTML = '';
        const h2 = document.createElement('h2');
        h2.textContent = t('حامیان', 'Sponsors');
        mount.appendChild(h2);
        const sub = document.createElement('p');
        sub.className = 'sponsors-sub';
        sub.textContent = t('از حامیان پیام سپاسگزاریم', 'Thank you to our sponsors');
        mount.appendChild(sub);

        if (!list.length) {
          const empty = document.createElement('p');
          empty.className = 'sponsors-empty';
          empty.textContent = t('به‌زودی…', 'Coming soon…');
          mount.appendChild(empty);
          return;
        }
        const grid = document.createElement('div');
        grid.className = 'sponsors-grid';
        list.forEach(function (s) {
          const a = document.createElement('a');
          a.className = 'sponsor-card';
          a.href = s.url || '#';
          a.target = '_blank';
          a.rel = 'noopener sponsored';
          if (s.image) {
            const img = document.createElement('img');
            img.src = s.image;
            img.alt = s.name || '';
            img.loading = 'lazy';
            a.appendChild(img);
          }
          const span = document.createElement('span');
          span.textContent = lang === 'fa' && s.nameFa ? s.nameFa : (s.name || '');
          a.appendChild(span);
          grid.appendChild(a);
        });
        mount.appendChild(grid);
      });
  }

  function init() {
    injectSlots();
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function () { loadAdSense(); loadSponsors(); }, { timeout: 2500 });
    } else {
      setTimeout(function () { loadAdSense(); loadSponsors(); }, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
