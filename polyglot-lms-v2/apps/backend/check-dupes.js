const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blocks = await prisma.lessonBlock.findMany({
    orderBy: [{ lesson_id: 'asc' }, { seq_no: 'asc' }]
  });
  
  const dupes = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    if (blocks[i].lesson_id === blocks[i+1].lesson_id && blocks[i].seq_no === blocks[i+1].seq_no) {
      dupes.push(blocks[i].lesson_id);
    }
  }
  if (dupes.length > 0) {
    console.log("FOUND DUPES IN LESSONS: ", [...new Set(dupes)]);
  } else {
    console.log("NO DUPES FOUND.");
  }
}
main().finally(() => prisma.$disconnect());
