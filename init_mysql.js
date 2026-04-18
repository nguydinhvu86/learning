const mysql = require('mysql2/promise');
const fs = require('fs');

async function init() {
  console.log("Connecting to MySQL on 192.168.10.40 (root1/blank)...");
  let conn;
  try {
    conn = await mysql.createConnection({ host: '192.168.10.40', user: 'root1', password: '' });
  } catch(e) {
    console.error("❌ Không thể kết nối MySQL! Bạn đã bật XAMPP / WAMP chưa?", e.message);
    process.exit(1);
  }

  console.log("✅ Kết nối MySQL thành công. Đang khởi tạo CSDL...");
  await conn.query("CREATE DATABASE IF NOT EXISTS polyglot_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
  await conn.query("USE polyglot_lms;");

  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(20) DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id INT AUTO_INCREMENT PRIMARY KEY,
      level INT NOT NULL,
      category VARCHAR(255) NOT NULL,
      category_vi VARCHAR(255) NOT NULL,
      en_word VARCHAR(255) NOT NULL,
      en_phonetic VARCHAR(255),
      zh_hanzi VARCHAR(255) NOT NULL,
      zh_pinyin VARCHAR(255),
      vi_meaning VARCHAR(500) NOT NULL,
      pos VARCHAR(50),
      examples_json JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      user_id VARCHAR(50) NOT NULL,
      vocab_id INT NOT NULL,
      interval_days INT DEFAULT 0,
      ease FLOAT DEFAULT 2.5,
      next_review BIGINT NOT NULL,
      PRIMARY KEY (user_id, vocab_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (vocab_id) REFERENCES vocabulary(id) ON DELETE CASCADE
    );
  `;
  
  // split and execute
  for(let q of schema.split(';').map(x=>x.trim()).filter(Boolean)) {
     await conn.query(q);
  }
  
  console.log("✅ Đã tạo cấu trúc Bảng thành công!");

  // Seed default admin
  await conn.query('INSERT IGNORE INTO users (id, username, role) VALUES (?, ?, ?)', ['admin-1234', 'Admin', 'admin']);
  
  // Seed Data from trilingual files
  const levels = [1,2,3,4,5,6];
  let totalSeeded = 0;
  
  for(let l of levels) {
    const filePath = `js/data_trilingual/hsk${l}.js`;
    if(!fs.existsSync(filePath)) continue;
    
    let raw = fs.readFileSync(filePath, 'utf8').replace(`const HSK${l}_DATA = `, 'module.exports = ');
    fs.writeFileSync('temp.js', raw);
    delete require.cache[require.resolve('./temp.js')];
    const data = require('./temp.js');
    
    for(let cat of data.categories) {
       for(let w of cat.words) {
          try {
             await conn.query(
               'INSERT INTO vocabulary (level, category, category_vi, en_word, en_phonetic, zh_hanzi, zh_pinyin, vi_meaning, pos, examples_json) VALUES (?,?,?,?,?,?,?,?,?,?)',
               [l, cat.name, cat.name_vi, w.en?.word||'', w.en?.phonetic||'', w.zh?.hanzi||'', w.zh?.pinyin||'', w.vi_meaning||'', w.pos||'', JSON.stringify(w.examples||[])]
             );
             totalSeeded++;
          } catch(e) {
             // duplicate or skip
          }
       }
    }
  }
  console.log(`✅ Đã chèn thành công ${totalSeeded} từ vựng vào MySQL!`);
  
  await conn.end();
  console.log("🎉 Hoàn tất cài đặt Database. Bạn có thể chạy 'node server.js'!");
}

init();
