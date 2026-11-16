/* Persian+English Bible search — FA letter normalize, skip 404 stubs, no result cap */
(function () {
  if (window.__mbSearchBooted) return;
  var CORE = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@bb93c5e6585ef3a2a6927425a8ac8bb92e9cb6ce/js/bible_search.js',
    'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/bb93c5e6585ef3a2a6927425a8ac8bb92e9cb6ce/js/bible_search.js'
  ];

  var FA_NORM =
    'function normalize(s){' +
    's=String(s||"");' +
    's=s.replace(/[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]/g,"");' +
    's=s.replace(/\\u0640/g,"");' +
    's=s.replace(/\\u064A|\\u0649|\\u06D2/g,"\\u06CC");' +
    's=s.replace(/\\u0643/g,"\\u06A9");' +
    's=s.replace(/\\u0629|\\u06C1/g,"\\u0647");' +
    's=s.replace(/[\\u0622\\u0623\\u0625]/g,"\\u0627");' +
    's=s.replace(/\\u0624/g,"\\u0648");' +
    's=s.replace(/[\\u0660-\\u0669]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x0660+0x06F0);});' +
    's=s.replace(/[0-9]/g,function(c){return String.fromCharCode(0x06F0+c.charCodeAt(0)-48);});' +
    's=s.replace(/[\\u200B-\\u200F\\u202A-\\u202E\\uFEFF]/g,"");' +
    's=s.replace(/\\u200C/g," ");' +
    's=s.toLowerCase().replace(/\\s+/g," ").trim();' +
    'return s;}';

  function patch(src) {
    src = src.replace(/function normalize\(s\) \{[^}]+\}/, FA_NORM);

    src = src.replace(/var MAX_SHOW = \d+/g, 'var MAX_SHOW = 999999');
    src = src.replace(/return items\.slice\(0,\s*MAX_SHOW\);/g, 'return items;');
    src = src.replace(/items\.slice\(0,\s*MAX_SHOW\)/g, 'items');
    src = src.replace(/slice\(0,\s*MAX_SHOW\)/g, 'slice(0)');

    src = src.replace(
      /if \(s === 'ot'\) return bookId > 0 && bookId < NT_MIN;\s*if \(s === 'nt'\) return bookId >= NT_MIN;\s*if \(s === 'book'\) return bookId === currentBookId\(\);\s*return true;/,
      "if (s === 'ot') return (bookId=Number(bookId)||0)>=10&&bookId<NT_MIN; if (s === 'nt') return (bookId=Number(bookId)||0)>=NT_MIN&&bookId<=730; if (s === 'book') return Number(bookId)===currentBookId(); bookId=Number(bookId)||0; return bookId>=10&&bookId<=730;"
    );

    src = src.replace(
      'list.forEach(function (fn) {',
      'list.forEach(function (fn) { if (/^b\\d+\\.json$/i.test(String(fn||""))) return;'
    );

    src = src.replace(/mapPool\(files,\s*\\d+,/g, 'mapPool(files, 24,');
    src = src.replace(/checked % 20 === 0/g, 'checked % 40 === 0');
    src = src.replace(/, 450\)/g, ', 800)');
    return src;
  }

  function load(i) {
    if (i >= CORE.length) return;
    fetch(CORE[i] + '?t=fanorm1')
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (src) {
        try { (0, eval)(patch(src)); }
        catch (e) {
          console.warn('bible search load error', e);
          try { (0, eval)(src); } catch (e2) {}
        }
      })
      .catch(function () { load(i + 1); });
  }
  load(0);
})();
