/* Extra admin translations for playlist fields */
(function () {
  if (typeof T === 'undefined') return;
  if (T.fa) {
    T.fa.plAddOnPublish = 'افزودن به پلی‌لیست (اختیاری)';
    T.fa.playlistsTitle = 'پلی‌لیست‌ها';
    T.fa.playlistsNote = 'پلی‌لیست با نام دلخواه بسازید و پست‌ها را به آن اضافه کنید.';
    T.fa.plNameFa = 'نام پلی‌لیست (فارسی)';
    T.fa.plNameEn = 'نام پلی‌لیست (انگلیسی)';
    T.fa.plNameFaPh = 'مثلاً: موعظه‌های مکاشفه';
    T.fa.plNameEnPh = 'e.g. Revelation sermons';
    T.fa.plCreate = 'ساخت پلی‌لیست';
    T.fa.typeAudio = 'صوت';
  }
  if (T.en) {
    T.en.plAddOnPublish = 'Add to playlist (optional)';
    T.en.playlistsTitle = 'Playlists';
    T.en.playlistsNote = 'Create playlists with custom names and add posts to them.';
    T.en.plNameFa = 'Playlist name (Persian)';
    T.en.plNameEn = 'Playlist name (English)';
    T.en.plNameFaPh = 'e.g. Revelation sermons';
    T.en.plNameEnPh = 'e.g. Revelation sermons';
    T.en.plCreate = 'Create playlist';
    T.en.typeAudio = 'Audio';
  }
  // Re-apply labels if language already applied
  if (typeof applyLanguage === 'function') {
    try { applyLanguage(); } catch (e) {}
  }
})();
