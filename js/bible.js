/* Load known-good bible.js, fix actions bar id, enable multi-verse share */
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

    // Fix: old core used wrong id for the selection toolbar
    code = code.replace(/mb-sel-actions/g, 'mb-actions');

    // Inject single-chapter auto-discovery into loadFaBook
    code = code.replace(
      "const files = man[String(id)] || ['b' + id + '.json'];",
      "let files = (man[String(id)] || []).slice();" +
      "const __nCh = (typeof CHAPTER_COUNTS!=='undefined' && CHAPTER_COUNTS[id]) ? CHAPTER_COUNTS[id] : 1;" +
      "for (let __ch=1; __ch<=__nCh; __ch++) { const __fn='b'+id+'c'+__ch+'.json'; if (files.indexOf(__fn)===-1) files.push(__fn); }" +
      "if (!files.length) files = ['b' + id + '.json'];"
    );

    // After core boots, wire multi-verse share
    code += '\n;(function(){\n' +
      'function shareSelectedVerses(){\n' +
      '  var nodes = document.querySelectorAll(".mb-verse.selected");\n' +
      '  if (!nodes.length) { alert(document.documentElement.lang==="en"?"Select one or more verses first":"ابتدا یک یا چند آیه را انتخاب کنید"); return; }\n' +
      '  var lines = [], firstCh=null, firstV=null, lastV=null;\n' +
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
      '  function ok(){ var l=document.getElementById("mb-sel-label"); if(l){l.textContent=document.documentElement.lang==="en"?"Link ready":"لینک آماده شد";} }\n' +
      '  if(navigator.share){ navigator.share({title:"Bible",text:body,url:url}).then(ok).catch(function(){ if(navigator.clipboard) navigator.clipboard.writeText(body).then(ok); }); }\n' +
      '  else if(navigator.clipboard){ navigator.clipboard.writeText(body).then(ok); }\n' +
      '  else { var ta=document.createElement("textarea"); ta.value=body; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(e){} ta.remove(); ok(); }\n' +
      '}\n' +
      'window.shareSelected=shareSelectedVerses;\n' +
      'function bindShare(){ var btn=document.getElementById("mb-share"); if(!btn||btn._bound) return; btn._bound=true; btn.addEventListener("click", shareSelectedVerses); }\n' +
      'bindShare();\n' +
      'var obs=new MutationObserver(bindShare); if(document.body) obs.observe(document.body,{childList:true,subtree:true});\n' +
      '})();\n';

    (0, eval)(code);
  } catch (e) {
    console.error(e);
    var el = document.getElementById('bible-reader') || document.getElementById('mb-reader') || document.body;
    if (el) el.insertAdjacentHTML('afterbegin', '<p style="color:#c00;padding:1rem">Bible failed to load. Refresh the page.</p>');
  }
})();
