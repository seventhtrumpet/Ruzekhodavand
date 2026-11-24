/* Social links — visible in header, not covered by Login/flags */
(function () {
  var LINKS = [
    {
      href: 'https://www.youtube.com/@SeventhTrumpet-n6k',
      cls: 'social-yt',
      label: 'YouTube',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.2 3.5-6.2 3.5z"/></svg>'
    },
    {
      href: 'https://www.instagram.com/seventh.trumpet/',
      cls: 'social-ig',
      label: 'Instagram',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.1 0-3.5 0-4.7.1-2.2.1-3.3 1.2-3.4 3.4-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 2.2 1.2 3.3 3.4 3.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c2.2-.1 3.3-1.2 3.4-3.4.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-2.2-1.2-3.3-3.4-3.4-1.2-.1-1.6-.1-4.7-.1zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.3-.9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>'
    },
    {
      href: 'https://www.tiktok.com/@seventh.trumpet',
      cls: 'social-tt',
      label: 'TikTok',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 7.2a5.6 5.6 0 0 1-3.3-1.1v6.6a5.7 5.7 0 1 1-4.9-5.6v2.9a2.8 2.8 0 1 0 2 2.7V2.5h2.8a5.6 5.6 0 0 0 3.4 4.7z"/></svg>'
    },
    {
      href: 'https://www.facebook.com/share/1Ev7nyyXVu/',
      cls: 'social-fb',
      label: 'Facebook',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>'
    },
    {
      href: 'https://wa.me/',
      cls: 'social-wa',
      label: 'WhatsApp',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.5l-.3.5.5 1.9-2-.5-.5.3A8.2 8.2 0 1 1 12 3.8zm4.6 9.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 2.3.9 2.3.6 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1z"/></svg>'
    }
  ];

  function makeLink(item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.className = item.cls;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', item.label);
    a.title = item.label;
    a.innerHTML = item.svg;
    return a;
  }

  function ensureCss() {
    var st = document.getElementById('social-brand-colors');
    if (st) return;
    st = document.createElement('style');
    st.id = 'social-brand-colors';
    st.textContent =
      '#header-social.header-social{order:2!important;flex-shrink:0!important;z-index:6!important;display:inline-flex!important;align-items:center;gap:0.2rem!important}' +
      '.header-social a, .footer-social a{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:1.55rem;height:1.55rem;border-radius:50%;' +
      'background:#fff!important;border:none!important;' +
      'box-shadow:0 1px 5px rgba(0,0,0,0.18);' +
      'text-decoration:none;flex-shrink:0;' +
      '}' +
      '.footer-social{display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;padding:0.85rem 0;}' +
      '.footer-social a{width:2.35rem;height:2.35rem;}' +
      '.header-social a svg, .footer-social a svg{width:0.95rem;height:0.95rem;display:block;}' +
      '.footer-social a svg{width:1.25rem;height:1.25rem;}' +
      '.header-social a.social-yt, .footer-social a.social-yt{color:#FF0000!important;}' +
      '.header-social a.social-yt svg, .footer-social a.social-yt svg{fill:#FF0000!important;}' +
      '.header-social a.social-ig, .footer-social a.social-ig{' +
      'background:linear-gradient(45deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)!important;color:#fff!important;}' +
      '.header-social a.social-ig svg, .footer-social a.social-ig svg{fill:#fff!important;}' +
      '.header-social a.social-tt, .footer-social a.social-tt{color:#111!important;}' +
      '.header-social a.social-tt svg, .footer-social a.social-tt svg{fill:#111!important;}' +
      '.header-social a.social-fb, .footer-social a.social-fb{color:#1877F2!important;}' +
      '.header-social a.social-fb svg, .footer-social a.social-fb svg{fill:#1877F2!important;}' +
      '.header-social a.social-wa, .footer-social a.social-wa{background:#25D366!important;color:#fff!important;}' +
      '.header-social a.social-wa svg, .footer-social a.social-wa svg{fill:#fff!important;}';
    document.head.appendChild(st);
  }

  function injectHeader() {
    ensureCss();
    var existing = document.getElementById('header-social');
    if (existing) {
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
      brand.style.cssText = 'display:flex;align-items:center;gap:0.35rem;min-width:0;order:1;';
      parent.insertBefore(brand, logo);
      brand.appendChild(logo);
    }
    var row = document.createElement('div');
    row.id = 'header-social';
    row.className = 'header-social';
    LINKS.forEach(function (item) { row.appendChild(makeLink(item)); });
    brand.appendChild(row);
  }

  function injectFooter() {
    ensureCss();
    var footer = document.querySelector('footer, .footer');
    if (!footer) return;
    var host = document.getElementById('footer-social');
    if (!host) {
      host = document.createElement('div');
      host.id = 'footer-social';
      footer.appendChild(host);
    }
    // The homepage already contains #footer-social without this class.
    // Add it in both cases so the compact footer icon styles always apply.
    host.classList.add('footer-social');
    host.innerHTML = '';
    LINKS.forEach(function (item) { host.appendChild(makeLink(item)); });
  }

  function boot() {
    injectHeader();
    injectFooter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
})();
