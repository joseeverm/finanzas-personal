import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
dotenv.config()

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT,
    password_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT '📦',
    user_id INTEGER REFERENCES users(id)
  )
`)

await db.execute(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    amount REAL NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    date TEXT NOT NULL,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    user_id INTEGER REFERENCES users(id)
  )
`)

// Migración: insertar usuario dueño de los datos existentes (id=1)
await db.execute(`
  INSERT OR IGNORE INTO users (id, email, name)
  VALUES (1, 'jmu3612@gmail.com', 'Jose')
`)
// Migración: asignar contraseña temporal si no tiene ninguna
await db.execute(`
  UPDATE users SET password_hash = '$2b$12$P66EgmMlfJ.xCHkzirPYzux2PedkL3to.WsUhY1Dn38uhmyR6tWVO'
  WHERE id = 1 AND password_hash IS NULL
`)

// Migración: agregar columnas nuevas si no existen
try { await db.execute('ALTER TABLE categories ADD COLUMN user_id INTEGER DEFAULT 1') } catch {}
try { await db.execute('ALTER TABLE transactions ADD COLUMN user_id INTEGER DEFAULT 1') } catch {}
try { await db.execute('ALTER TABLE users ADD COLUMN password_hash TEXT') } catch {}

export default db