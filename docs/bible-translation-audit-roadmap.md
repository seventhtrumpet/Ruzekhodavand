# Bible Reader Audit and Translation Roadmap

Last reviewed: 2026-11-23
Repository: seventhtrumpet/Ruzekhodavand
Latest main reviewed: 31a524657b20e6d82360f87d95a4ca8456dae778

## Purpose

## Translation fidelity: Sabbath and Sunday

- Preserve every translation faithfully; never insert, delete, or alter wording to force a denominational position.
- Do not label Sunday as the biblical Sabbath or add a claim that Sunday is holy when that claim is not present in the source text.
- Keep the distinction visible in editorial notes: Genesis 2:2–3 and Exodus 20:8–11 identify the seventh day with the Sabbath; Mark 16:2 and Acts 20:7 refer to Sunday as the first day of the week.
- If a translation or edition contains a Sunday-related editorial heading, footnote, or interpretive gloss, distinguish it from the translated biblical text and identify it as editorial material. Do not silently rewrite it.
- Present translation history and church tradition neutrally. Readers may compare editions, but the site's own notes must not misrepresent what the source text says.
- Provide this explanation in Persian and English, separate from the verse text.


Keep Bible reading inside SeventhTrumpet.org, preserve useful complete translations when their reuse terms allow it, disclose the source and limitations of every edition, and progressively reduce dependence on third-party runtime services. Do not describe a translation as fully audited until a complete text-level comparison has actually been completed.

## Current reader inventory

### Persian

- **OPV — Old Persian Version:** served from the site's own `/data/bible-fa/opv/` files. The supplied USFM archive was structurally inspected: 66 books, 1,189 chapters, 31,090 original verse markers. The importer restores one Ezekiel 25:5 boundary that was joined to verse 25:4 in the source; two empty Job verse markers are preserved. This is a structural/import audit, not a complete linguistic or source-text collation.
- **OPCB — Open Persian Contemporary Bible:** 66 books, 1,189 chapters, 28,731 verse entries. A reproducible importer now converts the pinned upstream source into per-book JSON files under `/data/bible-fa/opcb/`; the reader fetches those same-origin files and no longer needs a CDN/Raw GitHub text fallback. The importer validates the complete book/chapter/verse structure and preserves verse wording. Genesis 1:1, Psalm 23:1, and John 3:16 were spot-checked against official eBible samples. This is not a full verse-by-verse comparison with the official USFM archive. The GitHub Actions import workflow completed successfully and committed all 66 per-book files plus the manifest, metadata, and attribution README. The generated dataset contains 1,189 chapters and 28,731 verses.
- **NMV — New Millennium Version:** not offered as a full-text option because written permission to host the complete text has not been obtained. Do not add an outbound reading link. Reconsider only after documented permission.

### English

The selector currently exposes these 14 choices:

1. KJV — King James Version
2. WEB — World English Bible
3. ASV — American Standard Version (1901)
4. ERV 1885 — English Revised Version
5. YLT — Young's Literal Translation (1898)
6. Webster — Webster's Bible (1833)
7. BBE — Bible in Basic English
8. BSB — Berean Standard Bible
9. WEBBE — World English Bible, British Edition
10. Darby — Darby Translation (1884)
11. DRA — Douay-Rheims 1899 (73-book Catholic canon)
12. Geneva — Geneva Bible 1599 (66 books)
13. Original Douay-Rheims — modernized spelling
14. Original Douay-Rheims — historical spelling

The reader requests chapter text from these runtime sources (the Original Douay-Rheims rows below are being migrated to same-origin data files):

| Translation(s) | Current chapter-data source | Runtime note |
|---|---|---|
| KJV, WEB, ASV, BBE, ERV 1885, YLT, Webster | Free.Bible | Chapter fetched on demand |
| BSB, WEBBE, Darby, DRA 1899 | bible-api.com | Chapter fetched on demand |
| Geneva 1599 | Bolls API | Chapter fetched on demand |
| Original Douay-Rheims, both spelling forms | Same-origin `/data/bible-en/odr/` files | Pinned 76-book manifest and 152 book JSON files |

The reader does not navigate visitors to these providers. English chapter data for several editions and Original Douay-Rheims remain upstream runtime dependencies; Persian OPV and OPCB are designed to load from same-origin local files.

The reader wrapper now retrieves the reviewed, pinned JavaScript core from the same-origin path `/js/bible-core-pinned.js`. The core itself is self-hosted; the selected Bible chapter data for several editions remains externally fetched.

## Rights and presentation rules

- Never assume that free-to-read means free to redistribute. Confirm the exact edition, source, licence, attribution, and any trademark or jurisdiction caveat before self-hosting.
- Preserve OPV and OPCB as separate Persian options. Never merge their text or silently substitute one for the other.
- Keep the 1899 Douay-Rheims and the original 1582/1609–1610 Douay-Rheims as separate editions.
- The original Douay-Rheims dataset has 76 listed texts: 73 in the Catholic canon plus three appendix texts (3 Esdras, 4 Esdras, and the Prayer of Manasses). Label the appendix clearly; do not imply that all 76 are part of the 73-book canon.
- Keep Geneva, Darby, and Catholic historical editions available for comparison when their complete texts and reuse terms permit. Explain historical context without treating a tradition label as proof that a translation is wrong or right.
- Do not add incomplete corpora to the full-Bible selector. If a partial corpus is ever shown, label it conspicuously as partial.
- Do not add NMV full text or an external reading link without documented permission and a clear user decision.
- Keep source and licence information on the site's own bilingual information page. A source citation is not a reason to send the reader away from the site's Bible reader.


## No-external-link and sharing policy

- Visitors must remain on **SeventhTrumpet.org** to read every offered translation. Never add an external reading-page link, external download link, or a button that opens a translation provider.
- The source/licence page may identify publishers, repositories, translators, and licence names as plain text for attribution. Do not make those names clickable outbound links.
- Verse/chapter sharing must contain only a canonical URL on `https://seventhtrumpet.org` (for example, `/bible.html?b=...&c=...&v=...`). Never append, expose, or substitute the source provider's URL in WhatsApp, Telegram, Signal, the system share sheet, copied text, or generated share images.
- Share-image branding and website text must use SeventhTrumpet.org assets and domain only. Do not use a translation provider's logo, domain, or preview image.
- Third-party data may still be fetched invisibly by the reader while migration is in progress; this is a runtime hosting dependency, not a visitor-facing link. The long-term goal remains to self-host every translation whose rights allow it.
- Regression checks must inspect both visible anchors and generated share payloads. A clean page with no external anchors is not sufficient if a share action can still leak a provider URL.

## Recommended engineering sequence

1. **Make the runtime core local.** Vendor the exact reviewed upstream core into the repository, document its upstream commit and local patches, and stop requiring jsDelivr/Raw GitHub to boot the reader.
2. **Create a reproducible data-import pipeline.** Prefer authorized downloadable source archives or repositories with clear redistribution terms. Do not scrape chapter APIs to build local copies when the provider's terms or documentation prohibit bulk extraction.
3. **Self-host eligible texts one edition at a time.** Begin with sources that provide a clear reusable complete dataset. Preserve exact source version, licence, attribution, checksum, book/chapter counts, and import script for each edition.
4. **Add automated integrity tests.** Verify every expected book and chapter, verse numbering, duplicate/missing verse keys, empty records, and selected known passages. Report anomalies rather than silently filling or dropping them.
5. **Keep an honest dependency table.** Until a translation is self-hosted and tested, state that chapter data is fetched from its named provider in the background. Do not call the reader fully independent while a live third-party dependency remains.
6. **Test real use.** Test Persian/English switching, OPV/OPCB selection, all book and chapter selectors, historical canon differences, mobile layout, offline/provider-failure behavior, and direct deep links. Code syntax checks alone do not establish browser correctness.

## Future project: translation from the original languages

This is a separate, long-term scholarly project, not a quick conversion of an existing English or Persian translation.

### Source-language scope

- **Hebrew:** the Hebrew portions of the Old Testament.
- **Aramaic:** the Aramaic portions of the Old Testament, including the relevant passages in Ezra and Daniel and other Aramaic passages.
- **Koine Greek:** the New Testament.

### Decisions required before translating

1. Select a specific base text edition for each language only after checking its textual basis, editorial method, manuscript policy, and licence. Do not silently mix editions.
2. Decide how textual variants will be represented: main reading, footnote, or apparatus note. Record meaningful differences rather than hiding them.
3. Publish a transparent translation philosophy: formal/dynamic balance, treatment of idioms, names, poetry, quotations, and theological terms.
4. Build a versioned glossary for key Hebrew, Aramaic, and Greek terms, with consistent Persian and English renderings where appropriate.
5. Keep source text, morphology/lexical notes, draft translation, reviewer comments, and final published text as separate data layers.
6. Require review by qualified readers of the original languages and independent theological/language review. AI may assist with comparison, consistency checks, and draft suggestions, but must not be presented as a substitute for qualified human review.
7. Where the source text or translation is disputed, show the issue and the reason for the chosen rendering in a concise note. Do not disguise interpretation as a certain lexical fact.
8. Version every published revision and keep a public changelog and correction process.

### Publication format

Each verse should be linked to its source-language text and stable reference. The reader should be able to view the Persian translation, English translation, original-language text, and concise translator notes without leaving SeventhTrumpet.org. The first release should be a clearly labelled pilot passage, not a claim that the entire Bible has already been translated.

## Audit status

- Reader selector and runtime source map: inspected in the latest main source.
- Reader JavaScript core: self-hosted at `/js/bible-core-pinned.js`; new deployment and real-browser verification still required.
- Bible reader and home-page preview metadata: external image-host URLs removed from the HTML metadata; verify production after next deployment.
- License-page visitor navigation: no external reading/download anchors remain in the inspected page; source names are plain text.
- Share payloads: the dedicated share module uses the canonical SeventhTrumpet.org URL. The legacy selected-verse share fallback now also uses the canonical domain, independent of preview host.
- OPV structure/import: previously inspected from the supplied USFM archive.
- OPCB importer and local reader path: implemented; GitHub Actions import completed successfully and generated 66 local per-book JSON files (1,189 chapters; 28,731 verses). The site still needs a successful Vercel deployment and browser test before production availability can be claimed. Three sample passages were compared with official eBible samples; not a full collation.
- Original Douay-Rheims: GitHub Actions import completed successfully; 76 files per spelling form, 1,361 chapters, and 37,154 JSON verse entries per form are stored locally. The 73-book Catholic canon and three appendix texts remain clearly distinguished. This is structural validation, not a full scholarly verse-by-verse collation.
- Seven English editions: official eBible VPL archive importer and same-origin reader path implemented. The importer was executed successfully in a sandbox against the seven pinned official archives. Each edition has 66 books and 1,189 chapters. Verse counts: WEB 31,103; ASV 31,102; YLT 31,102; Webster 31,102; Darby 31,099; Geneva 31,090; BSB 31,086. Empty markers and verse-number gaps are recorded and preserved, never filled from another translation. Genesis 1:1, Psalm 23:1, and John 3:16 were spot-checked against the existing provider outputs. Full verse-by-verse collation remains outstanding. GitHub Actions completed successfully and committed 462 per-book files (66 books × 7 translations), plus metadata and README; the JSON data occupies about 30.2 MB.
- Full verse-by-verse accuracy audit across every English and Persian edition: **not yet completed**.
- Real interactive browser/device testing of every selector and chapter: **not yet completed**.
- Complete self-hosting of every translation text: **not yet completed**; English versions other than Original Douay-Rheims still use upstream chapter services.
- Elimination of all third-party runtime dependencies across the whole website (including fonts, analytics, and unrelated services): **not yet completed**.
- Production deployment: the latest READY deployment on `seventhtrumpet.org` is commit `5c3ca44143bb6846d9821a010ff83b7457676c46` (7 local English editions plus the earlier Persian and Original Douay-Rheims work). Main is now at `f5442ca73c8b955109d7187da711972cf79b9665`, three commits ahead, including DRA 1899 and WEBBE. Vercel reports `build-rate-limit` for newer builds and the deployment API has a 24-hour daily limit; DRA/WEBBE are in main but not yet confirmed live.
