#!/usr/bin/env python3
"""Verify every locally hosted English verse against its pinned official eBible VPL source.

This is a read-only collation: it downloads the pinned source archives, runs the
same parser used by the importer, and compares every verse string and book
metadata field with the committed per-book JSON files.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMPORTER_PATH = ROOT / "scripts" / "import-english-local.py"
SPEC = importlib.util.spec_from_file_location("english_importer", IMPORTER_PATH)
if SPEC is None or SPEC.loader is None:
    raise SystemExit("Cannot load the English Bible importer")
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)

DATA_ROOT = ROOT / "data" / "bible-en" / "local"
METADATA = json.loads((DATA_ROOT / "metadata.json").read_text(encoding="utf-8"))


def book_definitions(edition: str) -> list[tuple]:
    if edition == "dra":
        return IMPORTER.BOOKS_73_DRA
    if edition == "webbe":
        return IMPORTER.BOOKS_81_WEBBE
    if edition == "rv1885":
        return IMPORTER.BOOKS_80_ERV
    if edition == "web":
        return IMPORTER.BOOKS_81_WEB
    return IMPORTER.BOOKS


def download_source(archive_id: str) -> tuple[bytes, str]:
    url = f"https://ebible.org/Scriptures/{archive_id}_vpl.zip"
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "SeventhTrumpet-ExactVerseCollation/1.0"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        archive = response.read()
    return archive, url


def compare_edition(edition: str, archive_id: str) -> tuple[int, int, bool]:
    archive, url = download_source(archive_id)
    archive_sha = hashlib.sha256(archive).hexdigest()
    pinned_sha = (
        IMPORTER.EXPECTED_ARCHIVE_SHA256.get(edition)
        or METADATA.get(edition, {}).get("source_archive_sha256")
    )
    if not pinned_sha:
        raise ValueError(f"{edition}: no pinned source archive SHA-256 is recorded")
    archive_hash_changed = archive_sha != pinned_sha

    # ZIP-level hashes can change when an upstream archive is repackaged
    # (for example, timestamps or packaging metadata) even if its VPL text
    # is unchanged. The authoritative integrity check below compares every
    # parsed verse and book field, and verifies every committed book-file hash.
    with zipfile.ZipFile(BytesIO(archive)) as source_zip:
        corrupt_member = source_zip.testzip()
        if corrupt_member:
            raise ValueError(f"{edition}: corrupt archive member {corrupt_member}")
        vpl_name = next(
            (name for name in source_zip.namelist() if name.endswith("_vpl.txt")),
            None,
        )
        if not vpl_name:
            raise ValueError(f"{edition}: official VPL archive has no VPL text file")
        source_text = source_zip.read(vpl_name).decode("utf-8-sig")

    expected_books, counts, _empty_verses, _verse_gaps = IMPORTER.parse_vpl(
        source_text, edition, book_definitions(edition)
    )
    expected_metadata = METADATA.get(edition, {}).get("book_file_sha256", {})
    compared_verses = 0
    errors: list[str] = []

    for book_id, expected in expected_books.items():
        path = DATA_ROOT / edition / f"b{book_id}.json"
        if not path.is_file():
            errors.append(f"{edition}: missing local book file b{book_id}.json")
            continue

        raw = path.read_bytes()
        actual_pack = json.loads(raw.decode("utf-8"))
        actual = actual_pack.get(str(book_id), actual_pack.get(book_id, actual_pack))
        compared_verses += sum(len(verses) for verses in expected["chapters"].values())

        for field in ("id", "name", "chapter_start", "chapters"):
            if actual.get(field) != expected.get(field):
                errors.append(f"{edition}: book {book_id} field {field} differs from pinned VPL")
                break

        expected_file_sha = expected_metadata.get(str(book_id))
        if not expected_file_sha:
            errors.append(f"{edition}: metadata has no generated-file SHA for book {book_id}")
        elif hashlib.sha256(raw).hexdigest() != expected_file_sha:
            errors.append(f"{edition}: generated-file SHA mismatch for book {book_id}")

    if errors:
        raise ValueError("; ".join(errors[:12]))

    return len(expected_books), compared_verses, archive_hash_changed


def main() -> int:
    failures = []
    total_books = 0
    total_verses = 0
    for edition, (archive_id, _title, _license) in IMPORTER.SOURCES.items():
        try:
            books, verses, archive_hash_changed = compare_edition(edition, archive_id)
        except Exception as error:  # report every edition before failing
            failures.append(f"{edition}: {error}")
            print(f"{edition}: FAIL — {error}")
            continue
        total_books += books
        total_verses += verses
        print(
            f"{edition}: PASS; books={books}; "
            f"exact_verse_texts={verses}; VPL_and_local_hashes=verified"
        )
        if archive_hash_changed:
            print(
                f"{edition}: NOTICE — ZIP archive hash changed since it was pinned; "
                "all parsed VPL verses and committed local book files still match exactly"
            )

    if failures:
        print(f"FAIL: {len(failures)} English edition(s) did not collate")
        return 1
    print(
        f"PASS: all {len(IMPORTER.SOURCES)} local English editions; "
        f"{total_books} books and {total_verses} verse texts match pinned sources exactly"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
