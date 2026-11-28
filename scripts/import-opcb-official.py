#!/usr/bin/env python3
"""Import the official Biblica OPCB USFM archive into a separate, range-preserving reader dataset."""
from __future__ import annotations

import hashlib
import json
import re
import urllib.request
import zipfile
from pathlib import Path

SOURCE_URL = "https://ebible.org/Scriptures/pesopcb_usfm.zip"
EXPECTED_SHA256 = "86ec74a1de07f769bf53f0f282c9f2886f845aca7dcbf8412543f0feb2a42a7d"
OUT = Path("data/bible-fa/opcb-official")

BOOKS = {
    10:"GEN",20:"EXO",30:"LEV",40:"NUM",50:"DEU",60:"JOS",70:"JDG",80:"RUT",
    90:"1SA",100:"2SA",110:"1KI",120:"2KI",130:"1CH",140:"2CH",150:"EZR",160:"NEH",190:"EST",
    220:"JOB",230:"PSA",240:"PRO",250:"ECC",260:"SNG",290:"ISA",300:"JER",310:"LAM",330:"EZK",340:"DAN",
    350:"HOS",360:"JOL",370:"AMO",380:"OBA",390:"JON",400:"MIC",410:"NAM",420:"HAB",430:"ZEP",440:"HAG",450:"ZEC",460:"MAL",
    470:"MAT",480:"MRK",490:"LUK",500:"JHN",510:"ACT",520:"ROM",530:"1CO",540:"2CO",550:"GAL",560:"EPH",570:"PHP",580:"COL",
    590:"1TH",600:"2TH",610:"1TI",620:"2TI",630:"TIT",640:"PHM",650:"HEB",660:"JAS",670:"1PE",680:"2PE",690:"1JN",700:"2JN",710:"3JN",720:"JUD",730:"REV"
}
SKIP = {"s1","s2","s3","d","sp","cl","ms1","mr","mt1","mt2","toc1","toc2","toc3","h","id","c"}

def clean_text(value: str) -> str:
    value = re.sub(r"\\[A-Za-z0-9]+\*?", " ", value)
    value = value.replace("|", " ")
    value = re.sub(r"[\u200e\u200f\u202a-\u202e\u2066-\u2069]", "", value)
    value = value.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", value).strip()

def parse_usfm(source: str, book_id: int) -> dict:
    # Footnotes and cross-references are separate study apparatus, not verse wording.
    source = re.sub(r"\\f\b[\s\S]*?\\f\*", " ", source)
    source = re.sub(r"\\x\b[\s\S]*?\\x\*", " ", source)
    chapters: dict[str, dict[str, str]] = {}
    chapter = None
    verse_key = None

    for raw_line in source.splitlines():
        line = re.sub(r"[\u200e\u200f\u202a-\u202e\u2066-\u2069]", "", raw_line).strip()
        if not line:
            continue
        chapter_match = re.match(r"^\\c\s+(\d+)", line)
        if chapter_match:
            chapter = chapter_match.group(1)
            chapters.setdefault(chapter, {})
            verse_key = None
            continue

        verse_match = re.match(r"^\\v\s+(\d+(?:-\d+)?)\s*(.*)$", line)
        if verse_match and chapter is not None:
            verse_key = verse_match.group(1)
            if verse_key in chapters[chapter]:
                raise ValueError(f"Duplicate verse marker {chapter}:{verse_key} in book {book_id}")
            chapters[chapter][verse_key] = clean_text(verse_match.group(2))
            continue

        if chapter is None or verse_key is None:
            continue
        marker_match = re.match(r"^\\([A-Za-z0-9]+)\*?\s*(.*)$", line)
        if marker_match:
            marker, payload = marker_match.groups()
            if marker in SKIP or marker in {"f","x"}:
                continue
            text = clean_text(payload)
            if not text:
                continue
            separator = " • " if marker.startswith("li") else " | " if marker.startswith(("tc","th")) else " "
        else:
            text = clean_text(line)
            separator = " "
        if text:
            previous = chapters[chapter].get(verse_key, "")
            chapters[chapter][verse_key] = (previous + separator + text).strip()

    if not chapters:
        raise ValueError(f"No chapters parsed for book {book_id}")
    empty = [(ch, verse) for ch, rows in chapters.items() for verse, text in rows.items() if not text]
    if empty:
        raise ValueError(f"Empty verse text in book {book_id}: {empty[:5]}")
    return {"id": book_id, "name": "", "chapters": chapters}

def main() -> None:
    archive = Path("/tmp/pesopcb_usfm.zip")
    request = urllib.request.Request(SOURCE_URL, headers={"User-Agent":"SeventhTrumpet-OPCB-import/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        archive.write_bytes(response.read())
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise SystemExit(f"Official OPCB archive checksum changed: {digest}")

    with zipfile.ZipFile(archive) as zf:
        sources = {}
        for name in zf.namelist():
            if not name.lower().endswith(".usfm"):
                continue
            content = zf.read(name).decode("utf-8-sig")
            match = re.search(r"^\\id\s+(\S+)", content, re.M)
            if match:
                sources[match.group(1)] = (name, content)

    if set(sources) != set(BOOKS.values()) or len(sources) != 66:
        raise SystemExit(f"Expected 66 official USFM books; found {len(sources)}")

    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    total_chapters = 0
    total_markers = 0
    total_ranges = 0
    for book_id, code in BOOKS.items():
        filename, source = sources[code]
        title_match = re.search(r"^\\h\s+(.+)$", source, re.M)
        book = parse_usfm(source, book_id)
        book["name"] = clean_text(title_match.group(1)) if title_match else code
        chapter_count = len(book["chapters"])
        if chapter_count == 0:
            raise SystemExit(f"No chapters in {code}")
        total_chapters += chapter_count
        for chapter_rows in book["chapters"].values():
            total_markers += len(chapter_rows)
            total_ranges += sum(1 for key in chapter_rows if "-" in key)
        output = {str(book_id): book}
        (OUT / f"b{book_id}.json").write_text(
            json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        manifest[str(book_id)] = [f"b{book_id}.json"]

    if total_chapters != 1189 or total_markers != 29469:
        raise SystemExit(
            f"Unexpected source structure: chapters={total_chapters}, markers={total_markers}"
        )
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    metadata = {
        "translation": "Biblica Open Persian Contemporary Bible (2022) — official USFM source",
        "copyright": "© 1995, 2005, 2018, 2022 Biblica, Inc.",
        "text_license": "CC BY-SA 4.0",
        "source": SOURCE_URL,
        "source_sha256": digest,
        "source_archive": "pesopcb_usfm.zip",
        "source_format": "USFM",
        "site_format": "Per-book JSON for the on-site reader",
        "format_changes": [
            "Converted USFM to per-book JSON.",
            "USFM verse ranges remain range keys (for example, 7-8); they are not silently split or renumbered.",
            "Footnotes and cross-references are kept out of verse-body text.",
            "Paragraph/list/table markers are represented as readable spacing and separators."
        ],
        "books": 66,
        "chapters": total_chapters,
        "verse_markers": total_markers,
        "verse_range_markers": total_ranges
    }
    (OUT / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    readme = """# OPCB Official 2022 — USFM-derived reader edition

Source: [Biblica Open Persian Contemporary Bible (2022)](https://ebible.org/details.php?id=pesopcb)  
Official USFM archive: https://ebible.org/Scriptures/pesopcb_usfm.zip  
Copyright: © 1995, 2005, 2018, 2022 Biblica, Inc.  
Text licence: CC BY-SA 4.0.

This is a separate, parallel edition for comparison in the SeventhTrumpet.org Bible reader. The existing OPCB edition remains unchanged.

The official USFM source is converted to per-book JSON for same-site reading. USFM verse ranges are preserved as range labels instead of being silently split or renumbered. Footnotes and cross-references are not inserted into verse-body text. Paragraph, list, and table markers are rendered as readable spacing/separators.

This format conversion is an adaptation; attribution and the CC BY-SA 4.0 licence are retained.
"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")
    print(f"Imported 66 books, {total_chapters} chapters, {total_markers} verse markers, {total_ranges} range markers.")

if __name__ == "__main__":
    main()
