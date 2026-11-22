/* Complete Persian Bible (66 books) from Open Persian Contemporary Bible — fills gaps */
(function () {
  if (window.__faFillInit) return;
  window.__faFillInit = true;

  var OPCB_URLS = [
    'https://cdn.jsdelivr.net/gh/thiagobodruk/bible/json/fa_opcb.json',
    'https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/fa_opcb.json',
    'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/fa_opcb.json'
  ];
  var IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];
  var CH_COUNT = {
    10:50,20:40,30:27,40:36,50:34,60:24,70:21,80:4,90:31,100:24,110:22,120:25,130:29,140:36,150:10,160:13,190:10,
    220:42,230:150,240:31,250:12,260:8,290:66,300:52,310:5,330:48,340:12,350:14,360:3,370:9,380:1,390:4,400:7,410:3,420:3,430:2,440:14,450:4,460:4,
    470:28,480:16,490:24,500:21,510:28,520:16,530:16,540:13,550:6,560:6,570:4,580:4,590:5,600:3,610:6,620:4,630:3,640:1,650:13,660:5,670:5,680:3,690:5,700:1,710:1,720:1,730:22
  };

  var opcbPromise = null;
  var converted = {};
  var origFetch = window.fetch.bind(window);

  function loadOpcb() {
    if (!opcbPromise) {
      opcbPromise = (async function () {
        for (var i = 0; i < OPCB_URLS.length; i++) {
          try {
            var r = await origFetch(OPCB_URLS[i]);
            if (r.ok) {
              var list = await r.json();
              if (Array.isArray(list) && list.length >= 66) return list;
            }
          } catch (e) {}
        }
        console.warn('Persian OPCB unavailable');
        opcbPromise = null;
        return null;
      })();
    }
    return opcbPromise;
  }

  function convertBook(list, index, bookId) {
    if (!list || !list[index]) return null;
    var book = list[index];
    var chapters = {};
    (book.chapters || []).forEach(function (verses, ci) {
      var ch = {};
      (verses || []).forEach(function (t, vi) {
        ch[String(vi + 1)] = typeof t === 'string' ? t : String(t || '');
      });
      chapters[String(ci + 1)] = ch;
    });
    var payload = {};
    payload[String(bookId)] = {
      id: bookId,
      name: book.name || '',
      chapters: chapters
    };
    return payload;
  }

  function bookIdFromUrl(url) {
    var m = String(url).match(/\/data\/bible-fa\/(?:b)?(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function chapterCount(pack, id) {
    if (!pack || typeof pack !== 'object') return 0;
    var data = pack[String(id)] || pack[id] || pack;
    var chapters = (data && data.chapters) ? data.chapters : null;
    if (!chapters || typeof chapters !== 'object') return 0;
    return Object.keys(chapters).filter(function (k) { return /^\d+$/.test(k); }).length;
  }

  function isIncomplete(pack, id) {
    var have = chapterCount(pack, id);
    if (have <= 0) return true;
    var need = CH_COUNT[id];
    if (need && have < need) return true;
    return false;
  }

  function fullManifest() {
    var man = {};
    IDS.forEach(function (id) {
      man[String(id)] = ['b' + id + '.json'];
    });
    return man;
  }

  function opcbResponse(id) {
    return loadOpcb().then(function (list) {
      if (!list) return null;
      var index = IDS.indexOf(id);
      if (index < 0) return null;
      if (!converted[id]) converted[id] = convertBook(list, index, id);
      if (!converted[id]) return null;
      return new Response(JSON.stringify(converted[id]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var p = origFetch(input, init);

    if (url.indexOf('/data/bible-fa/manifest.json') >= 0) {
      return p.then(function () {
        var man = fullManifest();
        window.__bibleManifest = man;
        return new Response(JSON.stringify(man), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }).catch(function () {
        var man = fullManifest();
        window.__bibleManifest = man;
        return new Response(JSON.stringify(man), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      });
    }

    if (url.indexOf('/data/bible-fa/') >= 0 && url.indexOf('manifest') < 0 && url.indexOf('meta') < 0) {
      var id = bookIdFromUrl(url);
      if (!id) return p;

      return p.then(function (res) {
        function useOpcb() {
          return opcbResponse(id).then(function (r) { return r || res; });
        }
        if (!res || !res.ok) return useOpcb();
        return res.clone().text().then(function (txt) {
          var t = (txt || '').trim();
          if (!t || t === 'PLACEHOLDER' || t === '{}') return useOpcb();
          try {
            var parsed = JSON.parse(t);
            if (isIncomplete(parsed, id)) return useOpcb();
            return res;
          } catch (e) {
            return useOpcb();
          }
        });
      }).catch(function () {
        return opcbResponse(id).then(function (r) {
          return r || new Response('{}', { status: 404 });
        });
      });
    }

    return p;
  };

  setTimeout(function () { loadOpcb(); }, 800);
  setTimeout(function () { loadOpcb(); }, 2500);
})();
