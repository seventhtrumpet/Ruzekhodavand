/* Privacy, Terms, Teachings — EN strings (FA is default in HTML) */
(function () {
  if (typeof T === 'undefined') return;
  var en = {
    privacyTitle: 'Privacy Policy',
    privacyUpdated: 'Last updated: 29 October 2026',
    privacyIntro: 'Seventh Trumpet ("we") respects your privacy. This page explains what information is collected and how it is used.',
    privacyWho: 'Who is responsible',
    privacyWhoT: 'The website seventhtrumpet.org is operated by Seventh Trumpet. For privacy questions contact: info.seventhtrumpet@gmail.com',
    privacyCollect: 'What information is collected',
    privacyC1: 'If you sign in with Google or email: email address and display name via Firebase Authentication.',
    privacyC2: 'Data stored in your browser (localStorage / sessionStorage): language, video progress, theme, and if you subscribe, email for the daily verse.',
    privacyC3: 'If you send a question, feedback, or contact form: the text you enter and optional contact details.',
    privacyC4: 'Standard web-server technical data (such as approximate IP and browser type) may be logged by the host (e.g. Vercel).',
    privacyUse: 'How it is used',
    privacyUseT: 'To provide optional sign-in, save your settings, send the daily verse if you subscribed, reply to messages, and improve the site. We do not sell your information.',
    privacyCookies: 'Cookies and local storage',
    privacyCookiesT: 'We use cookies and browser storage for language, login session, and preferences. Third parties such as Firebase may set their own cookies. You can clear or limit cookies in your browser; some features may stop working.',
    privacyThird: 'Third-party services',
    privacyThirdT: 'We may use Firebase (Google) for sign-in and database, and Vercel for hosting. Their privacy policies apply separately. If advertising is enabled later, the ad provider may also collect data; this page will be updated.',
    privacyRights: 'Your rights',
    privacyRightsT: 'You may request access, correction, or deletion of account-related data by emailing us. You can unsubscribe from the daily verse by messaging the same email.',
    privacyChildren: 'Children',
    privacyChildrenT: 'The site is for a general audience about the Bible. We do not knowingly collect personal information from children under 13.',
    privacyContact: 'Contact',
    privacyContactT: 'info.seventhtrumpet@gmail.com · seventh.trumpet@yahoo.com',
    termsTitle: 'Terms of Use',
    termsUpdated: 'Last updated: 29 October 2026',
    termsIntro: 'By using seventhtrumpet.org (the "Site") you accept these terms. If you do not agree, please do not use the Site.',
    termsPurpose: 'Purpose of the Site',
    termsPurposeT: 'The Site shares the gospel, the three angels\' messages (Revelation 14), the Bible, and teaching media in Persian and English.',
    termsUse: 'Allowed use',
    termsUseT: 'You may view and download content for personal study and spiritual growth where the Site allows. Abuse, hacking, spam, or uploading illegal or abusive content is not allowed.',
    termsContent: 'Content',
    termsContentT: 'Bible text and published media may be subject to translator or creator rights. Original Seventh Trumpet content may be used for personal non-commercial use unless stated otherwise. Do not use the site name or branding to mislead others without permission.',
    termsAccounts: 'Accounts',
    termsAccountsT: 'Sign-in is optional. You are responsible for keeping your account secure. We may suspend access in case of abuse.',
    termsDisclaimer: 'Disclaimer',
    termsDisclaimerT: 'Content is offered for teaching and encouragement of faith. The Site is provided "as is." We do not guarantee it will always be error-free or uninterrupted.',
    termsLinks: 'External links',
    termsLinksT: 'The Site may link to YouTube, social networks, or other sites. We are not responsible for their content.',
    termsChanges: 'Changes',
    termsChangesT: 'We may update these terms. The date above shows the latest change. Continued use means you accept the new version.',
    termsContact: 'Contact',
    termsContactT: 'info.seventhtrumpet@gmail.com · seventh.trumpet@yahoo.com',
    teachTitle: 'Teachings',
    teachIntro: 'Short notes on the three angels\' messages and the everlasting gospel — in our own words.',
    teach1Title: 'The everlasting gospel for every nation',
    teach1P1: 'Revelation 14 speaks of an angel preaching the everlasting gospel to every nation, tribe, language, and people. This message is not limited to one nation. God calls everyone to repentance and faith in Jesus Christ.',
    teach1P2: 'The "everlasting gospel" is the good news of salvation through the cross and resurrection of Christ — news that does not grow old and remains true until the Lord returns.',
    teach2Title: 'First angel: fear God and the hour of judgment',
    teach2P1: 'The first message calls us to fear God, give Him glory, and worship Him who made heaven and earth. "Fear of God" is not empty terror; it is reverence, obedience, and taking His word seriously.',
    teach2P2: '"The hour of His judgment has come" reminds us that history is not aimless. Everyone is accountable to God; our only refuge is the righteousness of Christ given by faith.',
    teach3Title: 'Second angel: Babylon is fallen',
    teach3P1: 'In Scripture, Babylon symbolizes religious confusion and systems that put human authority in place of God\'s full truth. The second message warns that such systems stand condemned before God.',
    teach3P2: 'The call is to stay faithful to God\'s word and turn from teachings that distort the gospel — with love, not pride.',
    teach4Title: 'Third angel: final warning and the patience of the saints',
    teach4P1: 'The third message gives the Bible\'s most serious warning about worshiping the beast and its image. At the same time, the closing verses speak of those who keep the commandments of God and the faith of Jesus.',
    teach4P2: 'The patience of the saints means standing firm in hope: not in human fear, but in trust in the Lamb of God who purchased us.',
    teach5Title: 'How should we respond?',
    teach5P1: 'Read the Bible, pray, and trust Jesus as Savior and Lord. The three angels\' messages do not replace the gospel; they proclaim it clearly for the last days.',
    teach5P2: 'On this site you can read the Bible, watch media, and ask questions. May God bless you.',
    privacyNav: 'Privacy',
    termsNav: 'Terms',
    teachingsNav: 'Teachings'
  };
  var fa = {
    privacyNav: '\u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc',
    termsNav: '\u0634\u0631\u0627\u06cc\u0637 \u0627\u0633\u062a\u0641\u0627\u062f\u0647',
    teachingsNav: '\u0622\u0645\u0648\u0632\u0634\u200c\u0647\u0627'
  };
  Object.keys(en).forEach(function (k) {
    if (!T.en) T.en = {};
    if (!T.fa) T.fa = {};
    T.en[k] = en[k];
    if (fa[k]) T.fa[k] = fa[k];
  });
})();
