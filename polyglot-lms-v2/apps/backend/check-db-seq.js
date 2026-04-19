const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blocks = await prisma.lessonBlock.findMany({
    orderBy: { seq_no: 'asc' },
    take: 20
  });
  let out = "=== DB BLOCKS ===\n";
  blocks.forEach(b => {
    out += `[${b.seq_no}] ${b.type} (ID: ${b.id.substring(0,8)})\n`;
  });
  require('fs').writeFileSync('db_blocks.txt', out);
}
main().finally(() => prisma.$disconnect());
