import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const db = getDb();
    
    // Fetch everything exactly like the JSON
    const result = await db.execute('SELECT * FROM characters');

    // The frontend expects an array of objects
    const characters = result.rows.map(row => ({
      name: row.name,
      imageUrl: row.imageUrl,
      type: row.type,
      distance: row.distance,
      style: row.style,
      height: row.height,
      g1Wins: row.g1Wins,
      birthYear: row.birthYear,
      releaseYear: row.releaseYear,
      dotColor: row.dotColor
    }));

    // Cache the response slightly to avoid hitting DB hard if players refresh frequently
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    return res.status(200).json(characters);

  } catch (error) {
    console.error('Error fetching characters:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
