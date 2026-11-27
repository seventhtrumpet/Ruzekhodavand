/* Bible search loader — restore full engine + fix version/search stack */
(function () {
  if (window.__mbSearchLoader) return;
  window.__mbSearchLoader = true;

  var URLS = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@9c8acefa30/js/bible_search.js',
    'https://raw.githubusercontent.com/seventhtrumpet/Ruzekhodavand/9c8acefa30/js/bible_search.js'
  ];

  var PATCH_TO = [
    'function placeSearch() {',
    '    var wrap = document.getElementById("mb-search-wrap");',
    '    if (!wrap) return;',
    '    var bar = document.querySelector(".mb-bar");',
    '    var top = bar ? Math.max(bar.getBoundingClientRect().bottom, 48) : 56;',
    '    wrap.style.position = "fixed";',
    '    wrap.style.left = "0";',
    '    wrap.style.right = "0";',
    '    wrap.style.top = top + "px";',
    '    wrap.style.zIndex = "1140";',
    '    wrap.style.display = "block";',
    '    var searchHeight = Math.max(wrap.offsetHeight || 0, 72);',
    '    var englishVersion = document.getElementById("bible-version-wrap");',
    '    var persianVersion = document.getElementById("persian-version-wrap");',
    '    var isEnglish = false;',
    '    try {',
    '      isEnglish = ((typeof currentLang !== "undefined" && currentLang) || localStorage.getItem("cog_lang") || document.documentElement.lang || "fa") === "en";',
    '    } catch (e) { isEnglish = document.documentElement.lang === "en"; }',
    '    var activeVersion = isEnglish ? englishVersion : (persianVersion || englishVersion);',
    '    [englishVersion, persianVersion].forEach(function (version) {',
    '      if (!version) return;',
    '      version.style.position = "fixed";',
    '      version.style.left = "0";',
    '      version.style.right = "0";',
    '      version.style.top = (top + searchHeight) + "px";',
    '      version.style.zIndex = "1130";',
    '      version.style.display = (version === activeVersion) ? "flex" : "none";',
    '      version.style.alignItems = "center";',
    '      version.style.gap = "0.5rem";',
    '      version.style.boxSizing = "border-box";',
    '      version.style.padding = "0.4rem 0.65rem";',
    '      version.style.margin = "0";',
    '      version.style.background = "var(--bg-card,#fff)";',
    '      version.style.borderBottom = "1px solid var(--border,#d8dee6)";',
    '      version.style.boxShadow = "0 2px 10px rgba(10,37,64,.06)";',
    '      version.style.width = "100%";',
    '    });',
    '    var versionHeight = activeVersion ? Math.max(activeVersion.offsetHeight || 0, 48) : 0;',
    '    var spacer = document.getElementById("bible-version-spacer");',
    '    if (!spacer) {',
    '      spacer = document.createElement("div");',
    '      spacer.id = "bible-version-spacer";',
    '      spacer.setAttribute("aria-hidden", "true");',
    '      var reader = document.getElementById("mb-reader") || document.querySelector("main") || document.body;',
    '      if (reader && reader.parentNode) reader.parentNode.insertBefore(spacer, reader);',
    '      else document.body.insertBefore(spacer, document.body.firstChild);',
    '    }',
    '    spacer.style.display = "block";',
    '    spacer.style.width = "100%";',
    '    spacer.style.height = (searchHeight + versionHeight + 8) + "px";',
    '    spacer.style.pointerEvents = "none";',
    '  }'
  ].join('\n');

  function applyPatch(code) {
    var start = code.indexOf('function placeSearch()');
    if (start < 0) return code;
    var end = code.indexOf('function goTo(', start);
    if (end < 0) end = code.indexOf('function renderItems(', start);
    if (end < 0) return code;
    return code.slice(0, start) + PATCH_TO + '\n\n  ' + code.slice(end);
  }

  function run(code) {
    code = applyPatch(code);
    try {
      (0, eval)(code);
    } catch (e) {
      console.error('[bible_search] eval failed', e);
    }
  }

  (async function () {
    for (var i = 0; i < URLS.length; i++) {
      try {
        var r = await fetch(URLS[i] + (URLS[i].indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now());
        if (!r.ok) continue;
        var code = await r.text();
        if (code.indexOf('function placeSearch') < 0) continue;
        run(code);
        return;
      } catch (e) {}
    }
    console.error('[bible_search] could not load engine');
  })();
})();
