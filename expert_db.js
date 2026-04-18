const mysql = require('mysql2/promise');

async function resetDB() {
  console.log("Connecting to MySQL on 192.168.10.40...");
  let pool;
  try {
     pool = mysql.createPool({ host: '192.168.10.40', user: 'root1', password: '' });
  } catch(e) {
     console.error(e); process.exit(1);
  }

  console.log("🔥 Purging old databases...");
  await pool.query('DROP DATABASE IF EXISTS polyglot_lms');
  await pool.query('CREATE DATABASE polyglot_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await pool.query('USE polyglot_lms');
  
  console.log("🏗️ Constructing Expert Linguistic Schema...");
  await pool.query(`CREATE TABLE users (
     id VARCHAR(50) PRIMARY KEY, username VARCHAR(100) UNIQUE, role VARCHAR(20) DEFAULT 'student'
  )`);
  // Seed admin
  await pool.query('INSERT INTO users (id, username, role) VALUES (?, ?, ?)', ['admin-1234', 'Admin', 'admin']);
  
  // High-level wrapper for scenarios ("Tiếng Trung Giao Tiếp", "Travel English")
  await pool.query(`CREATE TABLE courses (
     id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, language_target VARCHAR(50)
  )`);
  
  // Specific sections within a course ("Lesson 1: Greetings")
  await pool.query(`CREATE TABLE lessons (
     id INT AUTO_INCREMENT PRIMARY KEY, course_id INT, title VARCHAR(255), order_index INT,
     FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  )`);
  
  // The universal item table storing BOTH Vocabulary, Sentences, and Grammar rules
  await pool.query(`CREATE TABLE items (
     id INT AUTO_INCREMENT PRIMARY KEY, lesson_id INT, 
     item_type ENUM('word', 'sentence', 'grammar'),
     target_text VARCHAR(500) NOT NULL, 
     phonetic VARCHAR(255), 
     native_meaning TEXT NOT NULL,
     audio_url VARCHAR(255), 
     extra_json JSON,
     FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
  )`);
  
  // 4-Skills Mastery Tracker & SRS combined
  await pool.query(`CREATE TABLE user_progress (
     user_id VARCHAR(50), item_id INT, 
     score_listen INT DEFAULT 0, 
     score_speak INT DEFAULT 0, 
     score_read INT DEFAULT 0, 
     score_write INT DEFAULT 0,
     srs_interval INT DEFAULT 0,
     srs_ease FLOAT DEFAULT 2.5,
     next_review BIGINT NOT NULL,
     PRIMARY KEY (user_id, item_id),
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  )`);

  console.log("✅ Database rebuilt successfully!");
  process.exit(0);
}
resetDB();
