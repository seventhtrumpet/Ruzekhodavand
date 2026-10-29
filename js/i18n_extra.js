/* Extra i18n keys — keep FA and EN strictly separate */
(function () {
  if (typeof T === 'undefined') return;
  var extra = {
    fa: {
      pageTitle: '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645 \u2014 \u067e\u06cc\u0627\u0645 \u0633\u0647 \u0641\u0631\u0634\u062a\u0647',
      siteName: '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645',
      bibleNav: '\u06a9\u062a\u0627\u0628 \u0645\u0642\u062f\u0633',
      playlistsTitle: '\u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a\u200c\u0647\u0627',
      playlistsNav: '\u067e\u0644\u06cc\u200c\u0644\u06cc\u0633\u062a\u200c\u0647\u0627',
      feedbackTitle: '\u0628\u0627\u0632\u062e\u0648\u0631\u062f',
      feedbackIntro: '\u0646\u0638\u0631 \u06cc\u0627 \u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u062e\u0648\u062f \u0631\u0627 \u0628\u0646\u0648\u06cc\u0633\u06cc\u062f.',
      feedbackNav: '\u0628\u0627\u0632\u062e\u0648\u0631\u062f',
      verseOfDay: '\u0622\u06cc\u0647 \u0627\u0645\u0631\u0648\u0632',
      newVerse: '\u0622\u06cc\u0647 \u062f\u06cc\u06af\u0631',
      subscribeNav: '\u0622\u06cc\u0647 \u0631\u0648\u0632\u0627\u0646\u0647',
      themeToggle: '\u062d\u0627\u0644\u062a \u0634\u0628 / \u0631\u0648\u0632',
      menuTitle: '\u0645\u0646\u0648',
      liveOffline: '\u062f\u0631 \u062d\u0627\u0644 \u062d\u0627\u0636\u0631 \u067e\u062e\u0634 \u0632\u0646\u062f\u0647\u200c\u0627\u06cc \u0641\u0639\u0627\u0644 \u0646\u06cc\u0633\u062a.',
      questionsNav: '\u0633\u0648\u0627\u0644\u0627\u062a',
      about: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627',
      aboutTitle: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627',
      homeContactTitle: '\u062a\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627',
      rotatorLabel: '\u0627\u0632 \u0631\u0633\u0627\u0646\u0647\u200c\u0647\u0627',
      angel1Short: '\u0633\u0627\u0639\u062a \u062f\u0627\u0648\u0631\u06cc',
      angel2Short: '\u0628\u0627\u0628\u0644 \u0633\u0642\u0648\u0637 \u06a9\u0631\u062f',
      angel3Short: '\u0647\u0634\u062f\u0627\u0631 \u0648\u062d\u0634',
      footerSub: '\u0634\u06cc\u067e\u0648\u0631 \u0647\u0641\u062a\u0645 \u00b7 \u0645\u06a9\u0627\u0634\u0641\u0647 \u06f1\u06f4:\u06f6\u2013\u06f1\u06f2',
      socialFollow: '\u0634\u0628\u06a9\u0647\u200c\u0647\u0627\u06cc \u0627\u062c\u062a\u0645\u0627\u0639\u06cc',
      sponsors: '\u062d\u0627\u0645\u06cc\u0627\u0646',
      sponsorsTitle: '\u062d\u0627\u0645\u06cc\u0627\u0646',
      contactTitle: '\u062a\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627'
    },
    en: {
      pageTitle: 'Seventh Trumpet \u2014 Three Angels Message',
      siteName: 'Seventh Trumpet',
      bibleNav: 'Bible',
      playlistsTitle: 'Playlists',
      playlistsNav: 'Playlists',
      feedbackTitle: 'Feedback',
      feedbackIntro: 'Share your thoughts or suggestions.',
      feedbackNav: 'Feedback',
      verseOfDay: 'Verse of the day',
      newVerse: 'Another verse',
      subscribeNav: 'Daily verse',
      themeToggle: 'Dark / Light mode',
      menuTitle: 'Menu',
      liveOffline: 'There is no live stream right now.',
      questionsNav: 'Questions',
      about: 'About',
      aboutTitle: 'About us',
      homeContactTitle: 'Contact us',
      rotatorLabel: 'From the media',
      angel1Short: 'Hour of judgment',
      angel2Short: 'Babylon is fallen',
      angel3Short: 'Beast warning',
      footerSub: 'Seventh Trumpet \u00b7 Revelation 14:6\u201312',
      socialFollow: 'Follow us',
      sponsors: 'Sponsors',
      sponsorsTitle: 'Sponsors',
      contactTitle: 'Contact us'
    }
  };
  Object.assign(T.fa, extra.fa);
  Object.assign(T.en, extra.en);
  if (typeof applyLanguage === 'function') {
    try { applyLanguage(); } catch (e) {}
  }
})();
