import { getDb } from './lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// A fallback in case Node doesn't load .env automatically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runLocalSeed() {
  console.log("Conectando ao banco Turso pela sua .env...");

  try {
    const db = getDb();

    console.log("Resetando e Criando Tabelas Emojis, Quotes, Splash e Support...");
    await db.execute(`CREATE TABLE IF NOT EXISTS emojis (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, emojis TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS quotes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, quote TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS splash (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, splashUrl TEXT, originX INTEGER, originY INTEGER, imageUrl TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS support_cards (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, imageUrl TEXT, character TEXT, rarity TEXT, type TEXT, releaseYear INTEGER, uniqueEffect TEXT)`);

    await db.execute('DELETE FROM emojis');
    await db.execute('DELETE FROM quotes');
    await db.execute('DELETE FROM splash');
    await db.execute('DELETE FROM support_cards');

    console.log("Lendo arquivos JSON Locais...");
    const readLocal = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf-8'));
    
    const emojisDb = readLocal('database_emojis.json');
    const quotesDb = readLocal('database_quotes.json');
    const splashDb = readLocal('database_splash.json');
    const supportDb = readLocal('support_cards.json');

    console.log("Transferindo para o Turso (Isso pode demorar alguns segundos)....");
    let cEmojis = 0, cQuotes = 0, cSplash = 0, cSupport = 0;
    
    for (const item of emojisDb) {
      await db.execute({ sql: `INSERT INTO emojis (name, emojis) VALUES (?, ?)`, args: [item.name, item.emojis] });
      cEmojis++;
    }

    for (const item of quotesDb) {
      await db.execute({ sql: `INSERT INTO quotes (name, quote) VALUES (?, ?)`, args: [item.name, item.quote] });
      cQuotes++;
    }

    for (const item of splashDb) {
      await db.execute({ sql: `INSERT INTO splash (name, splashUrl, originX, originY, imageUrl) VALUES (?, ?, ?, ?, ?)`, args: [item.name, item.splashUrl, item.originX, item.originY, item.imageUrl] });
      cSplash++;
    }

    for (const item of supportDb) {
      await db.execute({ sql: `INSERT INTO support_cards (name, imageUrl, character, rarity, type, releaseYear, uniqueEffect) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [item.name, item.imageUrl, item.character, item.rarity, item.type, item.releaseYear, item.uniqueEffect] });
      cSupport++;
    }

    console.log(`✅ MIGRAÇÃO 100% CUMPRIDA!`);
    console.log(`Emojis: ${cEmojis} | Falas: ${cQuotes} | Splash: ${cSplash} | Support: ${cSupport}`);

  } catch (error) {
    console.error('🚫 ERRO CRÍTICO NA MIGRAÇÃO:', error);
  }
}

runLocalSeed();
