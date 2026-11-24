#!/usr/bin/env python3
"""Compare every official local-English VPL archive with the importer's declared book catalogue."""
from __future__ import annotations
import hashlib
import importlib.util
import json
import re
import urllib.request
import zipfile
from collections import OrderedDict
from io import BytesIO
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("english_importer", ROOT / "scripts" / "import-english-local.py")
if SPEC is None or SPEC.loader is None:
    raise SystemExit("Cannot load English importer catalogue")
IMPORTER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(IMPORTER)
METADATA_PATH = ROOT / "data" / "bible-en" / "local" / "metadata.json"
METADATA = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
LINE_RE = re.compile(r"^([A-Z0-9]{3})\s+(\d+):(\d+)\s+(.*)$")

def definitions(edition: str):
    if edition == "web":
        return IMPORTER.BOOKS_81_WEB
    if edition == "dra":
        return IMPORTER.BOOKS_73_DRA
    if edition == "webbe":
        return IMPORTER.BOOKS_73_WEBBE
    return IMPORTER.BOOKS

failures = []
for edition, (archive_id, title, licence) in IMPORTER.SOURCES.items():
    url = f"https://ebible.org/Scriptures/{archive_id}_vpl.zip"
    req = urllib.request.Request(url, headers={"User-Agent": "SeventhTrumpet-English-VPL-Coverage-Audit/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response:
        archive = response.read()
    digest = hashlib.sha256(archive).hexdigest()
    pinned = IMPORTER.EXPECTED_ARCHIVE_SHA256.get(edition) or METADATA.get(edition, {}).get("source_archive_sha256")
    if pinned and digest != pinned:
        failures.append(f"{edition}: archive SHA-256 changed (expected {pinned}, got {digest})")
        continue
    with zipfile.ZipFile(BytesIO(archive)) as zf:
        bad = zf.testzip()
        if bad:
            failures.append(f"{edition}: corrupt archive member {bad}")
            continue
        txt_name = next((name for name in zf.namelist() if name.endswith("_vpl.txt")), None)
        if not txt_name:
            failures.append(f"{edition}: missing VPL text file")
            continue
        source = zf.read(txt_name).decode("utf-8-sig")
    actual = OrderedDict()
    for line_no, line in enumerate(source.splitlines(), 1):
        if not line.strip():
            continue
        match = LINE_RE.match(line)
        if not match:
            failures.append(f"{edition}: unparsed VPL line {line_no}: {line[:100]!r}")
            continue
        code, chapter, verse, text = match.groups()
        actual.setdefault(code, {"chapters": set(), "verses": 0})
        actual[code]["chapters"].add(int(chapter))
        actual[code]["verses"] += 1
    expected_codes = {
        IMPORTER.CODE_ALIASES.get(code, code)
        for _, code, _, _ in definitions(edition)
    }
    actual_codes = set(actual)
    unknown = sorted(actual_codes - expected_codes)
    missing = sorted(expected_codes - actual_codes)
    print(f"{edition}: source_codes={len(actual_codes)} expected_codes={len(expected_codes)} "
          f"verses={sum(v['verses'] for v in actual.values())} sha256={digest}")
    print(f"  UNKNOWN_SOURCE_CODES={','.join(unknown) if unknown else 'none'}")
    print(f"  MISSING_EXPECTED_CODES={','.join(missing) if missing else 'none'}")
    if unknown:
        labels = {
            "BEL": "Bel and the Dragon", "SUS": "Susanna",
            "PRA": "Prayer of Azariah", "PRM": "Prayer of Manasses",
            "ESG": "Esther (Greek)", "DNG": "Daniel (Greek)",
            "1ES": "1 Esdras", "4ES": "2 Esdras",
            "3MA": "3 Maccabees", "4MA": "4 Maccabees",
            "PSX": "Psalm 151", "TOB": "Tobit", "JDT": "Judith",
            "WIS": "Wisdom", "SIR": "Sirach", "BAR": "Baruch",
            "1MA": "1 Maccabees", "2MA": "2 Maccabees",
        }
        for code in unknown:
            item = actual[code]
            print(f"  UNKNOWN_DETAIL {code} ({labels.get(code, 'unmapped source text')}): "
                  f"chapters={len(item['chapters'])} verses={item['verses']} "
                  f"chapter_numbers={','.join(map(str, sorted(item['chapters'])))}")
    if unknown or missing:
        failures.append(f"{edition}: source/import catalogue mismatch")
if failures:
    raise SystemExit("\n".join(failures))
print("PASS: every official English VPL archive matches its declared complete book catalogue.")
