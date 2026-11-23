#!/usr/bin/env python3
"""Build compact, local verse-only search indexes for both Original Douay-Rheims spellings.

The raw corpus has one chapter-zero introductory line in Tobias. Preserve it in
the source files, but exclude it from the scripture search index.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "data" / "bible-en" / "odr"
MANIFEST = BASE / "manifest.json"
METADATA = BASE / "metadata.json"
EXPECTED_SOURCE_ENTRIES = 37154
EXPECTED_SCRIPTURE_VERSES = 37153
EXPECTED_INTRO_ENTRIES = 1


def reject_duplicate_keys(pairs):
    """Reject repeated JSON object keys instead of silently overwriting them."""
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON object key: {key!r}")
        result[key] = value
    return result


def read_json(path: Path):
    return json.loads(
        path.read_text(encoding="utf-8"),
        object_pairs_hook=reject_duplicate_keys,
    )


def build_variant(source_dir: Path, target: Path, books: list[dict], file_hashes: dict[str, str]) -> int:
    rows: list[dict] = []
    source_entries = 0
    intro_entries = 0
    for index, entry in enumerate(books):
        slug = entry["slug"]
        source = source_dir / f"{slug}.json"
        if not source.is_file():
            raise FileNotFoundError(f"Missing Original Douay-Rheims book: {source}")
        relative_source = source.relative_to(BASE).as_posix()
        expected_hash = file_hashes.get(relative_source)
        if not expected_hash:
            raise ValueError(f"Missing pinned source hash for {relative_source}")
        actual_hash = hashlib.sha256(source.read_bytes()).hexdigest()
        if actual_hash != expected_hash:
            raise ValueError(f"Original Douay-Rheims source file hash mismatch: {relative_source}")
        data = read_json(source)
        chapters = data.get("chapters")
        if not isinstance(chapters, list):
            raise ValueError(f"{source}: missing chapters array")
        label = str(data.get("short_title") or slug)
        book_id = 1001 + index
        for chapter in chapters:
            if not isinstance(chapter, dict):
                raise ValueError(f"{source}: malformed chapter entry")
            chapter_number = int(chapter.get("chapter", 0))
            verses = chapter.get("verses")
            if not isinstance(verses, list):
                raise ValueError(f"{source}: malformed verse list in chapter {chapter_number}")
            for verse in verses:
                if not isinstance(verse, dict):
                    raise ValueError(f"{source}: malformed verse in chapter {chapter_number}")
                verse_number = int(verse.get("verse", 0))
                text = verse.get("text")
                if verse_number <= 0:
                    continue
                if not isinstance(text, str):
                    raise ValueError(f"{source}: verse {chapter_number}:{verse_number} has non-text content")
                source_entries += 1
                if chapter_number <= 0:
                    intro_entries += 1
                    continue
                rows.append({
                    "id": book_id,
                    "ch": chapter_number,
                    "v": verse_number,
                    "text": text,
                    "label": label,
                })
    if source_entries != EXPECTED_SOURCE_ENTRIES:
        raise ValueError(f"{source_dir}: expected {EXPECTED_SOURCE_ENTRIES:,} numbered source entries, found {source_entries:,}")
    if intro_entries != EXPECTED_INTRO_ENTRIES:
        raise ValueError(f"{source_dir}: expected {EXPECTED_INTRO_ENTRIES} chapter-zero introductory entry, found {intro_entries}")
    if len(rows) != EXPECTED_SCRIPTURE_VERSES:
        raise ValueError(f"{source_dir}: expected {EXPECTED_SCRIPTURE_VERSES:,} scripture verses, found {len(rows):,}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{target.relative_to(ROOT)}: {source_entries:,} source entries, {len(rows):,} scripture verse rows")
    return len(rows)


def main() -> None:
    manifest = read_json(MANIFEST)
    metadata = read_json(METADATA)
    books = manifest.get("books")
    if not isinstance(books, list) or len(books) != 76:
        raise ValueError("Original Douay-Rheims manifest must contain 76 texts")
    if metadata.get("license") != "CC0 1.0":
        raise ValueError("Original Douay-Rheims source licence metadata is not CC0 1.0")
    for variant, source_dir, target in (
        ("modern", BASE / "bible" / "raw", BASE / "search-index.json"),
        ("original", BASE / "original-spelling" / "bible" / "raw", BASE / "original-spelling" / "search-index.json"),
    ):
        expected = metadata.get("variants", {}).get(variant, {}).get("verses")
        if expected != EXPECTED_SOURCE_ENTRIES:
            raise ValueError(f"{variant}: raw source entry count does not match the reviewed expected count")
        build_variant(source_dir, target, books, metadata.get('file_sha256', {}))


if __name__ == "__main__":
    main()
