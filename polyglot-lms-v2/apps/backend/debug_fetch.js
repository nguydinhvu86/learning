const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugFetch() {
  const student = await prisma.user.findUnique({ where: { email: 'student@polyglot.edu' } });
  if (!student) {
    console.error('Student not found!');
    return;
  }
  
  const payload = { sub: student.id, role: student.role };
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  console.log('Sending request with token:', token);
  
  const res = await fetch('http://localhost:3001/api/v1/curriculum/courses', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('API RESPONSE CODE:', res.status);
  console.log('API RESPONSE BODY:', text);
}

debugFetch().finally(() => prisma.$disconnect());
