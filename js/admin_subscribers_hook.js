/* Inject Daily Verse Subscribers tab into admin */
(function () {
  function injectTab() {
    const tabs = document.querySelector('.admin-tabs');
    if (!tabs || document.getElementById('tab-subscribers')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-tab', 'tab-subscribers');
    btn.setAttribute('data-i18n', 'tabSubscribers');
    const fa = (localStorage.getItem('cog_lang') || 'fa') === 'fa';
    btn.textContent = fa ? 'اعضای آیه روزانه' : 'Daily verse list';
    const backupBtn = tabs.querySelector('[data-tab="tab-backup"]');
    if (backupBtn) tabs.insertBefore(btn, backupBtn);
    else tabs.appendChild(btn);

    const panel = document.getElementById('admin-panel');
    if (!panel) return;
    const section = document.createElement('div');
    section.id = 'tab-subscribers';
    section.className = 'admin-tab-content hidden';
    section.innerHTML =
      '<h3 style="margin-bottom:0.5rem">' + (fa ? 'اعضای آیه روزانه' : 'Daily verse subscribers') + '</h3>' +
      '<p style="font-size:0.9rem;color:#666;margin-bottom:1rem">' +
      (fa
        ? 'ایمیل کسانی که برای آیه روزانه عضو شده‌اند. همچنین به info.seventhtrumpet@gmail.com ایمیل می‌رسد.'
        : 'People who subscribed for the daily verse. You also get an email at info.seventhtrumpet@gmail.com.') +
      '</p>' +
      '<p style="margin-bottom:1rem"><strong>' + (fa ? 'تعداد:' : 'Count:') + '</strong> <span id="subscribers-count">0</span> ' +
      '<button type="button" id="refresh-subscribers" class="btn btn-outline btn-sm" style="margin-inline-start:0.8rem">' +
      (fa ? 'بازخوانی' : 'Refresh') + '</button></p>' +
      '<div id="subscribers-list" style="border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;background:#fafafa;"></div>';
    const backup = document.getElementById('tab-backup');
    if (backup) panel.insertBefore(section, backup);
    else panel.appendChild(section);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
      section.classList.remove('hidden');
      if (window.STSubscribers) window.STSubscribers.renderAdmin('subscribers-list');
    });
    document.getElementById('refresh-subscribers')?.addEventListener('click', () => {
      if (window.STSubscribers) window.STSubscribers.renderAdmin('subscribers-list');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectTab, 200));
  } else {
    setTimeout(injectTab, 200);
  }
})();
