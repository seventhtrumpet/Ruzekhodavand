(function(){
  function go(){
    var p=window.ST_HERO_PARTS||[];
    if(p.length<7)return;
    for(var i=0;i<7;i++)if(!p[i])return;
    window.ST_HERO_BG_URL="data:image/jpeg;base64,"+p.join("");
    document.dispatchEvent(new Event("st-hero-ready"));
  }
  go();setTimeout(go,50);setTimeout(go,300);setTimeout(go,700);
})();
