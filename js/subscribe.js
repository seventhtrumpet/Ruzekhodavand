/* Daily verse email subscribe + popup with Not now */
(function () {
  var style = document.createElement('style');
  style.textContent = '.subscribe-popup{position:fixed!important;inset:0!important;background:rgba(0,0,0,.55)!important;z-index:99999!important;display:none;align-items:center;justify-content:center;padding:1rem}.subscribe-popup.is-open{display:flex!important}.subscribe-popup[hidden],.subscribe-popup.hidden{display:none!important}.subscribe-popup-card{background:var(--bg-card,#fff);color:var(--text,#222);border-radius:16px;padding:1.6rem 1.4rem 1.2rem;max-width:400px;width:100%;position:relative;box-shadow:0 20px 50px rgba(0,0,0,.3);text-align:center}.subscribe-popup-later{display:block!important;width:100%;margin-top:.85rem!important;padding:.65rem 1rem!important;background:transparent!important;border:1px solid var(--border,#ccc)!important;border-radius:10px!important;color:var(--text,#333)!important;font-family:inherit!important;font-size:.95rem!important;cursor:pointer!important;text-decoration:none!important}.subscribe-popup-close{position:absolute;top:.5rem;inset-inline-start:.7rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#888}';
  document.head.appendChild(style);

  var SUB_KEY = 'cog_verse_subscribed';
  var SUB_POPUP_KEY = 'cog_verse_popup_dismissed_v2';

  var I18N = {
    fa: {
      subscribeTitle: '\u0622\u06cc\u0647 \u0631\u0648\u0632\u0627\u0646\u0647 \u0628\u0627 \u0627\u06cc\u0645\u06cc\u0644',
      subscribeIntro: '\u0647\u0631 \u0631\u0648\u0632 \u06cc\u06a9 \u0622\u06cc\u0647 \u0627\u0632 \u06a9\u0644\u0627\u0645 \u062e\u062f\u0627 \u0631\u0627 \u062f\u0631 \u0627\u06cc\u0645\u06cc\u0644 \u062e\u0648\u062f \u062f\u0631\u06cc\u0627\u0641\u062a \u06a9\u0646\u06cc\u062f \u2014 \u0631\u0627\u06cc\u06af\u0627\u0646.',
      subscribeBtn: '\u0639\u0636\u0648\u06cc\u062a',
      subscribeConsent: '\u0645\u0648\u0627\u0641\u0642\u0645 \u06a9\u0647 \u0622\u06cc\u0647 \u0631\u0648\u0632\u0627\u0646\u0647 \u0628\u0647 \u0627\u06cc\u0645\u06cc\u0644\u0645 \u0627\u0631\u0633\u0627\u0644 \u0634\u0648\u062f. \u0647\u0631 \u0632\u0645\u0627\u0646 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u0645 \u0644\u063a\u0648 \u06a9\u0646\u0645.',
      subscribeThanks: '\u0645\u062a\u0634\u06a9\u0631\u06cc\u0645! \u0628\u0647 \u0641\u0647\u0631\u0633\u062a \u0622\u06cc\u0647 \u0631\u0648\u0632\u0627\u0646\u0647 \u0627\u0636\u0627\u0641\u0647 \u0634\u062f\u06cc\u062f.',
      popupTitle: '\u0647\u0631 \u0631\u0648\u0632 \u06cc\u06a9 \u0622\u06cc\u0647 \u062f\u0631 \u0627\u06cc\u0645\u06cc\u0644 \u0634\u0645\u0627',
      popupText: '\u0645\u062b\u0644 \u06cc\u06a9 \u06cc\u0627\u062f\u0622\u0648\u0631\u06cc \u0622\u0631\u0627\u0645 \u0627\u0632 \u06a9\u0644\u0627\u0645 \u062e\u062f\u0627 \u2014 \u0631\u0627\u06cc\u06af\u0627\u0646\u060c \u0647\u0631 \u0631\u0648\u0632.',
      popupLater: '\u0627\u0644\u0627\u0646 \u0646\u0647',
      popupSubscribe: '\u0639\u0636\u0648\u06cc\u062a'
    },
    en: {
      subscribeTitle: 'Daily verse by email',
      subscribeIntro: 'Receive a Bible verse in your inbox every day \u2014 free.',
      subscribeBtn: 'Subscribe',
      subscribeConsent: 'I agree to receive a daily verse by email. I can unsubscribe anytime.',
      subscribeThanks: 'Thank you! You are on the daily verse list.',
      popupTitle: 'A verse in your inbox every day',
      popupText: "A gentle reminder from God's Word \u2014 free, every day.",
      popupLater: 'Not now',
      popupSubscribe: 'Subscribe'
    }
  };

  function lang() {
    return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
  }
  function t(key) {
    var L = I18N[lang() === 'en' ? 'en' : 'fa'];
    return (L && L[key]) || I18N.en[key] || key;
  }
  function applyLabels() {
    Object.keys(I18N.en).forEach(function (key) {
      document.querySelectorAll('[data-i18n="' + key + '"]').forEach(function (el) {
        el.textContent = t(key);
      });
    });
  }
  function isSubscribed() {
    try { return !!localStorage.getItem(SUB_KEY); } catch (e) { return false; }
  }
  function markSubscribed(email) {
    try { localStorage.setItem(SUB_KEY, email || '1'); } catch (e) {}
  }
  function wasDismissedThisSession() {
    try { return sessionStorage.getItem(SUB_POPUP_KEY) === '1'; } catch (e) { return false; }
  }
  function markDismissedThisSession() {
    try { sessionStorage.setItem(SUB_POPUP_KEY, '1'); } catch (e) {}
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
        '<div style="font-size:2rem;margin-bottom:0.3rem;">\uD83D\uDCD6</div>' +
        '<h3 data-i18n="popupTitle">' + t('popupTitle') + '</h3>' +
        '<p data-i18n="popupText" style="font-size:0.92rem;color:#666;margin:0.5rem 0 1rem;">' + t('popupText') + '</p>' +
        '<form id="subscribe-popup-form" action="https://formsubmit.co/info.seventhtrumpet@gmail.com" method="POST">' +
        '<input type="hidden" name="_subject" value="New daily verse subscriber (popup)">' +
        '<input type="hidden" name="_captcha" value="false">' +
        '<input type="hidden" name="_next" value="https://seventhtrumpet.org/">' +
        '<input type="hidden" name="form_type" value="daily_verse_subscribe">' +
        '<input type="hidden" name="source" value="popup">' +
        '<input type="email" name="email" id="popup-email" required placeholder="you@email.com" autocomplete="email" style="width:100%;padding:0.65rem;margin-bottom:0.5rem;border:1px solid #ccc;border-radius:8px;direction:ltr;box-sizing:border-box;">' +
        '<label style="display:flex;gap:0.4rem;font-size:0.85rem;text-align:start;margin-bottom:0.8rem;">' +
        '<input type="checkbox" name="consent" value="yes" required> <span data-i18n="subscribeConsent">' + t('subscribeConsent') + '</span></label>' +
        '<button type="submit" class="btn btn-primary" style="width:100%;padding:0.7rem;" data-i18n="popupSubscribe">' + t('popupSubscribe') + '</button>' +
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
    if (isSubscribed()) return;
    if (wasDismissedThisSession()) return;
    setTimeout(function () {
      if (isSubscribed() || wasDismissedThisSession()) return;
      openPopup();
    }, 2500);
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
    document.getElementById('lang-toggle') && document.getElementById('lang-toggle').addEventListener('click', function () {
      setTimeout(applyLabels, 80);
    });
    schedulePopup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 50); });
  } else {
    setTimeout(init, 50);
  }
})();
