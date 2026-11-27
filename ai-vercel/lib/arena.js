// Public leaderboards. Each board contains one best result per authenticated player.
import { createHash } from 'node:crypto';
import { verifyIdToken } from './payments.js';
import * as firestore from './firestore.js';

const ringCounts = { easy: 85, medium: 150, hard: 225 };
const wavesBoard = 'semester-waves';
const dailyBoard = 'semester-defense--daily';
const maxScore = 2000000;
const dayStride = (maxScore + 1) * 2;
const days = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Baku', year: 'numeric', month: '2-digit', day: '2-digit' });
const boards = new Set([
  ...Object.keys(ringCounts).map(mode => 'ring-escape--' + mode),
  'tower-descent--standard',
  ...['campaign', 'endless', 'continuation'].flatMap(mode =>
    ['easy', 'normal', 'hard'].map(level => 'semester-defense--' + mode + '-' + level)),
  wavesBoard, dailyBoard
]);
const lookFields = ['head', 'outfit', 'accessory', 'palette', 'effect', 'title'];
const safeInt = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const playerId = uid => createHash('sha256').update(uid).digest('hex');
const collection = board => 'arena_leaderboards/' + board + '/scores';
export const arenaPaths = uid => [...boards].map(board => collection(board) + '/' + playerId(uid));

function publicName(email) {
  if (typeof email !== 'string') return '';
  const end = email.indexOf('@');
  return end > 0 ? email.slice(0, end).replace(/[\p{C}\s<>]/gu, '').slice(0, 64) : '';
}
function publicLook(value) {
  return Object.fromEntries(lookFields.map(key => [key,
    typeof value?.[key] === 'string' && /^[a-z][a-z0-9-]{0,23}$/.test(value[key]) ? value[key] : '']));
}

function validateResult(item, day, dayRank) {
  const board = item?.board;
  if (!boards.has(board)) return null;
  if (board === wavesBoard) {
    if (!safeInt(item.reached, 1, 10000) || !safeInt(item.cleared, 0, item.reached)) return null;
    return { board, reached: item.reached, cleared: item.cleared, rank: item.reached * 10001 + item.cleared };
  }
  const { score, won } = item;
  if (!safeInt(score, 0, maxScore) || typeof won !== 'boolean') return null;
  if (board === dailyBoard) {
    if (item.day !== day || (won && score < 1700)) return null;
    return { board, day, score, won, rank: dayRank + score * 2 + Number(won) };
  }
  if (board.startsWith('ring-escape--')) {
    const max = ringCounts[board.split('--')[1]] * 10;
    if (score % 10 || (won ? score !== max + 100 : score > max)) return null;
  } else if (board === 'tower-descent--standard') {
    if (score % 10 || (won ? score < 460 || score > 1000 : score > 900)) return null;
  }
  return { board, score, won, rank: score * 2 + Number(won) };
}
function publicResult(data) {
  const { player, look, score, won, reached, cleared } = data;
  return { player, look, score, won, reached, cleared };
}
const response = (status, json) => ({ status, json });
const error = (status, code) => response(status, { error: code });

async function saveBest(db, env, id, identity, result) {
  const { board, ...score } = result;
  const path = collection(board) + '/' + id;
  const record = { ...score, ...identity };
  for (let attempt = 0; attempt < 5; attempt++) {
    const previous = await db.getDoc(path, env);
    if (previous?.data.rank > record.rank) return;
    if (previous?.data.rank === record.rank && previous.data.player === record.player &&
        lookFields.every(field => previous.data.look?.[field] === record.look[field])) return;
    try {
      if (previous) await db.patchDoc(path, record, { ifUpdateTime: previous.updateTime }, env);
      else await db.createDoc(collection(board), id, record, env);
      return;
    } catch (err) {
      if (!['exists', 'conflict'].includes(err.code)) throw err;
    }
  }
  throw new Error('arena_busy');
}

export async function arenaAction(body, env = process.env, services = {}) {
  const db = services.db || firestore;
  const verify = services.verify || verifyIdToken;
  const day = days.format(services.now?.() ?? new Date());
  const dayRank = Math.floor(Date.parse(day) / 86400000) * dayStride;
  if (body.action === 'arena-list') {
    if (!boards.has(body.board)) return error(400, 'invalid_board');
    const user = body.idToken ? await verify(body.idToken, env) : null;
    const parent = 'arena_leaderboards/' + body.board;
    const daily = body.board === dailyBoard;
    const [docs, mine] = await Promise.all([
      db.runQuery({
        from: [{ collectionId: 'scores' }],
        ...(daily ? { where: { fieldFilter: { field: { fieldPath: 'rank' }, op: 'GREATER_THAN_OR_EQUAL',
          value: { integerValue: String(dayRank) } } } } : {}),
        orderBy: [{ field: { fieldPath: 'rank' }, direction: 'DESCENDING' }],
        limit: 10
      }, env, parent),
      user ? db.getDoc(collection(body.board) + '/' + playerId(user.uid), env) : null
    ]);
    const rows = docs.filter(doc => !daily || doc.data.day === day).map(doc => publicResult(doc.data));
    return response(200, { rows, mine: mine && (!daily || mine.data.day === day) ? publicResult(mine.data) : null,
      ...(daily ? { day } : {}) });
  }
  if (body.action !== 'arena-submit') return error(400, 'invalid_action');

  const user = await verify(body.idToken, env);
  if (!user) return error(401, 'login_required');
  const player = publicName(user.email);
  if (!player) return error(422, 'email_required');
  if (!Array.isArray(body.results) || body.results.length < 1 || body.results.length > boards.size) {
    return error(400, 'invalid_results');
  }

  const results = body.results.map(item => validateResult(item, day, dayRank));
  // Validate each category independently so one invalid older result cannot block the others.
  const accepted = results.filter(Boolean);
  const seen = new Set(accepted.map(row => row.board));
  if (!accepted.length || seen.size !== accepted.length) return error(400, 'invalid_results');
  const deletionPath = 'account_deletions/' + user.uid;
  if (await db.getDoc(deletionPath, env)) return error(409, 'account_deleting');

  const identity = { player, look: publicLook(body.look) }, id = playerId(user.uid);
  await Promise.all(accepted.map(row => saveBest(db, env, id, identity, row)));
  if (await db.getDoc(deletionPath, env)) {
    await Promise.all(accepted.map(row => db.deleteDoc(collection(row.board) + '/' + id, env)));
    return error(409, 'account_deleting');
  }
  return response(200, { accepted: [...seen] });
}
