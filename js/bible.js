/* Load known-good bible.js, fix actions bar id, enable multi-verse share, language labels */
(async function () {
  try {
    var urls = [
      'https://cdn.jsdelivr.net/gh/seventhtrumpet/Ruzekhodavand@5b705c41b170e9bf44d18bc046ce2ddfe7547f5d/js/bible.js',
      'https://raw.githubusercontent.com/seventhtrumpet/Ruzekhodavand/5b705c41b170e9bf44d18bc046ce2ddfe7547f5d/js/bible.js'
    ];
    var code = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i]);
        if (r.ok) { code = await r.text(); break; }
      } catch (e) {}
    }
    if (!code) throw new Error('Could not load bible core');

    code = code.replace(/mb-sel-actions/g, 'mb-actions');

    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );

    code += '\n;(function(){\n' +
      'function isEn(){ try{ return (localStorage.getItem("cog_lang")||document.documentElement.lang||"fa")==="en"; }catch(e){ return document.documentElement.lang==="en"; } }\n' +
      'function applyShareLabels(){\n' +
      '  var en=isEn();\n' +
      '  var s=document.getElementById("mb-share"); if(s) s.textContent=en?"Share":"\u0627\u0634\u062a\u0631\u0627\u06a9";\n' +
      '  var c=document.getElementById("mb-copy"); if(c) c.textContent=en?"Copy":"\u06a9\u067e\u06cc";\n' +
      '  var x=document.getElementById("mb-clear"); if(x) x.textContent=en?"Clear":"\u067e\u0627\u06a9";\n' +
      '}\n' +
      'function shareSelectedVerses(){\n' +
      '  var nodes=document.querySelectorAll(".mb-verse.selected");\n' +
      '  if(!nodes.length){ alert(isEn()?"Select one or more verses first":"\u0627\u0628\u062a\u062f\u0627 \u06cc\u06a9 \u06cc\u0627 \u0686\u0646\u062f \u0622\u06cc\u0647 \u0631\u0627 \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f"); return; }\n' +
      '  var lines=[], firstCh=null, firstV=null, lastV=null;\n' +
      '  nodes.forEach(function(el){\n' +
      '    var ch=el.getAttribute("data-chapter"), vs=el.getAttribute("data-verse");\n' +
      '    if(firstCh==null){firstCh=ch;firstV=vs;} lastV=vs;\n' +
      '    var t=(el.textContent||"").replace(/^\\d+\\s*/,"").trim();\n' +
      '    lines.push(ch+":"+vs+" — "+t);\n' +
      '  });\n' +
      '  var state={}; try{state=JSON.parse(localStorage.getItem("cog_bible_state")||"{}");}catch(e){}\n' +
      '  var bookId=state.bookId||"";\n' +
      '  var base=(location.origin||"https://seventhtrumpet.org")+"/bible.html";\n' +
      '  var vParam=firstV+(lastV&&lastV!==firstV?("-"+lastV):"");\n' +
      '  var url=base+"?b="+bookId+"&c="+firstCh+"&v="+vParam;\n' +
      '  var body=lines.join("\\n")+"\\n\\n"+url;\n' +
      '  function ok(){ var l=document.getElementById("mb-sel-label"); if(l){l.textContent=isEn()?"Link ready":"\u0644\u06cc\u0646\u06a9 \u0622\u0645\u0627\u062f\u0647 \u0634\u062f";} }\n' +
      '  if(navigator.share){ navigator.share({title:"Bible",text:body,url:url}).then(ok).catch(function(){ if(navigator.clipboard) navigator.clipboard.writeText(body).then(ok); }); }\n' +
      '  else if(navigator.clipboard){ navigator.clipboard.writeText(body).then(ok); }\n' +
      '  else { var ta=document.createElement("textarea"); ta.value=body; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(e){} ta.remove(); ok(); }\n' +
      '}\n' +
      'window.shareSelected=shareSelectedVerses;\n' +
      'function bindShare(){ var btn=document.getElementById("mb-share"); if(!btn) return; applyShareLabels(); if(btn._bound) return; btn._bound=true; btn.addEventListener("click", shareSelectedVerses); }\n' +
      'bindShare(); applyShareLabels();\n' +
      'var obs=new MutationObserver(function(){ bindShare(); applyShareLabels(); }); if(document.body) obs.observe(document.body,{childList:true,subtree:true});\n' +
      'document.getElementById("lang-toggle")&&document.getElementById("lang-toggle").addEventListener("click", function(){ setTimeout(applyShareLabels, 80); setTimeout(applyShareLabels, 350); });\n' +
      'window.addEventListener("cog-lang-changed", applyShareLabels);\n' +
      '})();\n';

    (0, eval)(code);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('bible-reader') || document.getElementById('mb-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Refresh the page.</p>');
  }
})();
