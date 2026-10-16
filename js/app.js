/* Seventh Trumpet - Main App Logic + Firebase Auth */

const STORAGE_KEY = 'cog_posts_v1';
const LIVE_KEY = 'cog_live_v1';
const LANG_KEY = 'cog_lang';
const PROGRESS_KEY = 'cog_progress';

const firebaseConfig = {
  apiKey: "AIzaSyACmzOLWCtIBboDBTu8IbnjeS9NG-5Z87E",
  authDomain: "lalala-9a4b6.firebaseapp.com",
  projectId: "lalala-9a4b6",
  storageBucket: "lalala-9a4b6.firebasestorage.app",
  messagingSenderId: "304381949568",
  appId: "1:304381949568:web:2178a803c6950d448bd865",
  measurementId: "G-TPECJKXV61"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const BIBLE_BOOKS = {
  fa: ['پیدایش','خروج','لاویان','اعداد','تثنیه','یوشع','داوران','روت','اول سموئیل','دوم سموئیل','اول پادشاهان','دوم پادشاهان','اول تواریخ','دوم تواریخ','عزرا','نحمیا','استر','ایوب','مزامیر','امثال','جامعه','غزل غزل‌ها','اشعیا','ارمیا','مراثی','حزقیال','دانیال','هوشع','یوئیل','عاموس','عوبیدیا','یونس','میکا','ناحوم','حبقوق','صفنیا','حجی','زکریا','ملاکی','متی','مرقس','لوقا','یوحنا','اعمال رسولان','رومیان','اول قرنتیان','دوم قرنتیان','غلاطیان','افسسیان','فیلیپیان','کولسیان','اول تسالونیکیان','دوم تسالونیکیان','اول تیموتائوس','دوم تیموتائوس','تیطس','فلیمون','عبرانیان','یعقوب','اول پطرس','دوم پطرس','اول یوحنا','دوم یوحنا','سوم یوحنا','یهودا','مکاشفه','سه فرشته','عمومی'],
  en: ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation','Three Angels','General']
};

const T = {
  fa: {
    pageTitle: 'شیپور هفتم — پیام سه فرشته', siteName: 'شیپور هفتم', tagline: 'پیام سه فرشته — مکاشفه ۱۴',
    home: 'خانه', media: 'رسانه‌ها', live: 'پخش زنده', contact: 'تماس', admin: 'مدیریت', langBtn: 'English',
    heroTitle: 'شیپور هفتم', heroSub: 'پیام جاودانی انجیل برای تمام قوم‌ها، زبان‌ها و ملت‌ها',
    angel1: 'فرشته اول', angel1Text: 'از خدا بترسید و او را جلال دهید، زیرا ساعت داوری او رسیده است',
    angel2: 'فرشته دوم', angel2Text: 'بابل سقوط کرده است! سقوط کرده است!',
    angel3: 'فرشته سوم', angel3Text: 'اگر کسی وحش و تصویرش را بپرستد...',
    all: 'همه', photo: 'عکس', video: 'ویدیو', file: 'فایل', text: 'متن', audio: 'صوت', search: 'جستجو...',
    download: 'دانلود', view: 'مشاهده', comments: 'نظرات', noPosts: 'هنوز محتوایی منتشر نشده است.',
    writeComment: 'نظر خود را بنویسید...', yourName: 'نام شما', send: 'ارسال',
    liveNow: 'در حال پخش زنده', liveBadge: 'زنده', contactTitle: 'تماس با ما',
    questionsTitle: 'پرسش و پاسخ', questionsIntro: 'سوال خود را بنویسید. پاسخ از طریق ایمیل برای شما ارسال می‌شود.', questionsNav: 'سوالات',
    qName: 'نام شما', qEmail: 'ایمیل شما (برای پاسخ)', qQuestion: 'سوال شما', qSend: 'ارسال سوال', qThanks: 'سوال شما ارسال شد. متشکریم!',
    whatsapp: 'واتساپ', phone: 'تلفن', email: 'ایمیل',
    footer: 'شیپور هفتم — پیام سه فرشته مکاشفه ۱۴', close: 'بستن', untitled: 'بدون عنوان',
    guestText: 'مهمان', signOut: 'خروج', welcome: 'خوش آمدید',
    signInGoogle: 'ورود با گوگل', signInEmail: 'ورود با ایمیل',
    emailLoginTitle: 'ورود با ایمیل', emailLabel: 'ایمیل', passwordLabel: 'رمز عبور',
    loginBtn: 'ورود', registerBtn: 'ثبت‌نام', resumeHint: 'ویدیو از جایی که قبلاً متوقف کردید ادامه پیدا می‌کند'
  },
  en: {
    pageTitle: 'Seventh Trumpet — Three Angels Message', siteName: 'Seventh Trumpet', tagline: 'Three Angels Message — Revelation 14',
    home: 'Home', media: 'Media', live: 'Live', contact: 'Contact', admin: 'Admin', langBtn: 'Persian',
    heroTitle: 'Seventh Trumpet', heroSub: 'The everlasting gospel to every nation, tribe, language and people',
    angel1: 'First Angel', angel1Text: 'Fear God and give Him glory, for the hour of His judgment has come',
    angel2: 'Second Angel', angel2Text: 'Babylon is fallen, is fallen!',
    angel3: 'Third Angel', angel3Text: 'If anyone worships the beast and his image...',
    all: 'All', photo: 'Photo', video: 'Video', file: 'File', text: 'Text', audio: 'Audio', search: 'Search...',
    download: 'Download', view: 'View', comments: 'Comments', noPosts: 'No content has been published yet.',
    writeComment: 'Write your comment...', yourName: 'Your name', send: 'Send',
    liveNow: 'LIVE NOW', liveBadge: 'LIVE', contactTitle: 'Contact Us',
    questionsTitle: 'Ask a Question', questionsIntro: 'Write your question. We will reply by email.', questionsNav: 'Questions',
    qName: 'Your name', qEmail: 'Your email (for reply)', qQuestion: 'Your question', qSend: 'Send question', qThanks: 'Your question was sent. Thank you!',
    whatsapp: 'WhatsApp', phone: 'Phone', email: 'Email',
    footer: 'Seventh Trumpet — Three Angels Message of Revelation 14', close: 'Close', untitled: 'Untitled',
    guestText: 'Guest', signOut: 'Sign out', welcome: 'Welcome',
    signInGoogle: 'Sign in with Google', signInEmail: 'Sign in with Email',
    emailLoginTitle: 'Sign in with Email', emailLabel: 'Email', passwordLabel: 'Password',
    loginBtn: 'Login', registerBtn: 'Register', resumeHint: 'Video will resume from where you left off'
  }
};

let currentLang = localStorage.getItem(LANG_KEY) || 'fa';
if (currentLang === 'ru') currentLang = 'en';
let posts = [];
let liveData = { isLive: false, streamUrl: '', title: '' };
let currentUser = null;
