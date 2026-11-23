# Persian Bible data and licensing

## OPCB JSON source and structural audit
The reader uses the official **Biblica® Open Persian Contemporary Bible 2022** text, whose rights holder publishes it under CC BY-SA 4.0. The source text is the pinned `fa_opcb.json` dataset from `thiagobodruk/bible`, commit `4c8b8a4a7bd75fee381e1b55523b152191d6a1a5`. A reproducible importer validates the complete source and converts it into per-book JSON files hosted locally under `opcb/`. The upstream repository's MIT licence covers only its file structure, scripts, and formatting, not the Bible text. The Bible text remains subject to Biblica's CC BY-SA 4.0 licence.

Structural audit of the pinned `fa_opcb.json`: 66 books, 1,189 chapters, and 28,731 verse entries; all 66 book chapter counts match the reader's expected counts, every chapter is an array, and no empty or non-string verse entries were found. Genesis 1:1, Psalm 23:1, and John 3:16 match the official eBible.org sample passages. This is a structural and sample comparison, not a full verse-by-verse collation against the official USFM file. The official USFM download is available at https://ebible.org/Scriptures/pesopcb_usfm.zip.

## OPCB — Persian Contemporary Bible
The reader loads the complete Biblica® Open Persian Contemporary Bible 2022 (OPCB) from the site's own `/data/bible-fa/opcb/` files as a separate translation. Copyright © 1995, 2005, 2018, 2022 Biblica, Inc. The text is distributed under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0). Keep the copyright/source notice, link to the licence, identify the structural JSON conversion, and distribute adaptations under the same licence. The verse wording is preserved; the Biblica® trademark is retained only with the unmodified source text.

Official source and license: https://ebible.org/details.php?id=pesopcb
License: https://creativecommons.org/licenses/by-sa/4.0/

## OPV — Old Persian Version
OPV is hosted locally in the `opv/` directory. eBible.org identifies this translation as public domain and credits Wycliffe Bible Translators.

Official source: https://ebible.org/bible/details.php?id=pesOPV

## NMV — New Millennium Version
The full NMV text is not hosted here. Elam Ministries permits limited quotations (up to 500 verses, subject to additional limits); larger use requires permission. Readers can open the publisher's reader at https://www.kalameh.org/en/bible.

## Legacy data
Old Persian JSON fragments that matched NMV were removed so the OPCB reader cannot accidentally mix NMV wording into OPCB, and the repository does not continue distributing those legacy fragments.
