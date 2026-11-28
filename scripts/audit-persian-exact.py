#!/usr/bin/env python3
"""Compare local Persian editions with their pinned official source archives."""
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
OFFICIAL = load_importer("opcb_official_importer", "import-opcb-official.py")
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
                        empty_verses.append(f"{filename} {chapter_number}:{verse_number}")

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
        raise ValueError("OPV full-text search index differs from the source")
    return len(expected_books), total_verses


def compare_official_opcb() -> tuple[int, int, int]:
    request = urllib.request.Request(
        OFFICIAL.SOURCE_URL,
        headers={"User-Agent": "SeventhTrumpet-OPCB-Official-ExactCollation/1.0"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        archive = response.read()
    source_sha = hashlib.sha256(archive).hexdigest()
    if source_sha != OFFICIAL.EXPECTED_SHA256:
        raise ValueError(
            f"Official OPCB USFM archive SHA-256 changed: expected "
            f"{OFFICIAL.EXPECTED_SHA256}, received {source_sha}"
        )

    with zipfile.ZipFile(BytesIO(archive)) as source_zip:
        corrupt_member = source_zip.testzip()
        if corrupt_member:
            raise ValueError(f"Official OPCB corrupt archive member: {corrupt_member}")
        sources = {}
        for filename in source_zip.namelist():
            if not filename.lower().endswith(".usfm"):
                continue
            source = source_zip.read(filename).decode("utf-8-sig")
            code_match = re.search(r"^\\id\s+(\S+)", source, re.M)
            if code_match:
                sources[code_match.group(1)] = (filename, source)

    if set(sources) != set(OFFICIAL.BOOKS.values()) or len(sources) != 66:
        raise ValueError(f"Official OPCB expected 66 source books, found {len(sources)}")

    manifest = {}
    total_chapters = 0
    total_markers = 0
    total_ranges = 0
    for book_id, code in OFFICIAL.BOOKS.items():
        filename, source = sources[code]
        book = OFFICIAL.parse_usfm(source, book_id)
        heading = re.search(r"^\\h\s+(.+)$", source, re.M)
        book["name"] = OFFICIAL.clean_text(heading.group(1)) if heading else code
        expected = {str(book_id): book}
        local_path = PERSIAN_ROOT / "opcb-official" / f"b{book_id}.json"
        local = json.loads(local_path.read_text(encoding="utf-8"))
        if local != expected:
            raise ValueError(
                f"Official OPCB book {book_id} ({filename}): local data differs from USFM source"
            )
        manifest[str(book_id)] = [f"b{book_id}.json"]
        total_chapters += len(book["chapters"])
        for verses in book["chapters"].values():
            total_markers += len(verses)
            total_ranges += sum(1 for key in verses if "-" in key)

    local_manifest = json.loads(
        (PERSIAN_ROOT / "opcb-official" / "manifest.json").read_text(encoding="utf-8")
    )
    if local_manifest != manifest:
        raise ValueError("Official OPCB manifest differs from the 66-book source list")
    metadata = json.loads(
        (PERSIAN_ROOT / "opcb-official" / "metadata.json").read_text(encoding="utf-8")
    )
    expected_metadata = {
        "source_sha256": source_sha,
        "books": 66,
        "chapters": 1189,
        "verse_markers": 29469,
        "verse_range_markers": 913,
        "text_license": "CC BY-SA 4.0",
    }
    for key, value in expected_metadata.items():
        if metadata.get(key) != value:
            raise ValueError(
                f"Official OPCB metadata {key}={metadata.get(key)!r}; expected {value!r}"
            )
    if total_chapters != 1189 or total_markers != 29469 or total_ranges != 913:
        raise ValueError(
            f"Official OPCB totals mismatch: chapters={total_chapters}, "
            f"markers={total_markers}, ranges={total_ranges}"
        )
    return len(OFFICIAL.BOOKS), total_markers, total_ranges


def main() -> int:
    try:
        opv_books, opv_verses = compare_opv()
        print(
            f"OPV: PASS; books={opv_books}; exact_verse_records={opv_verses}; "
            "source_SHA256=verified"
        )
        official_books, official_markers, official_ranges = compare_official_opcb()
        print(
            f"OPCB official USFM: PASS; books={official_books}; "
            f"exact_verse_markers={official_markers}; preserved_ranges={official_ranges}; "
            "source_SHA256=verified"
        )
    except Exception as error:
        print(f"FAIL: {error}")
        return 1

    print(
        f"PASS: OPV and official OPCB; {opv_books + official_books} books, "
        f"{opv_verses} OPV records, {official_markers} OPCB markers, "
        f"and {official_ranges} source verse ranges verified."
    )
    print("NOTE: The earlier OPCB JSON edition remains available for user comparison; it is not certified by this exact-source audit.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
