/* --raw-- */

const db = require('./_db');

module.exports = async (req, res) => {
  try {
    const id = req.query.id;
    if (!db.validId(id)) return res.status(400).send('ID tidak valid');
    const raw = await db.cmd(['GET', 'p:' + id]);
    if (!raw) return res.status(404).send('Paste tidak ditemukan');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(JSON.parse(raw).code);
  } catch (e) {
    return res.status(500).send('Server error');
  }
};
