(function(){
  function go(){
    var parts=window.ST_VID_PARTS||[];
    if(parts.length<5) return;
    for(var i=0;i<5;i++) if(!parts[i]) return;
    try {
      var b64=parts.join('');
      var bin=atob(b64);
      var arr=new Uint8Array(bin.length);
      for(var j=0;j<bin.length;j++) arr[j]=bin.charCodeAt(j);
      window.ST_INTRO_VIDEO_URL=URL.createObjectURL(new Blob([arr],{type:'video/mp4'}));
      document.dispatchEvent(new Event('st-intro-ready'));
    } catch(e) { console.warn('intro video', e); }
  }
  go(); setTimeout(go,80); setTimeout(go,300); setTimeout(go,800);
})();
