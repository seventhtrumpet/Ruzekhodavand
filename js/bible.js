/* loader shim - real code in bible_part_*.b64 via bible_loader.js */
(async function(){
  try {
    const parts=[];
    for(let i=0;i<3;i++){
      const r=await fetch('/js/bible_part_'+i+'.b64');
      if(!r.ok) throw new Error('part '+i);
      parts.push(await r.text());
    }
    const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
    const code=new TextDecoder().decode(bin);
    (0,eval)(code);
  } catch(e) {
    console.error('bible load failed', e);
    document.body && (document.body.innerHTML += '<p style="color:red;padding:1rem">Bible script failed to load. Please refresh.</p>');
  }
})();
