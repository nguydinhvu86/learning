const mysql = require('mysql2/promise');

async function upgradeDB() {
  let pool;
  try {
     pool = mysql.createPool({ host: '192.168.10.40', user: 'root1', password: '', database: 'polyglot_lms' });
     console.log("Upgrading item_type column...");
     await pool.query("ALTER TABLE items MODIFY COLUMN item_type VARCHAR(50) NOT NULL");
     console.log("✅ Column item_type is now open VARCHAR.");
     process.exit(0);
  } catch(e) {
     console.error(e); process.exit(1);
  }
}
upgradeDB();
