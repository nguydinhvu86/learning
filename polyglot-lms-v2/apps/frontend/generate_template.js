const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ws = XLSX.utils.json_to_sheet([
  { "Term": "你好", "Pinyin": "nǐ hǎo", "Meaning": "Xin chào", "Audio URL": "https://example.com/hello.mp3" },
  { "Term": "学习", "Pinyin": "xuéxí", "Meaning": "Học tập", "Audio URL": "" },
  { "Term": "再见", "Pinyin": "zàijiàn", "Meaning": "Tạm biệt", "Audio URL": "" }
]);

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Vocabulary");

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

XLSX.writeFile(wb, path.join(publicDir, 'Template_Vocabulary.xlsx'));
console.log('Template created!');
