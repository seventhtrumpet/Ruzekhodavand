/* Personal playlists for visitors — only site videos & audio */
(function () {
  var KEY = 'cog_my_playlists_v1';

  function isFa() {
    try {
      var L = (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
      return L !== 'en';
    } catch (e) {
      return true;
    }
  }

  function t(fa, en) {
    return isFa() ? fa : en;
  }

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function uid() {
    return 'upl_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function isVideoOrAudio(post) {
    if (!post) return false;
    if (post.type === 'video' || post.type === 'audio') return true;
    var url = (post.externalUrl || post.dataUrl || post.fileUrl || post.url || '').toLowerCase();
    if (/youtu\.be|youtube\.com/.test(url)) return true;
    if (/\.(mp4|webm|mov|m4v|mp3|wav|ogg|m4a|aac|flac)(\?|$)/i.test(url)) return true;
    return false;
  }

  function postTitle(p) {
    if (typeof window.postTitle === 'function') {
      try {
        return window.postTitle(p);
      } catch (e) {}
    }
    if (isFa()) return p.title_fa || p.title_en || p.title || '';
    return p.title_en || p.title_fa || p.title || '';
  }

  function getPosts() {
    try {
      if (typeof posts !== 'undefined' && Array.isArray(posts)) return posts;
    } catch (e) {}
    try {
      return JSON.parse(localStorage.getItem('cog_posts_v1') || '[]');
    } catch (e2) {
      return [];
    }
  }

  function createPlaylist(name) {
    name = String(name || '').trim();
    if (!name) return null;
    var list = load();
    var pl = { id: uid(), name: name, postIds: [], createdAt: Date.now() };
    list.unshift(pl);
    save(list);
    return pl;
  }

  function addToPlaylist(plId, postId) {
    var allPosts = getPosts();
    var post = allPosts.find(function (p) {
      return p && p.id === postId;
    });
    if (!post || !isVideoOrAudio(post)) {
      alert(t('\u0641\u0642\u0637 \u0648\u06cc\u062f\u06cc\u0648 \u0648 \u0622\u0647\u0646\u06af \u0633\u0627\u06cc\u062a \u0631\u0627 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646 \u0627\u0636\u0627\u0641\u0647 \u06a9\u0631\u062f.', 'You can only add this site\'s videos or songs.'));
      return false;
    }
    var list = load();
    var pl = list.find(function (p) {
      return p.id === plId;
    });
    if (!pl) return false;
    if (!pl.postIds) pl.postIds = [];
    if (pl.postIds.indexOf(postId) >= 0) {
      alert(t('\u0642\u0628\u0644\u0627\u064b \u062f\u0631 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0647\u0633\u062a.', 'Already in this playlist.'));
      return false;
    }
    pl.postIds.push(postId);
    save(list);
    return true;
  }

  function removeFromPlaylist(plId, postId) {
    var list = load();
    var pl = list.find(function (p) {
      return p.id === plId;
    });
    if (!pl || !pl.postIds) return;
    pl.postIds = pl.postIds.filter(function (id) {
      return id !== postId;
    });
    save(list);
  }

  function deletePlaylist(plId) {
    save(
      load().filter(function (p) {
        return p.id !== plId;
      })
    );
  }

  function injectModalControls(postId) {
    var content = document.getElementById('modal-content');
    if (!content) return;
    var allPosts = getPosts();
    var post = allPosts.find(function (p) {
      return p && p.id === postId;
    });
    if (!post || !isVideoOrAudio(post)) return;
    if (content.querySelector('#my-pl-box')) return;

    var list = load();
    var box = document.createElement('div');
    box.id = 'my-pl-box';
    box.style.cssText =
      'margin-top:1.2rem;padding-top:1rem;border-top:1px solid rgba(0,0,0,.08);';

    var title = document.createElement('div');
    title.style.cssText = 'font-weight:700;margin-bottom:0.6rem;color:var(--primary,#0a2540);';
    title.textContent = t('\u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0645\u0646', 'My playlist');
    box.appendChild(title);

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;';

    var sel = document.createElement('select');
    sel.id = 'my-pl-select';
    sel.style.cssText =
      'flex:1;min-width:140px;padding:0.55rem 0.7rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;';
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = t('\u2014 \u0627\u0646\u062a\u062e\u0627\u0628 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u2014', '\u2014 Choose playlist \u2014');
    sel.appendChild(opt0);
    list.forEach(function (pl) {
      var o = document.createElement('option');
      o.value = pl.id;
      o.textContent = pl.name + ' (' + (pl.postIds ? pl.postIds.length : 0) + ')';
      sel.appendChild(o);
    });
    row.appendChild(sel);

    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-primary';
    addBtn.style.cssText = 'padding:0.55rem 1rem;font-size:0.95rem;';
    addBtn.textContent = t('\u0627\u0641\u0632\u0648\u062f\u0646', 'Add');
    addBtn.addEventListener('click', function () {
      if (!sel.value) {
        alert(t('\u0627\u0648\u0644 \u06cc\u06a9 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0628\u0633\u0627\u0632\u06cc\u062f \u06cc\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f.', 'Create or choose a playlist first.'));
        return;
      }
      if (addToPlaylist(sel.value, postId)) {
        alert(t('\u0628\u0647 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0627\u0636\u0627\u0641\u0647 \u0634\u062f.', 'Added to your playlist.'));
        renderPanel();
        injectModalControls(postId);
        var old = document.getElementById('my-pl-box');
        if (old) old.remove();
        injectModalControls(postId);
      }
    });
    row.appendChild(addBtn);
    box.appendChild(row);

    var createRow = document.createElement('div');
    createRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.7rem;';
    var nameIn = document.createElement('input');
    nameIn.type = 'text';
    nameIn.placeholder = t('\u0646\u0627\u0645 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u062c\u062f\u06cc\u062f', 'New playlist name');
    nameIn.style.cssText =
      'flex:1;min-width:140px;padding:0.55rem 0.7rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;';
    var createBtn = document.createElement('button');
    createBtn.type = 'button';
    createBtn.className = 'btn btn-outline';
    createBtn.style.cssText = 'padding:0.55rem 1rem;font-size:0.95rem;';
    createBtn.textContent = t('\u0633\u0627\u062e\u062a\u0646', 'Create');
    createBtn.addEventListener('click', function () {
      var pl = createPlaylist(nameIn.value);
      if (!pl) {
        alert(t('\u0646\u0627\u0645 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f.', 'Enter a name.'));
        return;
      }
      nameIn.value = '';
      alert(t('\u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0633\u0627\u062e\u062a\u0647 \u0634\u062f.', 'Playlist created.'));
      var old = document.getElementById('my-pl-box');
      if (old) old.remove();
      injectModalControls(postId);
      renderPanel();
    });
    createRow.appendChild(nameIn);
    createRow.appendChild(createBtn);
    box.appendChild(createRow);

    content.appendChild(box);
  }

  function renderPanel() {
    var host = document.getElementById('my-playlists-panel');
    if (!host) return;
    var list = load();
    var allPosts = getPosts();

    var html =
      '<h2 style="font-size:1.15rem;margin:0 0 0.8rem;color:var(--primary,#0a2540);">' +
      t('\u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a\u200c\u0647\u0627\u06cc \u0645\u0646', 'My playlists') +
      '</h2>';
    html +=
      '<p style="font-size:0.9rem;color:var(--text-muted,#666);margin:0 0 1rem;">' +
      t(
        '\u0641\u0642\u0637 \u0648\u06cc\u062f\u06cc\u0648\u0647\u0627 \u0648 \u0622\u0647\u0646\u06af\u200c\u0647\u0627\u06cc \u0627\u06cc\u0646 \u0633\u0627\u06cc\u062a \u0631\u0627 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0636\u0627\u0641\u0647 \u06a9\u0646\u06cc\u062f.',
        'You can only add videos and songs from this website.'
      ) +
      '</p>';

    html +=
      '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">' +
      '<input type="text" id="new-pl-name" placeholder="' +
      t('\u0646\u0627\u0645 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u062c\u062f\u06cc\u062f', 'New playlist name') +
      '" style="flex:1;min-width:160px;padding:0.55rem 0.7rem;border-radius:8px;border:1px solid #ccc;font-size:1rem;">' +
      '<button type="button" class="btn btn-primary" id="btn-create-pl">' +
      t('\u0633\u0627\u062e\u062a\u0646 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a', 'Create playlist') +
      '</button></div>';

    if (!list.length) {
      html +=
        '<p style="color:var(--text-muted,#888);">' +
        t('\u0647\u0646\u0648\u0632 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a\u06cc \u0646\u062f\u0627\u0631\u06cc\u062f.', 'You have no playlists yet.') +
        '</p>';
    } else {
      list.forEach(function (pl) {
        html +=
          '<div class="my-pl-card" data-pl="' +
          pl.id +
          '" style="background:#fff;border:1px solid #e8e4dc;border-radius:12px;padding:1rem;margin-bottom:0.8rem;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">' +
          '<strong style="font-size:1.05rem;">' +
          escape(pl.name) +
          '</strong>' +
          '<button type="button" class="btn btn-outline btn-sm pl-del" data-pl="' +
          pl.id +
          '" style="font-size:0.85rem;">' +
          t('\u062d\u0630\u0641', 'Delete') +
          '</button></div>';
        var ids = pl.postIds || [];
        if (!ids.length) {
          html +=
            '<p style="margin:0.5rem 0 0;font-size:0.9rem;color:#888;">' +
            t('\u062e\u0627\u0644\u06cc', 'Empty') +
            '</p>';
        } else {
          html += '<ul style="margin:0.6rem 0 0;padding:0;list-style:none;">';
          ids.forEach(function (pid) {
            var p = allPosts.find(function (x) {
              return x && x.id === pid;
            });
            var label = p ? postTitle(p) : pid;
            var canPlay = p && isVideoOrAudio(p);
            html +=
              '<li style="display:flex;align-items:center;gap:0.5rem;padding:0.35rem 0;border-top:1px solid #f0ece4;">' +
              (canPlay
                ? '<button type="button" class="btn btn-primary btn-sm pl-play" data-id="' +
                  pid +
                  '" style="font-size:0.85rem;">' +
                  t('\u067e\u062e\u0634', 'Play') +
                  '</button>'
                : '') +
              '<span style="flex:1;">' +
              escape(label) +
              '</span>' +
              '<button type="button" class="btn btn-outline btn-sm pl-remove" data-pl="' +
              pl.id +
              '" data-id="' +
              pid +
              '" style="font-size:0.8rem;">' +
              t('\u062d\u0630\u0641', 'Remove') +
              '</button></li>';
          });
          html += '</ul>';
        }
        html += '</div>';
      });
    }

    host.innerHTML = html;

    var createBtn = document.getElementById('btn-create-pl');
    if (createBtn) {
      createBtn.onclick = function () {
        var inp = document.getElementById('new-pl-name');
        var pl = createPlaylist(inp && inp.value);
        if (!pl) {
          alert(t('\u0646\u0627\u0645 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f.', 'Enter a name.'));
          return;
        }
        renderPanel();
      };
    }
    host.querySelectorAll('.pl-del').forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm(t('\u0627\u06cc\u0646 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u062d\u0630\u0641 \u0634\u0648\u062f\u061f', 'Delete this playlist?'))) return;
        deletePlaylist(btn.getAttribute('data-pl'));
        renderPanel();
      };
    });
    host.querySelectorAll('.pl-remove').forEach(function (btn) {
      btn.onclick = function () {
        removeFromPlaylist(btn.getAttribute('data-pl'), btn.getAttribute('data-id'));
        renderPanel();
      };
    });
    host.querySelectorAll('.pl-play').forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-id');
        if (typeof window.openPost === 'function') window.openPost(id);
      };
    });
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ensurePanel() {
    if (document.getElementById('my-playlists-panel')) return;
    var section = document.getElementById('media');
    if (!section) return;
    var panel = document.createElement('div');
    panel.id = 'my-playlists-panel';
    panel.style.cssText =
      'margin:0 0 1.5rem;padding:1.1rem 1.2rem;background:linear-gradient(180deg,#f8f5ee,#fff);border:1px solid #e8e4dc;border-radius:14px;';
    var filters = section.querySelector('.filters');
    if (filters) section.insertBefore(panel, filters);
    else section.insertBefore(panel, section.firstChild.nextSibling);
  }

  function patchOpenPost() {
    if (typeof window.openPost !== 'function') return;
    if (window.openPost._userPlPatched) return;
    var orig = window.openPost;
    window.openPost = function (id) {
      orig(id);
      setTimeout(function () {
        // Remove old admin-only playlist UI if present
        try {
          var content = document.getElementById('modal-content');
          if (content) {
            content.querySelectorAll('#modal-pl-select').forEach(function (el) {
              var row = el.closest('div');
              if (row) row.remove();
            });
          }
        } catch (e) {}
        injectModalControls(id);
        // autoplay
        try {
          var content2 = document.getElementById('modal-content');
          if (content2) {
            var iframe = content2.querySelector('iframe');
            if (iframe && iframe.src && iframe.src.indexOf('autoplay') < 0) {
              iframe.src += (iframe.src.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
            }
            var vid = content2.querySelector('video');
            if (vid) {
              try {
                vid.play();
              } catch (e2) {}
            }
          }
        } catch (e3) {}
      }, 50);
    };
    window.openPost._userPlPatched = true;
  }

  function boot() {
    ensurePanel();
    renderPanel();
    patchOpenPost();
    setTimeout(patchOpenPost, 400);
    setTimeout(function () {
      ensurePanel();
      renderPanel();
      patchOpenPost();
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.STUserPlaylists = {
    load: load,
    create: createPlaylist,
    add: addToPlaylist,
    render: renderPanel
  };
})();
