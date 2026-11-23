#!/usr/bin/env python3
"""Import ten English editions from official eBible VPL archives.

VPL archives contain Bible text only. The importer keeps verse wording exactly,
uses each edition’s defined 66- or 73-book canon, validates chapter/verse structure,
and writes reproducible per-book JSON files without filling missing source markers.
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
    "rv1885": ("eng-rv", "English Revised Version (1885)", "Public Domain"),
    "dra": ("engDRA", "Douay-Rheims 1899", "Public Domain"),
    "webbe": ("eng-webbe", "World English Bible British Edition", "Public Domain"),
    "msb": ("engmsb", "Majority Standard Bible", "Public Domain"),
}
EXPECTED_ARCHIVE_SHA256 = {
    "web": "93e867cdb2bfc84d1e997172e7773e166e718d9265985a054f8fca565f5cd21e",
    "asv": "6c41b8020cba9cf7041689f2356c55859e28023405537388be08bad93df2b050",
    "ylt": "653e9f1d8487de46e11574165a6355d3135ae378fb2198ee4128dedc06c8ca56",
    "webster": "402240da209b017c67a31b63773b42471ef7e2513aa76ef067f34af907537270",
    "darby": "7eb1df2a434f5bbd831591aa96c08e94b900b1458fda74ccf1d1739d5af73619",
    "gnv": "faa35b12d04bdacda78b5b53b35bc241d576c63e5d6cd5bccd99bb337b8f7ade",
    "bsb": "72ecd9e0131e82737b76e1f2d706c85771d6054b6350673f80f49c839133f45e",
    "rv1885": "3f26f6bb6fd48d9ee18ae11fff0670054e84ed35d3ae8c984cd95e9af0ed5791",
    "dra": "4b7ddcaec6bcf1d973d483a14e6495657daba94056b3a9678d0002315e7e57dd",
    "webbe": "055c1a5c21aa18c62117747ce7dd602346d587547399c89673fa7d0a511b8f14",
}
EXPECTED_GENESIS_1_1 = {
    "web": "In the beginning, God created the heavens and the earth.",
    "asv": "In the beginning God created the heavens and the earth.",
    "ylt": "In the beginning of God's preparing the heavens and the earth —",
    "webster": "In the beginning God created the heaven and the earth.",
    "darby": "In the beginning God created the heavens and the earth.",
    "gnv": "In the beginning God created the heauen and the earth.",
    "bsb": "In the beginning God created the heavens and the earth.",
    "rv1885": "In the beginning God created the heaven and the earth.",
    "dra": "In the beginning God created heaven, and earth.",
    "webbe": "In the beginning, God created the heavens and the earth.",
    "msb": "In the beginning God created the heavens and the earth.",
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
CODE_ALIASES = {
    "EZK": "EZE", "JOL": "JOE", "NAM": "NAH", "MRK": "MAR",
    "PHP": "PHI", "JAS": "JAM", "1JN": "1JO", "2JN": "2JO",
    "3JN": "3JO", "SNG": "SOL",
}
DEUTEROCANONICAL = [
    (740,"TOB","Tobit",14),(750,"JDT","Judith",16),(760,"WIS","Wisdom",19),
    (770,"SIR","Sirach",51),(780,"BAR","Baruch",6),(790,"1MA","1 Maccabees",16),
    (800,"2MA","2 Maccabees",15),
]
BOOKS_73_WEBBE = BOOKS + DEUTEROCANONICAL
BOOKS_73_DRA = [
    (book_id, code, name, 16 if book_id == 190 else 14 if book_id == 340 else chapters)
    for book_id, code, name, chapters in BOOKS
] + DEUTEROCANONICAL
LINE_RE = re.compile(r"^([A-Z0-9]{3})\s+(\d+):(\d+)\s+(.*)$")


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "SeventhTrumpet-English-Bible-Importer/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        data = response.read()
    if len(data) < 100_000:
        raise RuntimeError(f"Unexpectedly small source archive: {url}")
    return data


def parse_vpl(text: str, translation: str, book_defs: list[tuple]) -> tuple[dict, dict, list[str], list[str]]:
    code_map = {
        CODE_ALIASES.get(code, code): (book_id, name, chapters)
        for book_id, code, name, chapters in book_defs
    }
    books = {str(book_id): {"id": book_id, "name": name, "chapters": {}} for book_id, _, name, _ in book_defs}
    matched = 0
    empty_verses: list[str] = []
    verse_gaps: list[str] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        if not line.strip():
            continue
        match = LINE_RE.match(line)
        if not match:
            raise ValueError(f"{translation}: unparsed VPL line {line_number}: {line[:100]}")
        code, chapter, verse, verse_text = match.groups()
        if code not in code_map:
            continue
        book_id, name, expected_chapters = code_map[code]
        chapter_number = int(chapter)
        verse_number = int(verse)
        if not 1 <= chapter_number <= expected_chapters or verse_number < 1:
            raise ValueError(f"{translation}: out-of-range reference {code} {chapter}:{verse}")
        chapter_map = books[str(book_id)]["chapters"].setdefault(str(chapter_number), {})
        if str(verse_number) in chapter_map:
            raise ValueError(f"{translation}: duplicate verse {code} {chapter}:{verse}")
        if not verse_text.strip():
            empty_verses.append(f"{code} {chapter}:{verse}")
        chapter_map[str(verse_number)] = verse_text.strip()
        matched += 1

    expected_books = len(book_defs)
    expected_chapters_total = sum(item[3] for item in book_defs)
    if len([b for b in books.values() if b["chapters"]]) != expected_books:
        raise ValueError(f"{translation}: expected all {expected_books} books")
    chapter_total = 0
    for book_id, code, name, expected_chapters in book_defs:
        chapter_map = books[str(book_id)]["chapters"]
        if len(chapter_map) != expected_chapters:
            raise ValueError(f"{translation}: {name} expected {expected_chapters} chapters, got {len(chapter_map)}")
        if sorted(map(int, chapter_map)) != list(range(1, expected_chapters + 1)):
            raise ValueError(f"{translation}: non-contiguous chapters in {name}")
        for chapter, verses in chapter_map.items():
            if not verses:
                raise ValueError(f"{translation}: empty chapter {name} {chapter}")
            numbers = sorted(map(int, verses))
            missing = sorted(set(range(1, max(numbers) + 1)) - set(numbers))
            if missing:
                verse_gaps.append(f"{code} {chapter}: {','.join(map(str, missing))}")
        chapter_total += len(chapter_map)
    if chapter_total != expected_chapters_total:
        raise ValueError(f"{translation}: expected {expected_chapters_total} chapters, got {chapter_total}")
    return books, {"books": expected_books, "chapters": chapter_total, "verses": matched, "empty_verse_markers": len(empty_verses), "chapters_with_verse_gaps": len(verse_gaps)}, empty_verses, verse_gaps


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    metadata = {}
    metadata_path = OUT / "metadata.json"
    previous_metadata = json.loads(metadata_path.read_text(encoding="utf-8")) if metadata_path.exists() else {}
    for translation, (archive_id, title, license_name) in SOURCES.items():
        url = f"https://ebible.org/Scriptures/{archive_id}_vpl.zip"
        archive = download(url)
        archive_sha = hashlib.sha256(archive).hexdigest()
        pinned_sha = EXPECTED_ARCHIVE_SHA256.get(translation) or previous_metadata.get(translation, {}).get("source_archive_sha256")
        if pinned_sha and archive_sha != pinned_sha:
            raise RuntimeError(f"{translation}: source archive hash changed; review before importing")
        if not pinned_sha:
            print(f"{translation}: first import; recording official source archive SHA-256 {archive_sha}")
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
        book_defs = BOOKS_73_DRA if translation == "dra" else BOOKS_73_WEBBE if translation == "webbe" else BOOKS
        books, counts, empty_verses, verse_gaps = parse_vpl(source_text, translation, book_defs)
        if books["10"]["chapters"]["1"]["1"] != EXPECTED_GENESIS_1_1[translation]:
            raise RuntimeError(f"{translation}: Genesis 1:1 sample does not match the reviewed source")
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
            "empty_verses": empty_verses,
            "verse_gaps": verse_gaps,
            "format_note": f"Official eBible VPL text; {counts.get('books')} books are included according to this edition's catalogue. Verse wording is not edited. Empty verse markers and omitted verse-number gaps are preserved exactly as found; no text is borrowed from another edition.",
        }
        print(f"{translation}: {counts['books']} books, {counts['chapters']} chapters, {counts['verses']} verses")

    (OUT / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "README.md").write_text(
        "# Local English public-domain Bible texts\n\n"
        "Sources: official eBible.org VPL archives, pinned by SHA-256 in metadata.json.\n"
        "Included editions: WEB Classic, ASV 1901, YLT 1898, Webster 1833, Darby 1884, Geneva 1599, BSB, ERV 1885, Douay-Rheims 1899, WEBBE, and MSB. DRA and WEBBE include the seven deuterocanonical books; DRA also includes the longer Esther and Daniel chapter divisions.\n"
        "The VPL format contains Bible text only. The importer preserves verse wording; 66-book editions include the standard canon, while DRA and WEBBE include the seven deuterocanonical books. Empty verse markers and verse-number gaps are preserved, never filled from another edition.\n"
        "The World English Bible name is retained only for the unchanged source text. The Majority Standard Bible is identified as Public Domain by its official eBible.org source.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
