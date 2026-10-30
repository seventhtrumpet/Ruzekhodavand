/* Muted looping intro video behind hero — no sound */
(function () {
  var SRC = 'media/intro-bg.mp4';

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
    v.volume = 0;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.playsInline = true;
    v.loop = true;
    v.autoplay = true;
    v.preload = 'auto';
    v.disablePictureInPicture = true;
    v.controls = false;
    // Ensure no audio track plays even if file has sound
    v.addEventListener('play', function () {
      try { v.muted = true; v.volume = 0; } catch (e) {}
    });
    wrap.appendChild(v);
    hero.insertBefore(wrap, hero.firstChild);
    var play = function () {
      try { v.muted = true; v.volume = 0; } catch (e) {}
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
    if (window.ST_INTRO_VIDEO_URL) {
      mount(window.ST_INTRO_VIDEO_URL);
      return;
    }
    // Prefer site media file (muted)
    var test = document.createElement('video');
    test.preload = 'metadata';
    test.muted = true;
    test.src = SRC;
    test.onloadeddata = function () { mount(SRC); };
    test.onerror = function () {
      // file not uploaded yet — keep hero gradient only
    };
  }

  document.addEventListener('st-intro-ready', tryMount);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMount);
  } else {
    tryMount();
  }
  setTimeout(tryMount, 400);
})();
