const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnglishLesson() {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: { title: 'Lesson 2: Comprehensive Skills (Vocabulary, Grammar, Reading)' }
    });

    if (!lesson) {
      console.log("Lesson not found");
      return;
    }

    // Delete existing blocks for this lesson
    await prisma.lessonBlock.deleteMany({
      where: { lesson_id: lesson.id }
    });

    // Re-insert English Data
    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'VOCABULARY',
        seq_no: 1,
        content: {
          words: [
            { term: 'Hello', phonetic: 'həˈləʊ', meaning: 'Xin chào' },
            { term: 'Thank you', phonetic: 'θæŋk juː', meaning: 'Cảm ơn' },
            { term: 'Sorry', phonetic: 'ˈsɒri', meaning: 'Xin lỗi' },
            { term: 'Welcome', phonetic: 'ˈwɛlkəm', meaning: 'Chào mừng' }
          ]
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'FLASHCARD',
        seq_no: 2,
        content: {
          cards: [
            { term: 'Hello', phonetic: 'həˈləʊ', meaning: 'Xin chào' },
            { term: 'Thank you', phonetic: 'θæŋk juː', meaning: 'Cảm ơn' },
            { term: 'Sorry', phonetic: 'ˈsɒri', meaning: 'Xin lỗi' },
            { term: 'Welcome', phonetic: 'ˈwɛlkəm', meaning: 'Chào mừng' }
          ]
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'SENTENCE',
        seq_no: 3,
        content: {
          sentences: [
            { text: 'Hello, nice to meet you.', phonetic: 'həˈləʊ, naɪs tuː miːt jʊ.', meaning: 'Xin chào, rất vui được gặp bạn.' },
            { text: 'What are you reading?', phonetic: 'wɒt ɑː jʊ ˈriːdɪŋ?', meaning: 'Bạn đang đọc sách gì vậy?' }
          ]
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'GRAMMAR',
        seq_no: 4,
        content: {
          rule: 'Cấu trúc Chủ ngữ (S) + Động từ (V) + Tân ngữ (O)',
          examples: [
            { text: 'I study English.', phonetic: 'aɪ ˈstʌdi ˈɪŋglɪʃ.', meaning: 'Tôi học tiếng Anh.' },
            { text: 'He likes drinking tea.', phonetic: 'hiː laɪks ˈdrɪŋkɪŋ tiː.', meaning: 'Anh ấy thích uống trà.' }
          ]
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'READING',
        seq_no: 5,
        content: {
          paragraphs: [
            { 
              text: 'Good morning! My name is Alex. I am from the United States. I am currently studying at Oxford University.', 
              phonetic: 'gʊd ˈmɔːnɪŋ! maɪ neɪm ɪz ˈælɪks. aɪ æm frɒm ðə jʊˈnaɪtɪd steɪts. aɪ æm ˈkʌrəntli ˈstʌdyɪŋ æt ˈɒksfəd ˌjuːnɪˈvɜːsɪti.', 
              meaning: 'Chào buổi sáng! Tên tôi là Alex. Tôi đến từ Hoa Kỳ. Hiện tại tôi đang học tại Đại học Oxford.' 
            },
            { 
              text: 'My hobbies are reading books and listening to music. How about you?', 
              phonetic: 'maɪ ˈhɒbiz ɑː ˈriːdɪŋ bʊks ænd ˈlɪsnɪŋ tuː ˈmjuːzɪk. haʊ əˈbaʊt juː?', 
              meaning: 'Sở thích của tôi là đọc sách và nghe nhạc. Còn bạn thì sao?' 
            }
          ]
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'QUIZ',
        seq_no: 6,
        content: {
          question: '1. Where is Alex studying?',
          options: ['Harvard University', 'Oxford University', 'Stanford University'],
          correct: 'Oxford University'
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'QUIZ',
        seq_no: 7,
        content: {
          question: '2. What are Alex\'s hobbies?',
          options: ['Playing soccer and sleeping', 'Reading books and listening to music', 'Watching TV and eating'],
          correct: 'Reading books and listening to music'
        }
      }
    });

    await prisma.lessonBlock.create({
      data: {
        lesson_id: lesson.id,
        type: 'QUIZ',
        seq_no: 8,
        content: {
          question: '3. Where is Alex from?',
          options: ['The United Kingdom', 'Australia', 'The United States'],
          correct: 'The United States'
        }
      }
    });

    console.log('Fixed Lesson 2 to 100% English data!');
  } catch(e) {
    console.error(e);
  }
}

fixEnglishLesson().finally(() => prisma.$disconnect());
