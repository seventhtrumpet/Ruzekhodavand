/* Restore full site CSS if the main stylesheet was truncated */
(function () {
  var GOOD = 'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@2eaef80/css/style.css';
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = GOOD + '?v=restore1';
  l.setAttribute('data-style-restore', '1');
  document.head.appendChild(l);
  var s = document.createElement('style');
  s.setAttribute('data-about-fix', '1');
  s.textContent = '.btn-secondary{background:rgba(201,162,39,.95)!important;color:#0a1520!important;font-weight:700!important;border:2px solid #e8d48b!important;box-shadow:0 4px 16px rgba(0,0,0,.3)!important}.btn-secondary:hover{background:#e8d48b!important}.home-cta{display:flex!important;flex-wrap:wrap;justify-content:center;gap:.75rem 1rem}.home-cta .btn-secondary{min-width:160px;padding:.8rem 1.4rem!important;font-size:1rem!important}.mission-card .mission-more{display:inline-flex!important;align-items:center;justify-content:center;padding:.55rem 1.25rem!important;border-radius:8px!important;font-weight:700!important;color:#0a1520!important;background:#c9a227!important;border:none!important;text-decoration:none!important}';
  document.head.appendChild(s);
})();
