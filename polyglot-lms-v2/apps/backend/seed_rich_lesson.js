const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function injectRichLesson() {
  try {
    const course = await prisma.course.findFirst();
  if (!course) {
    console.error('Course not found');
    return;
  }

  const unit = await prisma.unit.findFirst({ where: { course_id: course.id } });
  if (!unit) {
    console.error('Unit not found');
    return;
  }

  const newLesson = await prisma.lesson.create({
    data: {
      unit_id: unit.id,
      title: 'Lesson 2: Comprehensive Skills (Vocabulary, Grammar, Reading)',
      order: 2
    }
  });

  // 1: VOCABULARY
  await prisma.lessonBlock.create({
    data: {
      lesson_id: newLesson.id,
      type: 'VOCABULARY',
      seq_no: 1,
      content: {
        words: [
          { term: '你好', phonetic: 'nǐ hǎo', meaning: 'Xin chào' },
          { term: '谢谢', phonetic: 'xiè xie', meaning: 'Cảm ơn' },
          { term: '对不起', phonetic: 'duì bu qǐ', meaning: 'Xin lỗi' },
          { term: '没关系', phonetic: 'méi guān xi', meaning: 'Không có gì' }
        ]
      }
    }
  });

  // 2: SENTENCE
  await prisma.lessonBlock.create({
    data: {
      lesson_id: newLesson.id,
      type: 'SENTENCE',
      seq_no: 2,
      content: {
        sentences: [
          { text: '你好，很高兴认识你。', phonetic: 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.', meaning: 'Xin chào, rất vui được gặp bạn.' },
          { text: '你在看什么书？', phonetic: 'Nǐ zài kàn shénme shū?', meaning: 'Bạn đang đọc sách gì vậy?' }
        ]
      }
    }
  });

  // 3: GRAMMAR
  await prisma.lessonBlock.create({
    data: {
      lesson_id: newLesson.id,
      type: 'GRAMMAR',
      seq_no: 3,
      content: {
        rule: 'Cấu trúc Chủ ngữ + (Phó từ) + Động từ + Tân ngữ',
        examples: [
          { text: '我学习中文。', phonetic: 'Wǒ xuéxí zhōngwén.', meaning: 'Tôi học tiếng Trung.' },
          { text: '他很喜欢喝茶。', phonetic: 'Tā hěn xǐhuān hē chá.', meaning: 'Anh ấy rất thích uống trà.' }
        ]
      }
    }
  });

  // 4: READING
  await prisma.lessonBlock.create({
    data: {
      lesson_id: newLesson.id,
      type: 'READING',
      seq_no: 4,
      content: {
        paragraphs: [
          { 
            text: '早上好！我叫小明。我是中国人。我现在在北京大学学习。', 
            phonetic: 'Zǎoshang hǎo! Wǒ jiào xiǎo míng. Wǒ shì zhōngguó rén. Wǒ xiànzài zài běijīng dàxué xuéxí.', 
            meaning: 'Chào buổi sáng! Tôi tên là Tiểu Minh. Tôi là người Trung Quốc. Bây giờ tôi đang học tại Đại học Bắc Kinh.' 
          },
          { 
            text: '我的爱好是看书和听音乐。你呢？', 
            phonetic: 'Wǒ de àihào shì kànshū hé tīng yīnyuè. Nǐ ne?', 
            meaning: 'Sở thích của tôi là đọc sách và nghe nhạc. Còn bạn thì sao?' 
          }
        ]
      }
    }
  });

  // 5: QUIZ
  await prisma.lessonBlock.create({
    data: {
      lesson_id: newLesson.id,
      type: 'QUIZ',
      seq_no: 5,
      content: {
        question: 'Tiểu Minh đang học ở đâu?',
        options: ['Đại học Thanh Hoa', 'Đại học Bắc Kinh', 'Đại học Phúc Đán'],
        correct: 'Đại học Bắc Kinh'
      }
    }
  });

  console.log('Successfully injected Lesson 2 with rich components!');
  } catch (err) {
    console.error("DEBUG ERROR:", err);
  }
}

injectRichLesson().finally(() => prisma.$disconnect());
