/* Simple text size controls for easier reading */
(function () {
  var KEY = 'cog_text_size';
  var STEPS = ['text-sm', 'text-md', 'text-lg', 'text-xl'];
  var DEFAULT = 1; // text-md

  function currentIndex() {
    try {
      var v = parseInt(localStorage.getItem(KEY), 10);
      if (isNaN(v) || v < 0 || v >= STEPS.length) return DEFAULT;
      return v;
    } catch (e) {
      return DEFAULT;
    }
  }

  function apply(idx) {
    var body = document.body;
    STEPS.forEach(function (c) { body.classList.remove(c); });
    body.classList.add(STEPS[idx]);
    try { localStorage.setItem(KEY, String(idx)); } catch (e) {}
    var label = document.getElementById('text-size-label');
    if (label) {
      var names = ['A', 'A', 'A', 'A'];
      label.textContent = names[idx] || 'A';
    }
  }

  function injectStyles() {
    if (document.getElementById('text-size-css')) return;
    var s = document.createElement('style');
    s.id = 'text-size-css';
    s.textContent =
      'body.text-sm{font-size:15px}' +
      'body.text-md{font-size:16px}' +
      'body.text-lg{font-size:18px}' +
      'body.text-xl{font-size:20px}' +
      'body.text-lg .hero h1,body.text-xl .hero h1{font-size:clamp(2rem,5vw,3.2rem)!important}' +
      'body.text-lg .daily-verse-text,body.text-xl .daily-verse-text{font-size:1.2em!important}' +
      '.text-size-controls{display:inline-flex;align-items:center;gap:0.2rem;margin-inline-start:0.25rem}' +
      '.text-size-controls button{width:2rem;height:2rem;border-radius:8px;border:1px solid rgba(255,255,255,0.3);' +
      'background:rgba(255,255,255,0.12);color:#fff;font-weight:700;cursor:pointer;font-family:inherit;line-height:1}' +
      '.text-size-controls button:hover{background:rgba(255,255,255,0.25)}' +
      '.text-size-controls #text-size-label{font-size:0.75rem;opacity:0.85;min-width:0.8rem;text-align:center;color:#fff}' +
      '@media(max-width:400px){.text-size-controls #text-size-label{display:none}}';
    document.head.appendChild(s);
  }

  function injectControls() {
    if (document.getElementById('text-size-controls')) return;
    var actions = document.querySelector('.header-actions');
    if (!actions) {
      var header = document.querySelector('.header-inner');
      if (!header) return;
      actions = document.createElement('div');
      actions.className = 'header-actions';
      header.appendChild(actions);
    }
    var wrap = document.createElement('div');
    wrap.id = 'text-size-controls';
    wrap.className = 'text-size-controls';
    wrap.setAttribute('title', 'Text size');
    wrap.innerHTML =
      '<button type="button" id="text-size-down" aria-label="Smaller text">A-</button>' +
      '<span id="text-size-label" aria-hidden="true">A</span>' +
      '<button type="button" id="text-size-up" aria-label="Larger text">A+</button>';
    actions.insertBefore(wrap, actions.firstChild);

    document.getElementById('text-size-down').addEventListener('click', function () {
      var i = currentIndex();
      if (i > 0) apply(i - 1);
    });
    document.getElementById('text-size-up').addEventListener('click', function () {
      var i = currentIndex();
      if (i < STEPS.length - 1) apply(i + 1);
    });
  }

  function boot() {
    injectStyles();
    apply(currentIndex());
    injectControls();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
})();
