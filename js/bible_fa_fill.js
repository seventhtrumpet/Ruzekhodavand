/* Complete Persian Bible — keep OPCB and OPV separate; never mix legacy NMV fragments into OPCB. */
(function () {
  if (window.__faFillInit) return;
  window.__faFillInit = true;

  var OPCB_MANIFEST_URL = '/data/bible-fa/opcb/manifest.json';

  var IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];

  var CH_COUNT = {
    10:50,20:40,30:27,40:36,50:34,60:24,70:21,80:4,90:31,100:24,110:22,120:25,130:29,140:36,150:10,160:13,190:10,
    220:42,230:150,240:31,250:12,260:8,290:66,300:52,310:5,330:48,340:12,350:14,360:3,370:9,380:1,390:4,400:7,410:3,420:3,430:3,440:2,450:14,460:4,
    470:28,480:16,490:24,500:21,510:28,520:16,530:16,540:13,550:6,560:6,570:4,580:4,590:5,600:3,610:6,620:4,630:3,640:1,650:13,660:5,670:5,680:3,690:5,700:1,710:1,720:1,730:22
  };

  var OPV_FILES = [
    '02-GENpesOPV.usfm','03-EXOpesOPV.usfm','04-LEVpesOPV.usfm','05-NUMpesOPV.usfm','06-DEUpesOPV.usfm','07-JOSpesOPV.usfm','08-JDGpesOPV.usfm','09-RUTpesOPV.usfm',
    '10-1SApesOPV.usfm','11-2SApesOPV.usfm','12-1KIpesOPV.usfm','13-2KIpesOPV.usfm','14-1CHpesOPV.usfm','15-2CHpesOPV.usfm','16-EZRpesOPV.usfm','17-NEHpesOPV.usfm','18-ESTpesOPV.usfm','19-JOBpesOPV.usfm','20-PSApesOPV.usfm','21-PROpesOPV.usfm','22-ECCpesOPV.usfm','23-SNGpesOPV.usfm','24-ISApesOPV.usfm','25-JERpesOPV.usfm','26-LAMpesOPV.usfm','27-EZKpesOPV.usfm','28-DANpesOPV.usfm','29-HOSpesOPV.usfm','30-JOLpesOPV.usfm','31-AMOpesOPV.usfm','32-OBApesOPV.usfm','33-JONpesOPV.usfm','34-MICpesOPV.usfm','35-NAMpesOPV.usfm','36-HABpesOPV.usfm','37-ZEPpesOPV.usfm','38-HAGpesOPV.usfm','39-ZECpesOPV.usfm','40-MALpesOPV.usfm',
    '70-MATpesOPV.usfm','71-MRKpesOPV.usfm','72-LUKpesOPV.usfm','73-JHNpesOPV.usfm','74-ACTpesOPV.usfm','75-ROMpesOPV.usfm','76-1COpesOPV.usfm','77-2COpesOPV.usfm','78-GALpesOPV.usfm','79-EPHpesOPV.usfm','80-PHPpesOPV.usfm','81-COLpesOPV.usfm','82-1THpesOPV.usfm','83-2THpesOPV.usfm','84-1TIpesOPV.usfm','85-2TIpesOPV.usfm','86-TITpesOPV.usfm','87-PHMpesOPV.usfm','88-HEBpesOPV.usfm','89-JASpesOPV.usfm','90-1PEpesOPV.usfm','91-2PEpesOPV.usfm','92-1JNpesOPV.usfm','93-2JNpesOPV.usfm','94-3JNpesOPV.usfm','95-JUDpesOPV.usfm','96-REVpesOPV.usfm'
  ];

  var opcbPromise = null;
  var converted = {};
  var origFetch = window.fetch.bind(window);

  function loadOpcb() {
    if (!opcbPromise) {
      opcbPromise = origFetch(OPCB_MANIFEST_URL).then(function (response) {
        if (!response.ok) throw new Error('Local OPCB manifest unavailable: ' + response.status);
        return response.json();
      }).then(function (manifest) {
        var valid = manifest && IDS.every(function (id) {
          return typeof manifest[String(id)] === 'string' && manifest[String(id)] === 'b' + id + '.json';
        });
        if (!valid) throw new Error('Local OPCB manifest is incomplete');
        return manifest;
      }).catch(function (error) {
        opcbPromise = null;
        console.error('[bible] Local OPCB manifest failed', error);
        return null;
      });
    }
    return opcbPromise;
  }

  function opcbBookPayload(id) {
    id = Number(id);
    if (!converted[id]) {
      converted[id] = loadOpcb().then(function (manifest) {
        if (!manifest || IDS.indexOf(id) < 0 || !manifest[String(id)]) return null;
        return origFetch('/data/bible-fa/opcb/' + manifest[String(id)]).then(function (response) {
          if (!response.ok) throw new Error('Local OPCB book unavailable: ' + response.status);
          return response.json();
        }).then(function (parsed) {
          var data = parsed && (parsed[String(id)] || parsed[id] || parsed);
          var chapters = data && data.chapters;
          var expected = CH_COUNT[id] || 0;
          if (!chapters || Object.keys(chapters).length !== expected) {
            throw new Error('Local OPCB chapter count mismatch for book ' + id);
          }
          return parsed;
        }).catch(function (error) {
          delete converted[id];
          console.error('[bible] Local OPCB book failed', id, error);
          return null;
        });
      });
    }
    return converted[id];
  }

  function jsonResponse(obj) {
    return new Response(JSON.stringify(obj), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var opvCache = {};
  var OPV_BASE = '/data/bible-fa/opv/b';
  function cleanUsfmText(value) {
    return String(value || '')
      .replace(/\\f[\s\S]*?\\f\*/g, ' ')
      .replace(/\\x[\s\S]*?\\x\*/g, ' ')
      .replace(/\\[a-zA-Z0-9]+\*?/g, ' ')
      .replace(/\\\\/g, '\\')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function parseOpvUsfm(source, id) {
    var chapters = {}, currentChapter = null, currentVerse = null;
    String(source || '').split(/\r?\n/).forEach(function(line) {
      var c = line.match(/^\s*\\c\s+(\d+)/);
      if (c) { currentChapter = c[1]; chapters[currentChapter] = chapters[currentChapter] || {}; currentVerse = null; return; }
      var v = line.match(/^\s*\\v\s+([0-9]+[a-z]?(?:-[0-9]+[a-z]?)?)\s*(.*)$/i);
      if (v && currentChapter) {
        var start = Number((v[1].match(/^\d+/) || [])[0]);
        if (!start) return;
        currentVerse = String(start);
        chapters[currentChapter][currentVerse] = cleanUsfmText(v[2]);
        return;
      }
      if (currentChapter && currentVerse && line.trim() && !/^\s*\\/.test(line)) {
        var extra = cleanUsfmText(line);
        if (extra) chapters[currentChapter][currentVerse] = (chapters[currentChapter][currentVerse] + ' ' + extra).trim();
      }
    });
    var h = String(source || '').match(/^\\h\s+(.+)$/m);
    var payload = {};
    payload[String(id)] = { id:id, name:h ? cleanUsfmText(h[1]) : '', chapters:chapters };
    return payload;
  }
  function opvBookPayload(id) {
    if (opvCache[id]) return opvCache[id];
    var index = IDS.indexOf(Number(id));
    if (index < 0 || !OPV_FILES[index]) return Promise.resolve(null);
    opvCache[id] = origFetch(OPV_BASE + encodeURIComponent(id) + '.json').then(function(res) {
      if (!res.ok) throw new Error('OPV book file unavailable: ' + res.status);
      return res.json();
    }).then(function(parsed) {
      var book = parsed && (parsed[String(id)] || parsed[id] || parsed);
      if (!book || !book.chapters || !Object.keys(book.chapters).length) {
        throw new Error('OPV JSON has no readable chapters');
      }
      return parsed;
    }).catch(function(error) {
      delete opvCache[id];
      console.error('[bible] OPV load failed', id, error);
      return null;
    });
    return opvCache[id];
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var isOpv = false;
    try { isOpv = localStorage.getItem('cog_bible_fa_version') === 'opv'; } catch (e) {}

    if (isOpv && url.indexOf('/data/bible-fa/manifest.json') >= 0) {
      return Promise.resolve(jsonResponse(fullManifest()));
    }
    if (isOpv && url.indexOf('/data/bible-fa/') >= 0 &&
        url.indexOf('manifest') < 0 && url.indexOf('meta.json') < 0 &&
        url.indexOf('pack.json') < 0) {
      var opvId = bookIdFromUrl(url);
      if (opvId && IDS.indexOf(opvId) >= 0) {
        return opvBookPayload(opvId).then(function(data) {
          return data ? jsonResponse(data) : jsonResponse({});
        });
      }
    }

    if (url.indexOf('/data/bible-fa/manifest.json') >= 0) {
      return Promise.resolve(jsonResponse(fullManifest())).then(function (res) {
        window.__bibleManifest = fullManifest();
        return res;
      });
    }

    if (url.indexOf('/data/bible-fa/') >= 0 &&
        url.indexOf('manifest') < 0 &&
        url.indexOf('meta.json') < 0 &&
        url.indexOf('pack.json') < 0) {
      var id = bookIdFromUrl(url);
      if (id && IDS.indexOf(id) >= 0) {
        // Always return the selected OPCB text as one consistent translation.
        // Legacy local fragments contain NMV material and must never be merged into OPCB.
        return opcbBookPayload(id).then(function (opcb) {
          return opcb ? jsonResponse(opcb) : jsonResponse({});
        }).catch(function () {
          return jsonResponse({});
        });
      }
    }

    return origFetch(input, init);
  };

  function preloadSelectedPersianVersion() {
    try {
      if (localStorage.getItem('cog_bible_fa_version') === 'opv') return;
    } catch (e) {}
    loadOpcb();
  }

  // OPV is served from the local, per-book files; do not download OPCB in the background.
  setTimeout(preloadSelectedPersianVersion, 400);
  setTimeout(preloadSelectedPersianVersion, 2000);

  window.__stPersianBibleReady = function () {
    var isOpv = false;
    try { isOpv = localStorage.getItem('cog_bible_fa_version') === 'opv'; } catch (e) {}
    if (isOpv) return Promise.resolve(true);
    return loadOpcb().then(function (list) {
      return !!(list && list.length >= 66);
    });
  };
})();
