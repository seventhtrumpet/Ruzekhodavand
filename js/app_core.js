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

function ensureAuthUI() {
  const bar = document.getElementById('user-bar');
  if (bar) bar.style.display = 'none';

  if (!document.getElementById('signin-modal')) {
    const modal = document.createElement('div');
    modal.id = 'signin-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML =
      '<div class="modal" style="max-width:380px;text-align:center;">' +
      '<button type="button" class="modal-close" id="signin-modal-close">&times;</button>' +
      '<h2 style="margin-bottom:1.2rem;color:var(--primary)" data-i18n-signin-title>ورود</h2>' +
      '<button type="button" id="btn-google" class="btn btn-primary" style="width:100%;margin-bottom:0.7rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;">' +
      '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="">' +
      '<span data-i18n-signin-google>ورود با گوگل</span></button>' +
      '<button type="button" id="btn-email" class="btn btn-outline" style="width:100%;" data-i18n-signin-email>ورود با ایمیل</button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeSignInModal(); });
    document.getElementById('signin-modal-close').addEventListener('click', closeSignInModal);
  }

  let actions = document.querySelector('.header-actions');
  if (!actions) {
    const inner = document.querySelector('.header-inner');
    if (inner) {
      actions = document.createElement('div');
      actions.className = 'header-actions';
      inner.appendChild(actions);
    }
  }
  if (actions && !document.getElementById('btn-signin-top')) {
    const wrap = document.createElement('div');
    wrap.id = 'auth-header-wrap';
    wrap.style.cssText = 'display:flex;align-items:center;gap:0.5rem;';
    wrap.innerHTML =
      '<button type="button" id="btn-signin-top" class="btn btn-primary btn-sm" data-i18n-signin>ورود</button>' +
      '<div id="auth-header-user" class="hidden" style="display:none;align-items:center;gap:0.5rem;">' +
      '<span id="user-display" style="font-size:0.85rem;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></span>' +
      '<button type="button" id="btn-signout" class="btn btn-outline btn-sm" data-i18n-signout>خروج</button></div>';
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle && menuToggle.parentNode === actions) {
      actions.insertBefore(wrap, menuToggle);
    } else {
      actions.insertBefore(wrap, actions.firstChild);
    }
  }

  if (!document.getElementById('email-modal')) {
    const em = document.createElement('div');
    em.id = 'email-modal';
    em.className = 'modal-overlay';
    em.innerHTML =
      '<div class="modal" style="max-width:400px;">' +
      '<button type="button" class="modal-close" onclick="closeEmailModal()">&times;</button>' +
      '<h2 style="margin-bottom:1rem;color:var(--primary)" data-i18n="emailLoginTitle">ورود با ایمیل</h2>' +
      '<div id="email-form">' +
      '<div class="form-group"><label data-i18n="emailLabel">ایمیل</label><input type="email" id="email-input" required></div>' +
      '<div class="form-group"><label data-i18n="passwordLabel">رمز عبور</label><input type="password" id="email-password" required></div>' +
      '<div id="email-error" style="color:#c62828;font-size:0.9rem;margin-bottom:0.8rem;display:none;"></div>' +
      '<button type="button" id="btn-email-login" class="btn btn-primary" style="width:100%;margin-bottom:0.5rem;" data-i18n="loginBtn">ورود</button>' +
      '<button type="button" id="btn-email-register" class="btn btn-outline" style="width:100%;" data-i18n="registerBtn">ثبت‌نام</button>' +
      '</div></div>';
    document.body.appendChild(em);
  }
  applySignInLabels();
}

function applySignInLabels() {
  const fa = (typeof currentLang !== 'undefined' ? currentLang : 'fa') === 'fa';
  const set = (sel, faT, enT) => {
    document.querySelectorAll(sel).forEach(el => { el.textContent = fa ? faT : enT; });
  };
  set('[data-i18n-signin]', 'ورود', 'Sign in');
  set('[data-i18n-signout]', 'خروج', 'Sign out');
  set('[data-i18n-signin-title]', 'ورود', 'Sign in');
  set('[data-i18n-signin-google]', 'ورود با گوگل', 'Sign in with Google');
  set('[data-i18n-signin-email]', 'ورود با ایمیل', 'Sign in with Email');
}

function openSignInModal() {
  const m = document.getElementById('signin-modal');
  if (m) m.classList.add('open');
}
function closeSignInModal() {
  const m = document.getElementById('signin-modal');
  if (m) m.classList.remove('open');
}

function setupAuth() {
  ensureAuthUI();
  auth.getRedirectResult().then(() => {}).catch(err => console.log('Redirect result error:', err.message));
  auth.onAuthStateChanged(user => { currentUser = user; updateAuthUI(); });
  document.getElementById('btn-signin-top')?.addEventListener('click', openSignInModal);
  document.getElementById('btn-google')?.addEventListener('click', () => {
    auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  });
  document.getElementById('btn-email')?.addEventListener('click', () => {
    closeSignInModal();
    document.getElementById('email-modal')?.classList.add('open');
  });
  document.getElementById('btn-email-login')?.addEventListener('click', emailLogin);
  document.getElementById('btn-email-register')?.addEventListener('click', emailRegister);
  document.getElementById('btn-signout')?.addEventListener('click', () => auth.signOut());
  document.getElementById('lang-toggle')?.addEventListener('click', () => setTimeout(applySignInLabels, 50));
}

function updateAuthUI() {
  const btnSignIn = document.getElementById('btn-signin-top');
  const userWrap = document.getElementById('auth-header-user');
  const display = document.getElementById('user-display');
  const t = (typeof T !== 'undefined' && T[currentLang]) ? T[currentLang] : { welcome: 'Welcome' };
  const bar = document.getElementById('user-bar');
  if (bar) bar.style.display = 'none';
  if (currentUser) {
    if (btnSignIn) btnSignIn.style.display = 'none';
    if (userWrap) { userWrap.style.display = 'flex'; userWrap.classList.remove('hidden'); }
    if (display) {
      const name = currentUser.displayName || currentUser.email || 'User';
      display.innerHTML = (t.welcome || '') + ', <strong>' + escapeHtml(name) + '</strong>';
    }
    closeSignInModal();
  } else {
    if (btnSignIn) btnSignIn.style.display = '';
    if (userWrap) { userWrap.style.display = 'none'; userWrap.classList.add('hidden'); }
  }
  applySignInLabels();
}

function closeEmailModal() {
  document.getElementById('email-modal')?.classList.remove('open');
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
  try {
    let n = parseInt(localStorage.getItem('cog_visits') || '0', 10);
    if (!sessionStorage.getItem('cog_counted')) {
      n += 1;
      localStorage.setItem('cog_visits', String(n));
      sessionStorage.setItem('cog_counted', '1');
    }
  } catch {}
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? 'https://www.youtube.com/embed/' + m[1] : null;
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

function renderAll() {
  if (typeof renderMedia === 'function') renderMedia();
  if (typeof renderLive === 'function') renderLive();
  const badge = document.getElementById('live-badge');
  if (badge) badge.classList.toggle('hidden', !(liveData && liveData.isLive));
}

function setupEventListeners() {
  document.getElementById('filter-book')?.addEventListener('change', () => { if (typeof renderMedia === 'function') renderMedia(); });
  document.getElementById('filter-type')?.addEventListener('change', () => { if (typeof renderMedia === 'function') renderMedia(); });
  document.getElementById('filter-search')?.addEventListener('input', () => { if (typeof renderMedia === 'function') renderMedia(); });
}

function applyLanguage() {
  if (typeof T === 'undefined') return;
  const t = T[currentLang] || T.fa;
  document.documentElement.lang = currentLang === 'fa' ? 'fa' : 'en';
  document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  document.body.classList.toggle('lang-en', currentLang === 'en');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (t[k] !== undefined) el.textContent = t[k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const k = el.getAttribute('data-i18n-placeholder');
    if (t[k] !== undefined) el.placeholder = t[k];
  });
  if (typeof applySignInLabels === 'function') applySignInLabels();
  if (typeof updateSideMenuLang === 'function') updateSideMenuLang();
  if (typeof renderAll === 'function') renderAll();
}

function toggleLanguage() {
  currentLang = currentLang === 'fa' ? 'en' : 'fa';
  localStorage.setItem(LANG_KEY, currentLang);
  applyLanguage();
}

document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);
