const fs = require('fs');
const html = fs.readFileSync('bible.html', 'utf8');
const photo = fs.readFileSync('js/bible-share-photo.js', 'utf8');

if (html.includes('bible-textual-integrity-note') ||
    html.includes('یادداشت امانت‌داری متن') ||
    html.includes('Textual-integrity note:')) {
  throw new Error('Editorial integrity note must not be displayed inside the Bible reader.');
}

const logoScript = html.indexOf('js/logo_data.js');
const photoScript = html.indexOf('js/bible-share-photo.js');
if (logoScript < 0 || photoScript < 0 || logoScript > photoScript) {
  throw new Error('The profile-logo assembler must load before the Bible share-photo module.');
}

if (!photo.includes('waitForSiteLogo') || !photo.includes('window.ST_LOGO')) {
  throw new Error('Share-photo generation must wait for the assembled profile logo.');
}

console.log('Bible reader note removal and share profile-logo checks passed.');
