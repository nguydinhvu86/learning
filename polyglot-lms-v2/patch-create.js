const fs = require('fs');
const path = './apps/backend/src/admin/academic.controller.ts';

try {
  let txt = fs.readFileSync(path, 'utf8');

  const dtoTarget = "export class UpdateBlockDto {";
  const dtoInjected = `import { IsString, IsNotEmpty } from 'class-validator';\n\nexport class CreateBlockDto {\n  @IsString()\n  @IsNotEmpty()\n  lesson_id: string;\n\n  @IsString()\n  @IsNotEmpty()\n  type: string;\n\n  @IsOptional()\n  content?: any;\n\n  @IsOptional()\n  @IsNumber()\n  seq_no?: number;\n}\n\n` + dtoTarget;

  if (!txt.includes(dtoTarget)) throw new Error("DTO target not found!");
  if (!txt.includes('CreateBlockDto')) {
     txt = txt.replace(dtoTarget, dtoInjected);
  }

  const methodTarget = `async createBlock(@Body() dto: { lesson_id: string, type: any, seq_no: number, content: any }) {`;
  const methodInjected = `async createBlock(@Body() dto: CreateBlockDto) {`;

  if (txt.includes(methodTarget)) {
    txt = txt.replace(methodTarget, methodInjected);
  } else {
    console.log("Method target not found, evaluating fallback...");
  }

  fs.writeFileSync(path, txt);
  console.log("BACKEND PATCH COMPLETE!");
} catch (e) {
  console.error(e);
}
