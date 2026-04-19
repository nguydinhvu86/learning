const fs = require('fs');
const path = './apps/frontend/app/admin/lesson-builder/[lessonId]/page.tsx';

try {
  let txt = fs.readFileSync(path, 'utf8');
  const target = '<button onClick={() => handleDeleteBlock(b.id)} className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded">Delete</button>';
  
  if (!txt.includes(target)) {
    console.error("COULD NOT FIND TARGET!");
    process.exit(1);
  }

  const injected = `<div className="flex space-x-1 mt-1 border-t border-gray-100 pt-1">
                               <button onClick={() => handleMoveBlock(index, 'UP')} disabled={index === 0} className={\`flex-1 px-2 py-1 text-xs font-bold text-center rounded \${index === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-sky-50 text-sky-600 hover:bg-sky-100 cursor-pointer'}\`}>↑ Lên</button>
                               <button onClick={() => handleMoveBlock(index, 'DOWN')} disabled={index === lesson.blocks.length - 1} className={\`flex-1 px-2 py-1 text-xs font-bold text-center rounded \${index === lesson.blocks.length - 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-sky-50 text-sky-600 hover:bg-sky-100 cursor-pointer'}\`}>↓ Xuống</button>
                            </div>
                            ` + target;

  txt = txt.replace(target, injected);
  fs.writeFileSync(path, txt);
  console.log("PATCH COMPLETE!");
} catch (e) {
  console.error(e);
}
