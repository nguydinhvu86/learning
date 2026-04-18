const fs = require('fs');
const translate = require('translate-google');

async function run() {
  const files = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'];
  for (let f of files) {
    console.log("Processing", f);
    const path = `js/data_trilingual/${f}.js`;
    let raw = fs.readFileSync(path, 'utf8');
    
    // Convert ES6 constant to module.exports temporarily to read objects
    raw = raw.replace(`const ${f.toUpperCase()}_DATA = `, `module.exports = `);
    fs.writeFileSync('temp.js', raw);
    
    delete require.cache[require.resolve('./temp.js')];
    const data = require('./temp.js');
    
    let toTranslate = [];
    data.categories.forEach(cat => {
      cat.words.forEach(w => {
        if (w.en.word === "N/A" && w.vi_meaning) {
          toTranslate.push(w);
        }
      });
    });

    console.log(`Translating ${toTranslate.length} words in ${f}...`);
    
    const CHUNK_SIZE = 80;
    for (let i = 0; i < toTranslate.length; i += CHUNK_SIZE) {
       const chunk = toTranslate.slice(i, i + CHUNK_SIZE);
       const arr = chunk.map(w => w.vi_meaning);
       
       try {
         const tArr = await translate(arr, {from: 'vi', to: 'en'});
         tArr.forEach((tStr, idx) => {
           chunk[idx].en.word = tStr.toLowerCase();
         });
         console.log(`   Chunk [${i} - ${i+CHUNK_SIZE}] success!`);
       } catch (err) {
         console.error(`   Chunk [${i} - ${i+CHUNK_SIZE}] failed:`, err.message);
       }
       await new Promise(r => setTimeout(r, 2000));
    }
    
    const out = `const ${f.toUpperCase()}_DATA = ` + JSON.stringify(data, null, 2) + ';';
    fs.writeFileSync(path, out);
    console.log("Saved updated file", f);
  }
}

run();
