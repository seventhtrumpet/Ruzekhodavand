const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/media_rotator.js', 'utf8');
const ytMatch = source.match(/function ytId\(url\) \{[\s\S]*?\n  \}/);
const isMatch = source.match(/function isYouTube\(url\) \{[\s\S]*?\n  \}/);
assert.ok(ytMatch, 'media rotator must define ytId');
assert.ok(isMatch, 'media rotator must define isYouTube');
const api = vm.runInNewContext('(function () {' + ytMatch[0] + isMatch[0] + '; return { ytId, isYouTube }; })()', { URL });
const id = 'a1B2c3D4e5F';

assert.equal(api.ytId('https://youtu.be/' + id), id);
assert.equal(api.ytId('https://www.youtube.com/watch?v=' + id), id);
assert.equal(api.ytId('https://m.youtube.com/shorts/' + id), id);
assert.equal(api.ytId('https://www.youtube-nocookie.com/embed/' + id), id);
assert.equal(api.ytId('https://youtube.com.evil.example/watch?v=' + id), null);
assert.equal(api.ytId('https://youtu.be.evil.example/' + id), null);
assert.equal(api.ytId('https://evil.example/?v=' + id), null);
assert.equal(api.ytId('https://youtube.com/watch?v=' + id + '\"><img src=x>'), null);
assert.equal(api.ytId('javascript:alert(1)'), null);
assert.equal(api.isYouTube('https://evil.example/?v=' + id), false);
assert.equal(api.isYouTube('https://youtu.be/' + id), true);

console.log('PASS: homepage media rotator only recognizes exact YouTube hosts and valid IDs.');
