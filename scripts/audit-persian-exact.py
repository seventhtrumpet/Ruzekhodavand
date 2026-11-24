#!/usr/bin/env python3
"""Compare every locally hosted Persian verse with its pinned upstream source."""
from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_importer(module_name: str, path: str):
    spec = importlib.util.spec_from_file_location(module_name, ROOT / "scripts" / path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Cannot load importer: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


OPV = load_importer("opv_importer", "import-opv.py")
OPCB = load_importer("opcb_importer", "import-opcb.py")
PERSIAN_ROOT = ROOT / "data" / "bible-fa"


def compare_opv() -> tuple[int, int]:
    archive = OPV.download_archive()
    archive_sha = hashlib.sha256(archive).hexdigest()
    if archive_sha != OPV.EXPECTED_ARCHIVE_SHA256:
        raise ValueError(
            f"OPV source archive SHA-256 changed: expected "
            f"{OPV.EXPECTED_ARCHIVE_SHA256}, received {archive_sha}"
        )

    with zipfile.ZipFile(BytesIO(archive)) as source_zip:
        corrupt_member = source_zip.testzip()
        if corrupt_member:
            raise ValueError(f"OPV corrupt archive member: {corrupt_member}")
        names = sorted(
            (name for name in source_zip.namelist() if name.endswith(".usfm")),
            key=lambda name: int(name.split("-", 1)[0]),
        )
        if len(names) != 66:
            raise ValueError(f"OPV expected 66 USFM books, found {len(names)}")

        expected_books = []
        empty_verses = []
        total_chapters = 0
        total_verses = 0

        for filename, book_id in zip(names, OPV.IDS):
            source = source_zip.read(filename).decode("utf-8-sig")
            code_match = re.search(r"^\\id\s+(\S+)", source, re.M)
            file_code = re.search(r"^\d+-(.+?)pesOPV\.usfm$", filename)
            if (
                not code_match
                or not file_code
                or code_match.group(1) != file_code.group(1)
            ):
                raise ValueError(f"OPV source book ID mismatch: {filename}")

            chapters = OPV.parse_usfm(source, book_id)
            expected_count = OPV.CHAPTER_COUNTS[book_id]
            if len(chapters) != expected_count:
                raise ValueError(
                    f"OPV book {book_id}: expected {expected_count} chapters, "
                    f"found {len(chapters)}"
                )
            if sorted(map(int, chapters)) != list(range(1, expected_count + 1)):
                raise ValueError(f"OPV book {book_id}: non-contiguous chapter numbering")

            # The source appends Ezekiel 25:5 to the end of 25:4. Restore only
            # the verse boundary; the original words remain unchanged.
            if book_id == 330:
                verse_four = chapters["25"]["4"]
                if OPV.EZEKIEL_25_5 not in verse_four:
                    raise ValueError("OPV source no longer contains the Ezekiel 25:5 boundary")
                before, after = verse_four.split(OPV.EZEKIEL_25_5, 1)
                chapters["25"]["4"] = before.rstrip()
                chapters["25"]["5"] = (OPV.EZEKIEL_25_5 + after).strip()

            for chapter_number, verses in chapters.items():
                verse_numbers = sorted(map(int, verses))
                if verse_numbers != list(range(1, max(verse_numbers) + 1)):
                    raise ValueError(
                        f"OPV book {book_id}, chapter {chapter_number}: verse gap"
                    )
                for verse_number, verse_text in verses.items():
                    if not verse_text:
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
            local_path = PERSIAN_ROOT / "opv" / f"b{book_id}.json"
            local = json.loads(local_path.read_text(encoding="utf-8"))
            if local != payload:
                raise ValueError(f"OPV book {book_id}: local verse text differs from source")

            expected_books.append(payload[str(book_id)])
            total_chapters += len(chapters)
            total_verses += sum(len(verses) for verses in chapters.values())

    expected_empty = {
        "19-JOBpesOPV.usfm 35:1",
        "19-JOBpesOPV.usfm 40:1",
    }
    if set(empty_verses) != expected_empty:
        raise ValueError(f"OPV empty verse markers differ from source: {empty_verses}")
    if total_chapters != 1189 or total_verses != 31091:
        raise ValueError(
            f"OPV totals mismatch: chapters={total_chapters}, verses={total_verses}"
        )

    index = json.loads((PERSIAN_ROOT / "opv" / "index.json").read_text(encoding="utf-8"))
    if index.get("version") != "OPV" or index.get("books") != expected_books:
        raise ValueError("OPV full-text search index differs from the source books")

    return len(expected_books), total_verses


def compare_opcb() -> tuple[int, int]:
    request = urllib.request.Request(
        OPCB.SOURCE_URL,
        headers={"User-Agent": "SeventhTrumpet-OPCB-ExactCollation/1.0"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        raw = response.read()

    metadata_path = PERSIAN_ROOT / "opcb" / "metadata.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    source_sha = hashlib.sha256(raw).hexdigest()
    if source_sha != metadata.get("source_sha256"):
        raise ValueError("OPCB source SHA-256 differs from pinned metadata")
    if metadata.get("source_commit") != OPCB.SOURCE_COMMIT:
        raise ValueError("OPCB source commit differs from importer pin")

    source_books = json.loads(
        raw.decode("utf-8"),
        object_pairs_hook=OPCB.reject_duplicate_keys,
    )
    if not isinstance(source_books, list) or len(source_books) != 66:
        raise ValueError("OPCB source must contain exactly 66 books")

    expected_manifest = {}
    total_chapters = 0
    total_verses = 0

    for index, book_id in enumerate(OPCB.BOOK_IDS):
        source_book = source_books[index]
        chapters = source_book.get("chapters")
        expected_chapters = OPCB.CHAPTER_COUNTS[book_id]
        if not isinstance(chapters, list) or len(chapters) != expected_chapters:
            raise ValueError(
                f"OPCB book {book_id}: expected {expected_chapters} chapters"
            )

        numbered_chapters = {}
        for chapter_number, verses in enumerate(chapters, start=1):
            if not isinstance(verses, list) or not verses:
                raise ValueError(f"OPCB book {book_id}, chapter {chapter_number}: invalid")
            verse_map = {}
            for verse_number, verse_text in enumerate(verses, start=1):
                if not isinstance(verse_text, str) or not verse_text.strip():
                    raise ValueError(
                        f"OPCB book {book_id}, {chapter_number}:{verse_number}: invalid"
                    )
                verse_map[str(verse_number)] = verse_text
                total_verses += 1
            numbered_chapters[str(chapter_number)] = verse_map
            total_chapters += 1

        expected_payload = {
            str(book_id): {
                "id": book_id,
                "name": str(source_book.get("name") or ""),
                "chapters": numbered_chapters,
            }
        }
        local_path = PERSIAN_ROOT / "opcb" / f"b{book_id}.json"
        local = json.loads(local_path.read_text(encoding="utf-8"))
        if local != expected_payload:
            raise ValueError(f"OPCB book {book_id}: local verse text differs from source")
        expected_manifest[str(book_id)] = f"b{book_id}.json"

    if total_chapters != 1189 or total_verses != OPCB.EXPECTED_VERSES:
        raise ValueError(
            f"OPCB totals mismatch: chapters={total_chapters}, verses={total_verses}"
        )
    manifest = json.loads(
        (PERSIAN_ROOT / "opcb" / "manifest.json").read_text(encoding="utf-8")
    )
    if manifest != expected_manifest:
        raise ValueError("OPCB local manifest differs from the source book list")

    return len(OPCB.BOOK_IDS), total_verses


def main() -> int:
    try:
        opv_books, opv_verses = compare_opv()
        print(
            f"OPV: PASS; books={opv_books}; exact_verse_records={opv_verses}; "
            "source_SHA256=verified"
        )
        opcb_books, opcb_verses = compare_opcb()
        print(
            f"OPCB: PASS; books={opcb_books}; exact_verse_texts={opcb_verses}; "
            "source_SHA256=verified"
        )
    except Exception as error:
        print(f"FAIL: {error}")
        return 1

    print(
        f"PASS: both local Persian editions; "
        f"{opv_books + opcb_books} books and {opv_verses + opcb_verses} "
        "verse records match pinned sources exactly"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
