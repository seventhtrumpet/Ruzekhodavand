#!/usr/bin/env python3
"""Verify both local Original Douay-Rheims spellings against the pinned source."""
from __future__ import annotations

import concurrent.futures
import hashlib
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "data" / "bible-en" / "odr"
COMMIT = "5bcc57fa20aae5acdc494c13b047b6287fec0b29"
SOURCE = f"https://raw.githubusercontent.com/janvier-s/original-douay-rheims/{COMMIT}"
VARIANTS = {
    "modern": ("bible/raw", BASE / "bible" / "raw", BASE / "search-index.json"),
    "original": (
        "original-spelling/bible/raw",
        BASE / "original-spelling" / "bible" / "raw",
        BASE / "original-spelling" / "search-index.json",
    ),
}
EXPECTED_BOOKS = 76
EXPECTED_CHAPTERS = 1361
EXPECTED_JSON_ENTRIES = 37154
EXPECTED_SCRIPTURE_VERSES = 37153
EXPECTED_INTRO_ENTRIES = 1


def reject_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON object key: {key!r}")
        result[key] = value
    return result


def read_json(raw: bytes, label: str):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=reject_duplicate_keys)
    except Exception as error:
        raise ValueError(f"{label}: invalid or duplicate-key JSON: {error}") from error


def download(path: str) -> bytes:
    request = urllib.request.Request(
        f"{SOURCE}/{path}",
        headers={"User-Agent": "SeventhTrumpet-ODR-ExactCollation/1.0"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()


def compare_variant(
    variant: str,
    source_dir: str,
    local_dir: Path,
    search_index_path: Path,
    books: list[dict],
    pinned_file_hashes: dict[str, str],
) -> tuple[int, int, int]:
    jobs = [(index, book["slug"], int(book["chapters"])) for index, book in enumerate(books)]

    def fetch_and_compare(job):
        book_index, slug, expected_chapters = job
        relative = f"{source_dir}/{slug}.json"
        source_raw = download(relative)
        expected_sha = pinned_file_hashes.get(relative)
        if not expected_sha:
            raise ValueError(f"{variant}: no pinned SHA-256 for {relative}")
        actual_sha = hashlib.sha256(source_raw).hexdigest()
        if actual_sha != expected_sha:
            raise ValueError(f"{variant}: pinned source SHA mismatch for {relative}")
        local_path = local_dir / f"{slug}.json"
        local_raw = local_path.read_bytes()
        if local_raw != source_raw:
            raise ValueError(f"{variant}: local raw file differs byte-for-byte: {relative}")
        data = read_json(source_raw, relative)
        if not isinstance(data.get("book"), str) or not data["book"].strip():
            raise ValueError(f"{variant}: missing title in {relative}")
        chapters = data.get("chapters")
        if not isinstance(chapters, list) or len(chapters) != expected_chapters:
            raise ValueError(
                f"{variant}: {slug} expected {expected_chapters} chapters"
            )
        rows = []
        source_entries = 0
        intro_entries = 0
        chapter_count = 0
        for chapter in chapters:
            if not isinstance(chapter, dict):
                raise ValueError(f"{variant}: malformed chapter in {relative}")
            chapter_number = int(chapter.get("chapter", 0))
            verses = chapter.get("verses")
            if not isinstance(verses, list):
                raise ValueError(f"{variant}: malformed verse list in {relative}")
            chapter_count += 1
            seen = set()
            for verse in verses:
                if not isinstance(verse, dict):
                    raise ValueError(f"{variant}: malformed verse in {relative}")
                verse_number = int(verse.get("verse", 0))
                text = verse.get("text")
                if verse_number <= 0:
                    continue
                if verse_number in seen:
                    raise ValueError(
                        f"{variant}: duplicate verse {slug} {chapter_number}:{verse_number}"
                    )
                seen.add(verse_number)
                if not isinstance(text, str) or not text.strip():
                    raise ValueError(
                        f"{variant}: empty verse {slug} {chapter_number}:{verse_number}"
                    )
                source_entries += 1
                if chapter_number <= 0:
                    intro_entries += 1
                    continue
                rows.append({
                    "id": 1001 + book_index,
                    "ch": chapter_number,
                    "v": verse_number,
                    "text": text,
                    "label": str(data.get("short_title") or slug),
                })
        return rows, source_entries, intro_entries, chapter_count

    all_rows = []
    total_entries = 0
    total_intro = 0
    total_chapters = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for rows, entries, intro, chapters_count in pool.map(fetch_and_compare, jobs):
            all_rows.extend(rows)
            total_entries += entries
            total_intro += intro
            total_chapters += chapters_count

    if total_chapters != EXPECTED_CHAPTERS:
        raise ValueError(f"{variant}: expected {EXPECTED_CHAPTERS} chapters, got {total_chapters}")
    if total_entries != EXPECTED_JSON_ENTRIES:
        raise ValueError(
            f"{variant}: expected {EXPECTED_JSON_ENTRIES} numbered source entries, got {total_entries}"
        )
    if total_intro != EXPECTED_INTRO_ENTRIES:
        raise ValueError(
            f"{variant}: expected {EXPECTED_INTRO_ENTRIES} chapter-zero entry, got {total_intro}"
        )
    if len(all_rows) != EXPECTED_SCRIPTURE_VERSES:
        raise ValueError(
            f"{variant}: expected {EXPECTED_SCRIPTURE_VERSES} scripture rows, got {len(all_rows)}"
        )

    local_index = read_json(search_index_path.read_bytes(), str(search_index_path))
    if local_index != all_rows:
        raise ValueError(f"{variant}: local search index differs from source verse records")

    return len(books), total_entries, len(all_rows)


def main() -> int:
    metadata = read_json((BASE / "metadata.json").read_bytes(), "ODR metadata")
    if metadata.get("source_commit") != COMMIT:
        raise ValueError("ODR source commit differs from the pinned importer commit")
    if metadata.get("license") != "CC0 1.0":
        raise ValueError("ODR source licence metadata is not CC0 1.0")
    if metadata.get("book_count_including_appendix") != EXPECTED_BOOKS:
        raise ValueError("ODR metadata must retain 76 source texts including appendices")

    modern_manifest_raw = download("manifest.json")
    original_manifest_raw = download("original-spelling/manifest.json")
    if hashlib.sha256(modern_manifest_raw).hexdigest() != metadata.get("source_manifest_sha256"):
        raise ValueError("ODR modern source manifest SHA-256 mismatch")
    if hashlib.sha256(original_manifest_raw).hexdigest() != metadata.get("original_spelling_manifest_sha256"):
        raise ValueError("ODR original-spelling source manifest SHA-256 mismatch")

    modern_manifest = read_json(modern_manifest_raw, "ODR modern manifest")
    original_manifest = read_json(original_manifest_raw, "ODR original-spelling manifest")
    books = modern_manifest.get("books")
    if not isinstance(books, list) or len(books) != EXPECTED_BOOKS:
        raise ValueError("ODR source manifest must list 76 texts")
    if original_manifest.get("books") != books:
        raise ValueError("ODR spelling variants do not share the same pinned book catalogue")
    if (BASE / "manifest.json").read_bytes() != modern_manifest_raw:
        raise ValueError("Local ODR manifest differs from the pinned modern source manifest")

    for variant, manifest in (("modern", modern_manifest), ("original", original_manifest)):
        counts = manifest.get("counts", {})
        if counts.get("chapters") != EXPECTED_CHAPTERS:
            raise ValueError(f"{variant}: source manifest chapter count mismatch")
        if counts.get("verses") != metadata.get("corpus_verses", {}).get(variant):
            raise ValueError(f"{variant}: source manifest corpus verse count mismatch")
        if counts.get("usfmVerses") != metadata.get("usfm_verse_lines"):
            raise ValueError(f"{variant}: source manifest USFM verse count mismatch")

    file_hashes = metadata.get("file_sha256", {})
    if len(file_hashes) != EXPECTED_BOOKS * len(VARIANTS):
        raise ValueError("ODR metadata must pin all 152 raw book files")

    total_books = 0
    total_entries = 0
    total_rows = 0
    for variant, (source_dir, local_dir, index_path) in VARIANTS.items():
        books_count, entries, rows = compare_variant(
            variant, source_dir, local_dir, index_path, books, file_hashes
        )
        total_books += books_count
        total_entries += entries
        total_rows += rows
        print(
            f"ODR {variant}: PASS; books={books_count}; "
            f"raw_verse_entries={entries}; indexed_scripture_verses={rows}; "
            "all 76 raw files match source bytes"
        )

    print(
        f"PASS: both ODR spellings; {total_books} book texts, "
        f"{total_entries} raw verse entries and {total_rows} indexed scripture rows "
        "verified against the pinned source"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
