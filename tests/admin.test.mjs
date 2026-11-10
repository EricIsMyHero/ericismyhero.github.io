import test from "node:test";
import assert from "node:assert/strict";
import handler from "../ai-vercel/api/admin-data.js";
import {
  adminData,
  isAdminKey,
  userRow,
  ratingRow,
  requestRow,
  premiumCode,
} from "../ai-vercel/lib/admin.js";
const response = () => ({
  headers: {},
  setHeader(k, v) {
    this.headers[k] = v;
  },
  status(code) {
    this.code = code;
    return this;
  },
  json(data) {
    this.data = data;
    return this;
  },
  end() {
    return this;
  },
});
test("admin endpoint rejects absent/wrong credentials before configuration or data access and never caches private responses", async () => {
  const old = process.env.ADMIN_SECRET_KEY;
  process.env.ADMIN_SECRET_KEY = "test-secret";
  try {
    for (const key of [undefined, "", "wrong"]) {
      const res = response();
      await handler(
        {
          method: "POST",
          headers: { "x-admin-key": key },
          body: { section: "users" },
        },
        res,
      );
      assert.equal(res.code, 401);
      assert.equal(res.headers["Cache-Control"], "no-store");
    }
    const pre = response();
    await handler({ method: "OPTIONS" }, pre);
    assert.equal(pre.code, 204);
    assert.equal(isAdminKey("a", ""), false);
    assert.equal(isAdminKey("same", "same"), true);
    assert.equal(isAdminKey(["same"], "same"), false);
  } finally {
    if (old === undefined) delete process.env.ADMIN_SECRET_KEY;
    else process.env.ADMIN_SECRET_KEY = old;
  }
});
test("admin schema adapters match real profile, rating and request writers, retaining old records", () => {
  const user = userRow(
    { id: "u", data: { name: "Student" } },
    { solvedTests: 13, totalTests: 0, lastLoginDate: "2026-11-10", xp: 50 },
  );
  assert.equal(user.totalTests, 13);
  assert.equal(user.lastLogin, "2026-11-10");
  assert.deepEqual(ratingRow({ id: "x", data: { avg: 4.5, count: 8 } }), {
    id: "x",
    avgRating: 4.5,
    totalVotes: 8,
  });
  assert.equal(
    ratingRow({ id: "x", data: { avgRating: 4, totalVotes: 9 } }).totalVotes,
    9,
  );
  assert.equal(
    requestRow({ id: "r", data: { status: "closed", name: "S" } }).status,
    "closed",
  );
});
test("users follow collection pagination and join progress without one network request per account", async () => {
  let calls = 0,
    queries = 0;
  const db = {
    listDocs: async (path, opt) => {
      assert.equal(path, "users");
      calls++;
      return {
        docs: [{ id: opt.pageToken ? "b" : "a", data: { name: "N" } }],
        nextPageToken: opt.pageToken ? null : "next",
      };
    },
    runQuery: async () => {
      queries++;
      return [
        { path: "users/b/progress/main", data: { xp: 15, solvedTests: 4 } },
      ];
    },
  };
  const { json } = await adminData({ section: "users" }, db);
  assert.equal(calls, 2);
  assert.equal(queries, 1);
  assert.equal(json.users[0].uid, "b");
  assert.equal(json.users[0].totalTests, 4);
  assert.equal(json.meta.users.limited, false);
});
test("PDF analysis queries the latest real fileName/ts events under the analytics parent and uses avg/count ratings", async () => {
  const db = {
    listDocs: async () => ({
      docs: [{ id: "pdf", data: { avg: 5, count: 2 } }],
    }),
    runQuery: async (q, env, parent) => {
      assert.equal(parent, "analytics/pdf_opens");
      assert.equal(q.orderBy[0].field.fieldPath, "ts");
      return [
        { data: { fileName: "ikt.pdf" } },
        { data: { fileName: "ikt.pdf" } },
        { data: { pdfName: "old.pdf" } },
      ];
    },
  };
  const { json } = await adminData({ section: "pdfs" }, db);
  assert.deepEqual(json.pdfOpens[0], { name: "ikt.pdf", count: 2 });
  assert.equal(json.pdfRatings[0].totalVotes, 2);
  assert.equal(json.meta.pdfOpens.sampled, true);
});
test("subject chats include missing parents and real name/createdAt fields", async () => {
  const db = {
    listDocs: async (path, options) => {
      if (path === "subject_chats") {
        assert.equal(options.showMissing, true);
        return { docs: [{ id: "subject", data: {} }] };
      }
      return {
        docs: [
          {
            id: "m",
            data: {
              name: "Reader",
              createdAt: "2026-11-10T10:00:00Z",
              text: "Hello",
            },
          },
        ],
      };
    },
  };
  const { json } = await adminData({ section: "chats" }, db);
  assert.equal(json.chats[0].messages[0].userName, "Reader");
  assert.equal(json.chats[0].messages[0].ts, "2026-11-10T10:00:00Z");
});
test("generation validates inputs, uses cryptographic code IDs and returns already-created codes on a partial failure", async () => {
  let writes = 0;
  const db = {
    createDoc: async () => {
      if (++writes === 2) throw Error("unavailable");
    },
  };
  assert.equal(
    (
      await adminData(
        { section: "premium", action: "generate", plan: "7d", count: 1.5 },
        db,
      )
    ).status,
    400,
  );
  assert.equal(writes, 0);
  const result = await adminData(
    { section: "premium", action: "generate", plan: "7d", count: 3 },
    db,
  );
  assert.equal(result.status, 503);
  assert.equal(result.json.codes.length, 1);
  assert.match(premiumCode(), /^UNEC-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});
test("read failures and unknown commands never become fabricated zero totals", async () => {
  assert.equal((await adminData({ section: "unknown" }, {})).status, 400);
  await assert.rejects(
    () =>
      adminData(
        { section: "users" },
        {
          listDocs: async () => {
            throw Error("denied");
          },
          runQuery: async () => [],
        },
      ),
    /denied/,
  );
});
