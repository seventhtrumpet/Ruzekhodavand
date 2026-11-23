const OPV_FILES = [
'02-GENpesOPV.usfm','03-EXOpesOPV.usfm','04-LEVpesOPV.usfm','05-NUMpesOPV.usfm','06-DEUpesOPV.usfm','07-JOSpesOPV.usfm','08-JDGpesOPV.usfm','09-RUTpesOPV.usfm',
'10-1SApesOPV.usfm','11-2SApesOPV.usfm','12-1KIpesOPV.usfm','13-2KIpesOPV.usfm','14-1CHpesOPV.usfm','15-2CHpesOPV.usfm','16-EZRpesOPV.usfm','17-NEHpesOPV.usfm','18-ESTpesOPV.usfm','19-JOBpesOPV.usfm','20-PSApesOPV.usfm','21-PROpesOPV.usfm','22-ECCpesOPV.usfm','23-SNGpesOPV.usfm','24-ISApesOPV.usfm','25-JERpesOPV.usfm','26-LAMpesOPV.usfm','27-EZKpesOPV.usfm','28-DANpesOPV.usfm','29-HOSpesOPV.usfm','30-JOLpesOPV.usfm','31-AMOpesOPV.usfm','32-OBApesOPV.usfm','33-JONpesOPV.usfm','34-MICpesOPV.usfm','35-NAMpesOPV.usfm','36-HABpesOPV.usfm','37-ZEPpesOPV.usfm','38-HAGpesOPV.usfm','39-ZECpesOPV.usfm','40-MALpesOPV.usfm',
'70-MATpesOPV.usfm','71-MRKpesOPV.usfm','72-LUKpesOPV.usfm','73-JHNpesOPV.usfm','74-ACTpesOPV.usfm','75-ROMpesOPV.usfm','76-1COpesOPV.usfm','77-2COpesOPV.usfm','78-GALpesOPV.usfm','79-EPHpesOPV.usfm','80-PHPpesOPV.usfm','81-COLpesOPV.usfm','82-1THpesOPV.usfm','83-2THpesOPV.usfm','84-1TIpesOPV.usfm','85-2TIpesOPV.usfm','86-TITpesOPV.usfm','87-PHMpesOPV.usfm','88-HEBpesOPV.usfm','89-JASpesOPV.usfm','90-1PEpesOPV.usfm','91-2PEpesOPV.usfm','92-1JNpesOPV.usfm','93-2JNpesOPV.usfm','94-3JNpesOPV.usfm','95-JUDpesOPV.usfm','96-REVpesOPV.usfm'
];
module.exports = async function handler(req, res) {
  const id = Number((req.query && req.query.id) || 0);
  const IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];
  const index = IDS.indexOf(id);
  if (index < 0 || !OPV_FILES[index]) {
    res.status(400).setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Invalid Bible book id');
  }
  try {
    const upstream = await fetch('https://ebible.org/Scriptures/' + OPV_FILES[index]);
    if (!upstream.ok) throw new Error('Upstream returned ' + upstream.status);
    const usfm = await upstream.text();
    if (!/\\c\s+1/.test(usfm) || !/\\v\s+1/.test(usfm)) throw new Error('Invalid USFM response');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(usfm);
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(502).send('OPV source temporarily unavailable');
  }
};
