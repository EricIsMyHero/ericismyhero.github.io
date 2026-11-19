import * as firestore from './firestore.js';

const COLLECTION = 'career_opportunities';
export const CAREER_CHANNEL = 'unecstudentshubcareer';
const CATEGORIES = Object.freeze({ bank: 'Bank', finance: 'Maliyyə', audit: 'Audit', it: 'İT', other: 'Digər' });
const TYPES = Object.freeze({ internship: 'Təcrübə', volunteer: 'Könüllülük', training: 'Təlim' });
const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const DETAILS = { description: 2000, schedule: 160, location: 220 };
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const bakuDay = now => new Date(now.getTime() + 4 * 3600_000).toISOString().slice(0, 10);
const isActive = (row, today) => !row.deadline || row.deadline >= today;
const result = (status, json) => ({ status, json });
const error = (status, code) => result(status, { error: code });

function fields(input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const company = typeof input.company === 'string' ? input.company.trim() : '';
  const { type, category, deadline } = input;
  if (!title || title.length > 160 || !company || company.length > 100 ||
      /[\r\n]/.test(title + company) || typeof category !== 'string' ||
      !Object.hasOwn(CATEGORIES, category) || typeof type !== 'string' || !Object.hasOwn(TYPES, type)) return null;
  if (typeof deadline !== 'string' || (deadline && (!DATE.test(deadline) ||
      !Number.isFinite(Date.parse(deadline)) || new Date(deadline).toISOString().slice(0, 10) !== deadline))) return null;
  const details = {};
  for (const [key, limit] of Object.entries(DETAILS)) {
    if (!Object.hasOwn(input, key)) continue;
    const value = input[key];
    if (typeof value !== 'string' || value.trim().length > limit ||
        (key !== 'description' && /[\r\n]/.test(value))) return null;
    details[key] = value.trim();
  }
  if (typeof input.applyUrl !== 'string' || input.applyUrl.length > 1000) return null;
  try {
    const url = new URL(input.applyUrl);
    if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 1000) return null;
    return { title, company, type, category, deadline, applyUrl: url.href, ...details };
  } catch {
    return null;
  }
}

export async function publicCareer(db = firestore, now = new Date()) {
  const docs = await db.runQuery({
    from: [{ collectionId: COLLECTION }],
    where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
  });
  const today = bakuDay(now);
  return docs.filter(({ data }) => isActive(data, today))
    .map(({ id, data: { title, company, type, category, deadline, applyUrl, description, schedule, location } }) => ({
      id, title, company, type, category, deadline, applyUrl,
      ...(description && { description }),
      ...(schedule && { schedule }),
      ...(location && { location }),
    }))
    .sort((a, b) => (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31') ||
      a.title.localeCompare(b.title, 'az'));
}

async function sendTelegram(row, token, request) {
  const text = [
    `#${TYPES[row.type]} | ${CATEGORIES[row.category]}`,
    `${row.company} — ${row.title}`,
    row.description,
    row.schedule && `📅 Tarix və saat: ${row.schedule}`,
    row.location && `📍 Məkan: ${row.location}`,
    `Son müraciət: ${row.deadline ? row.deadline.split('-').reverse().join('.') : 'Göstərilməyib'}`,
    `Müraciət: ${row.applyUrl}`,
    'Karyera lövhəsi: https://unecstudentshub.com/#/career',
  ].filter(Boolean).join('\n\n');
  try {
    const response = await request(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: '@' + CAREER_CHANNEL, text, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    if (response.ok && data.ok && Number.isSafeInteger(data.result?.message_id) && data.result.message_id > 0)
      return { telegramStatus: 'sent', telegramMessageId: data.result.message_id };
    if (response.status >= 400 && response.status < 500 && data.ok === false)
      return { telegramStatus: 'failed' };
  } catch {
    // A timeout can happen after Telegram accepts the post.
  }
  return { telegramStatus: 'unknown' };
}

function adminRow(doc) {
  return { ...doc.data, id: doc.id, revision: doc.updateTime };
}

export async function adminCareer(body, db = firestore, now = new Date(), env = process.env, request = fetch) {
  const today = bakuDay(now);
  const { action = 'list', id } = body;
  if (action === 'list') {
    const rows = [];
    let pageToken;
    do {
      const page = await db.listDocs(COLLECTION, { pageSize: 100, pageToken });
      rows.push(...page.docs.map(adminRow));
      pageToken = page.nextPageToken;
    } while (pageToken);
    rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return result(200, { career: rows, today });
  }
  if (!['save', 'publish', 'close', 'reconcile'].includes(action)) return error(400, 'invalid_action');
  if (typeof id !== 'string' || !ID.test(id)) return error(400, 'career_invalid');
  const path = `${COLLECTION}/${id}`;
  const updatedAt = now.toISOString();
  const current = await db.getDoc(path);
  const values = action === 'save' ? fields(body) : null;
  if (action === 'save') {
    if (!values) return error(400, 'career_invalid');
    if (!current) {
      if (body.revision) return error(404, 'career_missing');
      try {
        const draft = await db.createDoc(COLLECTION, id, {
          ...values, status: 'draft', telegramStatus: 'idle', updatedAt,
        });
        return result(200, { row: adminRow(draft) });
      } catch (err) {
        if (err.code === 'exists') return error(409, 'career_conflict');
        throw err;
      }
    }
  }
  if (!current) return error(404, 'career_missing');
  const row = current.data;
  if (current.updateTime !== body.revision) return error(409, 'career_conflict');
  const update = (values, doc = current) => db.patchDoc(path, { ...values, updatedAt }, { ifUpdateTime: doc.updateTime });
  try {
    if (action === 'reconcile') {
      if (!['sending', 'unknown'].includes(row.telegramStatus) ||
          (row.telegramStatus === 'sending' && now - Date.parse(row.updatedAt) < 60_000))
        return error(409, 'career_sending');
      const messageId = body.messageId;
      if (messageId !== null && (!Number.isSafeInteger(messageId) || messageId < 1))
        return error(400, 'career_invalid');
      const saved = await update(messageId === null
        ? { telegramStatus: 'failed' }
        : { telegramStatus: 'sent', telegramMessageId: messageId });
      return result(200, { row: adminRow(saved) });
    }
    if (row.telegramStatus === 'sending') return error(409, 'career_sending');
    if (action === 'save' || action === 'close') {
      const saved = await update(action === 'save' ? values : { status: 'closed' });
      return result(200, { row: adminRow(saved) });
    }
    if (row.status === 'closed' || !isActive(row, today)) return error(409, 'career_inactive');
    if (['unknown', 'sent'].includes(row.telegramStatus)) return result(200, { row: adminRow(current) });
    const token = env.CAREER_TELEGRAM_BOT_TOKEN?.trim();
    if (!token) {
      const saved = await update({ status: 'published', telegramStatus: 'unconfigured' });
      return result(200, { row: adminRow(saved) });
    }
    const claimed = await update({ status: 'published', telegramStatus: 'sending' });
    const outcome = await sendTelegram(claimed.data, token, request);
    return result(200, { row: adminRow(await update(outcome, claimed)) });
  } catch (err) {
    if (err.code === 'conflict') return error(409, 'career_conflict');
    throw err;
  }
}
