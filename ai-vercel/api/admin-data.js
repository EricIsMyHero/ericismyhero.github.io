import { stopDuringMigration } from '../lib/maintenance.js';
// Admin endpoint: no private responses are cached, authentication precedes DB access.
import { isAdminKey, adminData } from "../lib/admin.js";
export default async function handler(req, res) {
  if (stopDuringMigration(req, res)) return;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin-Key");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "method_not_allowed" });
  if (
    !isAdminKey(
      req.headers?.["x-admin-key"] || req.body?.adminKey,
      process.env.ADMIN_SECRET_KEY,
    )
  )
    return res.status(401).json({ error: "unauthorized" });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT)
    return res.status(503).json({ error: "service_not_configured" });
  try {
    const r = await adminData(req.body || {});
    return res.status(r.status).json(r.json);
  } catch (e) {
    console.error("[admin-data]", e.message);
    return res.status(503).json({ error: "data_unavailable" });
  }
}
