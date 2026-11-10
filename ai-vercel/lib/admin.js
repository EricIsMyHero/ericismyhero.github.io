// Admin-only data service. Reuses the server-side Firestore token and schema.
import crypto from "node:crypto";
import * as firestore from "./firestore.js";
const LIMIT = 2000;
export const num = (value) =>
  Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
export function isAdminKey(key, secret) {
  if (typeof key !== "string" || !key || typeof secret !== "string" || !secret)
    return false;
  const hash = (s) => crypto.createHash("sha256").update(s).digest();
  return crypto.timingSafeEqual(hash(key), hash(secret));
}
async function list(db, collection, meta, limit = LIMIT, options = {}) {
  const docs = [];
  let pageToken;
  do {
    const page = await db.listDocs(collection, {
      pageSize: Math.min(300, limit - docs.length),
      ...options,
      pageToken,
    });
    docs.push(...page.docs);
    pageToken = page.nextPageToken;
  } while (pageToken && docs.length < limit);
  meta[collection] = { loaded: docs.length, limited: !!pageToken, limit };
  return docs;
}
export function userRow(doc, progress = {}) {
  const f = doc.data;
  return {
    uid: doc.id,
    name: f.name || "Adsız",
    email: f.email || "",
    faculty: f.faculty || "",
    major: f.major || "",
    year: f.year || "",
    xp: num(progress.xp),
    streak: num(progress.streak),
    totalTests: num(progress.solvedTests ?? progress.totalTests),
    createdAt: f.createdAt || null,
    lastLogin:
      f.lastLogin || progress.lastLoginDate || progress.lastActive || null,
  };
}
export function ratingRow(doc) {
  const d = doc.data;
  return {
    id: doc.id,
    avgRating: Math.min(5, num(d.avg ?? d.avgRating)),
    totalVotes: num(d.count ?? d.totalVotes),
  };
}
const newest = (a, b) =>
  (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
export function requestRow(doc) {
  const f = doc.data;
  return {
    id: doc.id,
    text: f.text || "",
    userName: f.name || f.userName || "",
    uid: f.uid || "",
    course: f.course || "",
    subject: f.subject || "",
    upvotes: Array.isArray(f.upvoterIds) ? f.upvoterIds.length : num(f.upvotes),
    status: ["fulfilled", "closed"].includes(f.status)
      ? f.status
      : f.found
        ? "fulfilled"
        : "open",
    found: f.status === "fulfilled" || f.found === true,
    createdAt: f.createdAt || null,
  };
}
export function premiumCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[crypto.randomInt(chars.length)]).join(
      "",
    );
  return `UNEC-${part()}-${part()}`;
}
async function users(db, meta) {
  const [docs, rows] = await Promise.all([
    list(db, "users", meta),
    db.runQuery({
      from: [{ collectionId: "progress", allDescendants: true }],
      limit: LIMIT + 1,
    }),
  ]);
  const progress = new Map(
    rows
      .slice(0, LIMIT)
      .filter((d) => /^users\/[^/]+\/progress\/main$/.test(d.path))
      .map((d) => [d.path.split("/")[1], d.data]),
  );
  meta.progress = {
    loaded: Math.min(rows.length, LIMIT),
    limited: rows.length > LIMIT,
    limit: LIMIT,
  };
  return docs
    .map((d) => userRow(d, progress.get(d.id)))
    .sort((a, b) => b.xp - a.xp);
}
async function pdfs(db, meta) {
  const [events, ratings] = await Promise.all([
    db.runQuery(
      {
        from: [{ collectionId: "events" }],
        orderBy: [{ field: { fieldPath: "ts" }, direction: "DESCENDING" }],
        limit: 500,
      },
      undefined,
      "analytics/pdf_opens",
    ),
    list(db, "pdf_ratings", meta),
  ]);
  const counts = new Map();
  for (const { data: d } of events) {
    const key = d.fileName || d.pdfName || d.pdf || "Naməlum";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  meta.pdfOpens = { loaded: events.length, limit: 500, sampled: true };
  return {
    pdfOpens: [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    pdfRatings: ratings
      .map(ratingRow)
      .sort((a, b) => b.totalVotes - a.totalVotes),
  };
}
async function chats(db, meta) {
  const groups = await list(db, "subject_chats", meta, 50, {
    showMissing: true,
  });
  const result = [];
  // Missing parent documents still have messages. Bound concurrency and expose limits.
  for (let start = 0; start < groups.length; start += 6) {
    const batch = await Promise.all(
      groups.slice(start, start + 6).map(async (group) => {
        const docs = await list(
          db,
          `subject_chats/${group.id}/messages`,
          meta,
          100,
        );
        const messages = docs
          .map(({ id, data: d }) => ({
            id,
            text: d.text || "",
            userName: d.name || d.userName || "Adsız",
            userEmail: d.userEmail || "",
            uid: d.uid || "",
            ts: d.createdAt || d.ts || null,
            deleted: !!d.deleted,
          }))
          .sort((a, b) => (Date.parse(a.ts) || 0) - (Date.parse(b.ts) || 0));
        return { subject: group.id, messages, count: messages.length };
      }),
    );
    result.push(...batch.filter((g) => g.count));
  }
  return result.sort((a, b) => b.count - a.count);
}
export async function adminData(body, db = firestore, now = new Date()) {
  const meta = {},
    section = body.section || "all";
  if (
    !["all", "users", "chats", "requests", "pdfs", "premium"].includes(section)
  )
    return { status: 400, json: { error: "invalid_section" } };
  if (body.action && !(section === "premium" && body.action === "generate"))
    return { status: 400, json: { error: "invalid_action" } };
  if (section === "premium" && body.action === "generate") {
    if (
      !["7d", "15d", "32d", "lifetime"].includes(body.plan) ||
      !Number.isInteger(body.count) ||
      body.count < 1 ||
      body.count > 50
    )
      return { status: 400, json: { error: "invalid_plan_or_count" } };
    const codes = [];
    try {
      for (let i = 0; i < body.count; i++) {
        let created = false;
        for (let attempt = 0; attempt < 5; attempt++) {
          const code = premiumCode();
          try {
            await db.createDoc("premium_codes", code, {
              plan: body.plan,
              status: "unused",
              createdAt: now.toISOString(),
            });
            codes.push(code);
            created = true;
            break;
          } catch (e) {
            if (e.code !== "exists") throw e;
          }
        }
        if (!created) throw new Error("code_collision");
      }
      return { status: 200, json: { codes } };
    } catch (_) {
      return { status: 503, json: { error: "generation_incomplete", codes } };
    }
  }
  let data;
  if (section === "users") data = { users: await users(db, meta) };
  if (section === "chats") data = { chats: await chats(db, meta) };
  if (section === "requests")
    data = {
      requests: (await list(db, "material_requests", meta))
        .map(requestRow)
        .sort(newest),
    };
  if (section === "pdfs") data = await pdfs(db, meta);
  if (section === "premium")
    data = {
      premiumCodes: (await list(db, "premium_codes", meta))
        .map(({ id, data: d }) => ({ code: id, ...d }))
        .sort(newest),
    };
  if (section === "all") {
    const [u, p, r] = await Promise.all([
      users(db, meta),
      pdfs(db, meta),
      list(db, "material_requests", meta),
    ]);
    const requests = r.map(requestRow).sort(newest);
    const baku = (date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Baku",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    data = {
      summary: {
        totalUsers: u.length,
        activeToday: u.filter(
          (x) =>
            x.lastLogin &&
            ((String(x.lastLogin).slice(0, 10) ===
              now.toISOString().slice(0, 10) &&
              String(x.lastLogin).length === 10) ||
              (Number.isFinite(Date.parse(x.lastLogin)) &&
                baku(new Date(x.lastLogin)) === baku(now))),
        ).length,
        totalRequests: requests.length,
        openRequests: requests.filter((x) => x.status === "open").length,
      },
      topUsers: u.slice(0, 10),
      pdfOpens: p.pdfOpens.slice(0, 10),
      requests: requests.slice(0, 20),
    };
  }
  return { status: 200, json: { ...data, meta, fetchedAt: now.toISOString() } };
}
