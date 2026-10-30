/* Muted looping intro video behind hero — no sound */
(function () {
  // Temporary hosted muted video (until media/intro-bg.mp4 is in the repo)
  var HOSTED = 'https://h.uguu.se/NvnoNbgl.mp4';
  var LOCAL = 'media/intro-bg.mp4';

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
    v.addEventListener('error', function () {
      if (url !== LOCAL && window.ST_INTRO_VIDEO_URL) {
        wrap.remove();
        hero.classList.remove('has-video-bg');
        mount(window.ST_INTRO_VIDEO_URL);
      }
    });
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
    // Prefer permanent local file if present
    var test = document.createElement('video');
    test.preload = 'metadata';
    test.muted = true;
    test.src = LOCAL;
    var done = false;
    test.onloadeddata = function () {
      if (done) return;
      done = true;
      mount(LOCAL);
    };
    test.onerror = function () {
      if (done) return;
      done = true;
      mount(HOSTED);
    };
    setTimeout(function () {
      if (!done) {
        done = true;
        mount(HOSTED);
      }
    }, 1500);
  }

  document.addEventListener('st-intro-ready', tryMount);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryMount);
  } else {
    tryMount();
  }
  setTimeout(tryMount, 400);
})();
