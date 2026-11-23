#!/usr/bin/env python3
"""Build compact, local verse-only search indexes for both Original Douay-Rheims spellings."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "data" / "bible-en" / "odr"
MANIFEST = BASE / "manifest.json"
METADATA = BASE / "metadata.json"
EXPECTED_VERSES = 37154


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build_variant(source_dir: Path, target: Path, books: list[dict]) -> int:
    rows: list[dict] = []
    for index, entry in enumerate(books):
        slug = entry["slug"]
        source = source_dir / f"{slug}.json"
        if not source.is_file():
            raise FileNotFoundError(f"Missing Original Douay-Rheims book: {source}")
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
            if chapter_number <= 0:
                continue
            verses = chapter.get("verses")
            if not isinstance(verses, list):
                raise ValueError(f"{source}: malformed verse list in chapter {chapter_number}")
            for verse in verses:
                if not isinstance(verse, dict):
                    raise ValueError(f"{source}: malformed verse in chapter {chapter_number}")
                verse_number = int(verse.get("verse", 0))
                text = verse.get("text")
                if verse_number <= 0 or not isinstance(text, str) or not text.strip():
                    continue
                rows.append({
                    "id": book_id,
                    "ch": chapter_number,
                    "v": verse_number,
                    "text": text,
                    "label": label,
                })
    if len(rows) != EXPECTED_VERSES:
        raise ValueError(f"{source_dir}: expected {EXPECTED_VERSES:,} scripture verses, found {len(rows):,}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{target.relative_to(ROOT)}: {len(rows):,} verse rows")
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
        if expected != EXPECTED_VERSES:
            raise ValueError(f"{variant}: metadata verse count does not match the reviewed expected count")
        build_variant(source_dir, target, books)


if __name__ == "__main__":
    main()
