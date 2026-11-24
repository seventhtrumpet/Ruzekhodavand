const fs = require('node:fs');
const assert = require('node:assert/strict');

const html = fs.readFileSync('bible.html', 'utf8');
const viewport = html.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i);
assert.ok(viewport, 'Bible reader must declare a viewport');
assert.ok(!/(?:^|,)\s*maximum-scale\s*=\s*1(?:\s*,|$)/i.test(viewport[1]), 'Bible reader must not cap zoom at 1');
assert.ok(!/(?:^|,)\s*user-scalable\s*=\s*no(?:\s*,|$)/i.test(viewport[1]), 'Bible reader must not disable user zoom');
console.log('PASS: Bible reader preserves browser zoom accessibility.');
