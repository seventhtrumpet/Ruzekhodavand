const IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,700,710,720,730];

module.exports = async function handler(req, res) {
  const id = Number((req.query && req.query.id) || 0);
  if (!IDS.includes(id)) {
    res.status(400).setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Invalid Bible book id');
  }

  // OPV is now hosted locally with the site. Redirect the legacy endpoint
  // to the static JSON pack instead of depending on an external eBible fetch.
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('Location', '/data/bible-fa/opv/b' + id + '.json');
  return res.status(307).end();
};
