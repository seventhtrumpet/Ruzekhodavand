/* About page + home contact i18n extras */
(function () {
  function merge() {
    if (typeof T === 'undefined') return;
    if (T.fa) {
      T.fa.about = 'درباره ما';
      T.fa.aboutTitle = 'درباره ما';
      T.fa.aboutP1 = 'شیپور هفتم وب‌سایتی است برای به اشتراک گذاشتن پیام انجیل جاودانی و پیام سه فرشته در مکاشفه ۱۴.';
      T.fa.aboutP2 = 'ما عکس، ویدیو، صوت، نوشته و فایل‌هایی درباره کتاب مقدس منتشر می‌کنیم تا همه بتوانند حقیقت را بشنوند و بخوانند — به فارسی و انگلیسی.';
      T.fa.aboutAngelsTitle = 'پیام سه فرشته';
      T.fa.aboutAngel1 = 'فرشته اول: از خدا بترسید و او را جلال دهید، زیرا ساعت داوری او رسیده است (مکاشفه ۱۴:۶–۷).';
      T.fa.aboutAngel2 = 'فرشته دوم: بابل سقوط کرده است (مکاشفه ۱۴:۸).';
      T.fa.aboutAngel3 = 'فرشته سوم: هشدار درباره پرستش وحش و تصویرش (مکاشفه ۱۴:۹–۱۲).';
      T.fa.aboutP3 = 'هدف ما این است که این پیام نهایی را با وضوح و محبت به هر زبان و ملتی برسانیم.';
      T.fa.aboutP4 = 'برای تماشای محتوا به بخش رسانه‌ها بروید. برای سوال یا تماس، از صفحه تماس یا سوالات استفاده کنید.';
      T.fa.homeContactTitle = 'تماس با ما';
    }
    if (T.en) {
      T.en.about = 'About';
      T.en.aboutTitle = 'About us';
      T.en.aboutP1 = 'Seventh Trumpet is a website for sharing the everlasting gospel and the three angels’ messages of Revelation 14.';
      T.en.aboutP2 = 'We publish photos, videos, audio, writings, and files about the Bible so everyone can hear and read the truth — in Persian and English.';
      T.en.aboutAngelsTitle = 'The three angels’ messages';
      T.en.aboutAngel1 = 'First angel: Fear God and give Him glory, for the hour of His judgment has come (Revelation 14:6–7).';
      T.en.aboutAngel2 = 'Second angel: Babylon is fallen (Revelation 14:8).';
      T.en.aboutAngel3 = 'Third angel: Warning against worshiping the beast and its image (Revelation 14:9–12).';
      T.en.aboutP3 = 'Our goal is to share this final message clearly and with love to every language and nation.';
      T.en.aboutP4 = 'Go to Media to watch content. For questions or contact, use the Contact or Questions pages.';
      T.en.homeContactTitle = 'Contact us';
    }
  }
  merge();
  // Re-apply language labels if the app already ran
  try {
    if (typeof applyLanguage === 'function') applyLanguage();
    else if (typeof currentLang !== 'undefined' && T[currentLang]) {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var k = el.getAttribute('data-i18n');
        if (T[currentLang][k]) el.textContent = T[currentLang][k];
      });
    }
  } catch (e) {}
})();
