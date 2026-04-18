const fs = require('fs');
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

async function importHSK1() {
   const pool = mysql.createPool({ host: '192.168.10.40', user: 'root1', password: '', database: 'polyglot_lms' });
   
   try {
      // 1. Ensure a Course exists or clean it
      const [cRes] = await pool.query("SELECT id FROM courses WHERE title LIKE '%HSK 1%' LIMIT 1");
      let courseId;
      if (cRes.length === 0) {
         const [ins] = await pool.query("INSERT INTO courses (title, language_target, description) VALUES ('HSK 1 - Toàn Tập', 'Chinese', '150 Từ vựng HSK1 chuẩn')");
         courseId = ins.insertId;
      } else {
         courseId = cRes[0].id;
         // Wipe existing lessons
         await pool.query("DELETE FROM lessons WHERE course_id = ?", [courseId]);
      }

      // 2. Read Excel Data
      const wb = xlsx.readFile('c:\\Users\\admin\\Documents\\HSK4_mindmap\\full.xlsx');
      const data = xlsx.utils.sheet_to_json(wb.Sheets['HSK1'], {header:1});
      
      let rows = data.slice(1); // skip header
      // Remove empty rows
      rows = rows.filter(r => r && r[1] && r[1].trim() !== '');

      const CHUNK_SIZE = 30;
      let lessonCount = 1;

      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
         let chunk = rows.slice(i, i + CHUNK_SIZE);
         
         const [lRes] = await pool.query("INSERT INTO lessons (course_id, title, order_index) VALUES (?, ?, ?)", [courseId, `Phần ${lessonCount}`, lessonCount]);
         const lessonId = lRes.insertId;
         
         for(let row of chunk) {
            let stt = row[0];
            let word = row[1];
            let pinyin = row[2];
            let meaning = row[3];
            let ex = row[4];
            let exPinyin = row[5];
            let exMeaning = row[6];

            if(word) {
               await pool.query("INSERT INTO items (lesson_id, item_type, target_text, phonetic, native_meaning) VALUES (?, 'word', ?, ?, ?)", [lessonId, word, pinyin||'', meaning||'']);
            }
            if(ex) {
               await pool.query("INSERT INTO items (lesson_id, item_type, target_text, phonetic, native_meaning) VALUES (?, 'sentence', ?, ?, ?)", [lessonId, ex, exPinyin||'', exMeaning||'']);
            }
         }
         console.log(`✅ Saved Lesson "Phần ${lessonCount}" with ${chunk.length} vocabulary units.`);
         lessonCount++;
      }
      
      console.log(`🎉 Successfully imported ${rows.length} HSK1 words across ${lessonCount-1} lessons.`);
      process.exit(0);

   } catch (e) {
      console.error(e);
      process.exit(1);
   }
}

importHSK1();
