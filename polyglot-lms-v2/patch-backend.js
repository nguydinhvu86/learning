const fs = require('fs');
const path = './apps/backend/src/admin/academic.controller.ts';

try {
  let txt = fs.readFileSync(path, 'utf8');

  // Insert imports
  const importTarget = "import { PrismaService } from '../prisma/prisma.service';";
  const importInjected = importTarget + `\nimport { IsOptional, IsNumber } from 'class-validator';\n\nexport class UpdateBlockDto {\n  @IsOptional()\n  content?: any;\n  @IsOptional()\n  @IsNumber()\n  seq_no?: number;\n}\n`;

  if (!txt.includes(importTarget)) throw new Error("Import target not found!");
  txt = txt.replace(importTarget, importInjected);

  // Update method definition
  const methodTarget = `async updateBlock(@Param('id') id: string, @Body() dto: { content: any, seq_no?: number }) {`;
  const methodInjected = `async updateBlock(@Param('id') id: string, @Body() dto: UpdateBlockDto) {`;

  if (!txt.includes(methodTarget)) throw new Error("Method target not found!");
  txt = txt.replace(methodTarget, methodInjected);

  fs.writeFileSync(path, txt);
  console.log("BACKEND PATCH COMPLETE!");
} catch (e) {
  console.error(e);
}
