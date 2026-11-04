/* Public media UX helpers — playlists handled by user_playlists.js */
(function () {
  function loadUserPlaylists() {
    try {
      if (document.querySelector('script[data-user-playlists]')) return;
      var s = document.createElement('script');
      s.src = 'js/user_playlists.js';
      s.setAttribute('data-user-playlists', '1');
      document.body.appendChild(s);
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadUserPlaylists);
  } else {
    loadUserPlaylists();
  }
})();
