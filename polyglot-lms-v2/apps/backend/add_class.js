require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Classes & Enrollments...');
  
  const student = await prisma.user.findUnique({ where: { email: 'student@polyglot.edu' }});
  const teacher = await prisma.user.findUnique({ where: { email: 'teacher@polyglot.edu' }});
  const course = await prisma.course.findFirst();

  if (!student || !teacher || !course) {
    console.error('Basic seed data missing!');
    return;
  }

  // Create a Class
  console.log('Creating Class...');
  const newClass = await prisma.class.create({
    data: {
      course_id: course.id,
      name: 'English A1 Fast-Track G1',
      teacher_id: teacher.id,
      members: {
        create: [
          { student_id: student.id }
        ]
      }
    }
  });

  console.log('Creating Enrollment...');
  await prisma.enrollment.create({
    data: {
      user_id: student.id,
      course_id: course.id,
      status: 'ACTIVE',
      progress: 30
    }
  });

  console.log('Successfully minted live Class & Enrollment data!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
