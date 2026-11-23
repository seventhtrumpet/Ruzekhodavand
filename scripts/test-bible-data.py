#!/usr/bin/env python3
"""Offline structural/regression checks for the self-hosted Bible reader.

These checks validate packaging and reader safeguards, not translation accuracy.
Run from the repository root: python scripts/test-bible-data.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BOOK_IDS = [
    10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,190,
    220,230,240,250,260,290,300,310,330,340,350,360,370,380,390,
    400,410,420,430,440,450,460,470,480,490,500,510,520,530,540,
    550,560,570,580,590,600,610,620,630,640,650,660,670,680,690,
    700,710,720,730,
]
ENGLISH = ["web", "asv", "ylt", "webster", "darby", "gnv", "bsb", "rv1885", "dra", "webbe"]
ERRORS: list[str] = []
CHECKED_JSON = 0


def fail(message: str) -> None:
    ERRORS.append(message)


def load_json(path: Path):
    global CHECKED_JSON
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        CHECKED_JSON += 1
        return data
    except Exception as exc:
        fail(f"{path.relative_to(ROOT)}: invalid JSON ({exc})")
        return None


def check_pack(pack: str, book_ids: list[int]) -> None:
    base = ROOT / pack
    expected = {f"b{book_id}.json" for book_id in book_ids}
    actual = {p.name for p in base.glob("b*.json") if re.fullmatch(r"b\d+\.json", p.name)}
    if actual != expected:
        fail(f"{base.relative_to(ROOT)}: book file set mismatch; missing={sorted(expected-actual)}, extra={sorted(actual-expected)}")
    for book_id in book_ids:
        path = base / f"b{book_id}.json"
        if not path.is_file():
            continue
        payload = load_json(path)
        if not isinstance(payload, dict) or not isinstance(payload.get(str(book_id)), dict):
            fail(f"{path.relative_to(ROOT)}: expected root object keyed by book ID {book_id}")
            continue
        book = payload[str(book_id)]
        chapters = book.get("chapters")
        if not isinstance(chapters, dict) or not chapters:
            fail(f"{path.relative_to(ROOT)}: missing chapters object")
            continue
        try:
            chapter_numbers = sorted(int(k) for k in chapters)
        except (TypeError, ValueError):
            fail(f"{path.relative_to(ROOT)}: non-numeric chapter key")
            continue
        if chapter_numbers != list(range(1, len(chapter_numbers) + 1)):
            fail(f"{path.relative_to(ROOT)}: chapter numbering is not contiguous from 1")
        for chapter, verses in chapters.items():
            if not isinstance(verses, dict):
                fail(f"{path.relative_to(ROOT)} chapter {chapter}: verses must be an object")
                continue
            for verse, text in verses.items():
                if not str(verse).isdigit() or int(verse) < 1:
                    fail(f"{path.relative_to(ROOT)} chapter {chapter}: invalid verse number {verse!r}")
                if not isinstance(text, str):
                    fail(f"{path.relative_to(ROOT)} chapter {chapter} verse {verse}: verse text must be a string")


def check_odr() -> None:
    base = ROOT / "data/bible-en/odr"
    manifest = load_json(base / "manifest.json")
    if not isinstance(manifest, dict) or not isinstance(manifest.get("books"), list):
        fail("Original Douay-Rheims manifest is missing its books catalogue")
        return
    books = manifest["books"]
    if len(books) != 76:
        fail(f"Original Douay-Rheims: expected 76 listed texts, found {len(books)}")
    for spelling in ("bible/raw", "original-spelling/bible/raw"):
        raw_dir = base / spelling
        files = {p.stem for p in raw_dir.glob("*.json")}
        expected = {b.get("slug") for b in books}
        if files != expected:
            fail(f"{raw_dir.relative_to(ROOT)}: raw book set mismatch; missing={sorted(expected-files)}, extra={sorted(files-expected)}")
        for book in books:
            slug = book.get("slug")
            path = raw_dir / f"{slug}.json"
            if not path.is_file():
                continue
            data = load_json(path)
            if not isinstance(data, dict) or not isinstance(data.get("chapters"), list):
                fail(f"{path.relative_to(ROOT)}: missing chapter array")
                continue
            chapters = data["chapters"]
            visible = [c for c in chapters if isinstance(c, dict) and c.get("chapter") != 0]
            expected_chapters = 14 if slug == "tobias" else int(book.get("chapters", 0))
            if len(visible) != expected_chapters:
                fail(f"{path.relative_to(ROOT)}: expected {expected_chapters} reader chapters (excluding chapter 0 where present), found {len(visible)}")
            for chapter in chapters:
                if not isinstance(chapter, dict) or not isinstance(chapter.get("verses"), list):
                    fail(f"{path.relative_to(ROOT)}: malformed chapter entry")
                    continue
                for verse in chapter["verses"]:
                    if not isinstance(verse, dict) or not isinstance(verse.get("verse"), int) or not isinstance(verse.get("text"), str):
                        fail(f"{path.relative_to(ROOT)}: malformed verse entry")
                        break


def check_reader_safeguards() -> None:
    reader = (ROOT / "js/bible.js").read_text(encoding="utf-8")
    core = (ROOT / "js/bible-core-pinned.js").read_text(encoding="utf-8")
    html = (ROOT / "bible.html").read_text(encoding="utf-8")
    share = (ROOT / "js/bible-share.js").read_text(encoding="utf-8")
    photo = (ROOT / "js/bible-share-photo.js").read_text(encoding="utf-8")
    admin = (ROOT / "admin.html").read_text(encoding="utf-8")
    admin_js = (ROOT / "js/admin.js").read_text(encoding="utf-8")
    if "code.replace(/  async function loadEnChapter" not in reader or "const requestUrl = isOdr" not in reader:
        fail("Runtime patch must replace the complete English chapter loader and define edition-specific request URLs")
    if "const localEnglishIds = ['web','asv','ylt','webster','darby','gnv','bsb','dra','webbe','rv1885']" not in reader:
        fail("Runtime patch must enumerate every locally hosted English edition")
    if "const entry = (data.chapters || []).find(item => Number(item.chapter) === Number(ch))" not in reader:
        fail("Original Douay-Rheims loader must select the requested chapter from its chapter array")
    if "const localChapter = localBook && localBook.chapters && localBook.chapters[String(ch)]" not in reader:
        fail("Self-hosted English loader must read the selected chapter from the per-book JSON pack")
    if "code.replace(/const ref = encodeURIComponent" not in reader:
        fail("English chapter fetch patch must target loadEnChapter, not the first generic fetch call")
    if "code.replace(/const res = await fetch" in reader:
        fail("English chapter fetch patch must not replace the first generic fetch call")
    if "const ref = encodeURIComponent(b.en + ' ' + ch);" not in core:
        fail("Pinned reader core no longer has the expected chapter-fetch anchor")
    if "Ten English editions" not in reader or "KJV and BBE" not in reader:
        fail("Reader hosting note must distinguish local editions from remotely fetched KJV/BBE")
    if "Geneva uses Bolls chapter delivery" in reader or "Darby and Douay-Rheims use Bible API" in reader:
        fail("Reader contains obsolete external-provider hosting notice")
    meta = json.loads((ROOT / "data/bible-fa/meta.json").read_text(encoding="utf-8"))
    extra_ids = {740,750,760,770,780,790,800}
    if not extra_ids.issubset({item.get("id") for item in meta}):
        fail("Book metadata must include the seven additional deuterocanonical books")
    core_counts = core[core.find("const CHAPTER_COUNTS"):core.find("const I18N")]
    for book_id, chapters in {740:14,750:16,760:19,770:51,780:6,790:16,800:15}.items():
        if not re.search(rf"\b{book_id}:{chapters}\b", core_counts):
            fail(f"Reader chapter-count map is missing book {book_id} ({chapters} chapters)")
    if "odrSlugById[id]" not in reader:
        fail("Original Douay-Rheims reader must map book IDs to source file slugs")
    if "hasDeuterocanon" not in reader or "return hasDeuterocanon ? meta : meta.filter(b => b.id < 740)" not in reader:
    if "const expandedEsther = bookId === 190" not in reader or "expandedEsther ? 16" not in reader:
        fail("Douay-Rheims editions with expanded Esther must expose all 16 chapters")
        fail("Reader must show the expanded canon only for editions that contain it")
    if "expanded-canon-fix-20261123" not in html:
        fail("Bible reader script URL is missing the hosting-note cache-busting version")
    if "var SITE = 'https://seventhtrumpet.org'" not in share or "var SITE = 'https://seventhtrumpet.org'" not in photo:
        fail("Bible share scripts must use the canonical site origin")
    if "bible.html?b=" not in share or "return SITE + '/'" not in share:
        fail("Bible share payload must build canonical same-site reader URLs")
    if re.search(r"<script[^>]+(?:admin_cloud_hook|admin_edit_hook|cloud_sync)", admin, re.I):
        fail("Disabled admin page must not load legacy admin hooks")
    if "Intentionally inert" not in admin_js or re.search(r"\\blocalStorage\\s*\\.|password|function\\s+login", admin_js, re.I):
        fail("Legacy admin compatibility script must remain inert and credential-free")
    if "Textual-integrity note" not in html or "یادداشت امانت‌داری متن" not in html:
        fail("Bible reader must retain its bilingual textual-integrity note")


def main() -> int:
    for version in ENGLISH:
        check_pack(f"data/bible-en/local/{version}", BOOK_IDS + ([740,750,760,770,780,790,800] if version in ("dra", "webbe") else []))
    check_pack("data/bible-fa/opcb", BOOK_IDS)
    check_pack("data/bible-fa/opv", BOOK_IDS)
    check_odr()
    check_reader_safeguards()
    if ERRORS:
        print(f"FAIL: {len(ERRORS)} issue(s); parsed {CHECKED_JSON} JSON files")
        for item in ERRORS[:100]:
            print(" - " + item)
        if len(ERRORS) > 100:
            print(f" - ... and {len(ERRORS)-100} more")
        return 1
    print(f"PASS: parsed {CHECKED_JSON} JSON files; 10 English packs, 2 Persian packs, both 76-text Original Douay-Rheims spelling forms, and reader safeguards validated.")
    print("NOTE: structural validation does not establish verse-by-verse translation accuracy or legal redistribution rights.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
