# Bible Reader Audit and Translation Roadmap

Last reviewed: 2026-11-23
Repository: seventhtrumpet/Ruzekhodavand
Latest reader-code commit reviewed: 397ca1cafaadaa8372e0f1b0da75ad14076a87a2
Latest importer-code commit reviewed: 6a2e748ee37f2d295696f975f404263adeff6ce7 (OPV source archive checksum pin).
Recent main commits: 952dc50996461733287dde43e3bc14630321e45b (licence-page corrections), 5c60083c427a4e9891803f33f4ef26c507b26be2 (KJV rights label), 1ee801b8394a5daea9b83f65b0d4574cae88299a (audit results), 87a504f3b985ac20bd281e16c1bc044426fba10f (importer scope wording), 6a2e748ee37f2d295696f975f404263adeff6ce7 (OPV archive checksum pin), and e68ede1ac758202bec74bf878cc645bef63b3ef1 (OPV data regenerated with the pinned archive).

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

The reader requests chapter text from these runtime sources:

| Translation(s) | Current chapter-data source in main | Runtime note |
|---|---|---|
| KJV, BBE | Free.Bible | The only remaining external translation-text service in main; background fetch only |
| WEB Classic, ASV, YLT, Webster, Darby, Geneva, BSB, ERV 1885 | Same-origin `/data/bible-en/local/{translation}/b{bookId}.json` | 66 books each |
| DRA 1899 | Same-origin `/data/bible-en/local/dra/` | 73 books; Esther has 16 chapters and Daniel 14 |
| WEBBE | Same-origin `/data/bible-en/local/webbe/` | 73 books |
| Original Douay-Rheims, both spelling forms | Same-origin `/data/bible-en/odr/` files | 76 listed texts: 73 canonical books plus three appendix texts |
| OPV, OPCB | Same-origin `/data/bible-fa/` files | 66 books each |

The reader does not navigate visitors to translation providers. In main, only KJV and BBE still fetch chapter text from Free.Bible in the background. Ten English editions are served from local files, alongside both original Douay-Rheims spelling forms and the two Persian editions. No outbound provider-reading links are offered.

The reader wrapper loads the pinned JavaScript core from the same-origin path `/js/bible-core-pinned.js`. The core is self-hosted; jsDelivr, Raw GitHub, Bible-API.com, and Bolls runtime fallback URLs have been removed from the main reader code. Unknown translation IDs resolve only to same-origin local paths.

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

- Reader selector and runtime source map: inspected in main; all 14 English selector choices remain present. The KJV selector label now says that rights vary by jurisdiction rather than implying blanket public-domain status outside the UK.
- Production data-file smoke test: all 964 JSON-file URLs found under the local English, Original Douay-Rheims, OPV, and OPCB data trees returned HTTP 200 from `www.seventhtrumpet.org`. All 964 files parse as JSON. The 958 per-book payload files (674 local English, 152 Original Douay-Rheims raw files across both spellings, 66 OPV, and 66 OPCB) passed book/chapter/verse structural checks; the other six files are metadata, manifest, or index JSON. This checks availability and structure, not translation accuracy.
- Reproducible source-to-output audit: all ten official English VPL archives were downloaded again, their pinned SHA-256 hashes and Public Domain notices passed, and the importer reproduced all 674 English per-book JSON files byte-for-byte; English metadata and README also matched (676 files total). The pinned OPCB importer reproduced all 69 files byte-for-byte (66 book files, manifest, metadata, and README). The pinned Original Douay-Rheims importer reproduced all 155 files byte-for-byte across both spelling forms (152 raw book files, manifest, metadata, and README). The OPV importer was updated to pin the current official eBible USFM archive SHA-256 (`dfadecb7be54dbde66059cb113c46b03586f11ff0adee57493ec2c75e7bf9769`); its reimport reproduced all 68 files byte-for-byte (66 book files, index, and README). These tests establish exact reproduction from the selected source archives, not full collation against Hebrew, Aramaic, Greek, or independent translation editions.
- Empty verse markers: 68 empty markers were found and preserved across the checked self-hosted payloads (ASV 16, ERV 1885 16, WEB 5, WEBBE 29, and OPV 2). They were not filled from another translation.
- Original Douay-Rheims editorial material: the two spelling-form source trees contain 152 raw book files, 2,722 chapters, and 74,308 verse records. A scan found 229 historical notes containing the word “Sunday”, including lectionary labels and interpretive marginal notes. The reader's import patch extracts only each verse number and `verse.text`; it does not render `notes`, summaries, introductions, or historical front matter as Scripture. These source notes are editorial apparatus, not Bible verse text. The bilingual licence page now explicitly explains this distinction.
- Reader JavaScript core: self-hosted at `/js/bible-core-pinned.js`; syntax checks pass and the production page returns HTTP 200. A fresh Playwright attempt still could not launch Chromium in the Vercel sandbox because the base image lacks `libglib-2.0.so.0` and the package manager could not complete dependency installation. Full interactive browser/device testing is still required.
- Bible reader and home-page preview metadata: third-party image-host URLs removed from the HTML metadata; the live reader HTML has no external OG image.
- License-page visitor navigation: live `/bible-licenses.html` returns HTTP 200 and has no external reading/download anchors; source names and licence names are plain text.
- Share payloads: live share scripts return HTTP 200 and use the canonical SeventhTrumpet.org URL for WhatsApp, Telegram, Signal, system share, copy, and generated share images; no Bible-provider URL is included in the share content.
- OPV: supplied USFM structure checked (66 books, 1,189 chapters, 31,090 original verse markers); one Ezekiel 25:5 boundary is restored by the importer and two empty Job markers are preserved.
- OPCB: 66 books, 1,189 chapters, 28,731 verse entries; GitHub Actions imported all 66 per-book files locally. Three passages were spot-checked against official eBible samples; not a full collation.
- Original Douay-Rheims: both spelling forms imported locally; 76 listed texts, 1,361 chapters, and 37,154 JSON verse entries per form. The 73-book Catholic canon and three appendix texts are distinguished. The corpus count differs because verse-0 fragments are folded into summary continuations and Tobias chapter 0 is introductory.
- Ten English editions are now self-hosted in main and the current production deployment: WEB Classic (31,103 verses), ASV (31,102), YLT (31,102), Webster (31,102), Darby (31,099), Geneva (31,090), BSB (31,086), ERV 1885 (31,102), DRA 1899 (35,811), and WEBBE (35,197). The local English tree contains 674 per-book JSON files and about 43 MB of JSON text. DRA has 73 books/1,334 chapters; WEBBE has 73 books/1,326 chapters.
- The English importer pins official eBible VPL archive SHA-256 hashes, checks the source archive's Public Domain notice, validates book/chapter structure, and records empty verse markers and verse-number gaps. It never fills an omitted verse from another translation. Genesis 1:1, Psalm 23:1, and John 3:16 were spot-checked against the previous provider; full verse-by-verse collation remains outstanding.
- Translation fidelity: no verse text is rewritten to declare Sunday holy or to call Sunday the Sabbath. The reader's Persian/English editorial note is separate from the verse text. Source headings, including historical headings that mention the first day of the week, remain clearly identified as source material.
- Remaining translation-text dependency in main and production: Free.Bible for KJV and BBE only. KJV rights in the Authorized Version are vested in the Crown in the United Kingdom and administered by Cambridge University Press under Letters Patent; US public-domain status does not settle worldwide reuse. eBible.org describes BBE as public domain in the United States because it was published without a copyright notice there, but that statement does not establish worldwide public-domain status. Keep both editions as background fetches unless jurisdiction-appropriate redistribution rights are documented. ERV 1885 is self-hosted from the official eBible VPL archive, whose embedded notice identifies it as Public Domain.
- Other website dependencies (for example, Google Fonts, Firebase, analytics, and unrelated site scripts) are separate from Bible translation text and have not all been localized.
- Full verse-by-verse accuracy audit across every English and Persian edition: **not yet completed**. The 964-file production smoke test and 958-payload structure check do not establish textual fidelity.
- Real interactive browser/device testing of every selector and chapter: **not yet completed**; the current sandbox browser launch remains blocked by a missing system library.
- Latest production deployment `dpl_HUcJJeQMyrvjdEXMBTxpZdrL6ME9` is `READY` for commit `2ea342c5c7ba6c7d5e82665f4e4ed9aebe107d1d`; aliases include `www.seventhtrumpet.org` and `seventhtrumpet.org`. This deployment includes the corrected bilingual licence page, the jurisdiction-qualified KJV selector label, the OPV archive checksum pin, and the updated audit/importer documentation. The current main branch has subsequent audit-document-only updates; the website content in the latest production deployment has been verified live. Both `/bible.html` and `/bible-licenses.html` return HTTP 200, the KJV label and Original Douay-Rheims editorial-note explanation are present, neither page has external anchor links, and the stale Bible API/Bolls descriptions are gone. All 964 local Bible JSON endpoints returned HTTP 200 on the deployed site. The apex domain redirects to `www` with HTTP 308. A Playwright browser attempt could not launch because the sandbox lacks `libglib-2.0.so.0`; interactive device testing remains outstanding.

