import { getDb } from '../lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Very basic authorization based on an environment variable.
  if (req.query.secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Add ?secret=YOUR_SECRET to the URL.' });
  }

  try {
    const db = getDb();

    // 1. Criar as Novas Tabelas caso não existam no Turso
    await db.execute(`
      CREATE TABLE IF NOT EXISTS emojis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        emojis TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quote TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS splash (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        splashUrl TEXT,
        originX INTEGER,
        originY INTEGER,
        imageUrl TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS support_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        imageUrl TEXT,
        character TEXT,
        rarity TEXT,
        type TEXT,
        releaseYear INTEGER,
        uniqueEffect TEXT
      )
    `);

    // 2. Limpar tudo para Seedagem Limpa
    await db.execute('DELETE FROM emojis');
    await db.execute('DELETE FROM quotes');
    await db.execute('DELETE FROM splash');
    await db.execute('DELETE FROM support_cards');

    // 3. Ler Arquivos Locais com Padrão Vercel
    // Usamos caminhos literais com process.cwd() para o Vercel saber que precisa "empacotar" esses arquivos na nuvem.
    const emojisDb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database_emojis.json'), 'utf-8'));
    const quotesDb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database_quotes.json'), 'utf-8'));
    const splashDb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'database_splash.json'), 'utf-8'));
    const supportDb = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'support_cards.json'), 'utf-8'));

    // 4. Inserir Tudo
    let cEmojis = 0, cQuotes = 0, cSplash = 0, cSupport = 0;
    
    for (const item of emojisDb) {
      await db.execute({
        sql: `INSERT INTO emojis (name, emojis) VALUES (?, ?)`,
        args: [item.name, item.emojis]
      });
      cEmojis++;
    }

    for (const item of quotesDb) {
      await db.execute({
        sql: `INSERT INTO quotes (name, quote) VALUES (?, ?)`,
        args: [item.name, item.quote]
      });
      cQuotes++;
    }

    for (const item of splashDb) {
      await db.execute({
        sql: `INSERT INTO splash (name, splashUrl, originX, originY, imageUrl) VALUES (?, ?, ?, ?, ?)`,
        args: [item.name, item.splashUrl, item.originX, item.originY, item.imageUrl]
      });
      cSplash++;
    }

    for (const item of supportDb) {
      await db.execute({
        sql: `INSERT INTO support_cards (name, imageUrl, character, rarity, type, releaseYear, uniqueEffect) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [item.name, item.imageUrl, item.character, item.rarity, item.type, item.releaseYear, item.uniqueEffect]
      });
      cSupport++;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Tabelas Recriadas. Inseridos: ${cEmojis} Emojis, ${cQuotes} Quotes, ${cSplash} Splashes, ${cSupport} Support Cards.` 
    });

  } catch (error) {
    console.error('Error seeding modes:', error);
    return res.status(500).json({ error: 'Failed to seed modes', details: error.message });
  }
}
