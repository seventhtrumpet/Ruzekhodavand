(function(){
  function go(){
    var parts=window.ST_VID_PARTS||[];
    if(parts.length<5) return;
    for(var i=0;i<5;i++) if(!parts[i]) return;
    var b64=parts.join('');
    try {
      var bin=atob(b64);
      var arr=new Uint8Array(bin.length);
      for(var j=0;j<bin.length;j++) arr[j]=bin.charCodeAt(j);
      var blob=new Blob([arr],{type:'video/mp4'});
      window.ST_INTRO_VIDEO_URL=URL.createObjectURL(blob);
      document.dispatchEvent(new Event('st-intro-ready'));
    } catch(e) { console.warn('intro video', e); }
  }
  go();
  setTimeout(go, 50);
  setTimeout(go, 200);
})();
