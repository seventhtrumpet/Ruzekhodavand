/* Extra i18n keys */
(function () {
  if (typeof T === 'undefined') return;
  const extra = {
    fa: {
      pageTitle: 'شیپور هفتم — پیام سه فرشته',
      bibleNav: 'کتاب مقدس', playlistsTitle: 'پلی‌لیست‌ها', playlistsNav: 'پلی‌لیست‌ها',
      feedbackTitle: 'بازخورد', feedbackIntro: 'نظر یا پیشنهاد خود را بنویسید. بازخورد شما به ما کمک می‌کند سایت را بهتر کنیم.', feedbackNav: 'بازخورد',
      fbName: 'نام شما (اختیاری)', fbEmail: 'ایمیل شما (اختیاری)', fbRating: 'امتیاز (اختیاری)',
      fbRatingNone: '— انتخاب کنید —', fbMessage: 'پیام بازخورد', fbSend: 'ارسال بازخورد',
      fbNamePh: 'نام (اختیاری)', fbEmailPh: 'ایمیل (اختیاری)', fbMessagePh: 'بازخورد شما...',
      verseOfDay: 'آیه امروز', newVerse: 'آیه دیگر', subscribeNav: 'آیه روزانه',
      themeToggle: 'حالت شب / روز', menuTitle: 'منو',
      liveOffline: 'در حال حاضر پخش زنده‌ای فعال نیست.', questionsNav: 'سوالات'
    },
    en: {
      pageTitle: 'Seventh Trumpet — Three Angels Message',
      bibleNav: 'Bible', playlistsTitle: 'Playlists', playlistsNav: 'Playlists',
      feedbackTitle: 'Feedback', feedbackIntro: 'Share your thoughts or suggestions. Your feedback helps us improve the site.', feedbackNav: 'Feedback',
      fbName: 'Your name (optional)', fbEmail: 'Your email (optional)', fbRating: 'Rating (optional)',
      fbRatingNone: '— Choose —', fbMessage: 'Your feedback', fbSend: 'Send feedback',
      fbNamePh: 'Name (optional)', fbEmailPh: 'Email (optional)', fbMessagePh: 'Your feedback...',
      verseOfDay: 'Verse of the day', newVerse: 'Another verse', subscribeNav: 'Daily verse',
      themeToggle: 'Dark / Light mode', menuTitle: 'Menu',
      liveOffline: 'There is no live stream right now.', questionsNav: 'Questions'
    }
  };
  Object.assign(T.fa, extra.fa);
  Object.assign(T.en, extra.en);
  T.fa.pageTitle = extra.fa.pageTitle;
  if (typeof applyLanguage === 'function') { try { applyLanguage(); } catch (e) {} }
})();
