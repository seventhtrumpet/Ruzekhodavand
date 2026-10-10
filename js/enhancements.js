/* Seventh Trumpet - UX enhancements */
(function () {
  const THEME_KEY = 'cog_theme';
  const DAILY_VERSES = [
    { fa: 'زیرا خدا جهان را این‌قدر محبت نمود که پسر یگانه خود را داد تا هر که بر او ایمان آورد هلاک نگردد بلکه حیات جاودانی یابد.', en: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.', ref_fa: 'یوحنا ۳:۱۶', ref_en: 'John 3:16' },
    { fa: 'و این انجیل ملکوت در تمام عالم موعظه خواهد شد تا شهادتی برای جمیع امت‌ها باشد؛ آنگاه انتها خواهد رسید.', en: 'And this gospel of the kingdom will be preached in all the world as a witness to all the nations, and then the end will come.', ref_fa: 'متی ۲۴:۱۴', ref_en: 'Matthew 24:14' },
    { fa: 'آنگاه فرشته‌ای دیگر را دیدم که در میان آسمان پرواز می‌کند و انجیل جاودانی با خود دارد تا ساکنان زمین را بشارت دهد.', en: 'Then I saw another angel flying in the midst of heaven, having the everlasting gospel to preach to those who dwell on the earth.', ref_fa: 'مکاشفه ۱۴:۶', ref_en: 'Revelation 14:6' },
    { fa: 'از خدا بترسید و او را جلال دهید، زیرا ساعت داوری او رسیده است؛ و او را که آسمان و زمین و دریا و چشمه‌های آب را آفرید، پرستش کنید.', en: 'Fear God and give Him glory, for the hour of His judgment has come; and worship Him who made heaven and earth, the sea and springs of water.', ref_fa: 'مکاشفه ۱۴:۷', ref_en: 'Revelation 14:7' },
    { fa: 'بیایید نزد من ای تمام زحمتکشان و گرانباران و من شما را آرامی خواهم بخشید.', en: 'Come to Me, all you who labor and are heavy laden, and I will give you rest.', ref_fa: 'متی ۱۱:۲۸', ref_en: 'Matthew 11:28' },
    { fa: 'عیسی بدو گفت: «من راه و راستی و حیات هستم؛ هیچ‌کس نزد پدر جز به وسیله من نمی‌آید.»', en: 'Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father except through Me.”', ref_fa: 'یوحنا ۱۴:۶', ref_en: 'John 14:6' },
    { fa: 'لیکن جویندگان خداوند هرگز محتاج به هیچ خیر نخواهند شد.', en: 'Those who seek the Lord shall not lack any good thing.', ref_fa: 'مزامیر ۳۴:۱۰', ref_en: 'Psalm 34:10' },
    { fa: 'دل خود را به تمامی به خداوند توکل نما و بر فهم خود تکیه مکن.', en: 'Trust in the Lord with all your heart, and lean not on your own understanding.', ref_fa: 'امثال ۳:۵', ref_en: 'Proverbs 3:5' },
    { fa: 'زیرا که فیض خدا که برای نجات جمیع مردم است ظاهر شده است.', en: 'For the grace of God that brings salvation has appeared to all men.', ref_fa: 'تیطس ۲:۱۱', ref_en: 'Titus 2:11' },
    { fa: 'اینک بر در ایستاده می‌کوبم؛ اگر کسی آواز مرا بشنود و در را باز کند، به نزد او درخواهم آمد و با او شام خواهم خورد و او با من.', en: 'Behold, I stand at the door and knock. If anyone hears My voice and opens the door, I will come in to him and dine with him, and he with Me.', ref_fa: 'مکاشفه ۳:۲۰', ref_en: 'Revelation 3:20' },
    { fa: 'خدا محبت است و هر که در محبت ساکن است در خدا ساکن است و خدا در وی.', en: 'God is love, and he who abides in love abides in God, and God in him.', ref_fa: 'اول یوحنا ۴:۱۶', ref_en: '1 John 4:16' },
    { fa: 'پس همه چیز را برای جلال خدا بکنید.', en: 'Therefore, whether you eat or drink, or whatever you do, do all to the glory of God.', ref_fa: 'اول قرنتیان ۱۰:۳۱', ref_en: '1 Corinthians 10:31' },
    { fa: 'روح خداوند بر من است، از آن رو که مرا مسح کرد تا مسکینان را بشارت دهم.', en: 'The Spirit of the Lord is upon Me, because He has anointed Me to preach the gospel to the poor.', ref_fa: 'لوقا ۴:۱۸', ref_en: 'Luke 4:18' },
    { fa: 'لیکن شما نسل برگزیده و کهانت ملوکانه و امت مقدس و قومی که ملک خاص خدا می‌باشید هستید.', en: 'But you are a chosen generation, a royal priesthood, a holy nation, His own special people.', ref_fa: 'اول پطرس ۲:۹', ref_en: '1 Peter 2:9' },
    { fa: 'بابل بزرگ سقوط کرده است! سقوط کرده است!', en: 'Babylon the great is fallen, is fallen!', ref_fa: 'مکاشفه ۱۴:۸', ref_en: 'Revelation 14:8' }
  ];

  function lang() {
    return (typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa';
  }

  function dayIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000) % DAILY_VERSES.length;
  }

  function showVerse(idx) {
    const v = DAILY_VERSES[idx % DAILY_VERSES.length];
    const textEl = document.getElementById('verse-text');
    const refEl = document.getElementById('verse-ref');
    if (!textEl || !refEl) return;
    const fa = lang() === 'fa';
    textEl.textContent = fa ? v.fa : v.en;
    refEl.textContent = '— ' + (fa ? v.ref_fa : v.ref_en);
    window._verseIdx = idx % DAILY_VERSES.length;
  }

  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  function initVerse() {
    showVerse(dayIndex());
    document.getElementById('verse-refresh')?.addEventListener('click', () => {
      showVerse(((window._verseIdx ?? dayIndex()) + 1) % DAILY_VERSES.length);
    });
    document.getElementById('lang-toggle')?.addEventListener('click', () => {
      setTimeout(() => showVerse(window._verseIdx ?? dayIndex()), 50);
    });
  }

  function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  }

  window.sharePost = function (title) {
    const url = window.location.href.split('#')[0];
    const text = title || document.title;
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
      return;
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
  };

  window.copyPageLink = function (btn) {
    const url = window.location.href.split('#')[0];
    navigator.clipboard.writeText(url).then(() => {
      if (btn) {
        const old = btn.textContent;
        btn.textContent = lang() === 'fa' ? 'کپی شد!' : 'Copied!';
        setTimeout(() => { btn.textContent = old; }, 1500);
      }
    }).catch(() => {});
  };

  function patchOpenPost() {
    if (typeof window.openPost !== 'function') return;
    const original = window.openPost;
    window.openPost = function (id) {
      original(id);
      setTimeout(() => {
        const content = document.getElementById('modal-content');
        if (!content || content.querySelector('.share-row')) return;
        const comments = content.querySelector('.comments-box');
        if (!comments) return;
        const titleEl = content.querySelector('h2');
        const title = titleEl ? titleEl.textContent : document.title;
        const isFa = lang() === 'fa';
        const row = document.createElement('div');
        row.className = 'share-row';
        row.innerHTML =
          '<span class="share-label">' + (isFa ? 'اشتراک‌گذاری' : 'Share') + ':</span>' +
          '<button type="button" class="share-btn" data-share="1">📤 ' + (isFa ? 'اشتراک' : 'Share') + '</button>' +
          '<button type="button" class="share-btn" data-copy="1">' + (isFa ? 'کپی لینک' : 'Copy link') + '</button>' +
          '<a class="share-btn" href="https://wa.me/?text=' + encodeURIComponent(title + ' ' + location.href.split('#')[0]) + '" target="_blank" rel="noopener">WhatsApp</a>';
        comments.parentNode.insertBefore(row, comments);
        row.querySelector('[data-share]')?.addEventListener('click', () => window.sharePost(title));
        row.querySelector('[data-copy]')?.addEventListener('click', function () { window.copyPageLink(this); });
      }, 80);
    };
  }

  function improveEmptyState() {
    const grid = document.getElementById('media-grid');
    if (!grid) return;
    const obs = new MutationObserver(() => {
      const empty = grid.querySelector('.empty-state');
      if (empty && !empty.querySelector('.empty-icon')) {
        const isFa = lang() === 'fa';
        empty.innerHTML =
          '<div class="empty-icon">📖</div>' +
          '<p>' + (isFa ? 'هنوز محتوایی منتشر نشده است.' : 'No content has been published yet.') + '</p>' +
          '<p class="empty-hint">' + (isFa ? 'به زودی پیام‌ها و رسانه‌های جدید اینجا منتشر می‌شوند.' : 'New messages and media will appear here soon.') + '</p>';
      }
    });
    obs.observe(grid, { childList: true, subtree: true });
  }

  function boot() {
    initTheme();
    initVerse();
    initScrollTop();
    patchOpenPost();
    improveEmptyState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 30));
  } else {
    setTimeout(boot, 30);
  }
})();
