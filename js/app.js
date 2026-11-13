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
    home: 'خانه', media: 'رسانه‌ها', live: 'پخش زنده', contact: 'تماس', admin: 'مدیریت',
    missionBody: 'اعلام انجیل جاودانی و پیام سه فرشته مکاشفه ۱۴ به همه قوم‌ها.',
    langBtn: 'English',
    heroTitle: 'شیپور هفتم', heroSub: 'پیام جاودانی انجیل برای تمام قوم‌ها، زبان‌ها و ملت‌ها',
    threeAngels: 'پیام سه فرشته', threeAngelsHint: 'مکاشفه ۱۴:۶–۱۲',
    angel1: 'فرشته اول', angel1Text: 'از خدا بترسید و او را جلال دهید، زیرا ساعت داوری او رسیده است',
    angel2: 'فرشته دوم', angel2Text: 'بابل بزرگ سقوط کرده است',
    angel3: 'فرشته سوم', angel3Text: 'اگر کسی وحش و تصویر او را پرستش کند',
    whatsapp: 'واتساپ', phone: 'تلفن', email: 'ایمیل',
    footer: 'شیپور هفتم — پیام سه فرشته مکاشفه ۱۴', close: 'بستن', untitled: 'بدون عنوان',
    guestText: 'مهمان', signOut: 'خروج', welcome: 'خوش آمدید',
    signInGoogle: 'ورود با گوگل', signInEmail: 'ورود با ایمیل',
    emailLoginTitle: 'ورود با ایمیل', emailLabel: 'ایمیل', passwordLabel: 'رمز عبور',
    loginBtn: 'ورود', registerBtn: 'ثبت‌نام', resumeHint: 'ویدیو از جایی که رها کردید ادامه می‌یابد'
  },
  en: {
    pageTitle: 'Seventh Trumpet — Three Angels Message', siteName: 'Seventh Trumpet', tagline: 'Three Angels Message — Revelation 14',
    home: 'Home', media: 'Media', live: 'Live', contact: 'Contact', admin: 'Admin',
    missionBody: 'Proclaim the everlasting gospel and the three angels messages of Revelation 14 to all nations.',
    langBtn: 'فارسی',
    heroTitle: 'Seventh Trumpet', heroSub: 'The everlasting gospel for every nation, tribe, language and people',
    threeAngels: 'Three Angels Message', threeAngelsHint: 'Revelation 14:6–12',
    angel1: 'First Angel', angel1Text: 'Fear God and give Him glory, for the hour of His judgment has come',
    angel2: 'Second Angel', angel2Text: 'Babylon the great is fallen',
    angel3: 'Third Angel', angel3Text: 'If anyone worships the beast and his image',
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

function applyLanguage() {
  var lang = currentLang === 'en' ? 'en' : 'fa';
  currentLang = lang;
  document.body.classList.toggle('lang-en', lang === 'en');
  document.body.classList.toggle('lang-fa', lang === 'fa');
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  var t = (T && T[lang]) ? T[lang] : {};
  if (t.pageTitle) document.title = t.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var key = el.getAttribute('data-i18n');
    if (key && t[key] != null && String(t[key]).length) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    var key = el.getAttribute('data-i18n-placeholder');
    if (key && t[key] != null) el.placeholder = t[key];
  });
  document.querySelectorAll('[data-lang-only]').forEach(function (el) {
    el.style.display = (el.getAttribute('data-lang-only') === lang) ? '' : 'none';
  });
  try { if (typeof updateLiveBadge === 'function') updateLiveBadge(); } catch (e) {}
  try { if (typeof updateAuthUI === 'function') updateAuthUI(); } catch (e) {}
  try { if (typeof window.updateSideMenuLang === 'function') window.updateSideMenuLang(); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('cog-lang-changed', { detail: { lang: lang } })); } catch (e) {}
}

function toggleLanguage() {
  currentLang = currentLang === 'fa' ? 'en' : 'fa';
  try { localStorage.setItem(LANG_KEY, currentLang); } catch (e) {}
  applyLanguage();
  try { if (typeof renderMedia === 'function') renderMedia(); } catch (e) {}
  try { if (typeof renderAll === 'function') renderAll(); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function () {
  try { if (typeof loadData === 'function') loadData(); } catch (e) {}
  try { applyLanguage(); } catch (e) { console.warn(e); }
  try { if (typeof renderAll === 'function') renderAll(); } catch (e) { console.warn(e); }
  try { if (typeof setupEventListeners === 'function') setupEventListeners(); } catch (e) { console.warn(e); }
  var lt = document.getElementById('lang-toggle');
  if (lt && !lt._stLangBound) {
    lt._stLangBound = true;
    lt.addEventListener('click', function (e) {
      e.preventDefault();
      toggleLanguage();
    });
  }
});
