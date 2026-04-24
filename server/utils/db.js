import Database from 'better-sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

let db;
let usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Railway/other managed services
  });
  
  // Initialize PostgreSQL table
  db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'To Do'
    )
  `).catch(err => console.error('Error initializing PostgreSQL:', err));
} else {
  const dbPath = process.env.DB_PATH || 'tasks.db';
  const dbDir = path.dirname(dbPath);
  if (dbDir !== '.' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  db = new Database(dbPath);
  
  // Initialize SQLite table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'To Do'
    )
  `);
}

export default {
  getTasks: async () => {
    if (usePostgres) {
      const { rows } = await db.query('SELECT * FROM tasks ORDER BY id DESC');
      return rows;
    }
    return db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
  },
  getTaskById: async (id) => {
    if (usePostgres) {
      const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
      return rows[0];
    }
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  },
  addTask: async (title, description, priority, status) => {
    const p = priority || 'Medium';
    const s = status || 'To Do';
    if (usePostgres) {
      const { rows } = await db.query(
        'INSERT INTO tasks (title, description, priority, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, p, s]
      );
      return rows[0];
    }
    const info = db.prepare('INSERT INTO tasks (title, description, priority, status) VALUES (?, ?, ?, ?)').run(
      title, description, p, s
    );
    return { id: info.lastInsertRowid, title, description, priority: p, status: s };
  },
  updateTask: async (id, title, description, priority, status) => {
    if (usePostgres) {
      const { rows } = await db.query(
        'UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4 WHERE id = $5 RETURNING *',
        [title, description, priority, status, id]
      );
      return rows[0] || null;
    }
    const info = db.prepare('UPDATE tasks SET title = ?, description = ?, priority = ?, status = ? WHERE id = ?').run(
      title, description, priority, status, id
    );
    if (info.changes === 0) return null;
    return { id, title, description, priority, status };
  },
  deleteTask: async (id) => {
    if (usePostgres) {
      const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
      return rowCount > 0;
    }
    const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return info.changes > 0;
  }
};
