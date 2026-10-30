/* One social row only — footer */
(function () {
  var LINKS = [
    {
      name: 'YouTube',
      href: 'https://youtube.com/@seventhtrumpetmedia',
      color: '#FF0000',
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.84.56 9.38.56 9.38.56s7.54 0 9.38-.56a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.52V8.48L15.82 12l-6.07 3.52z"/></svg>'
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/seventhtrumpet.media',
      color: '#E4405F',
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.56a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>'
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@seventhtrumpet.me',
      color: '#111',
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.8a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52V6.79a4.84 4.84 0 0 1-1-.1z"/></svg>'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1Ev7nyyXVu/',
      color: '#1877F2',
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>'
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/442081333076',
      color: '#25D366',
      svg: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-.14l-.36-.13-3.73.98 1-3.64-.24-.37a9.78 9.78 0 0 1-1.5-5.23C2.2 6.56 6.62 2.15 12.06 2.15c2.62 0 5.08 1.02 6.93 2.87a9.73 9.73 0 0 1 2.86 6.93c-.01 5.44-4.43 9.85-9.8 9.85zm0-17.96C7.43 3.84 3.7 7.56 3.7 12.15c0 1.67.44 3.3 1.27 4.73L3.6 20.6l3.83-1a9.75 9.75 0 0 0 4.62 1.17h.01c4.58 0 8.31-3.72 8.32-8.31 0-2.22-.86-4.3-2.43-5.87a8.3 8.3 0 0 0-5.9-2.45z"/></svg>'
    }
  ];

  function clearDuplicates() {
    // Remove extra social bars / contact social blocks so only one row remains
    document.querySelectorAll('.social-bar, .social-contact-block, #social-contact-block').forEach(function (el) {
      el.remove();
    });
  }

  function fillFooterSocial() {
    clearDuplicates();
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
      var a = document.createElement('a');
      a.href = item.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = item.name;
      a.setAttribute('aria-label', item.name);
      a.innerHTML = item.svg;
      a.style.color = '#fff';
      host.appendChild(a);
    });
  }

  function run() {
    fillFooterSocial();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 400);
})();
