const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const playlists = fs.readFileSync('js/playlists.js', 'utf8');
const media = fs.readFileSync('js/app_media.js', 'utf8');
const personal = fs.readFileSync('js/user_playlists.js', 'utf8');

const start = playlists.indexOf('function esc(str) {');
assert.notEqual(start, -1, 'playlist escaping helper must exist');
const end = playlists.indexOf('\n  }', start) + 4;
assert.ok(end > start, 'playlist escaping helper must end');
const esc = vm.runInNewContext('(' + playlists.slice(start, end) + ')');
assert.equal(esc(`"><img src=x onerror='alert(1)'>`), '&quot;&gt;&lt;img src=x onerror=&#39;alert(1)&#39;&gt;');

assert.ok(playlists.includes(`data-playlist-delete="' + esc(pl.id)`));
assert.ok(playlists.includes(`data-playlist-remove="1" data-playlist-id="' + esc(pl.id)`));
assert.ok(playlists.includes(`data-playlist-open="' + esc(pl.id)`));
assert.equal(playlists.includes('onclick="deletePlaylist('), false);
assert.equal(playlists.includes('onclick="removePostFromPlaylist('), false);
assert.equal(playlists.includes('onclick="openPlaylist('), false);
assert.ok(media.includes(`data-open-post="' + escapeHtml(p.id)`));
assert.equal(media.includes('onclick="openPost('), false);
assert.equal(media.includes('onclick="addPostToPlaylistFromModal('), false);
assert.ok(personal.includes('escape(pl.id)'));
assert.ok(personal.includes('escape(pid)'));

console.log('PASS: dynamic post and playlist IDs are escaped and not interpolated into inline handlers.');
