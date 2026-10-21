/* Daily verse email subscribe */
(function () {
  const SUB_KEY = 'cog_verse_subscribed';
  const SUB_POPUP_KEY = 'cog_verse_popup_seen';

  const I18N = {
    fa: {
      subscribeNav: 'آیه روزانه', subscribeTitle: 'آیه روزانه با ایمیل',
      subscribeIntro: 'هر روز یک آیه از کلام خدا را در ایمیل خود دریافت کنید — رایگان.',
      subscribeEmailPh: 'you@email.com', subscribeBtn: 'عضویت',
      subscribeConsent: 'موافقم که آیه روزانه به ایمیلم ارسال شود. هر زمان می‌توانم لغو کنم.',
      subscribeThanks: 'متشکریم! به فهرست آیه روزانه اضافه شدید.',
      subscribeWithAccount: 'عضویت با ایمیل حساب من',
      popupTitle: 'هر روز یک آیه در ایمیل شما',
      popupText: 'مثل یک یادآوری آرام از کلام خدا — رایگان، هر روز صبح.',
      popupLater: 'الان نه'
    },
    en: {
      subscribeNav: 'Daily verse', subscribeTitle: 'Daily verse by email',
      subscribeIntro: 'Receive a Bible verse in your inbox every day — free.',
      subscribeEmailPh: 'you@email.com', subscribeBtn: 'Subscribe',
      subscribeConsent: 'I agree to receive a daily verse by email. I can unsubscribe anytime.',
      subscribeThanks: 'Thank you! You are on the daily verse list.',
      subscribeWithAccount: 'Subscribe with my account email',
      popupTitle: 'A verse in your inbox every day',
      popupText: "A gentle reminder from God's Word — free, every morning.",
      popupLater: 'Not now'
    }
  };

  function lang() {
    return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
  }

  function t(key) {
    const L = I18N[lang() === 'fa' ? 'fa' : 'en'];
    return L[key] || key;
  }

  function applyLabels() {
    Object.keys(I18N.en).forEach(key => {
      document.querySelectorAll('[data-i18n="' + key + '"]').forEach(el => { el.textContent = t(key); });
      document.querySelectorAll('[data-i18n-placeholder="' + key + '"]').forEach(el => { el.placeholder = t(key); });
    });
  }

  function isSubscribed() {
    try { return !!localStorage.getItem(SUB_KEY); } catch (e) { return false; }
  }

  function markSubscribed(email) {
    try { localStorage.setItem(SUB_KEY, email || '1'); } catch (e) {}
  }

  function injectHTML() {
    const mount = document.getElementById('subscribe-mount');
    if (mount && !document.getElementById('subscribe-form')) {
      mount.innerHTML =
        '<section class="subscribe-section" id="subscribe">' +
        '<div class="subscribe-card">' +
        '<div class="subscribe-icon">✉️</div>' +
        '<h2 class="subscribe-title" data-i18n="subscribeTitle"></h2>' +
        '<p class="subscribe-intro" data-i18n="subscribeIntro"></p>' +
        '<form id="subscribe-form" class="subscribe-form" action="https://formsubmit.co/info.seventhtrumpet@gmail.com" method="POST">' +
        '<input type="hidden" name="_subject" value="New daily verse subscriber — Seventh Trumpet">' +
        '<input type="hidden" name="_captcha" value="false">' +
        '<input type="hidden" name="_template" value="table">' +
        '<input type="hidden" name="_next" value="https://www.seventhtrumpet.org/#subscribe">' +
        '<input type="hidden" name="form_type" value="daily_verse_subscribe">' +
        '<input type="hidden" name="source" id="sub-source" value="website">' +
        '<div class="subscribe-row">' +
        '<input type="email" name="email" id="subscribe-email" required data-i18n-placeholder="subscribeEmailPh" placeholder="you@email.com" autocomplete="email">' +
        '<button type="submit" class="btn btn-accent" data-i18n="subscribeBtn"></button>' +
        '</div>' +
        '<label class="subscribe-check"><input type="checkbox" name="consent" value="yes" required> <span data-i18n="subscribeConsent"></span></label>' +
        '</form>' +
        '<p id="subscribe-thanks" class="subscribe-thanks hidden" data-i18n="subscribeThanks"></p>' +
        '<button type="button" id="subscribe-with-account" class="btn btn-outline btn-sm subscribe-account-btn hidden" data-i18n="subscribeWithAccount"></button>' +
        '</div></section>';
    }
    const pm = document.getElementById('subscribe-popup-mount');
    if (pm && !document.getElementById('subscribe-popup')) {
      pm.innerHTML =
        '<div id="subscribe-popup" class="subscribe-popup hidden" role="dialog">' +
        '<div class="subscribe-popup-card">' +
        '<button type="button" class="subscribe-popup-close" id="subscribe-popup-close">&times;</button>' +
        '<div class="subscribe-icon">📖</div>' +
        '<h3 data-i18n="popupTitle"></h3>' +
        '<p data-i18n="popupText"></p>' +
        '<form id="subscribe-popup-form" action="https://formsubmit.co/info.seventhtrumpet@gmail.com" method="POST">' +
        '<input type="hidden" name="_subject" value="New daily verse subscriber — Seventh Trumpet">' +
        '<input type="hidden" name="_captcha" value="false">' +
        '<input type="hidden" name="_template" value="table">' +
        '<input type="hidden" name="_next" value="https://www.seventhtrumpet.org/#subscribe">' +
        '<input type="hidden" name="form_type" value="daily_verse_subscribe">' +
        '<input type="hidden" name="source" value="popup">' +
        '<input type="email" name="email" id="popup-email" required data-i18n-placeholder="subscribeEmailPh" placeholder="you@email.com" autocomplete="email">' +
        '<label class="subscribe-check"><input type="checkbox" name="consent" value="yes" required> <span data-i18n="subscribeConsent"></span></label>' +
        '<button type="submit" class="btn btn-accent" style="width:100%;margin-top:0.6rem" data-i18n="subscribeBtn"></button>' +
        '</form>' +
        '<button type="button" class="subscribe-popup-later" id="subscribe-popup-later" data-i18n="popupLater"></button>' +
        '</div></div>';
    }
  }

  function closePopup(permanent) {
    const popup = document.getElementById('subscribe-popup');
    if (popup) popup.classList.add('hidden');
    try {
      if (permanent) localStorage.setItem(SUB_POPUP_KEY, '1');
      else sessionStorage.setItem(SUB_POPUP_KEY, '1');
    } catch (e) {}
  }

  function syncAuthEmail() {
    let user = null;
    try {
      if (typeof currentUser !== 'undefined' && currentUser) user = currentUser;
      else if (typeof auth !== 'undefined' && auth.currentUser) user = auth.currentUser;
    } catch (e) {}
    const email = user && user.email ? user.email : '';
    const mainInput = document.getElementById('subscribe-email');
    const popupInput = document.getElementById('popup-email');
    const accountBtn = document.getElementById('subscribe-with-account');
    if (email) {
      if (mainInput && !mainInput.value) mainInput.value = email;
      if (popupInput && !popupInput.value) popupInput.value = email;
      if (accountBtn && !isSubscribed()) accountBtn.classList.remove('hidden');
    }
  }

  function init() {
    injectHTML();
    applyLabels();

    const form = document.getElementById('subscribe-form');
    const popupForm = document.getElementById('subscribe-popup-form');
    const thanks = document.getElementById('subscribe-thanks');
    const accountBtn = document.getElementById('subscribe-with-account');

    [form, popupForm].forEach(f => {
      if (!f) return;
      f.addEventListener('submit', () => {
        const emailInput = f.querySelector('input[type="email"]');
        markSubscribed(emailInput ? emailInput.value.trim() : '1');
      });
    });

    if (accountBtn) {
      accountBtn.addEventListener('click', () => {
        let user = null;
        try {
          if (typeof currentUser !== 'undefined' && currentUser) user = currentUser;
          else if (typeof auth !== 'undefined' && auth.currentUser) user = auth.currentUser;
        } catch (e) {}
        if (!user || !user.email || !form) return;
        const mainInput = document.getElementById('subscribe-email');
        const consent = form.querySelector('input[name="consent"]');
        if (mainInput) mainInput.value = user.email;
        if (consent) consent.checked = true;
        const source = document.getElementById('sub-source');
        if (source) source.value = 'signed_in_account';
        form.requestSubmit();
      });
    }

    try {
      if (typeof auth !== 'undefined' && auth.onAuthStateChanged) {
        auth.onAuthStateChanged(() => setTimeout(syncAuthEmail, 100));
      }
    } catch (e) {}
    setTimeout(syncAuthEmail, 600);
    setTimeout(syncAuthEmail, 2000);

    if (isSubscribed()) {
      if (thanks) thanks.classList.remove('hidden');
      if (form) form.classList.add('hidden');
      if (accountBtn) accountBtn.classList.add('hidden');
    }

    document.getElementById('lang-toggle')?.addEventListener('click', () => setTimeout(applyLabels, 80));

    if (!isSubscribed()) {
      try {
        if (!localStorage.getItem(SUB_POPUP_KEY) && !sessionStorage.getItem(SUB_POPUP_KEY)) {
          setTimeout(() => {
            if (isSubscribed()) return;
            const popup = document.getElementById('subscribe-popup');
            if (popup) popup.classList.remove('hidden');
          }, 4500);
        }
      } catch (e) {}
    }
    document.getElementById('subscribe-popup-close')?.addEventListener('click', () => closePopup(false));
    document.getElementById('subscribe-popup-later')?.addEventListener('click', () => closePopup(false));
    document.getElementById('subscribe-popup')?.addEventListener('click', (e) => {
      if (e.target.id === 'subscribe-popup') closePopup(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 80));
  } else {
    setTimeout(init, 80);
  }
})();
