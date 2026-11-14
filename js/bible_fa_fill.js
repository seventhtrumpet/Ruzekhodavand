/* Fill missing Persian books from Open Persian Contemporary Bible (Biblica, CC BY-SA 4.0) */
(function () {
  var OPCB_URLS = [
    'https://cdn.jsdelivr.net/gh/thiagobodruk/bible/json/fa_opcb.json',
    'https://fastly.jsdelivr.net/gh/thiagobodruk/bible@master/json/fa_opcb.json',
    'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/fa_opcb.json'
  ];
  var IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];
  var opcbPromise = null;
  var converted = {};
  var origFetch = window.fetch.bind(window);

  function loadOpcb() {
    if (!opcbPromise) {
      opcbPromise = (async function () {
        for (var i = 0; i < OPCB_URLS.length; i++) {
          try {
            var r = await origFetch(OPCB_URLS[i]);
            if (r.ok) return await r.json();
          } catch (e) {}
        }
        console.warn('Persian OPCB fallback unavailable');
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
    payload[String(bookId)] = { name: book.name || '', chapters: chapters };
    return payload;
  }

  function bookIdFromUrl(url) {
    var m = String(url).match(/\/data\/bible-fa\/b(\d+)(?:c\d+)?(?:p\d+)?\.json/);
    return m ? Number(m[1]) : null;
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
      return p.then(function (res) {
        if (!res.ok) {
          var man = {};
          IDS.forEach(function (id) { man[String(id)] = ['b' + id + '.json']; });
          window.__bibleManifest = man;
          return new Response(JSON.stringify(man), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return res.json().then(function (man) {
          man = man && typeof man === 'object' ? man : {};
          IDS.forEach(function (id) {
            var k = String(id);
            if (!man[k] || !man[k].length) man[k] = ['b' + id + '.json'];
          });
          window.__bibleManifest = man;
          return new Response(JSON.stringify(man), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }).catch(function () { return res; });
      });
    }

    if (url.indexOf('/data/bible-fa/') >= 0 && url.indexOf('manifest') < 0 && url.indexOf('meta') < 0) {
      return p.then(function (res) {
        var id = bookIdFromUrl(url);
        if (!id) return res;

        if (!res || !res.ok) {
          return opcbResponse(id).then(function (r) { return r || res; });
        }

        return res.clone().text().then(function (txt) {
          var t = (txt || '').trim();
          if (!t || t === 'PLACEHOLDER' || t === '{}') {
            return opcbResponse(id).then(function (r) { return r || res; });
          }
          try {
            var parsed = JSON.parse(t);
            if (!parsed || typeof parsed !== 'object') {
              return opcbResponse(id).then(function (r) { return r || res; });
            }
            var data = parsed[String(id)] || parsed[id];
            if (!data || !data.chapters || !Object.keys(data.chapters).length) {
              return opcbResponse(id).then(function (r) { return r || res; });
            }
          } catch (e) {
            return opcbResponse(id).then(function (r) { return r || res; });
          }
          return res;
        });
      });
    }

    return p;
  };

  setTimeout(function () { loadOpcb(); }, 1500);
})();
