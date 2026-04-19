const fs = require('fs');
const path = './apps/backend/src/admin/academic.controller.ts';

try {
  let txt = fs.readFileSync(path, 'utf8');

  const methodTarget = `console.log("==> RAW DTO RECEIVED: ", JSON.stringify(dto));`;
  const methodInjected = `console.log("=== DTO.TYPE ===", String(dto.type));\n    console.log("=== DTO KEYS ===", Object.keys(dto));`;

  if (txt.includes(methodTarget)) {
    txt = txt.replace(methodTarget, methodInjected);
  } else {
    console.log("Target not found!");
  }

  fs.writeFileSync(path, txt);
  console.log("LOG2 INJECTED!");
} catch (e) {
  console.error(e);
}
