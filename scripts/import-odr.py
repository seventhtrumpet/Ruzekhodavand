#!/usr/bin/env python3
"""Vendor both spelling forms of the pinned Original Douay-Rheims dataset.

The upstream dataset is CC0 1.0. This importer copies the source JSON files
without rewriting verse wording or mixing commentary into the verse text.
"""
from __future__ import annotations

import concurrent.futures
import hashlib
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "bible-en" / "odr"
COMMIT = "5bcc57fa20aae5acdc494c13b047b6287fec0b29"
BASE = f"https://raw.githubusercontent.com/janvier-s/original-douay-rheims/{COMMIT}"
EXPECTED_BOOKS = 76
EXPECTED_CHAPTERS = 1361
EXPECTED_JSON_VERSES = 37154
EXPECTED_MODERN_CORPUS_VERSES = 37202
EXPECTED_ORIGINAL_CORPUS_VERSES = 37180
EXPECTED_USFM_VERSES = 37153
VARIANTS = {
    "modern": "bible/raw",
    "original": "original-spelling/bible/raw",
}


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "SeventhTrumpet-ODR-import/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read()


def validate_book(raw: bytes, slug: str, expected_chapters: int) -> tuple[dict, int, int]:
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data.get("book"), str) or not data["book"].strip():
        raise ValueError(f"{slug}: source book title is missing")
    # The source manifest slug is authoritative; some source files use a display
    # title (for example, "Prayer of Manasses") in the `book` field instead.
    chapters = data.get("chapters")
    if not isinstance(chapters, list) or len(chapters) != expected_chapters:
        raise ValueError(f"{slug}: expected {expected_chapters} chapters")
    verses_total = 0
    for index, chapter in enumerate(chapters):
        if not isinstance(chapter, dict) or not isinstance(chapter.get("verses"), list):
            raise ValueError(f"{slug}: invalid chapter record {index}")
        numbers = set()
        for verse in chapter["verses"]:
            if not isinstance(verse, dict) or not isinstance(verse.get("verse"), int):
                raise ValueError(f"{slug}: invalid verse record in chapter {index}")
            number = verse["verse"]
            if number in numbers:
                raise ValueError(f"{slug}: duplicate verse {chapter.get('chapter')}:{number}")
            numbers.add(number)
            if not isinstance(verse.get("text"), str) or not verse["text"].strip():
                raise ValueError(f"{slug}: empty verse {chapter.get('chapter')}:{number}")
            verses_total += 1
    return data, len(chapters), verses_total


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_raw = download(f"{BASE}/manifest.json")
    manifest = json.loads(manifest_raw.decode("utf-8"))
    books = manifest.get("books")
    counts = manifest.get("counts", {})
    if not isinstance(books, list) or len(books) != EXPECTED_BOOKS:
        raise SystemExit("Pinned ODR manifest must list 76 books")
    if (
        counts.get("chapters") != EXPECTED_CHAPTERS
        or counts.get("verses") != EXPECTED_MODERN_CORPUS_VERSES
        or counts.get("usfmVerses") != EXPECTED_USFM_VERSES
    ):
        raise SystemExit("Pinned ODR manifest totals do not match the audited source counts")
    original_manifest_raw = download(f"{BASE}/original-spelling/manifest.json")
    original_manifest = json.loads(original_manifest_raw.decode("utf-8"))
    original_counts = original_manifest.get("counts", {})
    if (
        original_counts.get("chapters") != EXPECTED_CHAPTERS
        or original_counts.get("verses") != EXPECTED_ORIGINAL_CORPUS_VERSES
        or original_counts.get("usfmVerses") != EXPECTED_USFM_VERSES
    ):
        raise SystemExit("Original-spelling ODR manifest totals do not match the audited source counts")

    jobs = []
    for variant, source_dir in VARIANTS.items():
        for book in books:
            slug = book["slug"]
            jobs.append((variant, source_dir, slug, int(book["chapters"])))

    file_records = {}
    totals = {variant: {"chapters": 0, "verses": 0} for variant in VARIANTS}

    def process(job):
        variant, source_dir, slug, expected_chapters = job
        url = f"{BASE}/{source_dir}/{slug}.json"
        raw = download(url)
        data, chapters, verses = validate_book(raw, slug, expected_chapters)
        destination = OUT / source_dir / f"{slug}.json"
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(raw)
        return variant, f"{source_dir}/{slug}.json", hashlib.sha256(raw).hexdigest(), chapters, verses

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for variant, path, digest, chapters, verses in pool.map(process, jobs):
            file_records[path] = digest
            totals[variant]["chapters"] += chapters
            totals[variant]["verses"] += verses

    for variant in VARIANTS:
        if totals[variant]["chapters"] != EXPECTED_CHAPTERS:
            raise SystemExit(f"{variant}: chapter total mismatch: {totals[variant]}")
        if totals[variant]["verses"] != EXPECTED_JSON_VERSES:
            raise SystemExit(f"{variant}: verse total mismatch: {totals[variant]}")

    (OUT / "manifest.json").write_bytes(manifest_raw)
    metadata = {
        "translation": "Original Douay-Rheims (1582 / 1609-1610)",
        "source_repository": "janvier-s/original-douay-rheims",
        "source_commit": COMMIT,
        "source_manifest_sha256": hashlib.sha256(manifest_raw).hexdigest(),
        "original_spelling_manifest_sha256": hashlib.sha256(original_manifest_raw).hexdigest(),
        "license": "CC0 1.0",
        "book_count_including_appendix": EXPECTED_BOOKS,
        "canon_books": 73,
        "appendix_texts": ["3 Esdras", "4 Esdras", "Prayer of Manasses"],
        "corpus_verses": {"modern": EXPECTED_MODERN_CORPUS_VERSES, "original": EXPECTED_ORIGINAL_CORPUS_VERSES},
        "json_verse_entries_per_variant": EXPECTED_JSON_VERSES,
        "usfm_verse_lines": EXPECTED_USFM_VERSES,
        "source_note": "The corpus count includes verse-0 fragments folded into summary continuations; JSON verse arrays contain 37,154 scripture verse entries. Tobias chapter 0 is introductory and is not shown as a scripture chapter.",
        "variants": totals,
        "file_sha256": file_records,
        "format_note": "Source JSON copied byte-for-byte; verse wording and annotations are unchanged in storage. Reader displays verse text only.",
    }
    (OUT / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "README.md").write_text(
        "# Original Douay-Rheims local dataset\n\n"
        "Source: janvier-s/original-douay-rheims, pinned commit " + COMMIT + ".\n"
        "Licence: CC0 1.0. The source marks this dataset beta.\n"
        "Both modernized and original spelling source JSON files are copied without changing their text. "
        "The reader displays verse text only; annotations, notes, and front matter are not rendered as scripture.\n"
        "The 76 listed texts comprise the 73-book Catholic canon plus 3 appendix texts.\n",
        encoding="utf-8",
    )
    print(f"Imported Original Douay-Rheims: 76 texts, 1,361 chapters, 37,154 JSON verse entries in each spelling form. Corpus counts: 37,202 modern / 37,180 original; USFM: 37,153.")


if __name__ == "__main__":
    main()
