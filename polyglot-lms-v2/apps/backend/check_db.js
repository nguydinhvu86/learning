const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const c = await prisma.course.count();
    const u = await prisma.user.count();
    const cl = await prisma.class.count();
    console.log(`DB Connection OK. Courses: ${c}, Users: ${u}, Classes: ${cl}`);
  } catch (e) {
    console.error('Prisma Error:', e.message);
  }
}
check().finally(()=>prisma.$disconnect());
