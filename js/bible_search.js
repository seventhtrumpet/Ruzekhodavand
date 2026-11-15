/* Bible search restore: All 66 books, full match count (e.g. David) */
(function () {
  if (window.__mbSearchBooted) return;
  var CORE = [
    'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@bb93c5e6585ef3a2a6927425a8ac8bb92e9cb6ce/js/bible_search.js',
    'https://raw.githack.com/seventhtrumpet/Ruzekhodavand/bb93c5e6585ef3a2a6927425a8ac8bb92e9cb6ce/js/bible_search.js'
  ];
  function patch(src) {
    src = src.replace(/var MAX_SHOW = \d+/g, 'var MAX_SHOW = 500');
    src = src.replace(/return items\.slice\(0,\s*MAX_SHOW\);/g, 'return items;');
    src = src.replace(
      /if \(s === 'ot'\) return bookId > 0 && bookId < NT_MIN;\s*if \(s === 'nt'\) return bookId >= NT_MIN;\s*if \(s === 'book'\) return bookId === currentBookId\(\);\s*return true;/,
      "if (s === 'ot') return (bookId = Number(bookId)||0) >= 10 && bookId < NT_MIN; if (s === 'nt') return (bookId = Number(bookId)||0) >= NT_MIN && bookId <= 730; if (s === 'book') return Number(bookId) === currentBookId(); bookId = Number(bookId)||0; return bookId >= 10 && bookId <= 730;"
    );
    src = src.replace(
      /renderItems\(items, msg\);/,
      'renderItems(items.slice(0, MAX_SHOW), (items.length > MAX_SHOW ? (items.length + " found, showing " + MAX_SHOW + " \u00b7 ") : "") + msg);'
    );
    src = src.replace(/, 450\)/g, ', 1000)');
    return src;
  }
  function load(i) {
    if (i >= CORE.length) return;
    fetch(CORE[i])
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (src) {
        try { (0, eval)(patch(src)); }
        catch (e) {
          console.warn('search patch error', e);
          try { (0, eval)(src); } catch (e2) {}
        }
      })
      .catch(function () { load(i + 1); });
  }
  load(0);
})();
