const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const mediaSource = fs.readFileSync('js/app_media.js', 'utf8');
const runtimeSource = fs.readFileSync('js/bugfixes.js', 'utf8');
const mediaMatch = mediaSource.match(/function escapeHtml\\(str\\) \\{[\\s\\S]*?\\n\\}/);
const runtimeMatch = runtimeSource.match(/window\\.escapeHtml = function \\(str\\) \\{[\\s\\S]*?\\n  \\};/);

assert.ok(mediaMatch, 'app_media.js must define escapeHtml');
assert.ok(runtimeMatch, 'bugfixes.js must define window.escapeHtml');

const mediaEscape = vm.runInNewContext('(' + mediaMatch[0] + ')');
const runtimeEscape = vm.runInNewContext('(function () { var window = {}; ' + runtimeMatch[0] + '; return window.escapeHtml; })()');
const input = '<img src=x onerror="alert(1)"> & \'';
const expected = '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;';

assert.equal(mediaEscape(input), expected, 'media helper must escape HTML metacharacters');
assert.equal(runtimeEscape(input), expected, 'runtime helper must escape HTML metacharacters');
assert.equal(mediaEscape(null), '', 'null values must become empty strings');
assert.equal(runtimeEscape(undefined), '', 'undefined values must become empty strings');
console.log('PASS: both HTML escaping helpers safely encode text and quoted attributes.');
