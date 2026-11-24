const fs = require('node:fs');
const assert = require('node:assert/strict');

const languageFix = fs.readFileSync('js/lang_fix.js', 'utf8');
const readerCore = fs.readFileSync('js/bible-core-pinned.js', 'utf8');
const biblePage = fs.readFileSync('bible.html', 'utf8');

assert.match(biblePage, /<script src="js\/lang_fix\.js"><\/script>/,
  'Bible reader must load the shared language handler');
assert.match(biblePage, /<script src="js\/bible\.js[^"]*"><\/script>/,
  'Bible reader must load its reader runtime');
assert.match(languageFix, /e\.preventDefault\(\);\s*\/\/[\s\S]*?toggle\(\);/,
  'Shared language handler must update the selected language');
assert.doesNotMatch(languageFix, /e\.stopImmediatePropagation\(\)/,
  'Shared handler must not suppress the reader language handler');
assert.match(readerCore, /document\.getElementById\('lang-toggle'\)\?\.addEventListener\('click',[\s\S]*?currentLang = currentLang === 'fa' \? 'en' : 'fa';[\s\S]*?await renderBook\(true\);/,
  'Reader must switch its internal language and rerender the Bible text');
console.log('PASS: Bible language toggle updates both interface and verse text.');
