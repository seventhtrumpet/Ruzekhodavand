document.addEventListener('DOMContentLoaded', () => {
  loadData();
  applyLanguage();
  renderAll();
  setupEventListeners();
  setupAuth();
  loadVisitorCount();
});

function loadData() {
  try { posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { posts = []; }
  try { liveData = JSON.parse(localStorage.getItem(LIVE_KEY) || '{"isLive":false,"streamUrl":"","title":""}'); } catch { liveData = { isLive: false, streamUrl: '', title: '' }; }
}

function savePosts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
function saveLive() { localStorage.setItem(LIVE_KEY, JSON.stringify(liveData)); }

function setupAuth() {
  auth.getRedirectResult().then(() => {}).catch(err => console.log('Redirect result error:', err.message));
  auth.onAuthStateChanged(user => { currentUser = user; updateAuthUI(); });
  document.getElementById('btn-google')?.addEventListener('click', () => {
    auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  });
  document.getElementById('btn-email')?.addEventListener('click', () => {
    document.getElementById('email-modal').classList.add('open');
  });
  document.getElementById('btn-email-login')?.addEventListener('click', emailLogin);
  document.getElementById('btn-email-register')?.addEventListener('click', emailRegister);
  document.getElementById('btn-signout')?.addEventListener('click', () => auth.signOut());
}

function updateAuthUI() {
  const loggedOut = document.getElementById('auth-logged-out');
  const loggedIn = document.getElementById('auth-logged-in');
  const display = document.getElementById('user-display');
  const t = T[currentLang];
  if (currentUser) {
    if (loggedOut) loggedOut.style.display = 'none';
    if (loggedIn) { loggedIn.style.display = 'flex'; loggedIn.classList.remove('hidden'); }
    if (display) {
      const name = currentUser.displayName || currentUser.email || 'User';
      display.innerHTML = `${t.welcome}, <strong>${escapeHtml(name)}</strong>`;
    }
  } else {
    if (loggedOut) loggedOut.style.display = 'flex';
    if (loggedIn) { loggedIn.style.display = 'none'; loggedIn.classList.add('hidden'); }
  }
}

function closeEmailModal() {
  document.getElementById('email-modal').classList.remove('open');
  const errEl = document.getElementById('email-error');
  if (errEl) errEl.style.display = 'none';
}

function emailLogin() {
  const email = document.getElementById('email-input').value.trim();
  const password = document.getElementById('email-password').value;
  const errEl = document.getElementById('email-error');
  if (!email || !password) {
    errEl.style.display = 'block';
    errEl.textContent = currentLang === 'fa' ? 'لطفاً ایمیل و رمز عبور را وارد کنید' : 'Please enter email and password';
    return;
  }
  auth.signInWithEmailAndPassword(email, password).then(() => closeEmailModal()).catch(err => {
    errEl.style.display = 'block'; errEl.textContent = err.message;
  });
}

function emailRegister() {
  const email = document.getElementById('email-input').value.trim();
  const password = document.getElementById('email-password').value;
  const errEl = document.getElementById('email-error');
  if (!email || !password) {
    errEl.style.display = 'block';
    errEl.textContent = currentLang === 'fa' ? 'لطفاً ایمیل و رمز عبور را وارد کنید' : 'Please enter email and password';
    return;
  }
  if (password.length < 6) {
    errEl.style.display = 'block';
    errEl.textContent = currentLang === 'fa' ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters';
    return;
  }
  auth.createUserWithEmailAndPassword(email, password).then(() => closeEmailModal()).catch(err => {
    errEl.style.display = 'block'; errEl.textContent = err.message;
  });
}

function getProgress(postId) {
  if (!currentUser) return 0;
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return all[currentUser.uid + '::' + postId] || 0;
  } catch { return 0; }
}

function saveProgress(postId, time) {
  if (!currentUser || time < 3) return;
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    all[currentUser.uid + '::' + postId] = time;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

function loadVisitorCount() {
  const KEY = 'cog_visitor_count';
  const ADMIN_SKIP = 'cog_admin_skip_visit';
  try {
    if (sessionStorage.getItem('cog_visit_session')) return;
    if (localStorage.getItem(ADMIN_SKIP) === '1') return;
    let n = parseInt(localStorage.getItem(KEY) || '0', 10) || 0;
    n += 1;
    localStorage.setItem(KEY, String(n));
    sessionStorage.setItem('cog_visit_session', '1');
  } catch {}
}
