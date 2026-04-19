const fs = require('fs');
const path = './apps/backend/src/admin/academic.controller.ts';

try {
  let txt = fs.readFileSync(path, 'utf8');

  const methodTarget = `const block = await this.prisma.lessonBlock.create({`;
  const methodInjected = `console.log("==> RAW DTO RECEIVED: ", JSON.stringify(dto));\n    const block = await this.prisma.lessonBlock.create({`;

  if (txt.includes(methodTarget)) {
    txt = txt.replace(methodTarget, methodInjected);
  } else {
    console.log("Target not found!");
  }

  fs.writeFileSync(path, txt);
  console.log("LOG INJECTED!");
} catch (e) {
  console.error(e);
}
