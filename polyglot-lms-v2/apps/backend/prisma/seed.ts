require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@polyglot.edu' },
    update: {},
    create: {
      email: 'admin@polyglot.edu',
      password_hash: 'hashed_password_mock', // Usually hashed with argon2
      role: 'SUPER_ADMIN',
    },
  });

  // 2. Create Center & Branch
  const center = await prisma.center.create({
    data: {
      name: 'Polyglot Main Center',
      location: 'Hanoi, Vietnam',
      branches: {
        create: { name: 'Campus 1' }
      }
    }
  });
  const branch = await prisma.branch.findFirst();

  // 3. Create sample Student & Teacher
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@polyglot.edu', password_hash: 'hashed_password_mock', role: 'STUDENT', branch_id: branch.id,
      student_profile: {
        create: { full_name: 'Nguyen Van Hoc', target_lang: 'English', target_level: 'B2' }
      }
    }
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@polyglot.edu', password_hash: 'hashed_password_mock', role: 'TEACHER', branch_id: branch.id,
      teacher_profile: {
        create: { full_name: 'Tran Thi Giao', specialization: 'IELTS / CEFR' }
      }
    }
  });

  // 4. Frameworks & Levels
  const cefr = await prisma.framework.create({ data: { name: 'CEFR' } });
  const hsk = await prisma.framework.create({ data: { name: 'HSK' } });

  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (let i = 0; i < cefrLevels.length; i++) {
    await prisma.level.create({ data: { framework_id: cefr.id, name: cefrLevels[i], order: i + 1 } });
  }

  const hskLevels = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
  for (let i = 0; i < hskLevels.length; i++) {
    await prisma.level.create({ data: { framework_id: hsk.id, name: hskLevels[i], order: i + 1 } });
  }

  // 5. Sample Curriculum (English A1)
  const a1Level = await prisma.level.findFirst({ where: { name: 'A1' } });
  
  const program = await prisma.program.create({
    data: { title: 'English Foundation', language: 'en', description: 'Core English Program' }
  });

  const course = await prisma.course.create({
    data: { program_id: program.id, level_id: a1Level.id, title: 'English A1 Beginner' }
  });

  const unit = await prisma.unit.create({
    data: { course_id: course.id, title: 'Unit 1: Introductions', order: 1 }
  });

  const lesson = await prisma.lesson.create({
    data: { unit_id: unit.id, title: 'Lesson 1: Hello & Goodbye', order: 1 }
  });

  await prisma.lessonBlock.create({
    data: {
      lesson_id: lesson.id, type: 'TEXT', seq_no: 1,
      content: { text: "Welcome to English A1. Let's learn basic greetings." }
    }
  });

  await prisma.lessonBlock.create({
    data: {
      lesson_id: lesson.id, type: 'FLASHCARD', seq_no: 2,
      content: { term: "Hello", meaning: "Xin chào", pronunciation: "həˈləʊ" }
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
