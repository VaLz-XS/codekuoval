/* --session-- */

const { verifyToken, readCookie } = require('./_auth');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const ok = !!process.env.SESSION_SECRET && verifyToken(readCookie(req));
  res.status(200).json({ ok });
};
