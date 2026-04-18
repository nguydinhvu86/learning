const xlsx = require('xlsx');

try {
  const file = xlsx.readFile('full.xlsx');
  console.log("Found sheets:", file.SheetNames);
  
  for (const sheetName of file.SheetNames) {
    console.log(`\n--- First 3 rows of ${sheetName} ---`);
    const sheet = file.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log(data.slice(0, 3));
  }
} catch (e) {
  console.error("Error reading excel file:", e);
}
