/* Register PWA manifest + service worker; optional install button */
(function () {
  function injectManifest() {
    if (document.querySelector('link[rel="manifest"]')) return;
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/site.webmanifest';
    document.head.appendChild(link);

    if (!document.querySelector('meta[name="mobile-web-app-capable"]')) {
      var m1 = document.createElement('meta');
      m1.name = 'mobile-web-app-capable';
      m1.content = 'yes';
      document.head.appendChild(m1);
    }
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      var m2 = document.createElement('meta');
      m2.name = 'apple-mobile-web-app-capable';
      m2.content = 'yes';
      document.head.appendChild(m2);
    }
    if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
      var m3 = document.createElement('meta');
      m3.name = 'apple-mobile-web-app-title';
      m3.content = 'Seventh Trumpet';
      document.head.appendChild(m3);
    }
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  var deferredPrompt = null;

  function isFa() {
    try {
      return ((typeof currentLang !== 'undefined' && currentLang) || localStorage.getItem('cog_lang') || 'fa') !== 'en';
    } catch (e) {
      return true;
    }
  }

  function showInstallHint() {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (sessionStorage.getItem('st_install_dismissed')) return;
    if (document.getElementById('pwa-install-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'pwa-install-bar';
    bar.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;justify-content:space-between;' +
      'padding:0.75rem 1rem;background:#0a2540;color:#fff;box-shadow:0 -4px 20px rgba(0,0,0,.25);font-size:0.95rem;';
    bar.innerHTML =
      '<span style="flex:1;min-width:160px;line-height:1.4;">' +
      (isFa()
        ? '\u0627\u06cc\u0646 \u0633\u0627\u06cc\u062a \u0631\u0627 \u0645\u062b\u0644 \u06cc\u06a9 \u0628\u0631\u0646\u0627\u0645\u0647 \u0631\u0648\u06cc \u06af\u0648\u0634\u06cc \u062e\u0648\u062f \u0646\u0635\u0628 \u06a9\u0646\u06cc\u062f'
        : 'Install this site like an app on your phone') +
      '</span>' +
      '<span style="display:flex;gap:0.4rem;">' +
      '<button type="button" id="pwa-install-btn" style="background:#c9a227;color:#0a2540;border:none;font-weight:800;padding:0.5rem 0.9rem;border-radius:8px;cursor:pointer;">' +
      (isFa() ? '\u0646\u0635\u0628' : 'Install') +
      '</button>' +
      '<button type="button" id="pwa-install-dismiss" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);padding:0.5rem 0.7rem;border-radius:8px;cursor:pointer;">' +
      (isFa() ? '\u0628\u0639\u062f\u0627' : 'Later') +
      '</button></span>';

    document.body.appendChild(bar);
    document.getElementById('pwa-install-dismiss').onclick = function () {
      sessionStorage.setItem('st_install_dismissed', '1');
      bar.remove();
    };
    document.getElementById('pwa-install-btn').onclick = function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(function () {
          deferredPrompt = null;
          bar.remove();
        });
      } else {
        alert(
          isFa()
            ? '\u062f\u0631 \u06a9\u0631\u0648\u0645 \u06cc\u0627 \u0633\u0627\u0641\u0627\u0631\u06cc: \u0645\u0646\u0648 \u2192 \u0627\u0641\u0632\u0648\u062f\u0646 \u0628\u0647 \u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc / Add to Home Screen'
            : 'In Chrome/Safari: Menu → Add to Home Screen / Install app'
        );
      }
    };
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallHint();
  });

  injectManifest();
  registerSW();
  setTimeout(function () {
    if (!deferredPrompt) showInstallHint();
  }, 8000);
})();
