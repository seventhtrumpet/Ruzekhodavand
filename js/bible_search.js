/* Persian+English Bible search — works with full FA books from bible_fa_fill */
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
    src = src.replace(/mapPool\(files,\s*\d+,/g, 'mapPool(files, 10,');
    src = src.replace(/checked % 20 === 0/g, 'checked % 8 === 0');
    src = src.replace(/, 450\)/g, ', 700)');
    src = src.replace(
      'if (!bookIds.length) bookIds = meta.map(function (b) { return String(b.id); });',
      "if (!bookIds.length) bookIds = meta.map(function (b) { return String(b.id); });" +
      "if (!bookIds.length) bookIds = ['10','20','30','40','50','60','70','80','90','100','110','120','130','140','150','160','190','220','230','240','250','260','290','300','310','330','340','350','360','370','380','390','400','410','420','430','440','450','460','470','480','490','500','510','520','530','540','550','560','570','580','590','600','610','620','630','640','650','660','670','680','690','700','710','720','730'];" +
      "bookIds.forEach(function(id){ if(!man[id]||!man[id].length) man[id]=['b'+id+'.json']; });"
    );
    return src;
  }

  function load(i) {
    if (i >= CORE.length) return;
    fetch(CORE[i] + '?t=faok1')
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
