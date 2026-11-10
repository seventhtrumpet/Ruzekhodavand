/* Social links — brand colors on header + footer icons */
(function () {
  var LINKS = [
    {
      name: 'YouTube',
      href: 'https://youtube.com/@seventhtrumpetmedia',
      cls: 'social-yt',
      color: '#FF0000',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.84.56 9.38.56 9.38.56s7.54 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.52V8.48L15.82 12l-6.07 3.52z"/></svg>'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/seventhtrumpet.media',
      cls: 'social-ig',
      color: '#E1306C',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.56a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>'
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@seventhtrumpet.me',
      cls: 'social-tt',
      color: '#010101',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.8a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z"/></svg>'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1Ev7nyyXVu/',
      cls: 'social-fb',
      color: '#1877F2',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/442081333076',
      cls: 'social-wa',
      color: '#25D366',
      svg: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"/><path d="M12.05 2.15c-5.44 0-9.86 4.41-9.86 9.85 0 1.74.45 3.44 1.31 4.93L2.05 22l5.1-1.34a9.8 9.8 0 0 0 4.9 1.25h.01c5.44 0 9.85-4.42 9.85-9.86 0-2.63-1.03-5.1-2.89-6.96a9.78 9.78 0 0 0-6.97-2.94zm5.85 14.2c-.25.7-1.44 1.32-2.01 1.41-.51.08-1.16.11-1.87-.12-.43-.14-.98-.32-1.69-.63-2.98-1.28-4.93-4.28-5.08-4.48-.15-.2-1.21-1.62-1.21-3.08s.77-2.18 1.04-2.48c.27-.3.59-.37.79-.37h.57c.18.01.43-.02.67.51.25.59.84 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.33-.3.5-.15.17-.32.39-.45.52-.15.15-.3.31-.13.61.17.29.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.38 1.47.29.14.47.12.64-.08.17-.2.77-.86.94-1.16.2-.3.4-.25.67-.15.27.09 1.73.81 2.03.96.3.15.5.22.57.35.08.12.08.71-.17 1.41z"/></svg>'
    }
  ];

  function injectBrandCss() {
    if (document.getElementById('social-brand-colors')) return;
    var st = document.createElement('style');
    st.id = 'social-brand-colors';
    st.textContent =
      /* Header icons — original brand colors on white circle */
      '.header-social a{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:1.85rem;height:1.85rem;border-radius:50%;' +
      'background:#fff!important;border:none!important;' +
      'box-shadow:0 1px 4px rgba(0,0,0,0.18);' +
      'text-decoration:none;flex-shrink:0;' +
      '}' +
      '.header-social a svg{width:1rem;height:1rem;display:block;}' +
      '.header-social a.social-yt{color:#FF0000!important;}' +
      '.header-social a.social-ig{color:#E1306C!important;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)!important;}' +
      '.header-social a.social-ig svg{color:#fff!important;fill:#fff!important;}' +
      '.header-social a.social-tt{color:#010101!important;}' +
      '.header-social a.social-fb{color:#1877F2!important;}' +
      '.header-social a.social-wa{color:#25D366!important;}' +

      /* Footer icons — same brand colors */
      '.footer-social{display:flex;flex-wrap:wrap;justify-content:center;gap:0.55rem;padding:0.75rem 0;}' +
      '.footer-social a{' +
      'display:inline-flex;align-items:center;justify-content:center;' +
      'width:2.25rem;height:2.25rem;border-radius:50%;' +
      'background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.12);' +
      'text-decoration:none;' +
      '}' +
      '.footer-social a svg{width:1.15rem;height:1.15rem;}' +
      '.footer-social a.social-yt{color:#FF0000;}' +
      '.footer-social a.social-ig{color:#fff;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);}' +
      '.footer-social a.social-tt{color:#010101;}' +
      '.footer-social a.social-fb{color:#1877F2;}' +
      '.footer-social a.social-wa{color:#25D366;}' +

      /* Menu panel social letters if present */
      '.menu-social-icons a[title="YouTube"],.menu-social-icons a[aria-label="YouTube"]{color:#FF0000!important;font-weight:800;}' +
      '.menu-social-icons a[title="Instagram"],.menu-social-icons a[aria-label="Instagram"]{color:#E1306C!important;font-weight:800;}' +
      '.menu-social-icons a[title="TikTok"],.menu-social-icons a[aria-label="TikTok"]{color:#111!important;font-weight:800;}' +
      '.menu-social-icons a[title="Facebook"],.menu-social-icons a[aria-label="Facebook"]{color:#1877F2!important;font-weight:800;}' +
      '.menu-social-icons a[title="WhatsApp"],.menu-social-icons a[aria-label="WhatsApp"]{color:#25D366!important;font-weight:800;}';
    document.head.appendChild(st);
  }

  function makeLink(item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.title = item.name;
    a.setAttribute('aria-label', item.name);
    a.className = item.cls || '';
    a.style.color = item.color;
    a.innerHTML = item.svg;
    return a;
  }

  function fillHeaderSocial() {
    injectBrandCss();
    var existing = document.getElementById('header-social');
    if (existing) {
      // Re-color existing links if already present without classes
      var anchors = existing.querySelectorAll('a');
      if (anchors.length && !existing.querySelector('.social-wa')) {
        existing.innerHTML = '';
        LINKS.forEach(function (item) { existing.appendChild(makeLink(item)); });
      }
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
      host.className = 'footer-social';
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
