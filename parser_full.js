const xlsx = require('xlsx');
const fs = require('fs');

try {
  const file = xlsx.readFile('full.xlsx');
  
  file.SheetNames.forEach(sheetName => {
    const data = xlsx.utils.sheet_to_json(file.Sheets[sheetName]);
    if (data.length === 0) return;
    
    // Use the explicit Vietnamese headers found in the file
    const words = data.map(row => {
      const wh = row['Từ mới'] ? row['Từ mới'].toString().trim() : "";
      const wp = row['Phiên âm'] ? row['Phiên âm'].toString().trim() : "";
      const wv = row['Giải thích'] ? row['Giải thích'].toString().trim() : "";
      
      const ex_zh = row['Ví dụ (chữ hán)'] ? row['Ví dụ (chữ hán)'].toString().trim() : "";
      const ex_zp = row['Phiên âm_1'] ? row['Phiên âm_1'].toString().trim() : "";
      const ex_v = row['Dịch'] ? row['Dịch'].toString().trim() : "";
      
      return {
        en: { word: "N/A", phonetic: "" }, // Explicitly show N/A since this dataset lacks English
        zh: { hanzi: wh, pinyin: wp },
        vi_meaning: wv,
        pos: "", // Not explicitly provided
        examples: (ex_zh || ex_v) ? [{
          context: "General",
          en: "",
          en_p: "",
          zh: ex_zh,
          zh_p: ex_zp,
          vi: ex_v
        }] : []
      };
    });
    
    const categories = [];
    const chunkSize = 50;
    for(let i = 0; i < words.length; i += chunkSize) {
      categories.push({
        name: `部分 ${Math.floor(i/chunkSize) + 1}`,
        name_vi: `Phần ${Math.floor(i/chunkSize) + 1}`,
        icon: "📚",
        words: words.slice(i, i+chunkSize)
      });
    }

    const resultObj = {
      level: sheetName,
      total: words.length,
      categories: categories
    };
    
    const safeSheetName = sheetName.replace(/\s+/g, '').toLowerCase();
    const varName = safeSheetName.toUpperCase() + '_DATA';
    const code = `const ${varName} = ` + JSON.stringify(resultObj, null, 2) + ';';
    
    fs.writeFileSync(`js/data_trilingual/${safeSheetName}.js`, code);
    console.log(`Exported ${words.length} words to ${safeSheetName}.js`);
  });
  console.log('All rebuilt successfully.');
} catch(e) {
  console.error("Critical error:", e);
}
