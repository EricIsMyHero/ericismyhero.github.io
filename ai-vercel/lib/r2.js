// lib/r2.js
// Cloudflare R2 (S3 uyğun API) — istək yazışmalarına əlavə olunan fayllar üçün. Heç bir kitabxana yoxdur: AWS Signature V4 əl ilə yazılıb.
//   • presignPut()  — brauzerin birbaşa R2-yə yükləməsi üçün vaxtı məhdud imzalı link (fayl Vercel-dən keçmir)
//   • r2Head() / r2Range() / r2Delete() — yüklənmiş faylı yoxlamaq (ölçü, növ, ilk baytlar) və silmək
// Mühit dəyişənləri: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET (hamısı məcburi),
//   R2_PUBLIC_BASE (ictimai oxuma ünvanı, məs. https://pub-xxxx.r2.dev — bucket-də "Public access" aktiv olmalıdır),
//   R2_ENDPOINT (istəyə görə: AB bölgəsi üçün <account>.eu.r2.cloudflarestorage.com kimi tam host).
import crypto from 'node:crypto';

const sha256hex = (data) => crypto.createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();

// AWS qaydası: yalnız A–Z a–z 0–9 - _ . ~ olduğu kimi qalır (encodeURIComponent ! ' ( ) * simvollarını da buraxır)
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const encPath = (p) => p.split('/').map(enc).join('/');
const stamp = (d) => d.toISOString().replace(/[:-]|\.\d{3}/g, '');           // 20130524T000000Z

function signingKey(secret, date, region, service) {
  return hmac(hmac(hmac(hmac('AWS4' + secret, date), region), service), 'aws4_request');
}

function canonicalHeaders(headers) {
  const names = Object.keys(headers).map(h => h.toLowerCase()).sort();
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v).trim().replace(/\s+/g, ' ')]));
  return { names, block: names.map(n => `${n}:${lower[n]}\n`).join(''), signed: names.join(';') };
}

/**
 * Vaxtı məhdud imzalı URL (query-string imzası). `headers` — imzalanan başlıqlar (host məcburidir);
 * brauzer sorğuda eyni başlıqları göndərməlidir (host-u özü qoyur, Content-Type-ı biz deyirik).
 */
export function presignUrl({ method, host, path, region = 'auto', service = 's3', accessKeyId, secretAccessKey,
  expires = 600, headers = {}, now = new Date() }) {
  const date = stamp(now).slice(0, 8);
  const h = canonicalHeaders({ ...headers, host });
  const scope = `${date}/${region}/${service}/aws4_request`;
  const query = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${scope}`,
    'X-Amz-Date': stamp(now),
    'X-Amz-Expires': String(expires),
    'X-Amz-SignedHeaders': h.signed,
  };
  const canonicalQuery = Object.keys(query).sort().map(k => `${enc(k)}=${enc(query[k])}`).join('&');
  const canonicalRequest = [method, encPath(path), canonicalQuery, h.block, h.signed, 'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', stamp(now), scope, sha256hex(canonicalRequest)].join('\n');
  const signature = hmac(signingKey(secretAccessKey, date, region, service), toSign).toString('hex');
  return `https://${host}${encPath(path)}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/** Başlıq imzası (Authorization): serverin özünün etdiyi HEAD/GET/DELETE sorğuları üçün. Qaytarır: fetch başlıqları. */
export function signHeaders({ method, host, path, query = '', headers = {}, payloadHash = sha256hex(''),
  region = 'auto', service = 's3', accessKeyId, secretAccessKey, now = new Date() }) {
  const date = stamp(now).slice(0, 8);
  const all = { ...headers, host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': stamp(now) };
  const h = canonicalHeaders(all);
  const scope = `${date}/${region}/${service}/aws4_request`;
  const canonicalRequest = [method, encPath(path), query, h.block, h.signed, payloadHash].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', stamp(now), scope, sha256hex(canonicalRequest)].join('\n');
  const signature = hmac(signingKey(secretAccessKey, date, region, service), toSign).toString('hex');
  const out = { ...headers, 'x-amz-content-sha256': payloadHash, 'x-amz-date': stamp(now),
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${h.signed}, Signature=${signature}` };
  return { headers: out, signature, signedHeaders: h.signed };
}

// ── Konfiqurasiya ──────────────────────────────────────────────
export function r2Config(env = process.env) {
  const accountId = (env.R2_ACCOUNT_ID || '').trim();
  const accessKeyId = (env.R2_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (env.R2_SECRET_ACCESS_KEY || '').trim();
  const bucket = (env.R2_BUCKET || '').trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  const host = (env.R2_ENDPOINT || `${accountId}.r2.cloudflarestorage.com`).replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const publicBase = (env.R2_PUBLIC_BASE || 'https://pub-2179773f096a4b76a772ec1317daec99.r2.dev').replace(/\/+$/, '');
  return { accountId, accessKeyId, secretAccessKey, bucket, host, publicBase };
}
export const r2Enabled = (env = process.env) => !!r2Config(env);
export const publicUrl = (key, env = process.env) => `${r2Config(env).publicBase}/${key}`;

/** Brauzerin PUT edəcəyi imzalı link. Content-Type imzalanır: başqa növlə yükləmək olmur. */
export function presignPut(key, contentType, { expires = 600, now = new Date() } = {}, env = process.env) {
  const c = r2Config(env);
  return presignUrl({ method: 'PUT', host: c.host, path: `/${c.bucket}/${key}`, expires, now,
    headers: { 'content-type': contentType }, accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey });
}

async function r2Fetch(method, key, { range } = {}, env = process.env) {
  const c = r2Config(env);
  const path = `/${c.bucket}/${key}`;
  const { headers } = signHeaders({ method, host: c.host, path, headers: range ? { range } : {},
    accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey });
  return fetch(`https://${c.host}${encPath(path)}`, { method, headers });
}

/** Obyekt varmı? → { exists, size, contentType } */
export async function r2Head(key, env = process.env) {
  const res = await r2Fetch('HEAD', key, {}, env);
  if (res.status === 404) return { exists: false };
  if (!res.ok) throw new Error(`R2 HEAD xətası: ${res.status}`);
  return { exists: true, size: parseInt(res.headers.get('content-length') || '0', 10), contentType: (res.headers.get('content-type') || '').toLowerCase() };
}

/** İlk `n` bayt (faylın əsl növünü yoxlamaq üçün) */
export async function r2Range(key, n = 512, env = process.env) {
  const res = await r2Fetch('GET', key, { range: `bytes=0-${n - 1}` }, env);
  if (!res.ok) throw new Error(`R2 GET xətası: ${res.status}`);
  return Buffer.from(await res.arrayBuffer()).subarray(0, n);
}

/** Obyekti sil (olmayan obyekt xəta sayılmır) */
export async function r2Delete(key, env = process.env) {
  const res = await r2Fetch('DELETE', key, {}, env);
  if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE xətası: ${res.status}`);
  return true;
}

// ── Faylın əsl məzmunu yazılan növə uyğundurmu? ────────────────
const startsWith = (buf, bytes, at = 0) => bytes.every((b, i) => buf[at + i] === b);
const OLE = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];            // doc / xls / ppt
const ZIP = [0x50, 0x4B, 0x03, 0x04];                                        // docx / xlsx / pptx
/** Uzantı ilə ilk baytların uyğunluğu. (Adını dəyişib .exe-ni .pdf kimi göndərməyin qarşısını alır.) */
export function sniffOk(ext, buf) {
  if (!buf || buf.length < 4) return false;
  switch (ext) {
    case 'pdf': return startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2D]);                       // %PDF-
    case 'png': return startsWith(buf, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    case 'jpg': case 'jpeg': return startsWith(buf, [0xFF, 0xD8, 0xFF]);
    case 'webp': return buf.length >= 12 && startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8);
    case 'doc': case 'xls': case 'ppt': return buf.length >= 8 && startsWith(buf, OLE);
    case 'docx': case 'xlsx': case 'pptx': return startsWith(buf, ZIP);
    case 'txt': return !buf.subarray(0, 512).includes(0);                                       // mətn faylında NUL bayt olmur
    default: return false;
  }
}
