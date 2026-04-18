const mysql = require('mysql2/promise');

async function seedData() {
  const pool = mysql.createPool({ host: '192.168.10.40', user: 'root1', password: '', database: 'polyglot_lms' });
  
  try {
     console.log("Seeding Course...");
     const [cResult] = await pool.query("INSERT INTO courses (title, language_target, description) VALUES ('HSK 1 - Nhập môn', 'Chinese', 'Khóa học căn bản dành cho người mới bắt đầu học tiếng Trung.')");
     const cid = cResult.insertId;

     console.log("Seeding Lessons...");
     const [l1] = await pool.query("INSERT INTO lessons (course_id, title, order_index) VALUES (?, 'Phần 1: Chào Hỏi Cơ Bản', 1)", [cid]);
     const lid1 = l1.insertId;

     const [l2] = await pool.query("INSERT INTO lessons (course_id, title, order_index) VALUES (?, 'Phần 2: Giới Thiệu Bản Thân', 2)", [cid]);
     const lid2 = l2.insertId;

     console.log("Seeding Linguistic Items for Lesson 1...");
     const items1 = [
        [lid1, 'word', '你好', 'nǐ hǎo', 'Xin chào'],
        [lid1, 'word', '您好', 'nín hǎo', 'Xin chào (Kính trọng)'],
        [lid1, 'sentence', '你好吗？', 'nǐ hǎo ma?', 'Bạn có khỏe không?'],
        [lid1, 'grammar', 'Đại từ nhân xưng + 好', '', 'Cấu trúc cơ bản dùng để chào hỏi ai đó.'],
        [lid1, 'paragraph', 'A: 你好！\nB: 你好！\n\nA: 你好吗？\nB: 我很好，谢谢！', 'A: nǐ hǎo!\nB: nǐ hǎo!\n\nA: nǐ hǎo ma?\nB: wǒ hěn hǎo, xiè xiè!', 'A: Xin chào!\nB: Xin chào!\n\nA: Bạn khỏe không?\nB: Tôi rất khỏe, cảm ơn!'],
        [lid1, 'exercise', 'Dịch: Bạn có khỏe không?', '', '你好吗']
     ];

     for(let i of items1) {
        await pool.query("INSERT INTO items (lesson_id, item_type, target_text, phonetic, native_meaning) VALUES (?,?,?,?,?)", i);
     }

     console.log("Seeding Linguistic Items for Lesson 2...");
     const items2 = [
        [lid2, 'word', '叫', 'jiào', 'Gọi, tên là'],
        [lid2, 'word', '什么', 'shén me', 'Cái gì'],
        [lid2, 'word', '名字', 'míng zì', 'Tên'],
        [lid2, 'sentence', '你叫什么名字？', 'nǐ jiào shén me míng zì?', 'Bạn tên là gì?'],
        [lid2, 'exercise', 'Tôi tên là Tiểu Minh: 我叫___', 'tiểu minh', '小明']
     ];
     
     for(let i of items2) {
        await pool.query("INSERT INTO items (lesson_id, item_type, target_text, phonetic, native_meaning) VALUES (?,?,?,?,?)", i);
     }

     console.log("✅ Seeding completed! Database is populated with functional data.");
     process.exit(0);

  } catch(e) {
     console.error("Seeding Failed:", e);
     process.exit(1);
  }
}

seedData();
