const fs = require('fs');
const xlsx = require('xlsx');
const wb = xlsx.readFile('c:\\Users\\admin\\Documents\\HSK4_mindmap\\full.xlsx');
let out = {};
for(let sheet of wb.SheetNames) {
   out[sheet] = xlsx.utils.sheet_to_json(wb.Sheets[sheet], {header:1}).slice(0,10);
}
fs.writeFileSync('c:\\Users\\admin\\Documents\\HSK4_mindmap\\check_xlsx.json', JSON.stringify(out, null, 2));
