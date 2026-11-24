const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const playlists = fs.readFileSync('js/playlists.js', 'utf8');
const media = fs.readFileSync('js/app_media.js', 'utf8');
const personal = fs.readFileSync('js/user_playlists.js', 'utf8');

const match = playlists.match(/function esc\(str\) \{[\s\S]*?\n  \}/);
assert.ok(match, 'playlist escaping helper must exist');
const esc = vm.runInNewContext('(' + match[0] + ')');
assert.equal(
  esc(`"><img src=x onerror='alert(1)'>`),
  '&quot;&gt;&lt;img src=x onerror=&#39;alert(1)&#39;&gt;'
);

assert.match(playlists, /data-playlist-delete="[^"]*" \+ esc\(pl\.id\)/);
assert.match(playlists, /data-playlist-remove="1" data-playlist-id="[^"]*" \+ esc\(pl\.id\)/);
assert.match(playlists, /data-playlist-open="[^"]*" \+ esc\(pl\.id\)/);
assert.doesNotMatch(playlists, /onclick="[^"]*(?:pl|pid|p)\.id/);
assert.match(media, /data-open-post="[^"]*" \+ escapeHtml\(p\.id\)/);
assert.doesNotMatch(media, /onclick="openPost\(/);
assert.doesNotMatch(media, /onclick="addPostToPlaylistFromModal\(/);
assert.match(personal, /escape\(pl\.id\)/);
assert.match(personal, /escape\(pid\)/);

console.log('PASS: dynamic post and playlist IDs are escaped and not interpolated into inline handlers.');
