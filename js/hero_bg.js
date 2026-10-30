/* Muted looping intro video behind hero */
(function () {
  function mount(url) {
    var hero = document.querySelector('section.hero');
    if (!hero || hero.querySelector('.hero-bg-video')) return;
    hero.classList.add('has-video-bg');
    var wrap = document.createElement('div');
    wrap.className = 'hero-bg-video';
    wrap.setAttribute('aria-hidden', 'true');
    var v = document.createElement('video');
    v.src = url;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.playsInline = true;
    v.loop = true;
    v.autoplay = true;
    v.preload = 'auto';
    v.disablePictureInPicture = true;
    v.controls = false;
    wrap.appendChild(v);
    hero.insertBefore(wrap, hero.firstChild);
    var play = function () {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    };
    v.addEventListener('loadeddata', play);
    play();
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) play();
    });
  }
  function tryMount() {
    if (window.ST_INTRO_VIDEO_URL) mount(window.ST_INTRO_VIDEO_URL);
  }
  document.addEventListener('st-intro-ready', tryMount);
  tryMount();
  setTimeout(tryMount, 300);
  setTimeout(tryMount, 1000);
})();
