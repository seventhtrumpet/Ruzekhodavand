# Bible Reader Audit and Translation Roadmap

Last reviewed: 2026-11-23 (including MSB reader fix, cache refresh, and selector/runtime regression guard)
Repository: seventhtrumpet/Ruzekhodavand
Latest main commit reviewed: 76630ae251cba51ac4ace419b08e692c426475fc (PR #57 selector/runtime regression guard)
Latest reader-code fixes: PR #55 (MSB saved-version and change-handler allowlists) and PR #56 (cache-busting refresh)
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

The selector currently exposes these 15 choices (11 locally hosted editions, two Original Douay-Rheims spelling forms, and KJV/BBE):

1. KJV — King James Version
2. WEB — World English Bible
3. ASV — American Standard Version (1901)
4. ERV 1885 — English Revised Version
5. YLT — Young's Literal Translation (1898)
6. Webster — Webster's Bible (1833)
7. BBE — Bible in Basic English
8. BSB — Berean Standard Bible
9. MSB — Majority Standard Bible (Public Domain)
10. WEBBE — World English Bible, British Edition
11. Darby — Darby Translation (1884)
12. DRA — Douay-Rheims 1899 (73-book Catholic canon)
13. Geneva — Geneva Bible 1599 (66 books)
14. Original Douay-Rheims — modernized spelling
15. Original Douay-Rheims — historical spelling

The reader requests chapter text from these runtime sources:

| Translation(s) | Current chapter-data source in main | Runtime note |
|---|---|---|
| KJV, BBE | Free.Bible | The only remaining external translation-text service in main; background fetch only |
| WEB Classic, ASV, YLT, Webster, Darby, Geneva, BSB, MSB, ERV 1885 | Same-origin `/data/bible-en/local/{translation}/b{bookId}.json` | 66 books each |
| DRA 1899 | Same-origin `/data/bible-en/local/dra/` | 73 books; Esther has 16 chapters and Daniel 14 |
| WEBBE | Same-origin `/data/bible-en/local/webbe/` | 73 books |
| Original Douay-Rheims, modern and historical spelling | Same-origin `/data/bible-en/odr/` chapter files and separate local search indexes | 76 listed texts: 73 canonical books plus three appendix texts; 37,153 scripture verse rows per search index |
| OPV, OPCB | Same-origin `/data/bible-fa/` files | 66 books each |

The reader does not navigate visitors to translation providers. In main, only KJV and BBE still fetch chapter text from Free.Bible in the background. Eleven English editions are served from local files, alongside both Original Douay-Rheims spelling forms and the two Persian editions. No outbound provider-reading links are offered.

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

## Audit status (repository state after the November 23, 2026 updates)

- English selector: 15 choices are present: 11 locally hosted editions (WEB, ASV, YLT, Webster, Darby, Geneva, BSB, MSB, ERV 1885, DRA 1899, WEBBE), KJV, BBE, and two Original Douay-Rheims spelling forms. The MSB option must remain accepted by both the saved-version restore list and the change handler; regression tests now guard this.
- Selector/runtime alignment: regression tests now compare all 15 visible English option IDs against supported editions, check both local-English loader allowlists against the 11 local packs, preserve OPV and OPCB as distinct Persian options, and require a display label for every English selector option. PR #57 is merged; its GitHub Actions Bible-data regression run passed.
- Local runtime data: 11 English local editions (674 per-book JSON files), two Persian editions (66 files each), and two Original Douay-Rheims spellings (152 raw book files plus two local search indexes). Only KJV and BBE chapter text still fetches from Free.Bible in the background; neither is self-hosted because rights clearance is incomplete.
- Search: Persian OPV/OPCB and locally hosted English editions use the selected edition's local files. Both Original Douay-Rheims spelling forms use separate local indexes with 37,153 actual scripture verse rows each. KJV and BBE still use the KJV fallback index. The one Tobias chapter-zero introductory line remains in source data but is excluded from scripture search.
- Original Douay-Rheims integrity: all 152 raw book files (76 texts in two spelling forms) are pinned by SHA-256 in metadata. The builder and regression test verify these hashes before indexing. The 76 listed texts are 73 books in the Catholic canon plus three appendix texts.
- Persian structure: OPV has 66 books, 1,189 chapters, and 31,090 original verse markers; the importer restores the documented Ezekiel 25:5 boundary and preserves two empty Job markers. OPCB has 66 books, 1,189 chapters, and 28,731 verse entries. Both remain separate editions. Spot checks are not a full verse-by-verse collation.
- English source integrity: 11 local editions are generated from official eBible VPL archives pinned by SHA-256; the importer checks source notices, archive integrity, book/chapter structure, and known sample passages. Empty verse markers and omitted numbering gaps are preserved rather than filled from another translation.
- Sunday/Sabbath fidelity: no translation wording has been changed to call Sunday holy or to label it the biblical Sabbath. Historical Sunday-related notes in the Original Douay-Rheims archive are editorial apparatus, not Scripture text; they are not rendered as verses. The bilingual site note keeps editorial explanation separate from the source translation.
- Share and visitor navigation policy: Bible reading and shared verse links remain on SeventhTrumpet.org. Provider names may be shown as plain-text attribution, but no outbound reading links or provider URLs should be inserted into share payloads.
- Not yet completed: complete verse-by-verse collation of every English and Persian edition against its source/independent text; interactive testing of every selector, chapter, language switch, deep link, and mobile layout; fresh production verification for the latest repository commit. Structural tests do not prove translation accuracy.
- Production caveat: the last production deployment visible in Vercel is older than the latest main commit. Do not claim the MSB addition, Original Douay-Rheims local search indexes, or the newest selector fixes are live until a READY deployment for the current main commit is confirmed and the live site is smoke-tested.

## Additional security finding (2026-11-23)

- The legacy README and browser-delivered `js/admin.js` exposed the same static admin password. It has been removed from the current README and current `js/admin.js`; it remains in Git history, so treat it as compromised and rotate it anywhere it was reused. Do not reuse it.
- The static client-side login was not authentication: it could be inspected or bypassed. The old panel stored posts/live state in each visitor's `localStorage`, not a protected shared database.
- Current main replaces `admin.html` with a bilingual maintenance notice, retires the old admin client, and adds Vercel redirects for `/admin` and `/admin.html` to `/admin-disabled.html`. Verify a READY production deployment and the live route before calling the public route fully disabled.
- A secure replacement requires server-side authentication/authorization and protected shared storage. Never put secrets in static JavaScript, HTML, README files, or Git history.

## Deployment follow-up (2026-11-23)

- The bilingual licence-page clarification for BBE redistribution rights is committed to main (commit `be09327c1fd7327c83b6b102d6c83f904ebc69a9`), but it is not yet in the latest confirmed production deployment. The Vercel deployment API returned its daily deployment quota limit; no working local Vercel CLI deployment path is available in the current environment. Do not claim this latest licence wording is live until a subsequent production deployment reaches READY and the live page is checked.
- The latest confirmed security deployment `dpl_EFcMh8Vr9LaFoSyQxH7FsgzdGcTS` is READY for commit `fb69293cc872bc8e3fd723b55bdfa79e870c92ec`. Live checks confirmed that the browser-delivered `/js/admin.js` no longer contains the old password and the old login check fails closed. However, the live `/admin` route returned 404 rather than the intended bilingual maintenance page because the subsequent redirects and HTML replacement were not in that deployment.
- On 2026-11-23, a further hardening commit `4d7c0419452f3477ce174a7c2c2656f8f75765a8` replaced `js/admin.js` with an inert stub. This removes the old admin UI logic and localStorage management functions from the directly accessible JavaScript asset, not merely the password check. This commit is on main but is not yet deployed. The file remains only as a harmless compatibility stub for stale references.
- The live `/admin` path currently returns 404, and the latest confirmed deployment's source commit predates the bilingual `admin.html` replacement, dedicated maintenance page, redirects, and inert-stub hardening. Do not treat the 404 as proof that every old path or cached copy is safely disabled. Recheck `/admin`, `/admin.html`, `/admin-disabled.html`, and `/js/admin.js` after the next successful production deployment.
- The Vercel deployment API returned HTTP 402 with the `api-deployments-free-per-day` limit and a `retryAfter` of 86400 seconds. Do not repeatedly retry deployment creation during the limit window or change billing/security settings automatically. GitHub main is updated; production publication and live route verification remain pending.


## Production verification update (2026-11-23, after hardening deploy)

- GitHub-triggered Vercel production deployment `dpl_3mRoSpQ2F8SsrQeMJ5yMSjpBMYtR` reached `READY` for commit `4d7c0419452f3477ce174a7c2c2656f8f75765a8` (`security: retire legacy browser-only admin client`). This succeeded through the repository's Git deployment integration even though direct deployment API creation had reached its daily quota.
- Live checks on `www.seventhtrumpet.org` now return HTTP 200 for `/admin`, `/admin.html`, and `/admin-disabled.html`; all three show the bilingual Persian/English maintenance notice. The `/admin` and `/admin.html` paths therefore resolve to the intended disabled page after this deployment.
- Live `/js/admin.js` is now an inert compatibility stub. It contains no old password comparison, login function, post-management UI, or browser-local admin storage logic.
- Live `/bible-licenses.html` returns HTTP 200 and contains the BBE caveat in both Persian and English: the eBible explanation based on the 1965 U.S. publication does not establish worldwide redistribution rights, so BBE is not self-hosted.
- Live `/bible.html` and `/bible-licenses.html` have no external HTTP(S) anchor links. Live share scripts `/js/bible-share.js` and `/js/bible-share-photo.js` return HTTP 200 and use the canonical SeventhTrumpet.org domain; no Bible-provider URL was found in their share-script source.
- The live licence page explicitly distinguishes historical Sunday references in the Original Douay-Rheims archive from Bible verse wording and states that the site does not endorse Sunday as holy or as the Sabbath. No translation wording was altered to impose that position.
- Remaining limitations: no secure server-side admin replacement has been built; the public panel remains intentionally disabled. The old credential still exists in Git history and must be treated as compromised and rotated anywhere reused. Full verse-by-verse textual accuracy checks and interactive mobile/browser tests remain outstanding.


## Reader hosting-notice correction (2026-11-23)

- A source review found that the English reader's explanatory paragraph still claimed Geneva used Bolls and Darby/Douay-Rheims used Bible API chapter delivery. That statement was stale: these ten English editions and both Original Douay-Rheims spelling forms are now served from same-origin files. The stale paragraph could mislead readers about current dependencies.
- Updated `js/bible.js` in commit `e69990595a2c588a984d2fdbfc44036baf994498`: the English explanation now distinguishes the locally hosted editions from KJV and BBE, whose chapter text is still fetched in the background from Free.Bible. The Persian explanation now states that OPV and OPCB are served from the site's own files. Search now follows the selected local edition for locally hosted English and Persian versions; KJV and BBE retain the KJV fallback index, and both Original Douay-Rheims spellings have separate local indexes.
- Updated `bible.html` in commit `90e13254c0c440daa44c595ff0445b6eab62c433` to change the reader script query string. This is necessary because the site's JavaScript response headers use long-lived immutable caching; changing the URL helps browsers fetch the corrected script instead of retaining the previous cached copy.
- Repository verification: the new hosting wording is present, the obsolete Bolls/Bible API wording is absent from the reader's visible explanatory paragraph, and the cache-busting query is present in `bible.html`.
- Deployment status at this review: these two commits have not yet appeared in the Vercel deployment list. The latest confirmed production deployment remains `dpl_3mRoSpQ2F8SsrQeMJ5yMSjpBMYtR` for commit `4d7c0419452f3477ce174a7c2c2656f8f75765a8`. Do not describe the corrected notice as live until a deployment containing both commits reaches READY and the live reader is checked.


## Automated regression checks and publication (2026-11-23)

- Added `scripts/test-bible-data.py`, a standard-library-only offline regression test. It parses every per-book JSON file for ten English local editions, both Persian editions, and both 76-text Original Douay-Rheims spelling forms. It checks expected book sets, object schemas, contiguous chapter numbering where applicable, positive verse numbers, string verse text, and the special Tobias prologue chapter 0 handling.
- The same test checks reader safeguards: current local-versus-remote hosting explanation, removal of obsolete Bolls/Bible API text, cache-busting reader script URL, canonical SeventhTrumpet.org share origin, no legacy admin hooks on the disabled admin page, inert compatibility JS, and bilingual textual-integrity notes.
- Added `.github/workflows/bible-data-regression.yml` to run the test on pushes and pull requests to `main`, and on manual dispatch. No third-party Python packages are required.
- GitHub Actions run `45184080908` completed with conclusion `success` for commit `928c20228e5ec0093c0beb9968546b9d417dd9d4`. The validation step passed.
- Vercel production deployment `dpl_2ozsxZ64CHXKvFLPysVHGnwt1qPy` reached `READY` for commit `c92adbf9cc63461fd0b5a70793eb2a4cf2fcd209`; Vercel reports the aliases `seventhtrumpet.org` and `www.seventhtrumpet.org` on that deployment. This commit includes the reader hosting-note correction and cache-busting URL. A later commit `928c202` only tightens a test-script check and does not change site runtime files.
- Limitations remain: the automated test establishes structural integrity and safeguards, not translation accuracy, copyright clearance, or real-device/browser behavior. A direct live HTTP fetch from this environment was not possible during this check, so do not claim a fresh browser-level live test.

## Structural-count audit checkpoint (2026-11-23)

- PR #59 added an automated comparison between all 11 locally hosted English edition packs and `data/bible-en/local/metadata.json`. The test now fails if a local edition directory or metadata entry is missing/extra, and recounts actual books, chapters, verse entries, and empty verse markers for each pack. GitHub Actions passed before merge.
- PR #60 added explicit verse-entry totals for both Persian datasets and targeted OPV safeguards. The first run exposed a one-entry discrepancy: OPV contains 31,091 imported verse records, not 31,090. This is expected and documented by `scripts/import-opv.py`: the upstream source places the wording of Ezekiel 25:5 at the end of 25:4, and the importer restores that missing verse boundary without changing the wording. The regression test now expects 31,091 records and verifies the restored wording is separate in Ezekiel 25:5 rather than duplicated in 25:4.
- The OPV test also confirms that the only empty verse markers are the two source markers in Job 35:1 and 40:1. OPCB remains at 28,731 verse entries.
- The corrected PR #60 test run passed and the change was merged. These are structural and import-integrity checks, not a complete verse-by-verse comparison with the official source texts.
- The latest repository main commit after these changes is `f9db8f3813ae7466b1a343c542d110691757471e`. Production publication and live-browser verification must be checked separately; a successful GitHub Actions run does not mean the changes are already live on SeventhTrumpet.org.

## WEBBE canon-visibility correction (2026-11-23)

- PR #62 fixed a reader bug: WEBBE's local dataset and metadata contain 73 books, but the reader's available-book filter had not included `webbe` in the expanded-canon allowlist. As a result, its seven additional books were present in the data and search index but hidden from the reading selector.
- The reader now exposes the expanded 73-book catalogue for WEBBE as well as DRA and both Original Douay-Rheims spellings. The separate 16-chapter Esther rule remains limited to DRA and Original Douay-Rheims; WEBBE retains its source-specific 10-chapter Esther structure.
- A regression assertion for WEBBE's expanded canon passed in GitHub Actions before PR #62 was merged. No verse text was modified.
- Production deployment records have not yet advanced to the current main commit. Do not claim this reader correction is live until a READY production deployment contains the current commit and the live reader is checked.

## Douay-Rheims Daniel chapter visibility correction (2026-11-23)

- PR #64 fixed a second expanded-canon reader issue: the local DRA pack and Original Douay-Rheims source contain 14 Daniel chapters, but the reader had applied the standard 12-chapter map to every English edition.
- The reader now exposes Daniel chapters 13–14 only for DRA and both Original Douay-Rheims spelling forms. WEBBE remains at its source-specific 12 chapters.
- Regression checks validate DRA Daniel has 14 chapters, WEBBE has 12, and the runtime chapter-count rule is edition-specific. The workflow passed before merge.
- No Scripture wording or source files were changed. Production deployment and live-reader verification remain pending for the current main branch.

## Reader cache refresh after canon corrections (2026-11-23)

- PR #66 bumped the `bible.js` cache key in `bible.html` from `expanded-canon-search-fix5-20261123` to `expanded-canon-search-fix6-20261123` after the WEBBE and Douay Daniel reader fixes. This matters because the site serves long-lived cached JavaScript assets.
- The Bible-data regression test now requires the fix6 cache key. GitHub Actions passed before merge.
- Latest main commit at this checkpoint: `d1e299acd0dc9a7eb00110b82107f4bb547307d4`.
- Vercel production deployment records still show the older production commit `d42c7fde4377daed614357e0794758cecf0ad7ca`; the latest reader fixes are not confirmed live. Do not ask for or use a user token, and do not repeatedly retry the Vercel daily deployment quota.
