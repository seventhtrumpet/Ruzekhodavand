function isAudioFile(post) {
  if (!post) return false;
  if (post.type === 'audio') return true;
  const url = (post.fileUrl || post.url || '').toLowerCase();
  return /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/.test(url);
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return 'https://www.youtube.com/embed/' + u.pathname.slice(1).split('/')[0];
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return 'https://www.youtube.com/embed/' + v;
      const parts = u.pathname.split('/');
      const idx = parts.indexOf('embed');
      if (idx >= 0 && parts[idx + 1]) return 'https://www.youtube.com/embed/' + parts[idx + 1];
      const sidx = parts.indexOf('shorts');
      if (sidx >= 0 && parts[sidx + 1]) return 'https://www.youtube.com/embed/' + parts[sidx + 1];
    }
  } catch {}
  return null;
}

function renderAll() { renderMedia(); renderLive(); updateLiveBadge(); }

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
  if (liveData.isLive && liveData.streamUrl) {
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

function renderMedia() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;
  const t = T[currentLang] || T.en;
  const book = document.getElementById('filter-book')?.value || '';
  const type = document.getElementById('filter-type')?.value || '';
  const q = (document.getElementById('filter-search')?.value || '').toLowerCase();
  let list = posts.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (book) list = list.filter(p => (p.book || '') === book);
  if (type) list = list.filter(p => p.type === type);
  if (q) list = list.filter(p => ((p.title || '') + ' ' + (p.description || '')).toLowerCase().includes(q));
  if (!list.length) {
    grid.innerHTML = '<p class="no-posts">' + (t.noPosts || '') + '</p>';
    return;
  }
  grid.innerHTML = list.map(p => {
    const title = escapeHtml(p.title || t.untitled || '');
    const desc = escapeHtml((p.description || '').slice(0, 120));
    return '<article class="media-card" data-id="' + p.id + '">' +
      '<h3>' + title + '</h3>' +
      (desc ? '<p class="media-desc">' + desc + '</p>' : '') +
      '<button class="btn btn-primary btn-sm" onclick="openPost(\'' + p.id + '\')">' + (t.view || 'View') + '</button>' +
      '</article>';
  }).join('');
}

function openPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;
  const modal = document.getElementById('post-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;
  const t = T[currentLang] || T.en;
  let body = '<button class="modal-close" onclick="closeModal()">&times;</button>';
  body += '<h2>' + escapeHtml(post.title || t.untitled || '') + '</h2>';
  if (post.description) body += '<p>' + escapeHtml(post.description) + '</p>';
  if (post.type === 'text' && post.text) body += '<div class="post-text">' + escapeHtml(post.text).replace(/\n/g, '<br>') + '</div>';
  const yt = getYouTubeEmbedUrl(post.fileUrl || post.url || '');
  if (yt) body += '<div class="video-wrap"><iframe src="' + yt + '" allowfullscreen></iframe></div>';
  else if (post.fileUrl || post.url) {
    const u = post.fileUrl || post.url;
    if (isAudioFile(post)) body += '<audio controls src="' + escapeHtml(u) + '" style="width:100%"></audio>';
    else if ((post.type === 'video') || /\.(mp4|webm)/i.test(u)) body += '<video controls src="' + escapeHtml(u) + '" style="width:100%"></video>';
    else if (post.type === 'photo' || /\.(jpg|jpeg|png|gif|webp)/i.test(u)) body += '<img src="' + escapeHtml(u) + '" alt="" style="max-width:100%">';
    else body += '<a class="btn btn-primary" href="' + escapeHtml(u) + '" target="_blank" rel="noopener">' + (t.download || 'Download') + '</a>';
  }
  content.innerHTML = body;
  modal.classList.add('open');
}

function closeModal() {
  document.getElementById('post-modal')?.classList.remove('open');
}

function addComment(postId) {
  const name = document.getElementById('comment-name')?.value.trim();
  const text = document.getElementById('comment-text')?.value.trim();
  if (!text) return;
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  if (!post.comments) post.comments = [];
  post.comments.push({ name: name || 'Anon', text, at: Date.now() });
  savePosts();
  openPost(postId);
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setupEventListeners() {
  document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);
  document.getElementById('filter-book')?.addEventListener('change', renderMedia);
  document.getElementById('filter-type')?.addEventListener('change', renderMedia);
  document.getElementById('filter-search')?.addEventListener('input', renderMedia);
  document.getElementById('post-modal')?.addEventListener('click', (e) => { if (e.target.id === 'post-modal') closeModal(); });
  document.getElementById('email-modal')?.addEventListener('click', (e) => { if (e.target.id === 'email-modal') closeEmailModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeEmailModal(); } });
}

window.openPost = openPost;
window.closeModal = closeModal;
window.closeEmailModal = closeEmailModal;
window.addComment = addComment;
window.toggleLanguage = toggleLanguage;
