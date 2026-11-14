/* Admin: edit post titles */
(function () {
  function waitAdmin() {
    if (typeof posts === 'undefined' || typeof savePosts !== 'function' || typeof renderPostsList !== 'function') {
      setTimeout(waitAdmin, 200);
      return;
    }
    if (window.__editPostTitleHooked) return;
    window.__editPostTitleHooked = true;

    window.editPostTitle = function (id) {
      var post = posts.find(function (p) { return p.id === id; });
      if (!post) return;
      var isFa = (typeof currentLang !== 'undefined' && currentLang === 'fa') ||
        (localStorage.getItem('cog_lang') || 'fa') === 'fa';
      var title_fa = window.prompt(isFa ? '\u0639\u0646\u0648\u0627\u0646 \u0641\u0627\u0631\u0633\u06cc:' : 'Persian title:', post.title_fa || '');
      if (title_fa === null) return;
      var title_en = window.prompt(isFa ? '\u0639\u0646\u0648\u0627\u0646 \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc:' : 'English title:', post.title_en || '');
      if (title_en === null) return;
      post.title_fa = String(title_fa).trim();
      post.title_en = String(title_en).trim();
      try {
        savePosts();
        if (typeof renderPostsList === 'function') renderPostsList();
        if (typeof showStatus === 'function') {
          showStatus(isFa ? '\u0639\u0646\u0648\u0627\u0646 \u0630\u062e\u06cc\u0631\u0647 \u0634\u062f' : 'Title saved', 'success');
        }
      } catch (e) {
        alert(isFa ? '\u062e\u0637\u0627 \u062f\u0631 \u0630\u062e\u06cc\u0631\u0647' : 'Save error');
      }
    };

    var origRender = renderPostsList;
    window.renderPostsList = function () {
      origRender();
      var list = document.getElementById('posts-list');
      if (!list) return;
      var isFa = (typeof currentLang !== 'undefined' && currentLang === 'fa') ||
        (localStorage.getItem('cog_lang') || 'fa') === 'fa';
      var editLabel = isFa ? '\u0648\u06cc\u0631\u0627\u06cc\u0634' : 'Edit';
      list.querySelectorAll('button[onclick*="deletePost"]').forEach(function (delBtn) {
        if (delBtn.parentNode && delBtn.parentNode.querySelector('button[onclick*="editPostTitle"]')) return;
        var idMatch = (delBtn.getAttribute('onclick') || '').match(/deletePost\('([^']+)'\)/);
        if (!idMatch) return;
        var id = idMatch[1];
        var editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn btn-outline btn-sm';
        editBtn.textContent = editLabel;
        editBtn.setAttribute('onclick', "editPostTitle('" + id + "')");
        delBtn.parentNode.insertBefore(editBtn, delBtn);
        delBtn.parentNode.style.display = 'flex';
        delBtn.parentNode.style.gap = '0.4rem';
        delBtn.parentNode.style.flexWrap = 'wrap';
        delBtn.parentNode.style.alignItems = 'center';
      });
    };

    setTimeout(function () {
      try { window.renderPostsList(); } catch (e) {}
    }, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitAdmin);
  else waitAdmin();
})();
