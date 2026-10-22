/* Hook: fill playlist select on publish + add post to playlist after publish */
(function () {
  function loadPL() {
    try { return JSON.parse(localStorage.getItem('cog_playlists_v1') || '[]'); } catch { return []; }
  }
  function fill() {
    const sel = document.getElementById('post-playlist');
    if (!sel) return;
    const list = loadPL();
    const L = localStorage.getItem('cog_lang') || 'fa';
    const none = L === 'fa' ? '\u2014 \u0628\u062f\u0648\u0646 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u2014' : '\u2014 No playlist \u2014';
    const cur = sel.value;
    sel.innerHTML = '<option value="">' + none + '</option>' + list.map(function (pl) {
      const name = L === 'fa' ? (pl.name_fa || pl.name_en) : (pl.name_en || pl.name_fa);
      return '<option value="' + pl.id + '">' + String(name || '').replace(/</g, '') + '</option>';
    }).join('');
    if (cur) sel.value = cur;
  }
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(fill, 200);
    setTimeout(fill, 800);
    document.getElementById('lang-toggle')?.addEventListener('click', function () { setTimeout(fill, 100); });
    document.getElementById('post-form')?.addEventListener('submit', function () {
      setTimeout(function () {
        const sel = document.getElementById('post-playlist');
        if (!sel || !sel.value) return;
        try {
          const posts = JSON.parse(localStorage.getItem('cog_posts_v1') || '[]');
          if (!posts.length) return;
          const last = posts[posts.length - 1];
          const pls = loadPL();
          const pl = pls.find(function (x) { return x.id === sel.value; });
          if (!pl || !last) return;
          if (!pl.postIds) pl.postIds = [];
          if (!pl.postIds.includes(last.id)) {
            pl.postIds.push(last.id);
            localStorage.setItem('cog_playlists_v1', JSON.stringify(pls));
          }
          fill();
        } catch (e) {}
      }, 400);
    });
  });
  window.fillPlaylistSelect = fill;
})();
