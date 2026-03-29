import { getDb } from '../lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Simple protection: only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Very basic authorization based on an environment variable, 
  // so random users hitting /api/seed can't reset the DB.
  if (req.query.secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Add ?secret=YOUR_SECRET to the URL.' });
  }

  try {
    const db = getDb();
    
    // 1. Create the table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        imageUrl TEXT,
        type TEXT,
        distance TEXT,
        style TEXT,
        height INTEGER,
        g1Wins INTEGER,
        birthYear INTEGER,
        releaseYear INTEGER,
        dotColor TEXT
      )
    `);

    // We can clear it before seeding so we don't have duplicates
    await db.execute('DELETE FROM characters');

    // 2. Read the local JSON file
    const dbPath = path.join(__dirname, '..', 'database.json');
    const dbJson = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    // 3. Insert each character into the DB
    let inserted = 0;
    for (const char of dbJson) {
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
      inserted++;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Database successfully seeded with ${inserted} characters.` 
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return res.status(500).json({ error: 'Failed to seed database', details: error.message });
  }
}
