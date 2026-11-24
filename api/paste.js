/* --paste-- */

const db = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const id = req.query.id;
      if (!db.validId(id)) return res.status(400).json({ ok: false, error: 'ID tidak valid' });
      const raw = await db.cmd(['GET', 'p:' + id]);
      if (!raw) return res.status(404).json({ ok: false, error: 'Paste tidak ditemukan' });
      return res.status(200).json({ ok: true, paste: JSON.parse(raw) });
    }
    if (req.method === 'POST') {
      const b = req.body || {};
      const code = typeof b.code === 'string' ? b.code : '';
      if (!code.trim()) return res.status(400).json({ ok: false, error: 'Kode masih kosong' });
      if (code.length > 100000) return res.status(413).json({ ok: false, error: 'Maksimal 100.000 karakter' });
      if (!(await db.limit(req, 'create', 10, 60))) return res.status(429).json({ ok: false, error: 'Terlalu cepat, coba lagi sebentar' });
      const p = {
        id: db.newId(),
        title: String(b.title || '').trim().slice(0, 60) || 'Tanpa judul',
        lang: db.LANGS.indexOf(b.lang) > -1 ? b.lang : 'Lainnya',
        vis: b.vis === 'unlisted' ? 'unlisted' : 'public',
        created: Date.now(),
        code: code
      };
      const cmds = [['SET', 'p:' + p.id, JSON.stringify(p)], ['LPUSH', 'list:all', p.id]];
      if (p.vis === 'public') cmds.push(['LPUSH', 'list:pub', p.id]);
      await db.pipe(cmds);
      return res.status(200).json({ ok: true, id: p.id });
    }
    return res.status(405).json({ ok: false });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
