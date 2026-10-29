/* Home feature cards — Bible fixed at top, others shuffled */
(function () {
  var FEATURES = [
    {
      id: 'bible',
      fixed: true,
      href: 'bible.html',
      icon: '\uD83D\uDCD6',
      title: { fa: '\u06A9\u062A\u0627\u0628 \u0645\u0642\u062F\u0633', en: 'Bible' },
      detail: {
        fa: '\u062E\u0648\u0627\u0646\u062F\u0646 \u06A9\u062A\u0627\u0628 \u0645\u0642\u062F\u0633 \u0628\u0647 \u0632\u0628\u0627\u0646 \u0641\u0627\u0631\u0633\u06CC (FANMV) \u0648 \u0627\u0646\u06AF\u0644\u06CC\u0633\u06CC (NKJV). \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u062A\u0627\u0628\u060C \u0641\u0635\u0644 \u0648 \u0622\u06CC\u0647 \u0648 \u0627\u0633\u06A9\u0631\u0648\u0644 \u067E\u06CC\u0648\u0633\u062A\u0647.',
        en: 'Read the Bible in Persian (FANMV) and English (NKJV). Choose book, chapter and verse with continuous scroll.'
      }
    },
    {
      id: 'media',
      href: 'media.html',
      icon: '\uD83C\uDFAC',
      title: { fa: '\u0631\u0633\u0627\u0646\u0647\u200C\u0647\u0627', en: 'Media' },
      detail: {
        fa: '\u0648\u06CC\u062F\u06CC\u0648\u060C \u0635\u0648\u062A\u060C \u0639\u06A9\u0633 \u0648 \u0645\u062A\u0646\u200C\u0647\u0627\u06CC \u062F\u0631\u0628\u0627\u0631\u0647 \u067E\u06CC\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062A\u0647. \u062F\u0627\u0646\u0644\u0648\u062F \u0648 \u0645\u0634\u0627\u0647\u062F\u0647 \u0622\u0632\u0627\u062F.',
        en: 'Videos, audio, photos and texts about the three angels\u2019 message. View and download freely.'
      }
    },
    {
      id: 'angels',
      href: 'angel.html?n=1',
      icon: '\uD83D\uDC7C',
      title: { fa: '\u067E\u06CC\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062A\u0647', en: 'Three Angels' },
      detail: {
        fa: '\u062A\u0648\u0636\u06CC\u062D \u067E\u06CC\u0627\u0645 \u0641\u0631\u0634\u062A\u0647 \u0627\u0648\u0644\u060C \u062F\u0648\u0645 \u0648 \u0633\u0648\u0645 \u0627\u0632 \u0645\u06A9\u0627\u0634\u0641\u0647 \u06F1\u06F4 \u0628\u0627 \u0622\u06CC\u0627\u062A \u0648 \u062A\u0641\u0633\u06CC\u0631.',
        en: 'The first, second and third angels\u2019 messages of Revelation 14 with verses and explanation.'
      }
    },
    {
      id: 'live',
      href: 'live.html',
      icon: '\uD83D\uDD34',
      title: { fa: '\u067E\u062E\u0634 \u0632\u0646\u062F\u0647', en: 'Go Live' },
      detail: {
        fa: '\u0647\u0646\u06AF\u0627\u0645 \u06A9\u0647 \u067E\u062E\u0634 \u0632\u0646\u062F\u0647 \u0641\u0639\u0627\u0644 \u0628\u0627\u0634\u062F\u060C \u0627\u0632 \u0647\u0645\u06CC\u0646\u062C\u0627 \u062F\u0631 \u0633\u0627\u06CC\u062A \u0645\u0634\u0627\u0647\u062F\u0647 \u06A9\u0646\u06CC\u062F.',
        en: 'When a live stream is on, watch it right here on the website.'
      }
    },
    {
      id: 'teachings',
      href: 'teachings.html',
      icon: '\uD83D\uDCDD',
      title: { fa: '\u0622\u0645\u0648\u0632\u0634\u200C\u0647\u0627', en: 'Teachings' },
      detail: {
        fa: '\u0645\u0642\u0627\u0644\u0647\u200C\u0647\u0627 \u0648 \u0622\u0645\u0648\u0632\u0634\u200C\u0647\u0627\u06CC \u06A9\u0648\u062A\u0627\u0647 \u062F\u0631\u0628\u0627\u0631\u0647 \u067E\u06CC\u0627\u0645 \u062C\u0627\u0648\u062F\u0627\u0646\u06CC \u0648 \u0645\u06A9\u0627\u0634\u0641\u0647 \u06F1\u06F4.',
        en: 'Short articles and teachings on the everlasting gospel and Revelation 14.'
      }
    },
    {
      id: 'verse',
      href: 'subscribe.html',
      icon: '\u2709\uFE0F',
      title: { fa: '\u0622\u06CC\u0647 \u0631\u0648\u0632\u0627\u0646\u0647', en: 'Daily Verse' },
      detail: {
        fa: '\u0622\u06CC\u0647 \u0631\u0648\u0632 \u0631\u0627 \u062F\u0631 \u0635\u0641\u062D\u0647 \u0627\u0635\u0644\u06CC \u0628\u0628\u06CC\u0646\u06CC\u062F \u06CC\u0627 \u0628\u0627 \u0627\u06CC\u0645\u06CC\u0644 \u0639\u0636\u0648 \u0634\u0648\u06CC\u062F \u062A\u0627 \u0647\u0631 \u0631\u0648\u0632 \u0622\u06CC\u0647 \u062F\u0631\u06CC\u0627\u0641\u062A \u06A9\u0646\u06CC\u062F.',
        en: 'See today\u2019s verse on the home page, or subscribe by email to receive a verse every day.'
      }
    },
    {
      id: 'questions',
      href: 'questions.html',
      icon: '\u2753',
      title: { fa: '\u0633\u0648\u0627\u0644\u0627\u062A', en: 'Questions' },
      detail: {
        fa: '\u0633\u0648\u0627\u0644 \u062E\u0648\u062F \u0631\u0627 \u0628\u067E\u0631\u0633\u06CC\u062F\u061B \u067E\u0627\u0633\u062E \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0627\u06CC\u0645\u06CC\u0644 \u0628\u0631\u0627\u06CC\u062A\u0627\u0646 \u0627\u0631\u0633\u0627\u0644 \u0645\u06CC\u200C\u0634\u0648\u062F.',
        en: 'Ask a question; we will reply to you by email.'
      }
    },
    {
      id: 'playlists',
      href: 'playlists.html',
      icon: '\uD83C\uDFB5',
      title: { fa: '\u0644\u06CC\u0633\u062A\u200C\u067E\u062E\u0634', en: 'Playlists' },
      detail: {
        fa: '\u0648\u06CC\u062F\u06CC\u0648\u0647\u0627 \u0631\u0627 \u062F\u0631 \u0644\u06CC\u0633\u062A\u200C\u0647\u0627\u06CC \u0628\u0627 \u0646\u0627\u0645 \u062F\u0644\u062E\u0648\u0627\u0647 \u06AF\u0631\u062F\u0622\u0648\u0631\u06CC \u06A9\u0646\u06CC\u062F \u0648 \u067E\u0634\u062A \u0633\u0631 \u0647\u0645 \u0645\u0634\u0627\u0647\u062F\u0647 \u06A9\u0646\u06CC\u062F.',
        en: 'Group videos into named playlists and watch them in order.'
      }
    },
    {
      id: 'signin',
      href: 'index.html#user-bar',
      icon: '\uD83D\uDC64',
      title: { fa: '\u0648\u0631\u0648\u062F', en: 'Sign in' },
      detail: {
        fa: '\u0628\u0627 \u06AF\u0648\u06AF\u0644 \u06CC\u0627 \u0627\u06CC\u0645\u06CC\u0644 \u0648\u0627\u0631\u062F \u0634\u0648\u06CC\u062F \u062A\u0627 \u0648\u06CC\u062F\u06CC\u0648 \u0627\u0632 \u062C\u0627\u06CC\u06CC \u06A9\u0647 \u0645\u062A\u0648\u0642\u0641 \u06A9\u0631\u062F\u0647\u200C\u0627\u06CC\u062F \u0627\u062F\u0627\u0645\u0647 \u067E\u06CC\u062F\u0627 \u06A9\u0646\u062F.',
        en: 'Sign in with Google or email so videos can resume where you left off.'
      }
    },
    {
      id: 'feedback',
      href: 'feedback.html',
      icon: '\uD83D\uDCAC',
      title: { fa: '\u0628\u0627\u0632\u062E\u0648\u0631\u062F', en: 'Feedback' },
      detail: {
        fa: '\u0646\u0638\u0631 \u06CC\u0627 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u062E\u0648\u062F \u0631\u0627 \u062F\u0631\u0628\u0627\u0631\u0647 \u0633\u0627\u06CC\u062A \u0628\u0631\u0627\u06CC\u0645\u0627\u0646 \u0628\u0641\u0631\u0633\u062A\u06CC\u062F.',
        en: 'Send us your comments or suggestions about the website.'
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

  function orderedFeatures() {
    var fixed = FEATURES.filter(function (f) { return f.fixed; });
    var rest = FEATURES.filter(function (f) { return !f.fixed; });
    return fixed.concat(shuffle(rest));
  }

  function cardHtml(f, L) {
    return (
      '<a class="feature-card' + (f.fixed ? ' feature-card--bible' : '') + '" href="' + f.href + '">' +
      '<div class="feature-icon" aria-hidden="true">' + f.icon + '</div>' +
      '<div class="feature-body">' +
      '<div class="feature-title">' + (f.title[L] || f.title.en) + '</div>' +
      '<div class="feature-detail">' + (f.detail[L] || f.detail.en) + '</div>' +
      '</div>' +
      '<span class="feature-arrow" aria-hidden="true">\u203A</span>' +
      '</a>'
    );
  }

  function render() {
    var mount = document.getElementById('features-grid');
    if (!mount) return;
    var L = lang();
    var list = orderedFeatures();
    mount.innerHTML = list.map(function (f) { return cardHtml(f, L); }).join('');
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
