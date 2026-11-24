#!/usr/bin/env python3
"""Inspect the complete official WEB Classic VPL book coverage without changing data."""
from __future__ import annotations
import hashlib
import re
import urllib.request
import zipfile
from collections import OrderedDict
from io import BytesIO

URL = "https://ebible.org/Scriptures/eng-web_vpl.zip"
req = urllib.request.Request(URL, headers={"User-Agent": "SeventhTrumpet-WEB-VPL-Audit/1.0"})
with urllib.request.urlopen(req, timeout=120) as response:
    archive = response.read()
print(f"source={URL}")
print(f"archive_bytes={len(archive)}")
print(f"archive_sha256={hashlib.sha256(archive).hexdigest()}")
with zipfile.ZipFile(BytesIO(archive)) as zf:
    bad = zf.testzip()
    if bad:
        raise SystemExit(f"Corrupt archive member: {bad}")
    txt_name = next((name for name in zf.namelist() if name.endswith("_vpl.txt")), None)
    about_name = next((name for name in zf.namelist() if name.endswith("_about.htm")), None)
    if not txt_name or not about_name:
        raise SystemExit("Missing VPL text or source notice")
    about = zf.read(about_name).decode("utf-8", "replace")
    print("source_notice_public_domain=" + str("public domain" in about.lower()).lower())
    source = zf.read(txt_name).decode("utf-8-sig")
books = OrderedDict()
pattern = re.compile(r"^([A-Z0-9]{3})\s+(\d+):(\d+)\s+(.*)$")
for line_no, line in enumerate(source.splitlines(), 1):
    if not line.strip():
        continue
    match = pattern.match(line)
    if not match:
        raise SystemExit(f"Unparsed VPL line {line_no}: {line[:100]!r}")
    code, chapter, verse, text = match.groups()
    record = books.setdefault(code, {"chapters": set(), "verses": 0, "empty": 0})
    record["chapters"].add(int(chapter))
    record["verses"] += 1
    record["empty"] += not bool(text.strip())
print(f"unique_book_codes={len(books)}")
print("BOOK_CODE | CHAPTERS | VERSE_ROWS | EMPTY_ROWS")
for code, item in books.items():
    print(f"{code} | {len(item['chapters'])} | {item['verses']} | {item['empty']}")
