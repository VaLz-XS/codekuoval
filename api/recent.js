/* --recent-- */

const db = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const r = await db.pipe([['LLEN', 'list:all'], ['LLEN', 'list:pub'], ['LRANGE', 'list:pub', 0, 29]]);
    const items = (await db.fetchMany(r[2])).map(db.meta);
    return res.status(200).json({ ok: true, total: r[0], pub: r[1], items: items });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
