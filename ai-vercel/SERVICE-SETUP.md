# Account tools, AI quotas and site checks

The backend stays within Vercel Hobby's 12-function limit. Account operations are routed through `/api/push`; helpers in `lib/` are not functions. Deploy the repository with the existing Vercel root directory `ai-vercel`.

## Existing configuration

`FIREBASE_API_KEY`, `FIREBASE_SERVICE_ACCOUNT` and `GROQ_API_KEY` are required for authenticated AI usage. Account export and deletion use the first two variables; attachment deletion also needs the R2 credentials described in [REQUESTS-SETUP.md](REQUESTS-SETUP.md). Never place service-account or R2 secrets in the static site.

`REQUESTS_REQUIRE_PUSH` defaults to optional notifications. Remove an old value of `1` or set it to `0` to allow authenticated requests and replies without notifications. File uploads still require the R2 configuration and CORS policy.

## Firestore access

The service account handles these private collections. Verify that browser security rules deny access to them, including access by authenticated users:

```text
match /ai_usage/{id} { allow read, write: if false; }
match /account_deletions/{id} { allow read, write: if false; }
match /premium_codes/{id} { allow read, write: if false; }
```

Merge these blocks into the existing rules; do not replace the application's other rules. Firestore combines matching `allow` rules with OR, so a broad wildcard granting access must also be restricted. New unmatched collections are already denied by default. The backend uses service-account IAM and does not depend on client-side access.

AI quotas use atomic document preconditions, a Baku calendar day and server-controlled premium-code receipts: 5 requests/day and 250 characters for standard accounts, 12 and 400 for premium. Editing browser storage or profile premium fields does not change these limits. Failed provider calls refund the reserved request. A three-second minimum interval reduces bursts. Service failures fail closed without consuming a successful answer.

## Account operations

Export includes the authenticated user's profile and private subcollections, plus an explicit allowlist of local study data. It excludes auth tokens, SDK storage, payment secrets and public discussions. The JSON identifies its scope.

Deletion requires the user's exact Firebase ID token, a login within five minutes and an explicit `DELETE` confirmation. The UI reauthenticates with the current password or Google before sending the request. A private server-owned queue checkpoints each step and leases work so failed or interrupted batches can resume. Authentication is deleted last. There is no browser-supplied UID, storage path or deletion cursor.

Deletion removes the user subtree, AI usage, linked push devices and identifiable analytics. Public requests remain as closed placeholders to preserve other contributors' replies. The user's messages and linked attachments are removed. Ratings become anonymous votes in one atomic write, preserving aggregate counts. Donation records and redeemed codes retain accounting/anti-reuse fields without the account association. Associated supporter names are removed. Copies downloaded by users and external payment-provider records are outside this operation.

Keep the browser open during deletion. If a batch fails, sign in and retry; the UI reports the failure rather than claiming success. Large accounts may require reauthentication again. A server timeout can leave a lease for up to 45 seconds before retrying. Do not test this against a real account without an intentional deletion request.

## Public pages and offline shell

After changing the catalog or site assets, run from the repository root:

```sh
python3 tools/sync-material-dates.py
node tools/build-site.mjs
node --test tests/*.test.cjs tests/*.test.mjs
python3 tools/sync-material-dates.py --check
node tools/build-site.mjs --check
```

Commit the generated material pages, `sitemap.xml`, `offline-assets.js` and history metadata together with the source changes. Public material links contain real HTML metadata and structured data; the application remains a hash-routed static site.

The service worker precaches only explicitly listed public same-origin assets. It never caches Firebase responses, APIs, tokens, user exports or remote PDFs. Curriculum data, completion checkboxes, GPA and timer tools work after an initial successful online visit. A complete new cache version is installed before activation. Only caches with the `unec-static-` prefix are removed during upgrades; browser study data is retained.

GitHub Actions validates generated files, timestamps, syntax and unit tests on pushes/PRs. A separate weekly/manual job checks catalog links using browser headers, range requests and retries. No secrets are needed for these checks.
