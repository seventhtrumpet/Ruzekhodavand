/* Emergency homepage restore if index.html was truncated */
(function () {
  if (document.querySelector('.header-inner') && document.querySelector('#home-contact, .mission-section, section.hero')) return;
  console.warn('[ST] Restoring homepage shell');
  var header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = '<div class="header-inner"><a href="index.html" class="logo"><span data-i18n="siteName">\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645</span></a><nav class="nav nav-main"></nav></div>';
  var main = document.createElement('main');
  main.className = 'container';
  main.id = 'main-home';
  main.innerHTML = '<section class="hero" style="min-height:40vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem 1rem;"><div><h1 data-i18n="heroTitle">\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645</h1><p data-i18n="heroSub">Seventh Trumpet</p></div></section><section id="home-contact" class="home-contact" style="padding:1.5rem 1rem;"><h2 class="section-title" data-i18n="homeContactTitle">\u062a\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627</h2></section>';
  var footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = '<div class="footer-inner"><div class="footer-brand" data-i18n="siteName">\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645</div><div id="footer-social"></div></div>';
  var mount = document.getElementById('app-root') || document.getElementById('site-mount');
  var parent = document.body;
  if (mount) {
    parent.insertBefore(header, mount);
    parent.insertBefore(main, mount);
    parent.insertBefore(footer, mount);
    mount.remove();
  } else {
    parent.insertBefore(footer, parent.firstChild);
    parent.insertBefore(main, parent.firstChild);
    parent.insertBefore(header, parent.firstChild);
  }
})();
