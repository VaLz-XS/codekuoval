/* --auth-helper-- */

const crypto = require('crypto');
const COOKIE = 'kv_admin';
const TTL = 60 * 60 * 8;

function sign(value) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('hex');
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function makeToken() {
  const exp = String(Date.now() + TTL * 1000);
  return exp + '.' + sign(exp);
}

function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  return safeEqual(parts[1], sign(parts[0])) && Number(parts[0]) > Date.now();
}

function readCookie(req) {
  const m = (req.headers.cookie || '').match(/(?:^|; )kv_admin=([^;]+)/);
  return m ? m[1] : null;
}

function writeCookie(res, value, maxAge) {
  res.setHeader('Set-Cookie', COOKIE + '=' + value + '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=' + maxAge);
}

module.exports = { makeToken, verifyToken, readCookie, writeCookie, safeEqual, TTL };
