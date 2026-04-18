const xlsx = require('xlsx');
const fs = require('fs');

try {
  const file = xlsx.readFile('full.xlsx');
  const sheet = file.Sheets[file.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  const output = {
    firstRow: data[0],
    headers: Object.keys(data[0])
  };
  fs.writeFileSync('excel_debug.json', JSON.stringify(output, null, 2));
} catch(e) {
  console.error(e);
}
