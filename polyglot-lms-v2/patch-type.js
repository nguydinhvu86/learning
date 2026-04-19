const fs = require('fs');
const path = './apps/backend/src/admin/academic.controller.ts';

try {
  let txt = fs.readFileSync(path, 'utf8');

  const methodTarget = `data: { lesson_id: dto.lesson_id, type: dto.type, seq_no: Number(dto.seq_no), content: dto.content }`;
  const methodInjected = `data: { lesson_id: dto.lesson_id, type: dto.type as any, seq_no: Number(dto.seq_no), content: dto.content }`;

  if (txt.includes(methodTarget)) {
    txt = txt.replace(methodTarget, methodInjected);
  } else {
    console.log("Target not found!");
  }

  fs.writeFileSync(path, txt);
  console.log("TS FIX COMPLETE!");
} catch (e) {
  console.error(e);
}
