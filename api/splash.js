import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const db = getDb();
    const result = await db.execute('SELECT * FROM splash');

    const items = result.rows.map(row => ({
      name: row.name,
      splashUrl: row.splashUrl,
      originX: row.originX,
      originY: row.originY,
      imageUrl: row.imageUrl
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching splash:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
