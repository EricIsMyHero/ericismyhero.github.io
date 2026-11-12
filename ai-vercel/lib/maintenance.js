// Operator-controlled migration pause; disabled unless explicitly enabled.
export function migrationPaused(env = process.env) { return env.FIREBASE_MIGRATION_MAINTENANCE === '1'; }
export function stopDuringMigration(req, res) {
  if (!migrationPaused()) return false;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') res.status(204).end();
  else { res.setHeader('Retry-After', '60'); res.status(503).json({ error: 'maintenance' }); }
  return true;
}
