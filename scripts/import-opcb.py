#!/usr/bin/env python3
"""Import the pinned Biblica OPCB dataset into local, per-book JSON packs.

The Bible text is licensed CC BY-SA 4.0 by Biblica. The upstream repository's
MIT licence does not cover the Bible text. This script changes only the data
shape (array chapters -> numbered verse maps); it does not edit verse wording.
"""
from __future__ import annotations

import hashlib
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "bible-fa" / "opcb"
SOURCE_COMMIT = "4c8b8a4a7bd75fee381e1b55523b152191d6a1a5"
SOURCE_URL = (
    "https://raw.githubusercontent.com/thiagobodruk/bible/"
    + SOURCE_COMMIT + "/json/fa_opcb.json"
)
BOOK_IDS = [
    10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,
    220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,
    400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,
    550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,
    700,710,720,730,
]
CHAPTER_COUNTS = {
    10:50,20:40,30:27,40:36,50:34,60:24,70:21,80:4,90:31,100:24,
    110:22,120:25,130:29,140:36,150:10,160:13,190:10,220:42,230:150,
    240:31,250:12,260:8,290:66,300:52,310:5,330:48,340:12,350:14,
    360:3,370:9,380:1,390:4,400:7,410:3,420:3,430:3,440:2,450:14,
    460:4,470:28,480:16,490:24,500:21,510:28,520:16,530:16,540:13,
    550:6,560:6,570:4,580:4,590:5,600:3,610:6,620:4,630:3,640:1,
    650:13,660:5,670:5,680:3,690:5,700:1,710:1,720:1,730:22,
}
EXPECTED_VERSES = 28731


def main() -> None:
    request = urllib.request.Request(
        SOURCE_URL, headers={"User-Agent": "SeventhTrumpet-OPCB-import/1.0"}
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        raw = response.read()
    source_hash = hashlib.sha256(raw).hexdigest()
    books = json.loads(raw.decode("utf-8"))

    if not isinstance(books, list) or len(books) != len(BOOK_IDS):
        raise SystemExit("OPCB source must contain exactly 66 books")

    manifest: dict[str, str] = {}
    total_chapters = 0
    total_verses = 0

    for index, book_id in enumerate(BOOK_IDS):
        book = books[index]
        if not isinstance(book, dict) or not isinstance(book.get("chapters"), list):
            raise SystemExit(f"Invalid OPCB book at source index {index}")
        chapters = book["chapters"]
        expected_chapters = CHAPTER_COUNTS[book_id]
        if len(chapters) != expected_chapters:
            raise SystemExit(
                f"Book {book_id}: expected {expected_chapters} chapters, got {len(chapters)}"
            )

        numbered_chapters: dict[str, dict[str, str]] = {}
        for chapter_number, verses in enumerate(chapters, start=1):
            if not isinstance(verses, list) or not verses:
                raise SystemExit(f"Book {book_id}, chapter {chapter_number}: empty/invalid")
            verse_map: dict[str, str] = {}
            for verse_number, verse_text in enumerate(verses, start=1):
                if not isinstance(verse_text, str) or not verse_text.strip():
                    raise SystemExit(
                        f"Book {book_id}, {chapter_number}:{verse_number}: invalid verse text"
                    )
                verse_map[str(verse_number)] = verse_text
                total_verses += 1
            numbered_chapters[str(chapter_number)] = verse_map
            total_chapters += 1

        payload = {
            str(book_id): {
                "id": book_id,
                "name": str(book.get("name") or ""),
                "chapters": numbered_chapters,
            }
        }
        filename = f"b{book_id}.json"
        (OUT / filename).write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        manifest[str(book_id)] = filename

    if total_chapters != 1189 or total_verses != EXPECTED_VERSES:
        raise SystemExit(
            f"OPCB totals mismatch: {total_chapters} chapters, {total_verses} verses"
        )

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    metadata = {
        "translation": "Biblica Open Persian Contemporary Bible (2022)",
        "copyright": "© 1995, 2005, 2018, 2022 Biblica, Inc.",
        "text_license": "CC BY-SA 4.0",
        "source_repository": "thiagobodruk/bible",
        "source_commit": SOURCE_COMMIT,
        "source_url": SOURCE_URL,
        "source_sha256": source_hash,
        "format_note": "Per-book JSON conversion; verse wording preserved.",
        "books": len(BOOK_IDS),
        "chapters": total_chapters,
        "verses": total_verses,
    }
    (OUT / "metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUT / "README.md").write_text(
        "# OPCB local data\n\n"
        "Biblica® Open Persian Contemporary Bible 2022. Copyright © 1995, 2005, "
        "2018, 2022 Biblica, Inc. Text licence: CC BY-SA 4.0.\n\n"
        "The importer preserves verse wording and converts only the JSON structure "
        "into numbered per-book chapter/verse maps. Any redistributed adaptation "
        "must retain attribution, identify the format change, and use CC BY-SA 4.0.\n",
        encoding="utf-8",
    )
    print(
        f"Imported OPCB: {len(BOOK_IDS)} books, {total_chapters} chapters, "
        f"{total_verses} verses; source SHA-256 {source_hash}"
    )


if __name__ == "__main__":
    main()
