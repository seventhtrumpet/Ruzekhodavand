document.addEventListener('DOMContentLoaded', () => {
  loadData();
  try { if (typeof applyLanguage === 'function') applyLanguage(); } catch (e) { console.warn(e); }
  try { if (typeof renderAll === 'function') renderAll(); } catch (e) { console.warn(e); }
  try { if (typeof setupEventListeners === 'function') setupEventListeners(); } catch (e) { console.warn(e); }
  try { setupAuth(); } catch (e) { console.warn(e); }
  try { loadVisitorCount(); } catch (e) { console.warn(e); }
});

function loadData() {
  try { posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { posts = []; }
  try { liveData = JSON.parse(localStorage.getItem(LIVE_KEY) || '{"isLive":false,"streamUrl":"","title":""}'); } catch { liveData = { isLive: false, streamUrl: '', title: '' }; }
}

function savePosts() { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
function saveLive() { localStorage.setItem(LIVE_KEY, JSON.stringify(liveData)); }

function setupAuth() {
  if (typeof auth === 'undefined' || !auth) return;
  auth.getRedirectResult().then(() => {}).catch(err => console.log('Redirect result error:', err.message));
  auth.onAuthStateChanged(user => { currentUser = user; updateAuthUI(); });
  document.getElementById('btn-google')?.addEventListener('click', () => {
    auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  });
  document.getElementById('btn-email')?.addEventListener('click', () => {
    document.getElementById('email-modal')?.classList.add('open');
  });
  document.getElementById('btn-email-login')?.addEventListener('click', emailLogin);
  document.getElementById('btn-email-register')?.addEventListener('click', emailRegister);
  document.getElementById('btn-signout')?.addEventListener('click', () => auth.signOut());
}

function updateAuthUI() {
  const loggedOut = document.getElementById('auth-logged-out');
  const loggedIn = document.getElementById('auth-logged-in');
  const display = document.getElementById('user-display');
  const t = (typeof T !== 'undefined' && T[currentLang]) ? T[currentLang] : {};
  if (currentUser) {
    if (loggedOut) loggedOut.style.display = 'none';
    if (loggedIn) { loggedIn.style.display = 'flex'; loggedIn.classList.remove('hidden'); }
    if (display) {
      const name = currentUser.displayName || currentUser.email || 'User';
      const welcome = t.welcome || (currentLang === 'en' ? 'Welcome' : '\u062e\u0648\u0634 \u0622\u0645\u062f\u06cc\u062f');
      const esc = (typeof escapeHtml === 'function') ? escapeHtml(name) : String(name).replace(/</g,'');
      display.innerHTML = welcome + ', <strong>' + esc + '</strong>';
    }
  } else {
    if (loggedOut) loggedOut.style.display = 'flex';
    if (loggedIn) { loggedIn.style.display = 'none'; loggedIn.classList.add('hidden'); }
  }
}

function closeEmailModal() {
  document.getElementById('email-modal')?.classList.remove('open');
  const errEl = document.getElementById('email-error');
  if (errEl) errEl.style.display = 'none';
}

function emailLogin() {
  const email = document.getElementById('email-input')?.value.trim();
  const password = document.getElementById('email-password')?.value;
  const errEl = document.getElementById('email-error');
  if (!email || !password) {
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = currentLang === 'fa' ? '\u0644\u0637\u0641\u0627\u064b \u0627\u06cc\u0645\u06cc\u0644 \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f' : 'Please enter email and password';
    }
    return;
  }
  auth.signInWithEmailAndPassword(email, password).then(() => closeEmailModal()).catch(err => {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = err.message; }
  });
}

function emailRegister() {
  const email = document.getElementById('email-input')?.value.trim();
  const password = document.getElementById('email-password')?.value;
  const errEl = document.getElementById('email-error');
  if (!email || !password) {
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = currentLang === 'fa' ? '\u0644\u0637\u0641\u0627\u064b \u0627\u06cc\u0645\u06cc\u0644 \u0648 \u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f' : 'Please enter email and password';
    }
    return;
  }
  if (password.length < 6) {
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = currentLang === 'fa' ? '\u0631\u0645\u0632 \u0639\u0628\u0648\u0631 \u0628\u0627\u06cc\u062f \u062d\u062f\u0627\u0642\u0644 \u06f6 \u06a9\u0627\u0631\u0627\u06a9\u062a\u0631 \u0628\u0627\u0634\u062f' : 'Password must be at least 6 characters';
    }
    return;
  }
  auth.createUserWithEmailAndPassword(email, password).then(() => closeEmailModal()).catch(err => {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = err.message; }
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
  try {
    if (typeof window.recordSiteVisit === 'function') window.recordSiteVisit();
  } catch (e) {}
}
