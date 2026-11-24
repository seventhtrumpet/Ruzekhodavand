#!/usr/bin/env node
"use strict";

// Exercise the real selected-verse reference helper without a browser.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("js/bible-share.js", "utf8");
const start = source.indexOf("  function selectedVerseReference(selected, bookName) {");
const end = source.indexOf("\n  function versePayload()", start);
assert.ok(start >= 0 && end > start, "selectedVerseReference helper must be present");
const helperSource = source.slice(start, end);
const selectedVerseReference = vm.runInNewContext(
  helperSource + "\nselectedVerseReference",
  {}
);

function verses(coords) {
  return coords.map(([chapter, verse]) => ({
    getAttribute(name) {
      if (name === "data-chapter") return String(chapter);
      if (name === "data-verse") return String(verse);
      return null;
    }
  }));
}

assert.equal(
  selectedVerseReference(verses([[3, 18], [3, 16], [3, 17]]), "John"),
  "John 3:16-18",
  "contiguous verses should collapse into one range"
);
assert.equal(
  selectedVerseReference(verses([[3, 16], [3, 18]]), "John"),
  "John 3:16, 3:18",
  "gaps must remain separate references"
);
assert.equal(
  selectedVerseReference(verses([[3, 16], [3, 17], [4, 1], [4, 2]]), "John"),
  "John 3:16-17, 4:1-2",
  "chapter boundaries must remain explicit"
);
assert.equal(
  selectedVerseReference(verses([[3, 16], [3, 16], [0, 2], [3, -1]]), "John"),
  "John 3:16",
  "duplicates and invalid coordinates must not create duplicate references"
);
assert.equal(
  selectedVerseReference(verses([[0, 0]]), "John"),
  "",
  "invalid-only selections must produce no reference"
);

console.log("PASS: selected Bible verse reference ranges (5 behavioral cases)");
