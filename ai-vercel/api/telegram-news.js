// api/telegram-news.js — Vercel Serverless Function
//
// Açıq Telegram kanalının son postlarını (t.me/s/<kanal> veb önizləməsindən) oxuyub
// qısa JSON kimi qaytarır. Brauzer t.me-dən birbaşa oxuya bilmir (CORS), ona görə sayt bu endpointi çağırır.
//
//   GET /api/telegram-news            → { channel, posts: [ { id, url, text, date } ] }   (ən yenisi birinci, 3 post)
//   GET /api/telegram-news?limit=5    → 1–5 arası post
//
// Kanal adı TELEGRAM_CHANNEL mühit dəyişəni ilə dəyişdirilə bilər (standart: unecstudentshub).
// Qeyd: bu, Telegram-ın rəsmi API-si deyil — açıq kanalın veb önizləməsinin HTML-ni oxuyur. Yalnız KANALLAR üçün
// işləyir (qruplar üçün t.me/s önizləməsi yoxdur). Telegram HTML-i dəyişsə, yalnız parse() funksiyasını yeniləmək lazım olacaq.

const DEFAULT_CHANNEL = 'unecstudentshub';
const MAX_POSTS = 5;
const TEXT_LIMIT = 220;

const ALLOWED_ORIGINS = [
  'https://unecstudentshub.com',
  'https://www.unecstudentshub.com',
  'https://ericismyhero.github.io',
  'https://ericismyhero-github-io.vercel.app'
];

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''; } catch (_) { return ''; }
    }
    const k = e.toLowerCase();
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, k) ? NAMED_ENTITIES[k] : m;
  });
}

function htmlToText(html) {
  const text = decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div)>/gi, '\n')
      .replace(/<[^>]*>/g, '')
  );
  return text
    .replace(/[ \t ]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:–-]+$/, '') + '…';
}

// t.me/s/<kanal> səhifəsindən postları çıxarır (köhnədən yeniyə sıralanmış halda gəlir).
export function parse(html, channel) {
  const posts = [];
  const blocks = html.split('tgme_widget_message_wrap').slice(1);
  for (const block of blocks) {
    const idm = block.match(/data-post="([^"\/]+)\/(\d+)"/);
    if (!idm) continue;
    if (idm[1].toLowerCase() !== channel.toLowerCase()) continue;
    if (/service_message|message_service/.test(block)) continue;      // "kanal şəkli dəyişdi", "post sancıldı" və s.
    const tm = block.match(/<div class="tgme_widget_message_text(?:\s[^"]*)?"[^>]*>([\s\S]*?)<\/div>/);
    if (!tm) continue;                                                // mətni olmayan (yalnız şəkil/video) postlar
    const text = htmlToText(tm[1]);
    if (!text) continue;
    const dm = block.match(/<time[^>]*datetime="([^"]+)"/);
    const date = dm && !Number.isNaN(Date.parse(dm[1])) ? new Date(dm[1]).toISOString() : null;
    posts.push({
      id: Number(idm[2]),
      url: `https://t.me/${channel}/${idm[2]}`,
      text: truncate(text, TEXT_LIMIT),
      date
    });
  }
  return posts;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const channel = (process.env.TELEGRAM_CHANNEL || DEFAULT_CHANNEL).replace(/[^A-Za-z0-9_]/g, '');
  let limit = parseInt(req.query && req.query.limit, 10);
  if (!Number.isFinite(limit)) limit = 3;
  limit = Math.min(Math.max(limit, 1), MAX_POSTS);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 7000);
  try {
    const r = await fetch(`https://t.me/s/${channel}`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UNECStudentsHub/1.0)', 'Accept-Language': 'az,en;q=0.8' }
    });
    if (!r.ok) throw new Error('Telegram HTTP ' + r.status);
    const html = await r.text();
    const posts = parse(html, channel).slice(-limit).reverse();

    // 5 dəq. CDN keşi + köhnə cavabı fonda yeniləmə: Telegram-a sorğu sayı az qalır, sayt sürətli açılır.
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json({ channel, posts });
  } catch (err) {
    console.error('[telegram-news]', err && err.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Telegram oxunmadı' });
  } finally {
    clearTimeout(timer);
  }
}
