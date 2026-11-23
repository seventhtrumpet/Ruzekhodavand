#!/usr/bin/env python3
"""Build the Persian Old Persian Version (OPV) JSON packs from eBible USFM."""
from __future__ import annotations

import json
import re
import urllib.request
import zipfile
from pathlib import Path
from io import BytesIO

SOURCE_URL = "https://ebible.org/Scriptures/pesOPV_usfm.zip"
OUT_DIR = Path("data/bible-fa/opv")
IDS = [
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
EZEKIEL_25_5 = (
    "و ربه را آرامگاه شتران و (زمین ) بنی عمون را خوابگاه گله ها"
    "خواهم گردانید و خواهید دانست که من یهوه هستم."
)


def download_archive() -> bytes:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "SeventhTrumpet-Bible-Importer/1.0"},
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        data = response.read()
    if len(data) < 500_000:
        raise RuntimeError(f"Unexpectedly small OPV archive: {len(data)} bytes")
    return data


def parse_usfm(source: str, book_id: int) -> dict:
    chapters: dict[str, dict[str, str]] = {}
    current_chapter: str | None = None
    for line in source.splitlines():
        chapter_match = re.match(r"^\\c\s+(\d+)", line)
        if chapter_match:
            current_chapter = chapter_match.group(1)
            if current_chapter in chapters:
                raise ValueError(f"Duplicate chapter {current_chapter} in book {book_id}")
            chapters[current_chapter] = {}
            continue

        verse_match = re.match(r"^\\v\s+(\d+)([a-z]?)(?:\s+(.*))?$", line, re.I)
        if verse_match and current_chapter is not None:
            verse_number = verse_match.group(1)
            verse_text = (verse_match.group(3) or "").strip()
            if verse_number in chapters[current_chapter]:
                raise ValueError(
                    f"Duplicate verse {book_id}:{current_chapter}:{verse_number}"
                )
            chapters[current_chapter][verse_number] = verse_text

    if not chapters:
        raise ValueError(f"No chapters parsed for book {book_id}")

    return chapters


def main() -> None:
    archive = download_archive()
    with zipfile.ZipFile(BytesIO(archive)) as zf:
        bad_file = zf.testzip()
        if bad_file:
            raise RuntimeError(f"Corrupt archive member: {bad_file}")
        names = sorted(
            [n for n in zf.namelist() if n.endswith(".usfm")],
            key=lambda n: int(n.split("-", 1)[0]),
        )
        if len(names) != 66:
            raise RuntimeError(f"Expected 66 USFM books, found {len(names)}")

        OUT_DIR.mkdir(parents=True, exist_ok=True)
        total_chapters = 0
        total_verses = 0
        empty_verses: list[str] = []
        all_books: list[dict] = []

        for filename, book_id in zip(names, IDS):
            source = zf.read(filename).decode("utf-8-sig")
            code_match = re.search(r"^\\id\s+(\S+)", source, re.M)
            file_code = re.search(r"^\d+-(.+?)pesOPV\.usfm$", filename)
            if not code_match or not file_code or code_match.group(1) != file_code.group(1):
                raise RuntimeError(f"Book ID mismatch in {filename}")

            chapters = parse_usfm(source, book_id)
            expected = CHAPTER_COUNTS[book_id]
            if len(chapters) != expected:
                raise RuntimeError(
                    f"{filename}: expected {expected} chapters, got {len(chapters)}"
                )
            if sorted(map(int, chapters)) != list(range(1, expected + 1)):
                raise RuntimeError(f"Non-contiguous chapter numbering in {filename}")

            # In the supplied OPV source, Ezekiel 25:5 text is appended to 25:4.
            # Restore the verse boundary without changing any wording.
            if book_id == 330:
                verse_four = chapters["25"]["4"]
                if EZEKIEL_25_5 not in verse_four:
                    raise RuntimeError("Could not locate Ezekiel 25:5 text in source")
                before, after = verse_four.split(EZEKIEL_25_5, 1)
                chapters["25"]["4"] = before.rstrip()
                chapters["25"]["5"] = (EZEKIEL_25_5 + after).strip()

            for chapter_number, verses in chapters.items():
                verse_numbers = sorted(map(int, verses))
                if verse_numbers != list(range(1, max(verse_numbers) + 1)):
                    raise RuntimeError(
                        f"Verse-number gap in {filename}, chapter {chapter_number}"
                    )
                for verse_number, text in verses.items():
                    if not text:
                        empty_verses.append(
                            f"{filename} {chapter_number}:{verse_number}"
                        )

            heading = re.search(r"^\\h\s+(.+?)\s*$", source, re.M)
            payload = {
                str(book_id): {
                    "id": book_id,
                    "name": heading.group(1).strip() if heading else "",
                    "chapters": chapters,
                }
            }
            all_books.append(payload[str(book_id)])
            output_path = OUT_DIR / f"b{book_id}.json"
            output_path.write_text(
                json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            total_chapters += len(chapters)
            total_verses += sum(len(verses) for verses in chapters.values())

        if total_chapters != 1189:
            raise RuntimeError(f"Expected 1189 chapters, got {total_chapters}")
        if total_verses != 31091:
            raise RuntimeError(f"Expected 31091 verse records, got {total_verses}")
        expected_empty = {
            "19-JOBpesOPV.usfm 35:1",
            "19-JOBpesOPV.usfm 40:1",
        }
        if set(empty_verses) != expected_empty:
            raise RuntimeError(f"Unexpected empty source verses: {empty_verses}")

        (OUT_DIR / "index.json").write_text(
            json.dumps({"version": "OPV", "books": all_books}, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )

        readme = (
            "# Persian Old Persian Version (OPV) data\n\n"
            "Source: https://ebible.org/bible/details.php?id=pesOPV\n\n"
            "The source identifies OPV as public domain and credits Wycliffe Bible Translators.\n"
            "Original USFM archive: https://ebible.org/Scriptures/pesOPV_usfm.zip\n\n"
            "Generated as one JSON file per Bible book for the reader, plus index.json for full-text search.\n"
            "The source has two intentionally preserved empty verse markers in Job 35:1 and 40:1.\n"
            "The source placed the wording of Ezekiel 25:5 at the end of 25:4; the build restores "
            "that verse boundary without changing the wording.\n"
        )
        (OUT_DIR / "README.md").write_text(readme, encoding="utf-8")
        print(
            f"Imported 66 books, {total_chapters} chapters, "
            f"{total_verses} verse records; empty source markers: {empty_verses}"
        )


if __name__ == "__main__":
    main()
