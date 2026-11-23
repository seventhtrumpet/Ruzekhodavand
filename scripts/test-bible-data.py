#!/usr/bin/env python3
"""Offline structural/regression checks for the self-hosted Bible reader.

These checks validate packaging and reader safeguards, not translation accuracy.
Run from the repository root: python scripts/test-bible-data.py
"""
from __future__ import annotations

import hashlib
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
ENGLISH = ["web", "asv", "ylt", "webster", "darby", "gnv", "bsb", "rv1885", "dra", "webbe", "msb"]
ERRORS: list[str] = []
CHECKED_JSON = 0


def fail(message: str) -> None:
    ERRORS.append(message)


def reject_duplicate_keys(pairs):
    """Reject duplicate JSON object keys instead of silently keeping the last value."""
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate object key {key!r}")
        result[key] = value
    return result


def check_duplicate_key_guard() -> None:
    """Prove the JSON parser rejects duplicate keys and accepts valid objects."""
    try:
        json.loads('{"book": 1, "book": 2}', object_pairs_hook=reject_duplicate_keys)
    except ValueError:
        pass
    else:
        fail("duplicate JSON object keys must be rejected")
    if json.loads('{"book": 1}', object_pairs_hook=reject_duplicate_keys) != {"book": 1}:
        fail("duplicate-key parser must preserve valid JSON objects")


def load_json(path: Path):
    global CHECKED_JSON
    try:
        data = json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=reject_duplicate_keys)
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


def check_persian_verse_totals() -> None:
    expected_totals = {"opv": 31091, "opcb": 28731}
    for edition, expected in expected_totals.items():
        base = ROOT / f"data/bible-fa/{edition}"
        actual = 0
        empty_markers = []
        for book_id in BOOK_IDS:
            path = base / f"b{book_id}.json"
            if not path.is_file():
                continue
            payload = load_json(path)
            book = payload.get(str(book_id), {}) if isinstance(payload, dict) else {}
            chapters = book.get("chapters", {}) if isinstance(book, dict) else {}
            if isinstance(chapters, dict):
                for chapter, verses in chapters.items():
                    if not isinstance(verses, dict):
                        continue
                    actual += len(verses)
                    empty_markers.extend(
                        f"{book_id}:{chapter}:{verse}"
                        for verse, text in verses.items() if text == ""
                    )
        if actual != expected:
            fail(f"{edition}: expected {expected:,} imported verse markers, found {actual:,}")
        if edition == "opv" and set(empty_markers) != {"220:35:1", "220:40:1"}:
            fail(f"OPV: expected only the two documented empty Job markers, found {sorted(empty_markers)}")
    opv_ezekiel = load_json(ROOT / "data/bible-fa/opv/b330.json")
    chapters = opv_ezekiel.get("330", {}).get("chapters", {}) if isinstance(opv_ezekiel, dict) else {}
    verse_four = chapters.get("25", {}).get("4", "")
    verse_five = chapters.get("25", {}).get("5", "")
    restored_boundary = "و ربه را آرامگاه شتران و (زمین ) بنی عمون را خوابگاه گله ها"
    if restored_boundary in verse_four or not verse_five.startswith(restored_boundary):
        fail("OPV: Ezekiel 25:5 must remain a separate restored verse without duplicating its wording in 25:4")


def check_english_metadata(available_english: list[str]) -> None:
    metadata = load_json(ROOT / "data/bible-en/local/metadata.json")
    if not isinstance(metadata, dict):
        fail("English local metadata must be a JSON object")
        return
    expected_ids = set(ENGLISH)
    if set(metadata) != expected_ids:
        fail(f"English metadata edition set mismatch; missing={sorted(expected_ids-set(metadata))}, extra={sorted(set(metadata)-expected_ids)}")
    if set(available_english) != expected_ids:
        fail(f"English local data-pack set mismatch; missing={sorted(expected_ids-set(available_english))}, extra={sorted(set(available_english)-expected_ids)}")
    for edition in ENGLISH:
        entry = metadata.get(edition)
        if not isinstance(entry, dict):
            continue
        counts = entry.get("counts")
        if not isinstance(counts, dict):
            fail(f"{edition}: metadata counts are missing")
            continue
        book_ids = BOOK_IDS + ([740,750,760,770,780,790,800] if edition in ("dra", "webbe") else [])
        actual_books = actual_chapters = actual_verses = actual_empty = 0
        for book_id in book_ids:
            path = ROOT / f"data/bible-en/local/{edition}/b{book_id}.json"
            if not path.is_file():
                continue
            payload = load_json(path)
            book = payload.get(str(book_id), {}) if isinstance(payload, dict) else {}
            chapters = book.get("chapters", {}) if isinstance(book, dict) else {}
            if not isinstance(chapters, dict):
                continue
            actual_books += 1
            actual_chapters += len(chapters)
            for verses in chapters.values():
                if not isinstance(verses, dict):
                    continue
                actual_verses += len(verses)
                actual_empty += sum(1 for verse_text in verses.values() if verse_text == "")
        actual = {
            "books": actual_books,
            "chapters": actual_chapters,
            "verses": actual_verses,
            "empty_verse_markers": actual_empty,
        }
        for key, value in actual.items():
            if counts.get(key) != value:
                fail(f"{edition}: metadata {key}={counts.get(key)!r} does not match local data ({value})")



def check_runtime_chapter_catalogue() -> None:
    """Compare every local edition's chapter count with the reader's catalogue."""
    core = (ROOT / "js/bible-core-pinned.js").read_text(encoding="utf-8")
    match = re.search(r"const CHAPTER_COUNTS = \{(.*?)\n  \};", core, re.S)
    if not match:
        fail("Pinned reader core is missing its chapter-count catalogue")
        return
    catalogue = {int(book): int(chapters) for book, chapters in re.findall(r"(\d+)\s*:\s*(\d+)", match.group(1))}
    editions = [(f"data/bible-en/local/{edition}", edition) for edition in ENGLISH]
    editions += [(f"data/bible-fa/{edition}", edition) for edition in ("opv", "opcb")]
    for relative, edition in editions:
        base = ROOT / relative
        for path in sorted(base.glob("b*.json")):
            file_match = re.fullmatch(r"b(\d+)\.json", path.name)
            if not file_match:
                continue
            book_id = int(file_match.group(1))
            payload = load_json(path)
            book = payload.get(str(book_id), {}) if isinstance(payload, dict) else {}
            chapters = book.get("chapters", {}) if isinstance(book, dict) else {}
            if not isinstance(chapters, dict):
                continue
            expected = catalogue.get(book_id)
            if edition == "dra" and book_id == 190:
                expected = 16
            if edition == "dra" and book_id == 340:
                expected = 14
            if expected is None:
                fail(f"{relative}/{path.name}: book {book_id} is absent from the reader chapter catalogue")
            elif len(chapters) != expected:
                fail(f"{relative}/{path.name}: reader catalogue expects {expected} chapters, local edition contains {len(chapters)}")


def check_odr() -> None:
    base = ROOT / "data/bible-en/odr"
    manifest = load_json(base / "manifest.json")
    if not isinstance(manifest, dict) or not isinstance(manifest.get("books"), list):
        fail("Original Douay-Rheims manifest is missing its books catalogue")
        return
    books = manifest["books"]
    if len(books) != 76:
        fail(f"Original Douay-Rheims: expected 76 listed texts, found {len(books)}")
    metadata = load_json(base / "metadata.json")
    hashes = metadata.get("file_sha256", {}) if isinstance(metadata, dict) else {}
    if len(hashes) != 152:
        fail(f"Original Douay-Rheims: expected 152 pinned source-file hashes, found {len(hashes)}")
    for relative, expected_hash in hashes.items():
        source_path = base / relative
        if not source_path.is_file():
            fail(f"Original Douay-Rheims: missing hashed source file {relative}")
            continue
        actual_hash = hashlib.sha256(source_path.read_bytes()).hexdigest()
        if actual_hash != expected_hash:
            fail(f"Original Douay-Rheims: source text integrity hash mismatch for {relative}")
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
    search = (ROOT / "js/bible_search.js").read_text(encoding="utf-8")
    admin = (ROOT / "admin.html").read_text(encoding="utf-8")
    admin_js = (ROOT / "js/admin.js").read_text(encoding="utf-8")

    if "code.replace(/  async function loadEnChapter" not in reader or "const requestUrl = isOdr" not in reader:
        fail("Runtime patch must replace the complete English chapter loader and define edition-specific request URLs")
    if "const localEnglishIds = ['web','asv','ylt','webster','darby','gnv','bsb','dra','webbe','rv1885','msb']" not in reader:
        fail("Runtime patch must enumerate every locally hosted English edition")

    # Keep the visible selector, local data packs, runtime loader allowlists,
    # and bilingual edition labels in sync. This prevents a selectable option
    # from silently falling back to an unrelated or unsupported edition.
    english_select = re.search(r'<select id="bible-version-select">(.*?)</select>', html, re.S)
    selector_ids = set(re.findall(r'<option value="([^"]+)"', english_select.group(1))) if english_select else set()
    supported_ids = set(ENGLISH) | {"kjv", "bbe", "odr", "odr-original"}
    if selector_ids != supported_ids:
        fail(f"English selector/runtime edition mismatch; missing={sorted(supported_ids-selector_ids)}, unsupported={sorted(selector_ids-supported_ids)}")
    local_lists = re.findall(r"const localEnglishIds = \[([^\]]+)\]", reader)
    expected_local = set(ENGLISH)
    if len(local_lists) < 2:
        fail("Both English chapter-loader paths must declare their local edition allowlists")
    for raw_list in local_lists:
        listed = set(re.findall(r"'([^']+)'", raw_list))
        if listed != expected_local:
            fail(f"Local English runtime allowlist mismatch; missing={sorted(expected_local-listed)}, extra={sorted(listed-expected_local)}")
    persian_select = re.search(r'<select id="persian-version-select"(.*?)</select>', html, re.S)
    persian_ids = set(re.findall(r'<option value="([^"]+)"', persian_select.group(0))) if persian_select else set()
    if persian_ids != {"opv", "opcb"}:
        fail(f"Persian selector must preserve both distinct local editions; found={sorted(persian_ids)}")
    for edition_id in supported_ids:
        has_label = re.search(r"(?<![A-Za-z0-9_-])" + re.escape(edition_id) + r"\s*:", reader) or ("'" + edition_id + "':") in reader
        if not has_label:
            fail(f"Reader display-label map is missing selector edition {edition_id}")
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
    if "Eleven English editions" not in reader or "KJV and BBE" not in reader:
        fail("Reader hosting note must distinguish local editions from remotely fetched KJV/BBE")
    if reader.count("'msb'") < 3 or "msb:'Majority Standard Bible'" not in reader:
        fail("MSB must be accepted in both selector allowlists and have its own reader label")
    if "Geneva uses Bolls chapter delivery" in reader or "Darby and Douay-Rheims use Bible API" in reader:
        fail("Reader contains obsolete external-provider hosting notice")

    meta = json.loads((ROOT / "data/bible-fa/meta.json").read_text(encoding="utf-8"))
    extra_ids = {740,750,760,770,780,790,800}
    persian_manifest = json.loads((ROOT / "data/bible-fa/manifest.json").read_text(encoding="utf-8"))
    if len(persian_manifest) != 66 or extra_ids.intersection({int(k) for k in persian_manifest}):
        fail("Persian OPV/OPCB availability must remain limited to their 66-book datasets")
    if len(meta) != 73 or not extra_ids.issubset({item.get("id") for item in meta}):
        fail("Book metadata must include 66 common books plus seven additional deuterocanonical books")

    core_counts = core[core.find("const CHAPTER_COUNTS"):core.find("const I18N")]
    for book_id, chapters in {740:14,750:16,760:19,770:51,780:6,790:16,800:15}.items():
        if not re.search(rf"\b{book_id}:{chapters}\b", core_counts):
            fail(f"Reader chapter-count map is missing book {book_id} ({chapters} chapters)")
    if "odrSlugById[id]" not in reader or "const odrBookSlug = b.slug || odrSlugById[id]" not in reader:
        fail("Original Douay-Rheims reader must prefer manifest slugs for dynamically numbered books and retain the legacy ID map as fallback")
    if "hasDeuterocanon" not in reader or "return hasDeuterocanon ? meta : meta.filter(b => b.id < 740)" not in reader:
        fail("Reader must show the expanded canon only for editions that contain it")
    if "hasDeuterocanon = ['dra','webbe','odr','odr-original']" not in reader:
        fail("WEBBE must expose its seven included deuterocanonical books in the reader")
    if "const expandedEsther = bookId === 190" not in reader or "expandedEsther ? 16" not in reader:
        fail("Douay-Rheims editions with expanded Esther must expose all 16 chapters")
    if "['dra','odr','odr-original'].indexOf(selectedTranslation)" not in reader:
        fail("Expanded Esther must be limited to DRA and Original Douay-Rheims, not WEBBE")
    for version, expected in (("dra",16),("webbe",10)):
        esther_path = ROOT / f"data/bible-en/local/{version}/b190.json"
        esther = load_json(esther_path)
        if isinstance(esther, dict):
            chapters = esther.get("190", {}).get("chapters", {})
            if len(chapters) != expected:
                fail(f"{version}: Esther should have {expected} chapters, found {len(chapters)}")
    for version, expected in (("dra",14),("webbe",12)):
        daniel_path = ROOT / f"data/bible-en/local/{version}/b340.json"
        daniel = load_json(daniel_path)
        if isinstance(daniel, dict):
            chapters = daniel.get("340", {}).get("chapters", {})
            if len(chapters) != expected:
                fail(f"{version}: Daniel should have {expected} chapters, found {len(chapters)}")
    if "expandedDaniel = bookId === 340 && ['dra','odr','odr-original']" not in reader:
        fail("DRA and Original Douay-Rheims must expose Daniel chapters 13-14 without changing WEBBE")
    if "const availableIds = availableBooks().map(b => b.id)" not in reader:
        fail("Switching to Persian must move away from books absent from Persian editions")
    if "odr-manifest-slug-fix-20261123" not in html or "odr-local-search-20261123" not in html:
        fail("Bible reader or search script URL is missing the latest cache-busting version")

    if "var SITE = 'https://seventhtrumpet.org'" not in share or "var SITE = 'https://seventhtrumpet.org'" not in photo:
        fail("Bible share scripts must use the canonical site origin")
    if "bible.html?b=" not in share or "return SITE + '/'" not in share:
        fail("Bible share payload must build canonical same-site reader URLs")
    if re.search(r"<script[^>]+(?:admin_cloud_hook|admin_edit_hook|cloud_sync)", admin, re.I):
        fail("Disabled admin page must not load legacy admin hooks")
    if "Intentionally inert" not in admin_js or re.search(r"\blocalStorage\s*\.|password|function\s+login", admin_js, re.I):
        fail("Legacy admin compatibility script must remain inert and credential-free")
    if "Textual-integrity note" not in html or "یادداشت امانت‌داری متن" not in html:
        fail("Bible reader must retain its bilingual textual-integrity note")
    fa_loader_start = search.find("  function loadFa() {")
    fa_loader_end = search.find("  function loadEn() {", fa_loader_start)
    fa_loader = search[fa_loader_start:fa_loader_end] if fa_loader_start >= 0 and fa_loader_end > fa_loader_start else ""
    if "function flattenLocalPersian" not in search or "data/bible-fa/' + version + '/b' + id + '.json" not in fa_loader:
        fail("Persian Bible search must build its index from the site's own per-book OPV/OPCB files")
    if any(host in fa_loader for host in ("cdn.jsdelivr.net", "fastly.jsdelivr.net", "raw.githubusercontent.com")):
        fail("Persian Bible search must not depend on external text/CDN providers")
    if "faLoadedVersion" not in search:
        fail("Switching between OPV and OPCB must invalidate the cached Persian search index")
    if "function flattenLocalEnglish" not in search or "data/bible-en/local/' + version + '/b' + id + '.json" not in search:
        fail("English Bible search must use the selected locally hosted edition when available")
    if "enLoadedVersion" not in search or "msb" not in search:
        fail("Switching English editions must refresh the selected local search index, including MSB")
    if "searchIds = searchIds.concat([740,750,760,770,780,790,800])" not in search or "flattenLocalEnglish(packs, searchIds)" not in search:
        fail("DRA and WEBBE English search must include all seven deuterocanonical books")
    if "bookId >= 740 && bookId <= 800" not in search:
        fail("English search scopes must include deuterocanonical books in All Bible and Old Testament")
    if "flattenOriginalDouaySearch" not in search or "original-spelling/search-index.json" not in search or "bookId >= 1001 && bookId <= 1076" not in search:
        fail("Both Original Douay-Rheims spelling variants must use their own local search index and expanded-canon scopes")
    if "Search remains KJV-based." in reader or "Original Douay-Rheims use the KJV fallback index" in reader:
        fail("Reader notes must not describe Original Douay-Rheims search as using the KJV fallback")
    if "both Original Douay-Rheims spelling forms still use the KJV fallback search index" in (ROOT / "bible-licenses.html").read_text(encoding="utf-8"):
        fail("Licence page must describe the new local Original Douay-Rheims search indexes accurately")
    if not (ROOT / "scripts/build-odr-search-index.py").is_file():
        fail("Original Douay-Rheims local search-index builder is missing")
    for index_path in (ROOT / "data/bible-en/odr/search-index.json", ROOT / "data/bible-en/odr/original-spelling/search-index.json"):
        if index_path.is_file():
            rows = load_json(index_path)
            if not isinstance(rows, list) or len(rows) != 37153:
                fail(f"{index_path.relative_to(ROOT)}: expected 37,153 scripture verse search rows (excluding Tobias chapter zero)")
            else:
                book_ids = set()
                malformed = False
                for row in rows:
                    if not isinstance(row, dict) or not all(k in row for k in ("id","ch","v","text","label")):
                        malformed = True
                        break
                    if not isinstance(row["id"], int) or not 1001 <= row["id"] <= 1076:
                        malformed = True
                        break
                    if not isinstance(row["ch"], int) or row["ch"] < 1 or not isinstance(row["v"], int) or row["v"] < 1:
                        malformed = True
                        break
                    if not isinstance(row["text"], str) or not isinstance(row["label"], str) or not row["label"]:
                        malformed = True
                        break
                    book_ids.add(row["id"])
                if malformed:
                    fail(f"{index_path.relative_to(ROOT)}: malformed verse row or non-scripture chapter")
                if len(book_ids) != 76:
                    fail(f"{index_path.relative_to(ROOT)}: expected search coverage for all 76 listed texts, found {len(book_ids)}")
    if "cdn.jsdelivr.net" not in search or "fastly.jsdelivr.net" not in search or "raw.githubusercontent.com" not in search:
        fail("KJV fallback sources must remain available until KJV/BBE rights and local source archives are fully reviewed")

def main() -> int:
    check_duplicate_key_guard()
    available_english = [version for version in ENGLISH if (ROOT / f"data/bible-en/local/{version}").is_dir()]
    check_english_metadata(available_english)
    for version in available_english:
        check_pack(f"data/bible-en/local/{version}", BOOK_IDS + ([740,750,760,770,780,790,800] if version in ("dra", "webbe") else []))
    check_pack("data/bible-fa/opcb", BOOK_IDS)
    check_pack("data/bible-fa/opv", BOOK_IDS)
    check_persian_verse_totals()
    check_runtime_chapter_catalogue()
    check_odr()
    check_reader_safeguards()
    if ERRORS:
        print(f"FAIL: {len(ERRORS)} issue(s); parsed {CHECKED_JSON} JSON files")
        for item in ERRORS[:100]:
            print(" - " + item)
        if len(ERRORS) > 100:
            print(f" - ... and {len(ERRORS)-100} more")
        return 1
    print(f"PASS: parsed {CHECKED_JSON} JSON files; {len(available_english)} English packs, 2 Persian packs, both 76-text Original Douay-Rheims spelling forms, and reader safeguards validated.")
    if "msb" not in available_english:
        print("NOTE: MSB files are generated by the official-source import workflow after this change reaches main.")
    print("NOTE: structural validation does not establish verse-by-verse translation accuracy or legal redistribution rights.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
