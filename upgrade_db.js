const mysql = require('mysql2/promise');

async function upgradeDB() {
  let conn;
  try {
    conn = await mysql.createConnection({ host: '192.168.10.40', user: 'root1', password: '', database: 'polyglot_lms' });
    
    console.log("Creating categories table...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_vi VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0
      )
    `);
    
    console.log("Populating categories from existing vocabulary...");
    await conn.query(`
      INSERT INTO categories (level, name, name_vi)
      SELECT DISTINCT level, category, category_vi 
      FROM vocabulary
      WHERE category NOT IN (SELECT name FROM categories)
    `);
    
    console.log("✅ DB Upgrade complete.");
    process.exit(0);
  } catch(e) {
    console.error("Error", e);
    process.exit(1);
  }
}

upgradeDB();
