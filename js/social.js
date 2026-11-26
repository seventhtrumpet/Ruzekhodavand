/* Header + footer social icons — consistent compact alignment */
(function () {
  if (window.__stSocialInit) return;
  window.__stSocialInit = true;

  var LINKS = [
    {
      id: 'yt',
      href: 'https://www.youtube.com/@SeventhTrumpet',
      label: 'YouTube',
      className: 'social-yt',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.2 3.5-6.2 3.5z"/></svg>'
    },
    {
      id: 'ig',
      href: 'https://www.instagram.com/seventhtrumpet.media/',
      label: 'Instagram',
      className: 'social-ig',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.1 0-3.5 0-4.7.1-2.2.1-3.3 1.2-3.4 3.4-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 2.2 1.2 3.3 3.4 3.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c2.2-.1 3.3-1.2 3.4-3.4.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-2.2-1.2-3.3-3.4-3.4-1.2-.1-1.6-.1-4.7-.1zm0 3.2a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2zm0 1.8a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zm5.3-2.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>'
    },
    {
      id: 'tt',
      href: 'https://www.tiktok.com/@seventhtrumpet.media',
      label: 'TikTok',
      className: 'social-tt',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.2a7.3 7.3 0 0 1-4.2-1.3v7.2a6.1 6.1 0 1 1-5.3-6v3.1a3 3 0 1 0 2.1 2.9V2.5h3a4.3 4.3 0 0 0 4.4 4.3v1.4z"/></svg>'
    },
    {
      id: 'fb',
      href: 'https://www.facebook.com/SeventhTrumpet',
      label: 'Facebook',
      className: 'social-fb',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.2h2.7V5h-2.7C11.8 5 10 6.8 10 9.1V11H8v3.2h2V22h3.3v-7.8h2.5L16.5 11H13.3V9.1c0-.5.4-.9 1-.9z"/></svg>'
    },
    {
      id: 'wa',
      href: 'https://wa.me/442081333076',
      label: 'WhatsApp',
      className: 'social-wa',
      svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.5l-.3.5.5 1.9-2-.5-.5.3A8.2 8.2 0 1 1 12 3.8zm4.6 9.7c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.4 0-.1 0-.3-.1-.4-.1-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 2.3.9 2.3.6 2.7.6.4 0 1.3-.5 1.5-1 .2-.5.2-.9.1-1z"/></svg>'
    }
  ];

  function makeLink(item) {
    var a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = item.className;
    a.setAttribute('aria-label', item.label);
    a.title = item.label;
    a.innerHTML = item.svg;
    return a;
  }

  function ensureCss() {
    if (document.getElementById('st-social-css')) return;
    var st = document.createElement('style');
    st.id = 'st-social-css';
    st.textContent =
      /* Header icons */
      '.header-social a{' +
      'display:inline-flex;align-items:center;justify-content:center;' +
      'width:1.5rem!important;height:1.5rem!important;min-width:1.5rem!important;min-height:1.5rem!important;max-width:1.5rem!important;max-height:1.5rem!important;border-radius:50%;' +
      'text-decoration:none;background:rgba(255,255,255,0.12);overflow:hidden;flex-shrink:0;}' +
      '.header-social a svg{width:1rem!important;height:1rem!important;display:block;}' +

      /* FOOTER icons — much smaller + single row */
      '#footer-social, .footer-social{' +
      'display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;' +
      'justify-content:center!important;align-items:center!important;' +
      'gap:0.45rem!important;padding:0.65rem 0!important;margin:0.6rem auto 0!important;width:max-content;max-width:100%;}' +
      '#footer-social a, .footer-social a{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;' +
      'max-width:28px!important;max-height:28px!important;border-radius:50%!important;' +
      'text-decoration:none;background:rgba(255,255,255,0.14)!important;overflow:hidden;flex:0 0 28px!important;padding:0!important;margin:0!important;}' +
      '#footer-social a svg, .footer-social a svg{' +
      'width:15px!important;height:15px!important;max-width:15px!important;max-height:15px!important;display:block;}' +

      /* Colors */
      '.header-social a.social-yt, #footer-social a.social-yt, .footer-social a.social-yt{background:#FF0000!important;color:#fff!important;}' +
      '.header-social a.social-yt svg, #footer-social a.social-yt svg, .footer-social a.social-yt svg{fill:#fff!important;}' +
      '.header-social a.social-ig, #footer-social a.social-ig, .footer-social a.social-ig{' +
      'background:linear-gradient(45deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)!important;color:#fff!important;}' +
      '.header-social a.social-ig svg, #footer-social a.social-ig svg, .footer-social a.social-ig svg{fill:#fff!important;}' +
      '.header-social a.social-tt, #footer-social a.social-tt, .footer-social a.social-tt{background:#111!important;color:#fff!important;}' +
      '.header-social a.social-tt svg, #footer-social a.social-tt svg, .footer-social a.social-tt svg{fill:#fff!important;}' +
      '.header-social a.social-fb, #footer-social a.social-fb, .footer-social a.social-fb{background:#1877F2!important;color:#fff!important;}' +
      '.header-social a.social-fb svg, #footer-social a.social-fb svg, .footer-social a.social-fb svg{fill:#fff!important;}' +
      '.header-social a.social-wa, #footer-social a.social-wa, .footer-social a.social-wa{background:#25D366!important;color:#fff!important;}' +
      '.header-social a.social-wa svg, #footer-social a.social-wa svg, .footer-social a.social-wa svg{fill:#fff!important;}';
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
      host.className = 'footer-social';
      footer.appendChild(host);
    }
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
