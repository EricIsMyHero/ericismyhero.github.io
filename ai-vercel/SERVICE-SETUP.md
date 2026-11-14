# Account tools, AI quotas and site checks

The backend stays within Vercel Hobby's 12-function limit. Account operations are routed through `/api/push`; helpers in `lib/` are not functions. Deploy the repository with the existing Vercel root directory `ai-vercel`.

## Existing configuration

`FIREBASE_API_KEY`, `FIREBASE_SERVICE_ACCOUNT` and `GROQ_API_KEY` are required for authenticated AI usage. Account export and deletion use the first two variables; attachment deletion also needs the R2 credentials described in [REQUESTS-SETUP.md](REQUESTS-SETUP.md). Never place service-account or R2 secrets in the static site.

`REQUESTS_REQUIRE_PUSH` defaults to optional notifications. Remove an old value of `1` or set it to `0` to allow authenticated requests and replies without notifications. File uploads still require the R2 configuration and CORS policy.

## Firestore access

The service account handles these private collections. Verify that browser security rules deny access to them, including access by authenticated users:

```text
match /ai_usage/{id} { allow read, write: if false; }
match /ai_usage/{id}/{document=**} { allow read, write: if false; }
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

## AI written practice

Written practice shares `/api/ask` with the existing assistant, using authenticated
`written-*` actions. It does not consume chatbot credits. No additional Vercel
function or paid AI fallback is introduced. Install with `npm ci` in `ai-vercel`
and use Node.js 24. The pinned `unpdf` dependency extracts PDF text server-side.

The existing `GROQ_API_KEY` enables grading. The default model is
`openai/gpt-oss-120b`; optionally set `WRITTEN_EXAM_MODEL` to a Groq model that
supports JSON output. Free-tier availability depends on the provider and account
quotas. A 429 pauses grading; saved answers and completed question grades remain
available for retry. This is formative practice, not an official mark.

Midterm draws 3 questions (30 points maximum); Semester draws 5 (50 maximum).
Each question allows 20 minutes, enforced by server deadlines. Moving forward
locks the preceding answer. The shared limit is 3 started exams per UID per Baku
calendar day, including abandoned exams. Start request IDs make retries
idempotent, and Firestore update-time preconditions protect concurrent quota and
grading operations. Blank answers receive zero; insufficient or unverifiable
reference-based grading produces an ungraded result and no fabricated total.

Only written PDFs listed in the generated `lib/written-sources.js` are fetched.
Run `node tools/build-site.mjs` from the repository root after catalogue changes.
Source URLs and references supplied by a browser are never trusted. Extraction
requires numbered text questions and reference explanations; scans, question-only
files, unsupported layouts and overly long answer blocks may be ineligible.
Do not interpret the extracted count as a promise to support every question in a PDF.
The source fingerprint must still match when grading resumes.

Private sessions are stored in the existing server-only `ai_usage/{uidHash}`
document, under `written.days`, separately from chat quota fields. Existing rules
deny browser access to that collection. No new public write rules are needed.
Writes retain the current and previous Baku day and remove older practice entries;
this is not an automatic TTL cleanup when an account is inactive. Account exports
include written practice, and account deletion removes the whole usage document.
Browser drafts use account-specific session storage and are cleared on sign-out;
the resume pointer contains only an exam ID/day. Answers and selected reference
text are sent to Groq at grading time, as disclosed in the interface and privacy
policy. The AI key and reference answers are not sent to the browser before grading.

Run `node --test tests/written-exams.test.mjs` from the repository root for isolated
quota, timer, concurrency, grounding and PDF extraction tests. Live grading also
requires the existing Firebase service-account configuration and a working Groq key.

## Private PDF imports and result history

All practice screens require sign-in, including the ordinary multiple-choice
runner. A started multiple-choice quiz is bound to its starting UID and is reset
on account changes. Results use stable IDs; failed writes remain in a per-account
session queue for retry on the next sign-in or online event. Written grades are
created by the server under `users/{uid}/quiz_results/written-{examId}`; retries
repair a failed history write without invoking the AI again. Incomplete grading
is recorded explicitly and is never displayed as zero percent.

`practice-pdf-*` actions also share `/api/ask`. The server authenticates the UID,
accepts at most 3 MiB of base64-encoded original PDF bytes and parses them using
the same pinned PDF engine. Upload quota is independent of AI/chat quota: one
successful PDF per UID per Baku day across both formats. A server-side claim
prevents concurrent uploads from spending the slot twice. Unsupported/failed
parsing releases the claim; retries of a successful request are idempotent.
The original bytes are not retained or sent to R2. No new bucket or API key is
needed. The existing 3 written exams/day limit still applies to private sources.

Extracted data is stored in two alternating private document slots under
`ai_usage/{uidHash}/practice_sources/{0|1}`. At most 60 written questions and
200 marked MCQs are retained, with serialized budgets of 400 KB and 200 KB.
Only the current and previous Baku day may be loaded. This bounds storage but
is not automatic TTL deletion during inactivity. Account exports include both
slots and deletion traverses the whole AI usage subtree. Browser access must be
denied to this subtree as shown above; any broader allow rule must not grant it.

Private MCQ extraction accepts numbered text questions with marked correct
answers. Pages containing PDF image operators are omitted conservatively to
avoid scoring questions with missing visual formulas. Written extraction needs
reference explanations; scans and unsupported layouts may not import. The UI
shows the extracted counts before starting. `lib/test-bank.cjs` is generated
from the browser's pure `scripts/test-bank.js` parser by `tools/build-site.mjs`.
