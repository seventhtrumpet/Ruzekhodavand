/* Daily verse email subscribe — NO auto popup (too many windows) */
(function () {
  var style = document.createElement('style');
  style.textContent = '.subscribe-popup{position:fixed!important;inset:0!important;background:rgba(0,0,0,.55)!important;z-index:99999!important;display:none;align-items:center;justify-content:center;padding:1rem}.subscribe-popup.is-open{display:flex!important}.subscribe-popup[hidden],.subscribe-popup.hidden{display:none!important}.subscribe-popup-card{background:var(--bg-card,#fff);color:var(--text,#222);border-radius:12px;padding:0.85rem 0.8rem 0.75rem;max-width:280px;width:100%;position:relative;box-shadow:0 12px 32px rgba(0,0,0,.28);text-align:center}.subscribe-popup-later{display:block!important;width:100%;margin-top:.55rem!important;padding:.45rem 0.75rem!important;background:transparent!important;border:1px solid var(--border,#ccc)!important;border-radius:8px!important;color:var(--text,#333)!important;font-family:inherit!important;font-size:.85rem!important;cursor:pointer!important}.subscribe-popup-close{position:absolute;top:.4rem;inset-inline-start:.55rem;background:none;border:none;font-size:1.3rem;cursor:pointer;color:#888}';
  document.head.appendChild(style);

  var SUB_KEY = 'cog_verse_subscribed';
  var SUB_POPUP_KEY = 'cog_verse_popup_dismissed_v2';

  function lang() {
    try {
      return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
    } catch (e) { return 'fa'; }
  }
  function t(key) {
    var fa = {
      popupTitle: '\u0647\u0631 \u0631\u0648\u0632 \u06cc\u06a9 \u0622\u06cc\u0647',
      popupText: '\u0622\u06cc\u0647 \u0631\u0648\u0632\u0627\u0646\u0647 \u062f\u0631 \u0627\u06cc\u0645\u06cc\u0644.',
      popupLater: '\u0627\u0644\u0627\u0646 \u0646\u0647',
      popupSubscribe: '\u0639\u0636\u0648\u06cc\u062a'
    };
    var en = {
      popupTitle: 'Daily verse by email',
      popupText: 'A free verse reminder each day.',
      popupLater: 'Not now',
      popupSubscribe: 'Subscribe'
    };
    return (lang() === 'en' ? en : fa)[key] || key;
  }
  function isSubscribed() {
    try { return localStorage.getItem(SUB_KEY) === '1'; } catch (e) { return false; }
  }
  function markSubscribed() {
    try { localStorage.setItem(SUB_KEY, '1'); } catch (e) {}
  }
  function wasDismissedThisSession() {
    try { return sessionStorage.getItem(SUB_POPUP_KEY) === '1'; } catch (e) { return false; }
  }
  function markDismissedThisSession() {
    try { sessionStorage.setItem(SUB_POPUP_KEY, '1'); } catch (e) {}
  }
  function applyLabels() {
    document.querySelectorAll('#subscribe-popup [data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) el.textContent = t(k);
    });
  }
  function injectHTML() {
    var pm = document.getElementById('subscribe-popup-mount');
    if (!pm) {
      pm = document.createElement('div');
      pm.id = 'subscribe-popup-mount';
      document.body.appendChild(pm);
    }
    if (!document.getElementById('subscribe-popup')) {
      pm.innerHTML =
        '<div id="subscribe-popup" class="subscribe-popup" hidden role="dialog" aria-modal="true">' +
        '<div class="subscribe-popup-card">' +
        '<button type="button" class="subscribe-popup-close" id="subscribe-popup-close" aria-label="Close">&times;</button>' +
        '<h3 data-i18n="popupTitle" style="font-size:1rem;margin:0.4rem 0 0.35rem">' + t('popupTitle') + '</h3>' +
        '<p data-i18n="popupText" style="font-size:0.82rem;color:#666;margin:0.35rem 0 0.75rem;">' + t('popupText') + '</p>' +
        '<form id="subscribe-popup-form" action="https://formsubmit.co/info.seventhtrumpet@gmail.com" method="POST">' +
        '<input type="hidden" name="_subject" value="New daily verse subscriber (popup)">' +
        '<input type="hidden" name="_captcha" value="false">' +
        '<input type="hidden" name="source" value="popup">' +
        '<input type="email" name="email" id="popup-email" required placeholder="you@email.com" autocomplete="email" style="width:100%;padding:0.5rem;margin-bottom:0.45rem;border:1px solid #ccc;border-radius:8px;direction:ltr;box-sizing:border-box;font-size:0.9rem;">' +
        '<button type="submit" class="btn btn-primary" style="width:100%;padding:0.55rem;font-size:0.9rem;" data-i18n="popupSubscribe">' + t('popupSubscribe') + '</button>' +
        '</form>' +
        '<button type="button" class="subscribe-popup-later" id="subscribe-popup-later" data-i18n="popupLater">' + t('popupLater') + '</button>' +
        '</div></div>';
    }
  }
  function openPopup() {
    var popup = document.getElementById('subscribe-popup');
    if (!popup) return;
    popup.hidden = false;
    popup.classList.add('is-open');
    popup.classList.remove('hidden');
    applyLabels();
  }
  function closePopup() {
    var popup = document.getElementById('subscribe-popup');
    if (popup) {
      popup.hidden = true;
      popup.classList.remove('is-open');
      popup.classList.add('hidden');
    }
    markDismissedThisSession();
  }
  function schedulePopup() {
    /* No auto popup — daily verse is on the page; no big window */
    return;
  }
  function init() {
    injectHTML();
    applyLabels();
    var popupForm = document.getElementById('subscribe-popup-form');
    if (popupForm) {
      popupForm.addEventListener('submit', function () {
        var emailInput = popupForm.querySelector('input[type="email"]');
        markSubscribed(emailInput ? emailInput.value.trim() : '1');
        closePopup();
      });
    }
    var later = document.getElementById('subscribe-popup-later');
    var closeBtn = document.getElementById('subscribe-popup-close');
    var popup = document.getElementById('subscribe-popup');
    if (later) later.addEventListener('click', function (e) { e.preventDefault(); closePopup(); });
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.preventDefault(); closePopup(); });
    if (popup) popup.addEventListener('click', function (e) { if (e.target === popup) closePopup(); });
    schedulePopup();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 50); });
  } else {
    setTimeout(init, 50);
  }
  window.openVerseSubscribePopup = openPopup;
})();
