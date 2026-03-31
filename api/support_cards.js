import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const db = getDb();
    const result = await db.execute('SELECT * FROM support_cards');

    const items = result.rows.map(row => ({
      name: row.name,
      imageUrl: row.imageUrl,
      character: row.character,
      rarity: row.rarity,
      type: row.type,
      releaseYear: row.releaseYear,
      uniqueEffect: row.uniqueEffect
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching support cards:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
