/* Daily verse subscribers — Firebase Firestore + admin list */
(function (global) {
  const COL = 'verse_subscribers';

  function getDb() {
    try {
      if (typeof firebase === 'undefined') return null;
      if (!firebase.apps || !firebase.apps.length) return null;
      if (!firebase.firestore) return null;
      return firebase.firestore();
    } catch (e) { return null; }
  }

  function emailId(email) {
    return String(email || '').toLowerCase().trim().replace(/[^a-z0-9@._+-]/g, '_').slice(0, 120);
  }

  function saveSubscriber(email, source) {
    email = String(email || '').trim().toLowerCase();
    if (!email || email.indexOf('@') < 1) return Promise.resolve(false);
    const db = getDb();
    if (!db) {
      try {
        const key = 'cog_subscribers_v1';
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        if (!list.some(x => x.email === email)) {
          list.unshift({ email: email, source: source || 'website', at: Date.now() });
          localStorage.setItem(key, JSON.stringify(list.slice(0, 500)));
        }
      } catch (e) {}
      return Promise.resolve(true);
    }
    const id = emailId(email);
    return db.collection(COL).doc(id).set({
      email: email,
      source: source || 'website',
      at: firebase.firestore.FieldValue.serverTimestamp(),
      atMs: Date.now()
    }, { merge: true }).then(() => true).catch(err => {
      console.warn('subscriber save', err);
      try {
        const key = 'cog_subscribers_v1';
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        if (!list.some(x => x.email === email)) {
          list.unshift({ email: email, source: source || 'website', at: Date.now() });
          localStorage.setItem(key, JSON.stringify(list.slice(0, 500)));
        }
      } catch (e) {}
      return false;
    });
  }

  function loadSubscribers() {
    const db = getDb();
    if (db) {
      return db.collection(COL).orderBy('atMs', 'desc').limit(500).get()
        .then(snap => {
          const rows = [];
          snap.forEach(doc => {
            const d = doc.data() || {};
            rows.push({
              id: doc.id,
              email: d.email || doc.id,
              source: d.source || '',
              at: d.atMs || (d.at && d.at.toMillis ? d.at.toMillis() : 0)
            });
          });
          return rows;
        })
        .catch(err => {
          console.warn('subscriber load firestore', err);
          return loadLocal();
        });
    }
    return Promise.resolve(loadLocal());
  }

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem('cog_subscribers_v1') || '[]');
    } catch (e) { return []; }
  }

  function deleteSubscriber(id, email) {
    const db = getDb();
    const p = db ? db.collection(COL).doc(id || emailId(email)).delete().catch(() => {}) : Promise.resolve();
    return p.then(() => {
      try {
        const list = loadLocal().filter(x => x.email !== email && x.id !== id);
        localStorage.setItem('cog_subscribers_v1', JSON.stringify(list));
      } catch (e) {}
    });
  }

  function renderAdminList(mountId) {
    const el = document.getElementById(mountId || 'subscribers-list');
    if (!el) return;
    const fa = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('cog_lang') || 'fa') === 'fa';
    el.innerHTML = fa ? '<p style="color:#888">در حال بارگذاری…</p>' : '<p style="color:#888">Loading…</p>';
    loadSubscribers().then(rows => {
      const countEl = document.getElementById('subscribers-count');
      if (countEl) countEl.textContent = String(rows.length);
      if (!rows.length) {
        el.innerHTML = fa
          ? '<p style="color:#666">هنوز کسی عضو آیه روزانه نشده است. وقتی کسی عضو شود اینجا دیده می‌شود.</p>'
          : '<p style="color:#666">No subscribers yet. When someone signs up they will appear here.</p>';
        return;
      }
      el.innerHTML = rows.map(r => {
        const d = r.at ? new Date(r.at) : null;
        const dateStr = d && !isNaN(d) ? d.toLocaleString(fa ? 'fa-IR' : 'en-GB') : '—';
        const src = r.source ? String(r.source) : '';
        return (
          '<div class="sub-row" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.5rem;padding:0.7rem 0.9rem;border-bottom:1px solid #eee;background:#fff;">' +
          '<div><div style="font-weight:600;word-break:break-all;">' + escapeHtml(r.email) + '</div>' +
          '<div style="font-size:0.8rem;color:#888;">' + escapeHtml(dateStr) + (src ? ' · ' + escapeHtml(src) : '') + '</div></div>' +
          '<button type="button" class="btn btn-outline btn-sm sub-del" data-id="' + escapeHtml(r.id || '') + '" data-email="' + escapeHtml(r.email) + '" style="color:#c62828;border-color:#c62828;">' +
          (fa ? 'حذف' : 'Remove') + '</button></div>'
        );
      }).join('');
      el.querySelectorAll('.sub-del').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!confirm(fa ? 'حذف این ایمیل؟' : 'Remove this email?')) return;
          deleteSubscriber(btn.dataset.id, btn.dataset.email).then(() => renderAdminList(mountId));
        });
      });
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  global.STSubscribers = {
    save: saveSubscriber,
    load: loadSubscribers,
    remove: deleteSubscriber,
    renderAdmin: renderAdminList
  };
})(typeof window !== 'undefined' ? window : this);
