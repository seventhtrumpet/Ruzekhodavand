/* Light performance helpers */
(function () {
  document.querySelectorAll('img:not([loading])').forEach(function (img) {
    if (!img.closest('header')) img.loading = 'lazy';
  });
  try {
    var page = document.body.getAttribute('data-page');
    if (page) {
      document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (a) {
        a.classList.add('active');
      });
    }
  } catch (e) {}
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.documentElement.classList.add('fonts-ready');
    });
  }
})();
