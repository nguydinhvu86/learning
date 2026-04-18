const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('polyglot.db', { verbose: console.log });

console.log("Initializing database schema...");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL,
    category TEXT NOT NULL,
    category_vi TEXT NOT NULL,
    en_word TEXT NOT NULL,
    en_phonetic TEXT,
    zh_hanzi TEXT NOT NULL,
    zh_pinyin TEXT,
    vi_meaning TEXT NOT NULL,
    pos TEXT,
    examples_json TEXT
  );

  CREATE TABLE IF NOT EXISTS learning_progress (
    user_id TEXT NOT NULL,
    vocab_id INTEGER NOT NULL,
    interval INTEGER DEFAULT 0,
    ease REAL DEFAULT 2.5,
    next_review INTEGER NOT NULL,
    PRIMARY KEY (user_id, vocab_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vocab_id) REFERENCES vocabulary(id)
  );
`);

console.log("Schema created successfully.");

// Insert default user
try {
  const insertUser = db.prepare('INSERT INTO users (id, username) VALUES (?, ?)');
  insertUser.run('default-user-id', 'Học Viên 1');
  console.log("Default user created.");
} catch(e) {
  if (!e.message.includes("UNIQUE constraint failed")) {
    console.error(e);
  }
}

db.close();
console.log("Database initialized at polyglot.db");
