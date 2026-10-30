/* Media render + post modal - matches admin post fields */
function isAudioFile(post) {
  if (!post) return false;
  if (post.type === 'audio') return true;
  const url = (post.externalUrl || post.dataUrl || post.fileUrl || post.url || '').toLowerCase();
  const name = (post.filename || '').toLowerCase();
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/.test(url) || /\.(mp3|wav|ogg|m4a|aac|flac)$/.test(name);
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1).split('/')[0].split('?')[0];
      if (id) return 'https://www.youtube.com/embed/' + id;
    }
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v) return 'https://www.youtube.com/embed/' + v;
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('embed');
      if (idx >= 0 && parts[idx + 1]) return 'https://www.youtube.com/embed/' + parts[idx + 1];
      const sidx = parts.indexOf('shorts');
      if (sidx >= 0 && parts[sidx + 1]) return 'https://www.youtube.com/embed/' + parts[sidx + 1];
      const lidx = parts.indexOf('live');
      if (lidx >= 0 && parts[lidx + 1]) return 'https://www.youtube.com/embed/' + parts[lidx + 1];
    }
  } catch (e) {}
  return null;
}

function postTitle(p) {
  const t = (typeof T !== 'undefined' && T[currentLang]) ? T[currentLang] : {};
  if (currentLang === 'fa') return p.title_fa || p.title_en || p.title || t.untitled || 'Untitled';
  return p.title_en || p.title_fa || p.title || t.untitled || 'Untitled';
}

function postDesc(p) {
  if (currentLang === 'fa') return p.desc_fa || p.desc_en || p.description || '';
  return p.desc_en || p.desc_fa || p.description || '';
}

function postMediaUrl(p) {
  return (p.externalUrl || p.dataUrl || p.fileUrl || p.url || '').trim();
}

function postSortTime(p) {
  return new Date(p.date || p.createdAt || 0).getTime();
}

function isNewPost(p) {
  var t = postSortTime(p);
  if (!t) return false;
  var week = 7 * 24 * 60 * 60 * 1000;
  return (Date.now() - t) <= week;
}

function populateFilterBooks() {
  const sel = document.getElementById('filter-book');
  if (!sel || sel.options.length > 1) return;
  const books = (typeof BIBLE_BOOKS !== 'undefined') ? BIBLE_BOOKS : null;
  if (!books) return;
  const list = books[currentLang] || books.en || [];
  const allLabel = (T && T[currentLang] && T[currentLang].all) || 'All';
  sel.innerHTML = '<option value="">' + allLabel + '</option>' +
    list.map(function (name) { return '<option value="' + name.replace(/"/g, '') + '">' + name + '</option>'; }).join('');
}

function renderAll() {
  populateFilterBooks();
  renderMedia();
  renderLive();
  updateLiveBadge();
}

function updateLiveBadge() {
  const badge = document.getElementById('live-badge');
  if (!badge) return;
  if (liveData && liveData.isLive) badge.classList.remove('hidden');
  else badge.classList.add('hidden');
}

function renderLive() {
  const section = document.getElementById('live-section');
  if (!section) return;
  const offline = document.getElementById('live-offline');
  const iframe = document.getElementById('live-iframe');
  if (liveData && liveData.isLive && liveData.streamUrl) {
    section.classList.remove('hidden');
    if (offline) offline.style.display = 'none';
    if (iframe) iframe.style.display = 'block';
    const titleEl = document.getElementById('live-title');
    if (titleEl) titleEl.textContent = liveData.title || (T[currentLang] && T[currentLang].liveNow) || 'LIVE';
    if (iframe) {
      let src = liveData.streamUrl;
      const yt = getYouTubeEmbedUrl(src);
      if (yt) src = yt + '?autoplay=1';
      iframe.src = src;
    }
  } else {
    if (iframe) { iframe.src = ''; iframe.style.display = 'none'; }
    if (offline) offline.style.display = 'block';
    section.classList.remove('hidden');
  }
}

function loadPlaylistsSafe() {
  try { return JSON.parse(localStorage.getItem('cog_playlists_v1') || '[]'); } catch { return []; }
}

function renderMedia() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;
  const t = (T && T[currentLang]) || (T && T.en) || {};
  const book = document.getElementById('filter-book')?.value || '';
  const type = document.getElementById('filter-type')?.value || '';
  const q = (document.getElementById('filter-search')?.value || '').toLowerCase();
  let list = (posts || []).slice().sort((a, b) => postSortTime(b) - postSortTime(a));
  if (book) {
    list = list.filter(p => (p.book_fa || '') === book || (p.book_en || '') === book || String(p.book || '') === book);
  }
  if (type) list = list.filter(p => p.type === type);
  if (q) {
    list = list.filter(p => {
      const blob = [postTitle(p), postDesc(p), p.writing || '', p.book_fa || '', p.book_en || ''].join(' ').toLowerCase();
      return blob.includes(q);
    });
  }
  if (!list.length) {
    grid.innerHTML = '<p class="no-posts">' + (t.noPosts || 'No posts yet') + '</p>';
    return;
  }
  const newLabel = currentLang === 'fa' ? '\u062c\u062f\u06cc\u062f' : 'NEW';
  grid.innerHTML = list.map(p => {
    const title = escapeHtml(postTitle(p));
    const desc = escapeHtml((postDesc(p) || '').slice(0, 140));
    const typeIcon = p.type === 'photo' ? '\uD83D\uDDBC\uFE0F' : p.type === 'video' ? '\uD83C\uDFAC' : p.type === 'audio' ? '\uD83D\uDD0A' : p.type === 'text' ? '\uD83D\uDCDD' : '\uD83D\uDCC4';
    const bookLabel = escapeHtml((currentLang === 'fa' ? p.book_fa : p.book_en) || '');
    const badge = isNewPost(p)
      ? '<span class="media-new-badge" style="position:absolute;top:8px;inset-inline-start:8px;background:#c9a227;color:#0a2540;font-size:0.72rem;font-weight:800;padding:0.2rem 0.5rem;border-radius:999px;letter-spacing:0.03em;z-index:2;box-shadow:0 2px 8px rgba(0,0,0,0.25);">' + newLabel + '</span>'
      : '';
    return '<article class="media-card" data-id="' + p.id + '" style="position:relative;">' +
      badge +
      '<div class="media-thumb" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem;min-height:100px;background:linear-gradient(135deg,#0a2540,#1a4a7a);color:#fff;">' + typeIcon + '</div>' +
      '<div class="media-body" style="padding:1rem;flex:1;display:flex;flex-direction:column;">' +
      '<h3 class="media-title" style="margin:0 0 0.4rem;font-size:1.1rem;">' + title + '</h3>' +
      (bookLabel ? '<div class="media-meta" style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;">' + bookLabel + '</div>' : '') +
      (desc ? '<p class="media-desc" style="flex:1;">' + desc + '</p>' : '') +
      '<div class="media-actions" style="margin-top:0.8rem;">' +
      '<button type="button" class="btn btn-primary media-view-btn" onclick="openPost(\'' + p.id + '\')">' + (t.view || 'View') + '</button>' +
      '</div></div></article>';
  }).join('');
}

function openPost(id) {
  const post = (posts || []).find(p => p.id === id);
  if (!post) return;
  const modal = document.getElementById('post-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;
  const t = (T && T[currentLang]) || (T && T.en) || {};
  const mediaUrl = postMediaUrl(post);
  let body = '<button class="modal-close" type="button" onclick="closeModal()">&times;</button>';
  body += '<h2 style="margin-top:0.5rem;padding-right:2rem;padding-left:2rem;">' + escapeHtml(postTitle(post)) + '</h2>';
  const d = postDesc(post);
  if (d) body += '<p style="color:var(--text-muted);">' + escapeHtml(d) + '</p>';
  if (post.writing || (post.type === 'text' && post.text)) {
    const text = post.writing || post.text || '';
    body += '<div class="post-text" style="line-height:1.8;margin:1rem 0;white-space:pre-wrap;">' + escapeHtml(text).replace(/\n/g, '<br>') + '</div>';
  }
  const yt = getYouTubeEmbedUrl(mediaUrl);
  if (yt) {
    body += '<div class="video-wrap" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:1rem 0;background:#000;">' +
      '<iframe src="' + yt + '" title="video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen ' +
      'style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe></div>';
  } else if (mediaUrl) {
    if (isAudioFile(post)) {
      body += '<audio id="post-player" controls preload="metadata" src="' + escapeHtml(mediaUrl) + '" style="width:100%;margin:1rem 0;"></audio>';
    } else if (post.type === 'video' || /\.(mp4|webm|ogg)(\?|$)/i.test(mediaUrl)) {
      body += '<video id="post-player" controls playsinline preload="metadata" src="' + escapeHtml(mediaUrl) + '" style="width:100%;max-height:70vh;border-radius:12px;background:#000;"></video>';
    } else if (post.type === 'photo' || /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(mediaUrl)) {
      body += '<img src="' + escapeHtml(mediaUrl) + '" alt="" class="modal-media" style="max-width:100%;border-radius:12px;">';
    } else {
      body += '<p style="margin:1rem 0;"><a class="btn btn-primary" href="' + escapeHtml(mediaUrl) + '" target="_blank" rel="noopener">' + (t.download || 'Open / Download') + '</a></p>';
    }
  }

  const pls = loadPlaylistsSafe();
  if (pls.length) {
    const plLabel = currentLang === 'fa' ? '\u0627\u0641\u0632\u0648\u062f\u0646 \u0628\u0647 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a' : 'Add to playlist';
    const addLbl = currentLang === 'fa' ? '\u0627\u0641\u0632\u0648\u062f\u0646' : 'Add';
    const opts = pls.map(pl => {
      const name = currentLang === 'fa' ? (pl.name_fa || pl.name_en) : (pl.name_en || pl.name_fa);
      return '<option value="' + pl.id + '">' + escapeHtml(name) + '</option>';
    }).join('');
    body += '<div style="margin-top:1.2rem;padding-top:1rem;border-top:1px solid #e8e4dc;display:flex;gap:0.6rem;flex-wrap:wrap;align-items:center;">' +
      '<label style="font-size:0.9rem;font-weight:600;">' + plLabel + '</label>' +
      '<select id="modal-pl-select" style="flex:1;min-width:140px;padding:0.55rem 0.7rem;font-size:1rem;border-radius:8px;border:1px solid #ccc;">' +
      '<option value="">—</option>' + opts + '</select>' +
      '<button type="button" class="btn btn-primary" style="padding:0.55rem 1.1rem;font-size:1rem;" onclick="addPostToPlaylistFromModal(\'' + post.id + '\')">' + addLbl + '</button></div>';
  }

  content.innerHTML = body;
  modal.classList.add('open');

  const player = document.getElementById('post-player');
  if (player && typeof getProgress === 'function') {
    const start = getProgress(post.id);
    player.addEventListener('loadedmetadata', function once() {
      if (start > 0 && start < (player.duration || Infinity) - 2) {
        try { player.currentTime = start; } catch (e) {}
      }
      player.removeEventListener('loadedmetadata', once);
    });
    player.addEventListener('timeupdate', function () {
      if (typeof saveProgress === 'function') saveProgress(post.id, player.currentTime);
    });
  }
}

function addPostToPlaylistFromModal(postId) {
  const sel = document.getElementById('modal-pl-select');
  if (!sel || !sel.value) {
    alert(currentLang === 'fa' ? '\u0644\u0637\u0641\u0627\u064b \u06cc\u06a9 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f' : 'Please select a playlist');
    return;
  }
  try {
    const list = JSON.parse(localStorage.getItem('cog_playlists_v1') || '[]');
    const pl = list.find(p => p.id === sel.value);
    if (!pl) return;
    if (!pl.postIds) pl.postIds = [];
    if (!pl.postIds.includes(postId)) pl.postIds.push(postId);
    localStorage.setItem('cog_playlists_v1', JSON.stringify(list));
    alert(currentLang === 'fa' ? '\u0628\u0647 \u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a \u0627\u0636\u0627\u0641\u0647 \u0634\u062f' : 'Added to playlist');
  } catch (e) {
    alert('Error');
  }
}

function closeModal() {
  const modal = document.getElementById('post-modal');
  if (modal) modal.classList.remove('open');
  const content = document.getElementById('modal-content');
  if (content) {
    const iframe = content.querySelector('iframe');
    if (iframe) iframe.src = '';
    const player = content.querySelector('video,audio');
    if (player) { try { player.pause(); } catch (e) {} }
  }
}

function addComment(postId) {
  const name = document.getElementById('comment-name')?.value.trim();
  const text = document.getElementById('comment-text')?.value.trim();
  if (!text) return;
  const post = (posts || []).find(p => p.id === postId);
  if (!post) return;
  if (!post.comments) post.comments = [];
  post.comments.push({ name: name || 'Anon', text, at: Date.now() });
  if (typeof savePosts === 'function') savePosts();
  openPost(postId);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

function setupEventListeners() {
  document.getElementById('lang-toggle')?.addEventListener('click', function () {
    if (typeof toggleLanguage === 'function') toggleLanguage();
    setTimeout(renderMedia, 50);
  });
  document.getElementById('filter-book')?.addEventListener('change', renderMedia);
  document.getElementById('filter-type')?.addEventListener('change', renderMedia);
  document.getElementById('filter-search')?.addEventListener('input', renderMedia);
  document.getElementById('post-modal')?.addEventListener('click', function (e) {
    if (e.target.id === 'post-modal') closeModal();
  });
  document.getElementById('email-modal')?.addEventListener('click', function (e) {
    if (e.target.id === 'email-modal' && typeof closeEmailModal === 'function') closeEmailModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      if (typeof closeEmailModal === 'function') closeEmailModal();
    }
  });
}

window.openPost = openPost;
window.closeModal = closeModal;
window.addComment = addComment;
window.addPostToPlaylistFromModal = addPostToPlaylistFromModal;
window.renderMedia = renderMedia;
window.renderAll = renderAll;
window.getYouTubeEmbedUrl = getYouTubeEmbedUrl;
