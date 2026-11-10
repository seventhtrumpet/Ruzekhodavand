/* Homepage: big Bible button (replaced Start here) + Bible spotlight card */
(function () {
  var old = document.getElementById('start-here-wrap');
  if (old) old.remove();

  function isEn() {
    try {
      return (localStorage.getItem('cog_lang') || document.documentElement.lang || 'fa') === 'en';
    } catch (e) { return false; }
  }

  function labels() {
    if (isEn()) {
      return {
        heroBtn: 'Read the Bible',
        heroHint: 'Persian & English — free for everyone',
        title: 'The Bible',
        text: 'Read the Old and New Testament in Persian and English. Choose book, chapter and verse.',
        btn: 'Open the Bible'
      };
    }
    return {
      heroBtn: '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633 \u0631\u0627 \u0628\u062e\u0648\u0627\u0646\u06cc\u062f',
      heroHint: '\u0641\u0627\u0631\u0633\u06cc \u0648 \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc \u2014 \u0631\u0627\u06cc\u06af\u0627\u0646 \u0628\u0631\u0627\u06cc \u0647\u0645\u0647',
      title: '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633',
      text: '\u0639\u0647\u062f \u0639\u062a\u06cc\u0642 \u0648 \u062c\u062f\u06cc\u062f \u0631\u0627 \u0628\u0647 \u0641\u0627\u0631\u0633\u06cc \u0648 \u0627\u0646\u06af\u0644\u06cc\u0633\u06cc \u0628\u062e\u0648\u0627\u0646\u06cc\u062f. \u06a9\u062a\u0627\u0628\u060c \u0628\u0627\u0628 \u0648 \u0622\u06cc\u0647 \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f.',
      btn: '\u0628\u0627\u0632 \u06a9\u0631\u062f\u0646 \u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633'
    };
  }

  function applyAll() {
    var L = labels();
    var hero = document.getElementById('bible-hero-cta');
    if (hero) {
      var a = hero.querySelector('a');
      var hint = hero.querySelector('.bible-hero-hint');
      if (a) a.textContent = L.heroBtn;
      if (hint) hint.textContent = L.heroHint;
    }
    var box = document.getElementById('bible-spotlight');
    if (box) {
      var h = box.querySelector('h2');
      var p = box.querySelector('p');
      var b = box.querySelector('a');
      if (h) h.textContent = L.title;
      if (p) p.textContent = L.text;
      if (b) b.textContent = L.btn;
    }
  }

  function injectHeroBible() {
    if (document.getElementById('bible-hero-cta')) return;
    var heroInner = document.querySelector('.hero .hero-inner') || document.querySelector('.hero');
    if (!heroInner) return;

    if (!document.getElementById('bible-hero-css')) {
      var st = document.createElement('style');
      st.id = 'bible-hero-css';
      st.textContent =
        '.bible-hero-cta{text-align:center;margin:1.1rem auto 0.6rem;max-width:420px}' +
        '.bible-hero-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;background:#c9a227!important;color:#0a2540!important;font-weight:800;font-size:1.15rem;padding:.95rem 1.6rem;border-radius:12px;text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.25);border:none}' +
        '.bible-hero-btn:hover{filter:brightness(1.08)}' +
        '.bible-hero-hint{margin:.55rem 0 0;color:rgba(255,255,255,.9);font-size:.9rem}';
      document.head.appendChild(st);
    }

    var wrap = document.createElement('div');
    wrap.id = 'bible-hero-cta';
    wrap.className = 'bible-hero-cta';
    wrap.innerHTML =
      '<a class="bible-hero-btn" href="bible.html"></a>' +
      '<p class="bible-hero-hint"></p>';

    var sub = heroInner.querySelector('.hero-sub');
    var angels = heroInner.querySelector('.angels-heading');
    if (sub && sub.nextSibling) {
      sub.parentNode.insertBefore(wrap, sub.nextSibling);
    } else if (angels) {
      heroInner.insertBefore(wrap, angels);
    } else {
      heroInner.appendChild(wrap);
    }
  }

  function injectSpotlight() {
    if (document.getElementById('bible-spotlight')) return;
    if (!document.getElementById('bible-spotlight-css')) {
      var st = document.createElement('style');
      st.id = 'bible-spotlight-css';
      st.textContent =
        '.bible-spotlight{max-width:720px;margin:0.25rem auto 1.5rem;padding:0 1rem}' +
        '.bible-spotlight-inner{background:linear-gradient(145deg,#0a2540 0%,#1a4a7a 100%);color:#fff;border-radius:16px;padding:1.5rem 1.4rem 1.4rem;text-align:center;box-shadow:0 8px 28px rgba(10,37,64,.18)}' +
        '.bible-spotlight-icon{font-size:1.8rem;margin-bottom:.35rem}' +
        '.bible-spotlight-inner h2{margin:0 0 .45rem;font-size:1.35rem;font-weight:700;color:#fff}' +
        '.bible-spotlight-inner p{margin:0 0 1rem;font-size:.95rem;opacity:.92;line-height:1.55}' +
        '.bible-spotlight-btn{background:#c9a227!important;color:#0a2540!important;font-weight:700;border:none;padding:.7rem 1.4rem;border-radius:10px;display:inline-flex;text-decoration:none}' +
        'body.dark .bible-spotlight-inner{background:linear-gradient(145deg,#0f1a28 0%,#1a3050 100%)}';
      document.head.appendChild(st);
    }
    var sec = document.createElement('section');
    sec.id = 'bible-spotlight';
    sec.className = 'bible-spotlight';
    sec.innerHTML =
      '<div class="bible-spotlight-inner">' +
      '<div class="bible-spotlight-icon" aria-hidden="true">\uD83D\uDCD6</div>' +
      '<h2></h2><p></p>' +
      '<a class="btn bible-spotlight-btn" href="bible.html"></a></div>';
    var daily = document.getElementById('daily-verse');
    var mission = document.getElementById('mission');
    if (daily && daily.parentNode) daily.parentNode.insertBefore(sec, daily.nextSibling);
    else if (mission && mission.parentNode) mission.parentNode.insertBefore(sec, mission);
    else document.body.appendChild(sec);
  }

  function boot() {
    injectHeroBible();
    injectSpotlight();
    applyAll();
    window.addEventListener('cog-lang-changed', applyAll);
    var lt = document.getElementById('lang-toggle');
    if (lt) lt.addEventListener('click', function () {
      setTimeout(applyAll, 100);
      setTimeout(applyAll, 400);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
