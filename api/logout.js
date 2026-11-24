/* --logout-- */

const { writeCookie } = require('./_auth');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  writeCookie(res, '', 0);
  res.status(200).json({ ok: true });
};
