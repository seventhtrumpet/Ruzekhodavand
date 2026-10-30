(function(){
  function go(){
    var parts=window.ST_HERO_PARTS||[];
    if(parts.length<5) return;
    for(var i=0;i<5;i++) if(!parts[i]) return;
    try {
      window.ST_HERO_BG_URL="data:image/jpeg;base64,"+parts.join("");
      document.dispatchEvent(new Event("st-hero-ready"));
    } catch(e) { console.warn("hero bg", e); }
  }
  go(); setTimeout(go,50); setTimeout(go,200); setTimeout(go,600);
})();
