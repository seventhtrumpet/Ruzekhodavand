#!/usr/bin/env python3
"""Import seven public-domain English translations from official eBible VPL archives.

VPL archives contain Bible text only. The importer keeps verse wording exactly,
filters only non-canon books for the 66-book reader grid, and writes local JSON.
"""
from __future__ import annotations

import hashlib
import json
import re
import urllib.request
import zipfile
from collections import defaultdict
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "bible-en" / "local"
SOURCES = {
    "web": ("eng-web", "World English Bible (Classic)", "Public Domain"),
    "asv": ("eng-asv", "American Standard Version (1901)", "Public Domain"),
    "ylt": ("engylt", "Young's Literal Translation (1898)", "Public Domain"),
    "webster": ("engwebster", "Noah Webster Bible (1833)", "Public Domain"),
    "darby": ("engDBY", "Darby Translation (1884)", "Public Domain"),
    "gnv": ("enggnv", "Geneva Bible (1599)", "Public Domain"),
    "bsb": ("engbsb", "Berean Standard Bible", "Public Domain"),
}
BOOKS = [
    (10,"GEN","Genesis",50),(20,"EXO","Exodus",40),(30,"LEV","Leviticus",27),
    (40,"NUM","Numbers",36),(50,"DEU","Deuteronomy",34),(60,"JOS","Joshua",24),
    (70,"JDG","Judges",21),(80,"RUT","Ruth",4),(90,"1SA","1 Samuel",31),
    (100,"2SA","2 Samuel",24),(110,"1KI","1 Kings",22),(120,"2KI","2 Kings",25),
    (130,"1CH","1 Chronicles",29),(140,"2CH","2 Chronicles",36),(150,"EZR","Ezra",10),
    (160,"NEH","Nehemiah",13),(190,"EST","Esther",10),(220,"JOB","Job",42),
    (230,"PSA","Psalms",150),(240,"PRO","Proverbs",31),(250,"ECC","Ecclesiastes",12),
    (260,"SNG","Song of Songs",8),(290,"ISA","Isaiah",66),(300,"JER","Jeremiah",52),
    (310,"LAM","Lamentations",5),(330,"EZK","Ezekiel",48),(340,"DAN","Daniel",12),
    (350,"HOS","Hosea",14),(360,"JOL","Joel",3),(370,"AMO","Amos",9),
    (380,"OBA","Obadiah",1),(390,"JON","Jonah",4),(400,"MIC","Micah",7),
    (410,"NAM","Nahum",3),(420,"HAB","Habakkuk",3),(430,"ZEP","Zephaniah",3),
    (440,"HAG","Haggai",2),(450,"ZEC","Zechariah",14),(460,"MAL","Malachi",4),
    (470,"MAT","Matthew",28),(480,"MRK","Mark",16),(490,"LUK","Luke",24),
    (500,"JOH","John",21),(510,"ACT","Acts",28),(520,"ROM","Romans",16),
    (530,"1CO","1 Corinthians",16),(540,"2CO","2 Corinthians",13),(550,"GAL","Galatians",6),
    (560,"EPH","Ephesians",6),(570,"PHP","Philippians",4),(580,"COL","Colossians",4),
    (590,"1TH","1 Thessalonians",5),(600,"2TH","2 Thessalonians",3),(610,"1TI","1 Timothy",6),
    (620,"2TI","2 Timothy",4),(630,"TIT","Titus",3),(640,"PHM","Philemon",1),
    (650,"HEB","Hebrews",13),(660,"JAS","James",5),(670,"1PE","1 Peter",5),
    (680,"2PE","2 Peter",3),(690,"1JN","1 John",5),(700,"2JN","2 John",1),
    (710,"3JN","3 John",1),(720,"JUD","Jude",1),(730,"REV","Revelation",22),
]
CODE_MAP = {code: (book_id, name, chapters) for book_id, code, name, chapters in BOOKS}
LINE_RE = re.compile(r"^([A-Z0-9]{3})\s+(\d+):(\d+)\s+(.*)$")


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "SeventhTrumpet-English-Bible-Importer/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        data = response.read()
    if len(data) < 100_000:
        raise RuntimeError(f"Unexpectedly small source archive: {url}")
    return data


def parse_vpl(text: str, translation: str) -> tuple[dict, dict]:
    books = {str(book_id): {"id": book_id, "name": name, "chapters": {}} for book_id, _, name, _ in BOOKS}
    matched = 0
    for line_number, line in enumerate(text.splitlines(), start=1):
        if not line.strip():
            continue
        match = LINE_RE.match(line)
        if not match:
            raise ValueError(f"{translation}: unparsed VPL line {line_number}: {line[:100]}")
        code, chapter, verse, verse_text = match.groups()
        if code not in CODE_MAP:
            continue
        book_id, name, expected_chapters = CODE_MAP[code]
        chapter_number = int(chapter)
        verse_number = int(verse)
        if not 1 <= chapter_number <= expected_chapters or verse_number < 1:
            raise ValueError(f"{translation}: out-of-range reference {code} {chapter}:{verse}")
        chapter_map = books[str(book_id)]["chapters"].setdefault(str(chapter_number), {})
        if str(verse_number) in chapter_map:
            raise ValueError(f"{translation}: duplicate verse {code} {chapter}:{verse}")
        if not verse_text.strip():
            raise ValueError(f"{translation}: empty verse {code} {chapter}:{verse}")
        chapter_map[str(verse_number)] = verse_text.strip()
        matched += 1

    if len([b for b in books.values() if b["chapters"]]) != 66:
        raise ValueError(f"{translation}: expected all 66 canonical books")
    chapter_total = 0
    for book_id, code, name, expected_chapters in BOOKS:
        chapter_map = books[str(book_id)]["chapters"]
        if len(chapter_map) != expected_chapters:
            raise ValueError(f"{translation}: {name} expected {expected_chapters} chapters, got {len(chapter_map)}")
        if sorted(map(int, chapter_map)) != list(range(1, expected_chapters + 1)):
            raise ValueError(f"{translation}: non-contiguous chapters in {name}")
        for chapter, verses in chapter_map.items():
            if not verses:
                raise ValueError(f"{translation}: empty chapter {name} {chapter}")
            numbers = sorted(map(int, verses))
            if numbers != list(range(1, max(numbers) + 1)):
                raise ValueError(f"{translation}: verse-number gap in {name} {chapter}")
        chapter_total += len(chapter_map)
    if chapter_total != 1189:
        raise ValueError(f"{translation}: expected 1,189 chapters, got {chapter_total}")
    return books, {"books": 66, "chapters": chapter_total, "verses": matched}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    metadata = {}
    for translation, (archive_id, title, license_name) in SOURCES.items():
        url = f"https://ebible.org/Scriptures/{archive_id}_vpl.zip"
        archive = download(url)
        archive_sha = hashlib.sha256(archive).hexdigest()
        with zipfile.ZipFile(BytesIO(archive)) as zf:
            bad = zf.testzip()
            if bad:
                raise RuntimeError(f"{translation}: corrupt archive member {bad}")
            txt_name = next((n for n in zf.namelist() if n.endswith("_vpl.txt")), None)
            about_name = next((n for n in zf.namelist() if n.endswith("_about.htm")), None)
            if not txt_name or not about_name:
                raise RuntimeError(f"{translation}: missing VPL text or source notice")
            about = zf.read(about_name).decode("utf-8", "replace")
            if "public domain" not in about.lower():
                raise RuntimeError(f"{translation}: source archive does not state Public Domain")
            source_text = zf.read(txt_name).decode("utf-8-sig")
        books, counts = parse_vpl(source_text, translation)
        target = OUT / translation
        target.mkdir(parents=True, exist_ok=True)
        for book_id, payload in books.items():
            (target / f"b{book_id}.json").write_text(
                json.dumps({book_id: payload}, ensure_ascii=False, separators=(",", ":")) + "\n",
                encoding="utf-8",
            )
        metadata[translation] = {
            "title": title,
            "source_archive": f"{archive_id}_vpl.zip",
            "source_url": url,
            "source_archive_sha256": archive_sha,
            "license": license_name,
            "counts": counts,
            "format_note": "Official eBible VPL text; only the 66 standard books are included in this reader. Verse wording is not edited.",
        }
        print(f"{translation}: {counts['books']} books, {counts['chapters']} chapters, {counts['verses']} verses")

    (OUT / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "README.md").write_text(
        "# Local English public-domain Bible texts\n\n"
        "Sources: official eBible.org VPL archives, pinned by SHA-256 in metadata.json.\n"
        "Included editions: WEB Classic, ASV 1901, YLT 1898, Webster 1833, Darby 1884, Geneva 1599, and BSB.\n"
        "The VPL format contains Bible text only. The importer preserves verse wording and includes the 66 standard books.\n"
        "The World English Bible name is retained only for the unchanged source text.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
