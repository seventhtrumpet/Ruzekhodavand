/* Deep-merge FA packs at verse level so split chapters work */
(function () {
  var originalFetch = window.fetch.bind(window);
  var bookBuffers = {};
  window.fetch = function (url, opts) {
    var u = String(url);
    if (u.indexOf('/data/bible-fa/') === -1 || u.indexOf('manifest') !== -1 || u.indexOf('meta') !== -1) {
      return originalFetch(url, opts);
    }
    return originalFetch(url, opts).then(function (res) {
      if (!res.ok) return res;
      return res.clone().json().then(function (pack) {
        var ids = Object.keys(pack);
        if (!ids.length) return res;
        var id = ids[0];
        var data = pack[id];
        if (!data || !data.chapters) return res;
        if (!bookBuffers[id]) bookBuffers[id] = { chapters: {} };
        var chs = data.chapters;
        for (var ch in chs) {
          if (!bookBuffers[id].chapters[ch]) bookBuffers[id].chapters[ch] = {};
          var verses = chs[ch];
          for (var v in verses) bookBuffers[id].chapters[ch][v] = verses[v];
        }
        var body = {};
        body[id] = { chapters: bookBuffers[id].chapters };
        return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }).catch(function () { return res; });
    });
  };
})();
