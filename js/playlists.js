/* Seventh Trumpet - Playlists */
(function () {
  const PLAYLISTS_KEY = 'cog_playlists_v1';
  const STORAGE_KEY = 'cog_posts_v1';

  function loadPlaylists() {
    try { return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]'); } catch { return []; }
  }
  function savePlaylists(list) {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(list));
  }
  function loadPosts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function lang() {
    return localStorage.getItem('cog_lang') || 'fa';
  }
  function t() {
    const L = lang();
    const map = {
      fa: {
        plEmpty: 'هنوز پلی‌لیستی نیست', plCreate: 'ساخت پلی‌لیست', plNeedName: 'لطفاً حداقل یک نام وارد کنید',
        plCreated: 'پلی‌لیست ساخته شد!', plDelete: 'حذف پلی‌لیست', plConfirmDelete: 'این پلی‌لیست حذف شود؟',
        plDeleted: 'پلی‌لیست حذف شد', plAddPost: 'افزودن پست', plRemovePost: 'حذف از پلی‌لیست',
        plPosts: 'پست‌ها', plSelectPost: 'انتخاب پست برای افزودن', untitled: 'بدون عنوان',
        playlistsTitle: 'پلی‌لیست‌ها', plItems: 'مورد', plOpen: 'باز کردن'
      },
      en: {
        plEmpty: 'No playlists yet', plCreate: 'Create playlist', plNeedName: 'Please enter at least one name',
        plCreated: 'Playlist created!', plDelete: 'Delete playlist', plConfirmDelete: 'Delete this playlist?',
        plDeleted: 'Playlist deleted', plAddPost: 'Add post', plRemovePost: 'Remove from playlist',
        plPosts: 'Posts', plSelectPost: 'Select a post to add', untitled: 'Untitled',
        playlistsTitle: 'Playlists', plItems: 'items', plOpen: 'Open'
      }
    };
    return map[L] || map.en;
  }

  window.handlePlaylistCreate = function (e) {
    e.preventDefault();
    const tr = t();
    const name_fa = (document.getElementById('pl-name-fa')?.value || '').trim();
    const name_en = (document.getElementById('pl-name-en')?.value || '').trim();
    if (!name_fa && !name_en) {
      alert(tr.plNeedName);
      return;
    }
    const list = loadPlaylists();
    list.push({
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name_fa: name_fa || name_en,
      name_en: name_en || name_fa,
      postIds: [],
      created: new Date().toISOString()
    });
    savePlaylists(list);
    const a = document.getElementById('pl-name-fa'); if (a) a.value = '';
    const b = document.getElementById('pl-name-en'); if (b) b.value = '';
    alert(tr.plCreated);
    renderPlaylistsAdmin();
  };

  window.deletePlaylist = function (id) {
    const tr = t();
    if (!confirm(tr.plConfirmDelete)) return;
    savePlaylists(loadPlaylists().filter(p => p.id !== id));
    alert(tr.plDeleted);
    renderPlaylistsAdmin();
  };

  window.addPostToPlaylist = function (plId, postId) {
    if (!postId) return;
    const list = loadPlaylists();
    const pl = list.find(p => p.id === plId);
    if (!pl) return;
    if (!pl.postIds.includes(postId)) {
      pl.postIds.push(postId);
      savePlaylists(list);
      renderPlaylistsAdmin();
    }
  };

  window.removePostFromPlaylist = function (plId, postId) {
    const list = loadPlaylists();
    const pl = list.find(p => p.id === plId);
    if (!pl) return;
    pl.postIds = pl.postIds.filter(id => id !== postId);
    savePlaylists(list);
    renderPlaylistsAdmin();
  };

  window.renderPlaylistsAdmin = function () {
    const box = document.getElementById('playlists-admin-list');
    if (!box) return;
    const tr = t();
    const L = lang();
    const list = loadPlaylists();
    const posts = loadPosts();
    if (!list.length) {
      box.innerHTML = '<p style="color:#888">' + tr.plEmpty + '</p>';
      return;
    }
    box.innerHTML = list.map(pl => {
      const name = L === 'fa' ? (pl.name_fa || pl.name_en) : (pl.name_en || pl.name_fa);
      const opts = posts.map(p => {
        const pt = L === 'fa' ? (p.title_fa || p.title_en || tr.untitled) : (p.title_en || p.title_fa || tr.untitled);
        return '<option value="' + p.id + '">' + esc(pt) + '</option>';
      }).join('');
      const items = (pl.postIds || []).map(pid => {
        const p = posts.find(x => x.id === pid);
        const pt = p ? (L === 'fa' ? (p.title_fa || p.title_en || tr.untitled) : (p.title_en || p.title_fa || tr.untitled)) : pid;
        return '<li style="display:flex;justify-content:space-between;gap:0.5rem;padding:0.4rem 0;border-bottom:1px solid #eee;"><span>' + esc(pt) + '</span><button type="button" class="btn btn-outline btn-sm" style="color:#c62828;border-color:#c62828;" onclick="removePostFromPlaylist(\'' + pl.id + '\',\'' + pid + '\')">' + tr.plRemovePost + '</button></li>';
      }).join('') || '<li style="color:#888;padding:0.4rem 0;">—</li>';
      return '<div style="background:#fff;border:1px solid #e0dcd4;border-radius:12px;padding:1.2rem;margin-bottom:1rem;"><div style="display:flex;justify-content:space-between;gap:0.8rem;flex-wrap:wrap;margin-bottom:0.8rem;"><h4 style="margin:0;color:var(--primary);">' + esc(name) + '</h4><button type="button" class="btn btn-outline btn-sm" style="color:#c62828;border-color:#c62828;" onclick="deletePlaylist(\'' + pl.id + '\')">' + tr.plDelete + '</button></div><div style="font-size:0.85rem;color:#666;margin-bottom:0.6rem;">' + tr.plPosts + ' (' + (pl.postIds||[]).length + ')</div><ul style="list-style:none;padding:0;margin:0 0 1rem;">' + items + '</ul><div style="display:flex;gap:0.5rem;flex-wrap:wrap;"><select id="add-sel-' + pl.id + '" style="flex:1;min-width:160px;padding:0.45rem;"><option value="">' + tr.plSelectPost + '</option>' + opts + '</select><button type="button" class="btn btn-primary btn-sm" onclick="(function(){var s=document.getElementById(\'add-sel-' + pl.id + '\');if(s&&s.value)addPostToPlaylist(\'' + pl.id + '\',s.value);})()">' + tr.plAddPost + '</button></div></div>';
    }).join('');
  };

  window.renderPlaylistsPublic = function () {
    const grid = document.getElementById('playlists-grid');
    if (!grid) return;
    const tr = t();
    const L = lang();
    const list = loadPlaylists();
    if (!list.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><p>' + tr.plEmpty + '</p></div>';
      return;
    }
    grid.innerHTML = list.map(pl => {
      const name = L === 'fa' ? (pl.name_fa || pl.name_en) : (pl.name_en || pl.name_fa);
      const count = (pl.postIds || []).length;
      return '<article class="media-card" style="cursor:pointer;" onclick="openPlaylist(\'' + pl.id + '\')"><div class="media-thumb" style="font-size:2.5rem;">🎵</div><div class="media-body"><h3 class="media-title">' + esc(name) + '</h3><p class="media-desc">' + count + ' ' + tr.plItems + '</p><div class="media-actions"><button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openPlaylist(\'' + pl.id + '\')">' + tr.plOpen + '</button></div></div></article>';
    }).join('');
  };

  window.openPlaylist = function (plId) {
    const tr = t();
    const L = lang();
    const list = loadPlaylists();
    const posts = loadPosts();
    const pl = list.find(p => p.id === plId);
    if (!pl) return;
    const name = L === 'fa' ? (pl.name_fa || pl.name_en) : (pl.name_en || pl.name_fa);
    const modal = document.getElementById('post-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;
    const items = (pl.postIds || []).map((pid, idx) => {
      const p = posts.find(x => x.id === pid);
      if (!p) return '';
      const title = L === 'fa' ? (p.title_fa || p.title_en || tr.untitled) : (p.title_en || p.title_fa || tr.untitled);
      const typeIcon = p.type === 'photo' ? '🖼️' : p.type === 'video' ? '🎬' : p.type === 'audio' ? '🔊' : p.type === 'text' ? '📝' : '📄';
      const openFn = typeof openPost === 'function' ? 'openPost' : 'alert';
      return '<div style="display:flex;align-items:center;gap:0.8rem;padding:0.75rem;border-bottom:1px solid #eee;cursor:pointer;" onclick="' + openFn + '(\'' + p.id + '\')"><span style="font-weight:700;color:var(--primary);min-width:1.5rem;">' + (idx + 1) + '</span><span style="font-size:1.3rem;">' + typeIcon + '</span><span style="flex:1;">' + esc(title) + '</span></div>';
    }).join('') || '<p style="color:#888;padding:1rem;">' + tr.plEmpty + '</p>';
    content.innerHTML = '<button class="modal-close" onclick="document.getElementById(\'post-modal\').classList.remove(\'open\')">&times;</button><div style="font-size:0.85rem;color:#666;margin-bottom:0.3rem;">🎵 ' + tr.playlistsTitle + '</div><h2 style="margin:0.3rem 0 1rem;color:var(--primary)">' + esc(name) + '</h2><div style="max-height:60vh;overflow:auto;">' + items + '</div>';
    modal.classList.add('open');
  };

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('playlist-form');
    if (form) form.addEventListener('submit', handlePlaylistCreate);
    renderPlaylistsAdmin();
    renderPlaylistsPublic();
    document.getElementById('lang-toggle')?.addEventListener('click', function () {
      setTimeout(function () { renderPlaylistsPublic(); renderPlaylistsAdmin(); }, 50);
    });
  });
})();
