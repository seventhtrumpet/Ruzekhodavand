const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/app_media.js', 'utf8');
const match = source.match(/function safeLiveStreamUrl\(value\) \{[\s\S]*?\n\}/);
assert.ok(match, 'app_media.js must define safeLiveStreamUrl');

const context = { window: { location: { href: 'https://www.seventhtrumpet.org/media.html', origin: 'https://www.seventhtrumpet.org' } }, URL };
const safe = vm.runInNewContext('(' + match[0] + ')', context);

assert.equal(safe('https://www.youtube.com/embed/example'), 'https://www.youtube.com/embed/example');
assert.equal(safe('/live/embed'), 'https://www.seventhtrumpet.org/live/embed');
assert.equal(safe('javascript:alert(1)'), '');
assert.equal(safe('data:text/html,<script>alert(1)</script>'), '');
assert.equal(safe(''), '');
console.log('PASS: live iframe URLs allow HTTPS and same-origin paths, reject unsafe schemes.');
