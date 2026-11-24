# Cloud media sync and administration: security and reliability audit

**Status:** design/audit only. No runtime behavior is changed by this document.

**Scope reviewed:** `js/cloud_sync.js`, `js/app.js`, `js/app_core.js`, `js/playlists.js`, `js/user_playlists.js`, `media.html`, and `admin-disabled.html` on the default branch.

## Executive summary

The current media sync stores the complete shared media state in one Firestore document at `site/media`. It uses client wall-clock timestamps and a collection-level heuristic to decide whether to pull. This is not a conflict-safe offline sync protocol. A stale device can overwrite newer edits, and simultaneous writes can replace each other's unrelated changes.

The browser also initiates cloud pushes without checking the signed-in user in `cloud_sync.js`. Whether anonymous writes are actually accepted is determined by the deployed Firestore Security Rules, which are not present in this repository and were not available for inspection. **Do not infer that the database is open or protected from the client code alone.** Verify the live rules in Firebase Console before making any permission or migration change.

## Verified observations

1. **Whole-document writes:** `pushMediaToCloud()` reads posts, shared playlists, and live settings from local storage, then writes them together using `set(payload)` to the single `site/media` document.
2. **Clock-based conflict heuristic:** the payload uses `Date.now()`; pulls compare that timestamp and post counts. Client clocks can differ, and post count is not a reliable measure of freshness.
3. **Field loss on merge:** for matching post IDs, the pull merge primarily trusts the remote post and preserves only a local `dataUrl` when the remote copy lacks one. A newer local title, description, or other field can therefore be lost.
4. **Playlist/live overwrite:** when a cloud pull is accepted, shared playlists and live settings are replaced wholesale from the remote snapshot.
5. **No explicit deletion records:** the inspected format has no per-record tombstones or deletion revisions. A removed record can be reintroduced by another stale snapshot.
6. **Payload growth:** only large `dataUrl` values are stripped from posts. The complete shared snapshot can still grow as posts, playlist data, or other fields accumulate. A single-document design has a hard storage ceiling and is not appropriate for unbounded media metadata.
7. **Personal playlists are separate:** `js/user_playlists.js` stores `cog_my_playlists_v1` locally and is not included in the shared cloud snapshot. Users should not be led to expect those personal lists to sync across devices.
8. **Authentication and authorization are separate:** the media page initializes Firebase Auth, but the sync module itself does not gate reads or writes on a signed-in user. Firestore Security Rules must enforce the actual access policy; hiding or showing sign-in UI is not an authorization boundary.
9. **Public client configuration:** Firebase web configuration is present in browser JavaScript. A Firebase web API key is not a server secret; security must come from correctly restricted Firebase services, Authentication, and Security Rules. Never put service-account credentials or privileged server secrets in client code.

## Required checks before implementation

- Inspect and export the currently deployed Firestore Security Rules from Firebase Console.
- Confirm which identities are allowed to read and write `site/media`, including signed-out visitors.
- Confirm whether the live project has any data not represented in the current repository.
- Create and verify a restorable backup of the existing `site/media` document before migration.
- Confirm expected ownership and moderation roles for posts, playlists, and live-stream settings.
- Decide whether public visitors need read-only access and which trusted administrators may write.

These checks require access to the Firebase project console or an authorized Firebase administration environment. Repository inspection alone cannot establish the deployed rules.

## Recommended target design

### 1. Record-level data model

Move shared posts and playlists from one growing snapshot into individual documents with stable IDs. Keep live configuration in a dedicated document. Each record should carry:

- stable `id`;
- monotonically increasing `revision` (or an equivalent server-checked version);
- server-generated `updatedAt`;
- editor identity / ownership metadata where appropriate;
- a deletion tombstone such as `deletedAt` rather than silently removing the record.

Do not use client wall-clock time as the sole conflict authority.

### 2. Conflict-safe writes

Use Firestore transactions or equivalent conditional writes to compare the version read by the editor with the current server version. If the versions differ, preserve both values and report a conflict rather than silently overwriting. Define explicit field-level merge rules only for fields that are genuinely safe to merge.

### 3. Offline queue and pull behavior

Keep pending local edits in a durable queue with their base revision. Retry transient failures with bounded backoff. A pull must never replace a record that has an unacknowledged local edit. Tombstones must be synchronized so deleted content does not reappear from an old device. Add a clear conflict-resolution path for administrators.

### 4. Authorization

Use Firebase Authentication for identity and enforce permissions in Firestore Security Rules. For privileged administration, use verified ID tokens on server-side endpoints and an administrator role (for example, Firebase custom claims). Deny writes by default and grant only the minimum required operations. Do not rely on client-side flags, hidden pages, or browser-only checks.

### 5. Media storage

Keep binary media in an object-storage service with authenticated upload rules and size/type limits. Store only metadata and storage references in Firestore. Avoid embedding large base64 data URLs in shared documents.

## Regression tests required before rollout

- Two devices edit different fields of the same post while offline; neither change is silently lost.
- Two devices edit the same field; a visible conflict is produced.
- A local pending edit survives a cloud pull.
- A deletion on one device does not reappear after another stale device reconnects.
- Concurrent playlist changes do not replace one another.
- Live settings updates use an explicit revision check.
- Signed-out writes are rejected by deployed rules if the chosen policy requires authentication.
- A non-admin authenticated user cannot perform administrative writes.
- Large media uploads do not cause Firestore document-size failures.
- Personal playlists remain clearly local-only unless a separate, privacy-conscious per-user sync feature is implemented.

## Safe implementation sequence

1. Verify deployed rules and back up the current document.
2. Implement and test the record-level schema in a non-production Firebase environment.
3. Build a one-time, idempotent migration with a dry-run report and rollback plan.
4. Add concurrency, offline, deletion, and authorization tests to CI.
5. Test the exact candidate commit in a Vercel preview and against the staging Firebase project.
6. Deploy only after the preview, data migration, and access rules have been independently verified.

**No production migration or Firestore rule change is authorized by this audit.** The current runtime is intentionally left unchanged until the deployed security rules and backup are verified.
