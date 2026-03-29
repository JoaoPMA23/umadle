import { getDb } from '../lib/db.js';

export default async function handler(req, res) {
  // Simple auth to prevent unauthorized access
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized Access' });
  }

  const db = getDb();

  // Handle Adding a new character
  if (req.method === 'POST') {
    try {
      const char = req.body;
      
      await db.execute({
        sql: `INSERT INTO characters 
              (name, imageUrl, type, distance, style, height, g1Wins, birthYear, releaseYear, dotColor) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          char.name, char.imageUrl, char.type, char.distance, 
          char.style, char.height, char.g1Wins, char.birthYear, 
          char.releaseYear, char.dotColor
        ]
      });

      return res.status(201).json({ success: true, message: 'Character added successfully!' });
    } catch (error) {
      console.error('Error adding character:', error);
      return res.status(500).json({ error: 'Failed to add character', details: error.message });
    }
  }

  // Handle Deleting a character
  if (req.method === 'DELETE') {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      await db.execute({
        sql: `DELETE FROM characters WHERE name = ?`,
        args: [name]
      });

      return res.status(200).json({ success: true, message: 'Character deleted successfully!' });
    } catch (error) {
       console.error('Error deleting character:', error);
       return res.status(500).json({ error: 'Failed to delete character' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
