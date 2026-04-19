const fs = require('fs');
const path = './apps/frontend/app/admin/lesson-builder/[lessonId]/page.tsx';

try {
  let txt = fs.readFileSync(path, 'utf8');

  // We are going to replace the handleMoveBlock function completely.
  const regex = /const handleMoveBlock = async \(index: number, direction: 'UP' \| 'DOWN'\) => \{[\s\S]*?loadLesson\(\);\n\s*\}\n\s*\};/;
  
  if (!regex.test(txt)) {
    throw new Error('Regex did not match handleMoveBlock');
  }

  const replacement = `const handleMoveBlock = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!lesson || !lesson.blocks) return;
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === lesson.blocks.length - 1) return;

    const token = localStorage.getItem('polyglot_token');

    // Nudging algorithm: Swap in the array
    const newBlocks = [...lesson.blocks];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    // Healing Algorithm: Reassign perfect sequential integers to ALL blocks
    newBlocks.forEach((b, i) => {
       b.seq_no = i + 1;
    });

    // Optimistic Apply
    setLesson({ ...lesson, blocks: newBlocks });

    try {
      // Fire concurrent updates for ALL blocks to freeze the new chronology
      await Promise.all(
        newBlocks.map((b) => 
          fetch(\`/api/v1/admin/blocks/\${b.id}\`, {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
            body: JSON.stringify({ seq_no: b.seq_no }) // Securely isolate the sequence update without touching large content
          })
        )
      );
      loadLesson();
    } catch (e) {
      alert("Lỗi khi đồng bộ trật tự hiển thị!");
      loadLesson();
    }
  };`;

  txt = txt.replace(regex, replacement);
  fs.writeFileSync(path, txt);
  console.log("PATCH COMPLETE!");
} catch (e) {
  console.error(e);
}
