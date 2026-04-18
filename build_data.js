const fs = require('fs');
const https = require('https');

const URL = "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/master/complete.json";

https.get(URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const list = JSON.parse(data);
        
        function extractLevel(levelNum) {
            const tag = `newest-${levelNum}`;
            const words = list.filter(w => w.level && w.level.includes(tag));
            
            // Format to match our app structure
            // HSK 3.0 has too many words for deep categorization, so we group them by POS or just chunks
            const chunkSize = 50;
            const categories = [];
            
            for (let i = 0; i < words.length; i += chunkSize) {
                const chunk = words.slice(i, i + chunkSize);
                categories.push({
                    name: `部分 ${i/chunkSize + 1}`,
                    name_vi: `Phần ${i/chunkSize + 1}`,
                    icon: "📚",
                    words: chunk.map(w => {
                        const form = w.forms && w.forms[0] ? w.forms[0] : {};
                        const pinyin = form.transcriptions && form.transcriptions.pinyin ? form.transcriptions.pinyin : 'N/A';
                        const meanings = form.meanings ? form.meanings.join(', ') : 'N/A';
                        return {
                            hanzi: w.simplified || w.word,
                            pinyin: pinyin,
                            vi: meanings, // We map English meanings to vi/en because we lack VI dict right now
                            en: meanings,
                            pos: w.pos && w.pos[0] ? w.pos[0] : "word",
                            examples: []
                        };
                    })
                });
            }

            const output = `const HSK${levelNum}_DATA = {
  level: ${levelNum},
  color: "${getColor(levelNum)}",
  total: ${words.length},
  categories: ${JSON.stringify(categories, null, 2)},
  patterns: []
};`;
            fs.writeFileSync(`js/data/hsk${levelNum}.js`, output);
            console.log(`Wrote js/data/hsk${levelNum}.js with ${words.length} words`);
        }

        function getColor(l) {
            return l === 1 ? "#4CAF50" : l === 2 ? "#2196F3" : l === 3 ? "#9C27B0" : "#FF9800";
        }

        extractLevel(1);
        extractLevel(2);
        extractLevel(3);
        extractLevel(4);
    });
});
