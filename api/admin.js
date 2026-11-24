/* --admin-- */

const db = require('./_db');
const { verifyToken, readCookie } = require('./_auth');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.SESSION_SECRET || !verifyToken(readCookie(req))) {
    return res.status(401).json({ ok: false, error: 'Belum login' });
  }
  try {
    if (req.method === 'GET') {
      const r = await db.pipe([['LLEN', 'list:all'], ['LLEN', 'list:pub'], ['LRANGE', 'list:all', 0, 99]]);
      const items = (await db.fetchMany(r[2])).map(db.meta);
      return res.status(200).json({ ok: true, total: r[0], pub: r[1], items: items });
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      if (b.action === 'delete') {
        if (!db.validId(b.id)) return res.status(400).json({ ok: false, error: 'ID tidak valid' });
        await db.pipe([['DEL', 'p:' + b.id], ['LREM', 'list:all', 0, b.id], ['LREM', 'list:pub', 0, b.id]]);
        return res.status(200).json({ ok: true });
      }
      if (b.action === 'clear') {
        const ids = await db.cmd(['LRANGE', 'list:all', 0, -1]);
        const cmds = ids.map((i) => ['DEL', 'p:' + i]);
        cmds.push(['DEL', 'list:all'], ['DEL', 'list:pub']);
        await db.pipe(cmds);
        return res.status(200).json({ ok: true });
      }
    }
    return res.status(405).json({ ok: false });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
