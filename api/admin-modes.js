import { getDb } from '../lib/db.js';

// Definição dos schemas por tabela para segurança e validação
const TABLE_SCHEMAS = {
  emojis: {
    columns: ['name', 'emojis'],
    identityCol: 'name'
  },
  quotes: {
    columns: ['name', 'quote'],
    identityCol: 'id'
  },
  splash: {
    columns: ['name', 'splashUrl', 'originX', 'originY', 'imageUrl'],
    identityCol: 'name'
  },
  support_cards: {
    columns: ['name', 'imageUrl', 'character', 'rarity', 'type', 'releaseYear', 'uniqueEffect'],
    identityCol: 'name'
  }
};

export default async function handler(req, res) {
  // Auth
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized Access' });
  }

  const { table } = req.query;

  if (!table || !TABLE_SCHEMAS[table]) {
    return res.status(400).json({ error: `Invalid table. Valid: ${Object.keys(TABLE_SCHEMAS).join(', ')}` });
  }

  const schema = TABLE_SCHEMAS[table];
  const db = getDb();

  // ─── GET: List all rows ───
  if (req.method === 'GET') {
    try {
      const result = await db.execute(`SELECT * FROM ${table}`);
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch', details: error.message });
    }
  }

  // ─── POST: Insert a new row ───
  if (req.method === 'POST') {
    try {
      const data = req.body;
      const cols = schema.columns;
      const placeholders = cols.map(() => '?').join(', ');
      const args = cols.map(c => data[c] ?? null);

      await db.execute({
        sql: `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
        args
      });

      return res.status(201).json({ success: true, message: `Registro adicionado em ${table}!` });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to insert', details: error.message });
    }
  }

  // ─── PUT: Update an existing row ───
  if (req.method === 'PUT') {
    try {
      const data = req.body;
      const identityCol = schema.identityCol;
      const identityValue = data._identityValue;

      if (!identityValue) {
        return res.status(400).json({ error: 'Missing _identityValue for update' });
      }

      const cols = schema.columns;
      const setClause = cols.map(c => `${c} = ?`).join(', ');
      const args = [...cols.map(c => data[c] ?? null), identityValue];

      await db.execute({
        sql: `UPDATE ${table} SET ${setClause} WHERE ${identityCol} = ?`,
        args
      });

      return res.status(200).json({ success: true, message: `Registro atualizado em ${table}!` });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update', details: error.message });
    }
  }

  // ─── DELETE: Remove a row ───
  if (req.method === 'DELETE') {
    try {
      const { identityValue } = req.body;
      const identityCol = schema.identityCol;

      if (!identityValue) {
        return res.status(400).json({ error: 'Missing identityValue for delete' });
      }

      await db.execute({
        sql: `DELETE FROM ${table} WHERE ${identityCol} = ?`,
        args: [identityValue]
      });

      return res.status(200).json({ success: true, message: `Registro removido de ${table}!` });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
