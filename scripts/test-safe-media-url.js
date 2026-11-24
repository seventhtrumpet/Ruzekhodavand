const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/app_media.js', 'utf8');
const match = source.match(/function safeMediaUrl\(value\) \{[\s\S]*?\n\}/);
assert.ok(match, 'app_media.js must define safeMediaUrl');

const context = {
  window: { location: { href: 'https://www.seventhtrumpet.org/media.html' } },
  URL
};
const safe = vm.runInNewContext('(' + match[0] + ')', context);

assert.equal(safe('https://cdn.example.org/video.mp4'), 'https://cdn.example.org/video.mp4');
assert.equal(safe('/uploads/video.mp4'), 'https://www.seventhtrumpet.org/uploads/video.mp4');
assert.equal(safe('http://cdn.example.org/audio.mp3'), 'http://cdn.example.org/audio.mp3');
assert.equal(safe('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
assert.equal(safe('data:application/pdf;base64,AAAA'), 'data:application/pdf;base64,AAAA');
assert.equal(safe('data:image/svg+xml;base64,PHN2Zz4='), '');
assert.equal(safe('data:text/html;base64,PHNjcmlwdD4='), '');
assert.equal(safe('javascript:alert(1)'), '');
assert.equal(safe('vbscript:msgbox(1)'), '');
assert.equal(safe('file:///etc/passwd'), '');
assert.equal(safe('https://user:pass@example.org/file'), '');
assert.equal(safe(''), '');

console.log('PASS: media URLs allow safe HTTP(S) and selected base64 media/PDF types only.');
