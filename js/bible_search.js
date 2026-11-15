/* Full Bible search — no result cap; faster Persian; All/OT/NT/This book */
(function () {
  if (window.__mbSearchBooted) return;
  var CORE = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@bb93c5e6585ef3a2a6927425a8ac8bb92e9cb6ce/js/bible_search.js',
    'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/bb93c5e6585ef3a2a6927425a8ac8bb92e9cb6ce/js/bible_search.js'
  ];
  function patch(src) {
    src = src.replace(/var MAX_SHOW = \d+/g, 'var MAX_SHOW = 999999');
    src = src.replace(/return items\.slice\(0,\s*MAX_SHOW\);/g, 'return items;');
    src = src.replace(/items\.slice\(0,\s*MAX_SHOW\)/g, 'items');
    src = src.replace(/slice\(0,\s*MAX_SHOW\)/g, 'slice(0)');
    src = src.replace(
      /if \(s === 'ot'\) return bookId > 0 && bookId < NT_MIN;\s*if \(s === 'nt'\) return bookId >= NT_MIN;\s*if \(s === 'book'\) return bookId === currentBookId\(\);\s*return true;/,
      "if (s === 'ot') return (bookId=Number(bookId)||0)>=10&&bookId<NT_MIN; if (s === 'nt') return (bookId=Number(bookId)||0)>=NT_MIN&&bookId<=730; if (s === 'book') return Number(bookId)===currentBookId(); bookId=Number(bookId)||0; return bookId>=10&&bookId<=730;"
    );
    src = src.replace(/mapPool\(files,\s*12,/g, 'mapPool(files, 20,');
    src = src.replace(/mapPool\(files,\s*14,/g, 'mapPool(files, 20,');
    src = src.replace(/checked % 20 === 0/g, 'checked % 35 === 0');
    src = src.replace(/, 450\)/g, ', 800)');
    src = src.replace(/, 1000\)/g, ', 800)');
    return src;
  }
  function load(i) {
    if (i >= CORE.length) return;
    fetch(CORE[i] + (CORE[i].indexOf('?') >= 0 ? '&' : '?') + 't=1')
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
