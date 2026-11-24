/* --db-helper-- */

const crypto = require('crypto');
const DB_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const DB_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const LANGS = ['HTML', 'CSS', 'JavaScript', 'Python', 'Lainnya'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/* --redis-call-- */

async function call(path, body) {
  if (!DB_URL || !DB_TOKEN) throw new Error('Database belum dikonfigurasi');
  const r = await fetch(DB_URL + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + DB_TOKEN },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Database error');
  return d;
}

async function cmd(args) {
  const d = await call('', args);
  if (d.error) throw new Error(d.error);
  return d.result;
}

async function pipe(list) {
  const d = await call('/pipeline', list);
  return d.map((x) => { if (x.error) throw new Error(x.error); return x.result; });
}

/* --helpers-- */

function newId() {
  const b = crypto.randomBytes(10);
  let s = '';
  for (const x of b) s += ALPHA[x % 62];
  return s;
}

function validId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9]{6,20}$/.test(id);
}

function meta(p) {
  return { id: p.id, title: p.title, lang: p.lang, vis: p.vis, created: p.created, size: p.code.length };
}

async function fetchMany(ids) {
  if (!ids.length) return [];
  const rows = await cmd(['MGET'].concat(ids.map((i) => 'p:' + i)));
  return rows.filter(Boolean).map((r) => JSON.parse(r));
}

async function limit(req, key, max, sec) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const k = 'rl:' + key + ':' + ip;
  const r = await pipe([['INCR', k], ['EXPIRE', k, sec]]);
  return r[0] <= max;
}

module.exports = { cmd, pipe, newId, validId, meta, fetchMany, limit, LANGS };
