/* Fresh Bread — small inline subscribe under daily verse (EN + FA, no auto popup) */
(function () {
  var SUB_KEY = 'cog_verse_subscribed';

  function lang() {
    try {
      return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'en';
    } catch (e) { return 'en'; }
  }

  function isEn() { return lang() === 'en'; }

  function labels() {
    if (isEn()) {
      return {
        title: 'Fresh Bread / \u0646\u0627\u0646 \u062a\u0627\u0632\u0647',
        text: 'One free verse in your email each day.',
        placeholder: 'you@email.com',
        btn: 'Subscribe',
        thanks: 'Thank you \u2014 you are on the list.',
        support: 'Support this work',
        supportHref: 'about.html'
      };
    }
    return {
      title: '\u0646\u0627\u0646 \u062a\u0627\u0632\u0647 / Fresh Bread',
      text: '\u0647\u0631 \u0631\u0648\u0632 \u06cc\u06a9 \u0622\u06cc\u0647 \u0631\u0627\u06cc\u06af\u0627\u0646 \u062f\u0631 \u0627\u06cc\u0645\u06cc\u0644 \u0634\u0645\u0627.',
      placeholder: 'you@email.com',
      btn: '\u0639\u0636\u0648\u06cc\u062a',
      thanks: '\u0633\u067e\u0627\u0633 \u2014 \u0646\u0627\u0645 \u0634\u0645\u0627 \u062b\u0628\u062a \u0634\u062f.',
      support: '\u062d\u0645\u0627\u06cc\u062a \u0627\u0632 \u0627\u06cc\u0646 \u06a9\u0627\u0631',
      supportHref: 'about.html'
    };
  }

  function ensureCss() {
    if (document.getElementById('fresh-bread-css')) return;
    var st = document.createElement('style');
    st.id = 'fresh-bread-css';
    st.textContent =
      '#fresh-bread-box{max-width:520px;margin:0.75rem auto 0;padding:0.75rem 0.9rem;border-radius:12px;border:1px solid var(--border,#e0dcd3);background:var(--bg-card,#fff);text-align:center}' +
      'body.dark #fresh-bread-box{background:var(--bg-card,#152536);border-color:var(--border,#243447)}' +
      '#fresh-bread-box .fb-title{font-weight:800;font-size:0.95rem;color:var(--primary,#0a2540);margin:0 0 0.25rem}' +
      'body.dark #fresh-bread-box .fb-title{color:#9ec5ea}' +
      '#fresh-bread-box .fb-text{font-size:0.8rem;line-height:1.4;color:#556;margin:0 0 0.55rem}' +
      'body.dark #fresh-bread-box .fb-text{color:#b8c4d0}' +
      '#fresh-bread-box form{display:flex;flex-wrap:wrap;gap:0.4rem;justify-content:center;align-items:center}' +
      '#fresh-bread-box input[type=email]{flex:1;min-width:160px;padding:0.45rem 0.65rem;border:1px solid var(--border,#ccc);border-radius:8px;font-family:inherit;font-size:0.88rem;direction:ltr}' +
      '#fresh-bread-box button[type=submit]{padding:0.45rem 0.9rem;border:none;border-radius:8px;background:#c9a227;color:#0a2540;font-weight:700;font-family:inherit;font-size:0.88rem;cursor:pointer}' +
      '#fresh-bread-box button[type=submit]:hover{filter:brightness(1.05)}' +
      '#fresh-bread-box .fb-support{display:inline-block;margin-top:0.5rem;font-size:0.72rem;color:#6b7785;text-decoration:none}' +
      '#fresh-bread-box .fb-support:hover{text-decoration:underline;color:var(--primary,#0a2540)}' +
      '#fresh-bread-box.fb-done .fb-form-row{display:none}' +
      '#fresh-bread-box .fb-thanks{display:none;font-size:0.88rem;font-weight:600;color:var(--primary,#0a2540);margin:0.35rem 0}' +
      '#fresh-bread-box.fb-done .fb-thanks{display:block}';
    document.head.appendChild(st);
  }

  function isSubscribed() {
    try { return localStorage.getItem(SUB_KEY) === '1'; } catch (e) { return false; }
  }

  function markSubscribed() {
    try { localStorage.setItem(SUB_KEY, '1'); } catch (e) {}
  }

  function applyLabels() {
    var box = document.getElementById('fresh-bread-box');
    if (!box) return;
    var L = labels();
    var title = box.querySelector('.fb-title');
    var text = box.querySelector('.fb-text');
    var input = box.querySelector('input[type=email]');
    var btn = box.querySelector('button[type=submit]');
    var thanks = box.querySelector('.fb-thanks');
    var support = box.querySelector('.fb-support');
    if (title) title.textContent = L.title;
    if (text) text.textContent = L.text;
    if (input) input.placeholder = L.placeholder;
    if (btn) btn.textContent = L.btn;
    if (thanks) thanks.textContent = L.thanks;
    if (support) {
      support.textContent = L.support;
      support.href = L.supportHref;
    }
  }

  function injectInline() {
    ensureCss();
    var daily = document.getElementById('daily-verse');
    if (!daily) return;
    if (document.getElementById('fresh-bread-box')) {
      applyLabels();
      return;
    }
    var L = labels();
    var box = document.createElement('div');
    box.id = 'fresh-bread-box';
    if (isSubscribed()) box.className = 'fb-done';
    box.innerHTML =
      '<div class="fb-title">' + L.title + '</div>' +
      '<p class="fb-text">' + L.text + '</p>' +
      '<p class="fb-thanks">' + L.thanks + '</p>' +
      '<div class="fb-form-row">' +
      '<form id="fresh-bread-form" action="https://formsubmit.co/info.seventhtrumpet@gmail.com" method="POST">' +
      '<input type="hidden" name="_subject" value="Fresh Bread subscriber">' +
      '<input type="hidden" name="_captcha" value="false">' +
      '<input type="hidden" name="_template" value="table">' +
      '<input type="hidden" name="source" value="fresh-bread-inline">' +
      '<input type="email" name="email" required placeholder="' + L.placeholder + '" autocomplete="email">' +
      '<button type="submit">' + L.btn + '</button>' +
      '</form>' +
      '</div>' +
      '<a class="fb-support" href="' + L.supportHref + '">' + L.support + '</a>';

    var inner = daily.querySelector('.daily-verse-inner');
    if (inner) inner.appendChild(box);
    else daily.appendChild(box);

    var form = document.getElementById('fresh-bread-form');
    if (form) {
      form.addEventListener('submit', function () {
        markSubscribed();
        box.classList.add('fb-done');
      });
    }
  }

  function boot() {
    injectInline();
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () { setTimeout(applyLabels, 100); });
    window.addEventListener('cog-lang-changed', function () { setTimeout(applyLabels, 50); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
  else setTimeout(boot, 300);
})();
