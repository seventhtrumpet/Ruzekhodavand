const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/app_media.js', 'utf8');
const match = source.match(/function getYouTubeEmbedUrl\(url\) \{[\s\S]*?\n\}/);
assert.ok(match, 'app_media.js must define getYouTubeEmbedUrl');

const getEmbed = vm.runInNewContext('(' + match[0] + ')', { URL });
const id = 'a1B2c3D4e5F';
const expected = 'https://www.youtube.com/embed/' + id;

assert.equal(getEmbed('https://youtu.be/' + id), expected);
assert.equal(getEmbed('https://www.youtube.com/watch?v=' + id), expected);
assert.equal(getEmbed('https://m.youtube.com/shorts/' + id), expected);
assert.equal(getEmbed('https://www.youtube-nocookie.com/embed/' + id), expected);
assert.equal(getEmbed('https://youtube.com.evil.example/watch?v=' + id), null);
assert.equal(getEmbed('https://notyoutube.com/watch?v=' + id), null);
assert.equal(getEmbed('https://youtube.com/watch?v=' + id + '\"><img src=x onerror=alert(1)>'), null);
assert.equal(getEmbed('https://youtube.com/embed/short'), null);
assert.equal(getEmbed('javascript:alert(1)'), null);
assert.equal(getEmbed(''), null);

console.log('PASS: YouTube embed URLs require an exact trusted host and valid video ID.');
