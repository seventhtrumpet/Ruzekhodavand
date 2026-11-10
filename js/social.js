/* Social links — clear brand icons + correct colors */
(function () {
  var LINKS = [
    {
      name: 'YouTube',
      href: 'https://youtube.com/@seventhtrumpetmedia',
      cls: 'social-yt',
      color: '#FF0000',
      // Classic play-button tube logo
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.84.56 9.38.56 9.38.56s7.54 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.52V8.48L15.82 12l-6.07 3.52z"/></svg>'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/seventhtrumpet.media',
      cls: 'social-ig',
      color: '#E1306C',
      // Camera outline — must stay white on gradient, never red
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>'
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@seventhtrumpet.me',
      cls: 'social-tt',
      color: '#010101',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.8a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z"/></svg>'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1Ev7nyyXVu/',
      cls: 'social-fb',
      color: '#1877F2',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/442081333076',
      cls: 'social-wa',
      color: '#25D366',
      // Official-style bubble + phone handset (very recognizable)
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.39 1 2.56 1.17 1.92 2.8 3.32 4.56 4.06.72.32 1.3.5 1.75.63.74.24 1.41.2 1.94.12.59-.09 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.46-.07-.13-.27-.2-.56-.35-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.15-.17.2-.34.22-.63.08-.3-.15-1.24-.46-2.37-1.46-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.45.13-.6.13-.13.3-.34.44-.51.15-.17.2-.29.3-.48.1-.2.05-.37-.02-.52-.08-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.55z"/></svg>'
    }
  ];

  function injectBrandCss() {
    var st = document.getElementById('social-brand-colors');
    if (!st) {
      st = document.createElement('style');
      st.id = 'social-brand-colors';
      document.head.appendChild(st);
    }
    st.textContent =
      '.header-social a, .footer-social a{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:2rem;height:2rem;border-radius:50%;' +
      'background:#fff!important;border:none!important;' +
      'box-shadow:0 1px 5px rgba(0,0,0,0.18);' +
      'text-decoration:none;flex-shrink:0;' +
      '}' +
      '.footer-social{display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;padding:0.85rem 0;}' +
      '.footer-social a{width:2.35rem;height:2.35rem;}' +
      '.header-social a svg, .footer-social a svg{width:1.15rem;height:1.15rem;display:block;}' +
      '.footer-social a svg{width:1.25rem;height:1.25rem;}' +

      /* YouTube = red only */
      '.header-social a.social-yt, .footer-social a.social-yt{color:#FF0000!important;}' +
      '.header-social a.social-yt svg, .footer-social a.social-yt svg{fill:#FF0000!important;color:#FF0000!important;}' +

      /* Instagram = gradient bg + WHITE icon (not red) */
      '.header-social a.social-ig, .footer-social a.social-ig{' +
      'background:linear-gradient(45deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)!important;' +
      'color:#fff!important;' +
      '}' +
      '.header-social a.social-ig svg, .footer-social a.social-ig svg{fill:#fff!important;color:#fff!important;}' +

      /* TikTok */
      '.header-social a.social-tt, .footer-social a.social-tt{color:#111!important;}' +
      '.header-social a.social-tt svg, .footer-social a.social-tt svg{fill:#111!important;}' +

      /* Facebook */
      '.header-social a.social-fb, .footer-social a.social-fb{color:#1877F2!important;}' +
      '.header-social a.social-fb svg, .footer-social a.social-fb svg{fill:#1877F2!important;}' +

      /* WhatsApp — green circle + white bubble for maximum recognition */
      '.header-social a.social-wa, .footer-social a.social-wa{' +
      'background:#25D366!important;color:#fff!important;' +
      '}' +
      '.header-social a.social-wa svg, .footer-social a.social-wa svg{fill:#fff!important;color:#fff!important;}' +

      /* Menu text links */
      '.menu-social-icons a[aria-label="YouTube"]{color:#FF0000!important;font-weight:800;}' +
      '.menu-social-icons a[aria-label="Instagram"]{color:#E1306C!important;font-weight:800;}' +
      '.menu-social-icons a[aria-label="TikTok"]{color:#111!important;font-weight:800;}' +
      '.menu-social-icons a[aria-label="Facebook"]{color:#1877F2!important;font-weight:800;}' +
      '.menu-social-icons a[aria-label="WhatsApp"]{color:#25D366!important;font-weight:800;}';
  }

  function makeLink(item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = item.name;
    a.setAttribute('aria-label', item.name);
    a.className = item.cls || '';
    a.innerHTML = item.svg;
    return a;
  }

  function fillHeaderSocial() {
    injectBrandCss();
    var existing = document.getElementById('header-social');
    if (existing) {
      // Always rebuild so icons/colors update after deploy
      existing.innerHTML = '';
      LINKS.forEach(function (item) { existing.appendChild(makeLink(item)); });
      return;
    }
    var logo = document.querySelector('a.logo');
    if (!logo || !logo.parentNode) return;

    var parent = logo.parentNode;
    var brand = document.getElementById('header-brand');
    if (!brand) {
      brand = document.createElement('div');
      brand.id = 'header-brand';
      brand.className = 'header-brand';
      parent.insertBefore(brand, logo);
      brand.appendChild(logo);
    }

    var row = document.createElement('div');
    row.id = 'header-social';
    row.className = 'header-social';
    row.setAttribute('aria-label', 'Social media');
    LINKS.forEach(function (item) {
      row.appendChild(makeLink(item));
    });
    brand.appendChild(row);
  }

  function fillFooterSocial() {
    injectBrandCss();
    document.querySelectorAll('.social-bar, .social-contact-block, #social-contact-block').forEach(function (el) {
      el.remove();
    });
    var host = document.getElementById('footer-social');
    if (!host) {
      var footer = document.querySelector('footer.footer, .footer');
      if (!footer) return;
      host = document.createElement('div');
      host.id = 'footer-social';
      footer.appendChild(host);
    }
    host.innerHTML = '';
    host.className = 'footer-social';
    LINKS.forEach(function (item) {
      host.appendChild(makeLink(item));
    });
  }

  function run() {
    fillHeaderSocial();
    fillFooterSocial();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 300);
  setTimeout(run, 900);
})();
