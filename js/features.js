/* Home feature tiles — Bible always first, 3–4 others random */
(function () {
  var SHOW_EXTRA = 4; // Bible + 4 = 5 tiles total

  var FEATURES = [
    {
      id: 'bible',
      fixed: true,
      href: 'bible.html',
      icon: '\uD83D\uDCD6',
      title: { fa: '\u06A9\u062A\u0627\u0628 \u0645\u0642\u062F\u0633', en: 'Bible' },
      detail: {
        fa: '\u0641\u0627\u0631\u0633\u06CC \u0648 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC',
        en: 'Persian & English'
      }
    },
    {
      id: 'media',
      href: 'media.html',
      icon: '\uD83C\uDFAC',
      title: { fa: '\u0631\u0633\u0627\u0646\u0647', en: 'Media' },
      detail: {
        fa: '\u0648\u06CC\u062F\u06CC\u0648 \u0648 \u0635\u0648\u062A',
        en: 'Video & audio'
      }
    },
    {
      id: 'angels',
      href: 'angel.html?n=1',
      icon: '\uD83D\uDC7C',
      title: { fa: '\u0633\u0647 \u0641\u0631\u0634\u062A\u0647', en: '3 Angels' },
      detail: {
        fa: '\u0645\u06A9\u0627\u0634\u0641\u0647 \u06F1\u06F4',
        en: 'Revelation 14'
      }
    },
    {
      id: 'live',
      href: 'live.html',
      icon: '\uD83D\uDD34',
      title: { fa: '\u0632\u0646\u062F\u0647', en: 'Live' },
      detail: {
        fa: '\u067E\u062E\u0634 \u0645\u0633\u062A\u0642\u06CC\u0645',
        en: 'Watch live'
      }
    },
    {
      id: 'teachings',
      href: 'teachings.html',
      icon: '\uD83D\uDCDD',
      title: { fa: '\u0622\u0645\u0648\u0632\u0634', en: 'Teachings' },
      detail: {
        fa: '\u0645\u0642\u0627\u0644\u0647\u200C\u0647\u0627',
        en: 'Short articles'
      }
    },
    {
      id: 'verse',
      href: 'subscribe.html',
      icon: '\u2709\uFE0F',
      title: { fa: '\u0622\u06CC\u0647 \u0631\u0648\u0632', en: 'Daily verse' },
      detail: {
        fa: '\u0639\u0636\u0648\u06CC\u062A \u0627\u06CC\u0645\u06CC\u0644',
        en: 'Email subscribe'
      }
    },
    {
      id: 'questions',
      href: 'questions.html',
      icon: '\u2753',
      title: { fa: '\u0633\u0648\u0627\u0644', en: 'Ask' },
      detail: {
        fa: '\u067E\u0631\u0633\u0634 \u0648 \u067E\u0627\u0633\u062E',
        en: 'Q & A'
      }
    },
    {
      id: 'playlists',
      href: 'playlists.html',
      icon: '\uD83C\uDFB5',
      title: { fa: '\u0644\u06CC\u0633\u062A\u200C\u067E\u062E\u0634', en: 'Playlists' },
      detail: {
        fa: '\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627\u06CC \u0645\u0631\u062A\u0628',
        en: 'Watch in order'
      }
    },
    {
      id: 'signin',
      href: 'index.html#user-bar',
      icon: '\uD83D\uDC64',
      title: { fa: '\u0648\u0631\u0648\u062F', en: 'Sign in' },
      detail: {
        fa: '\u0627\u062F\u0627\u0645\u0647 \u0648\u06CC\u062F\u06CC\u0648',
        en: 'Resume video'
      }
    },
    {
      id: 'feedback',
      href: 'feedback.html',
      icon: '\uD83D\uDCAC',
      title: { fa: '\u0646\u0638\u0631', en: 'Feedback' },
      detail: {
        fa: '\u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0634\u0645\u0627',
        en: 'Your ideas'
      }
    }
  ];

  function lang() {
    try {
      if (typeof currentLang !== 'undefined' && currentLang) return currentLang === 'en' ? 'en' : 'fa';
      return (localStorage.getItem('cog_lang') || 'fa') === 'en' ? 'en' : 'fa';
    } catch (e) {
      return 'fa';
    }
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function pickFeatures() {
    var fixed = FEATURES.filter(function (f) { return f.fixed; });
    var rest = shuffle(FEATURES.filter(function (f) { return !f.fixed; }));
    return fixed.concat(rest.slice(0, SHOW_EXTRA));
  }

  function cardHtml(f, L) {
    return (
      '<a class="feature-tile' + (f.fixed ? ' feature-tile--bible' : '') + '" href="' + f.href + '">' +
      '<span class="feature-tile-icon" aria-hidden="true">' + f.icon + '</span>' +
      '<span class="feature-tile-title">' + (f.title[L] || f.title.en) + '</span>' +
      '<span class="feature-tile-detail">' + (f.detail[L] || f.detail.en) + '</span>' +
      '</a>'
    );
  }

  function render() {
    var mount = document.getElementById('features-grid');
    if (!mount) return;
    var L = lang();
    mount.innerHTML = pickFeatures().map(function (f) { return cardHtml(f, L); }).join('');
  }

  function boot() {
    render();
    window.addEventListener('cog-lang-changed', render);
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', function () { setTimeout(render, 50); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
