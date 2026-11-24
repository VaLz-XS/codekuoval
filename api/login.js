/* --login-- */

const { makeToken, writeCookie, safeEqual, TTL } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS || !process.env.SESSION_SECRET) {
    return res.status(500).json({ ok: false, error: 'Server belum dikonfigurasi' });
  }
  const body = req.body || {};
  const okUser = safeEqual(body.username || '', process.env.ADMIN_USER);
  const okPass = safeEqual(body.password || '', process.env.ADMIN_PASS);
  if (!(okUser && okPass)) {
    await new Promise((r) => setTimeout(r, 800));
    return res.status(401).json({ ok: false, error: 'Username atau password salah' });
  }
  writeCookie(res, makeToken(), TTL);
  return res.status(200).json({ ok: true });
};
