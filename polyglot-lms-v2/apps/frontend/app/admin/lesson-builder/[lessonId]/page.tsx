'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LessonBuilderPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { lessonId } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [blockType, setBlockType] = useState('VOCABULARY');
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});

  const toggleBlock = (id: string) => {
    setCollapsedBlocks(prev => ({...prev, [id]: !prev[id]}));
  };
  
  // Smart form states
  const [vocabData, setVocabData] = useState({ term: '', pinyin: '', meaning: '', audio_url: '' });
  const [quizData, setQuizData] = useState({ question: '', optA: '', optB: '', optC: '', optD: '', correct: '0' });
  const [jsonContent, setJsonContent] = useState('{}');

  const loadLesson = async () => {
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`/api/v1/admin/lessons/${lessonId}/blocks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setLesson(data);
  };

  useEffect(() => {
    if (lessonId) loadLesson();
  }, [lessonId]);

  const handleAddBlock = async () => {
     try {
       let parsedContent: any = {};
       if (blockType === 'VOCABULARY' || blockType === 'FLASHCARD') {
          if (!vocabData.term) return alert('Thiếu Từ vựng!');
          parsedContent = { ...vocabData };
       } else if (blockType === 'QUIZ') {
          if (!quizData.question) return alert('Thiếu câu hỏi!');
          parsedContent = {
             question: quizData.question,
             options: [quizData.optA, quizData.optB, quizData.optC, quizData.optD],
             correctAnswer: parseInt(quizData.correct)
          };
       } else {
          parsedContent = JSON.parse(jsonContent);
       }

       const token = localStorage.getItem('polyglot_token');
       const nextSeq = (lesson.blocks?.length || 0) + 1;
       const res = await fetch(`/api/v1/admin/blocks`, {
         method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ lesson_id: lessonId, type: blockType, seq_no: nextSeq, content: parsedContent })
       });
       if(res.ok) {
          setShowAddModal(false);
          setVocabData({ term: '', pinyin: '', meaning: '', audio_url: '' });
          setQuizData({ question: '', optA: '', optB: '', optC: '', optD: '', correct: '0' });
          loadLesson();
       }
     } catch (e) {
       alert('Lỗi khởi tạo nội dung!');
     }
  };

  const handleEditBlock = async (b: any) => {
     const newStr = prompt('Chỉnh sửa JSON Data của Block:', JSON.stringify(b.content));
     if(!newStr) return;
     try {
       const parsedContent = JSON.parse(newStr);
       const token = localStorage.getItem('polyglot_token');
       await fetch(`/api/v1/admin/blocks/${b.id}`, {
         method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ content: parsedContent })
       });

       // Auto-Sync logic for Manual Edit
       if (b.type === 'VOCABULARY' || b.type === 'SENTENCE') {
         const targetType = b.type === 'VOCABULARY' ? 'FLASHCARD' : 'FLASHCARD_SENTENCE';
         const syncBlock = lesson.blocks.find((blk: any) => blk.type === targetType);
         if (syncBlock) {
           const updatedSyncContent = JSON.parse(JSON.stringify(syncBlock.content || {}));
           if (b.type === 'VOCABULARY') {
             const words = parsedContent.words || [parsedContent];
             updatedSyncContent.cards = words.map((w: any) => ({
               term: w.term, pinyin: w.pinyin || w.phonetic, meaning: w.meaning, audio_url: w.audio_url
             }));
           } else {
             const sentences = parsedContent.sentences || [parsedContent];
             updatedSyncContent.sentences = sentences.map((s: any) => ({
               text: s.text || s.term, meaning: s.meaning, phonetic: s.phonetic || s.pinyin, audio_url: s.audio_url
             }));
           }
           await fetch(`/api/v1/admin/blocks/${syncBlock.id}`, {
             method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ content: updatedSyncContent })
           });
         }
       }

       loadLesson();
     } catch (e) {
       alert('Mã JSON sửa không hợp lệ!');
     }
  };

  const handleDeleteBlock = async (id: string) => {
     if(!confirm('Xóa Block nội dung này khỏi bài giảng?')) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`/api/v1/admin/blocks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
     loadLesson();
  };

  const handleTypeChange = (e: any) => {
      const type = e.target.value;
      setBlockType(type);
      if(type === 'GRAMMAR') setJsonContent('{\n  "title": "Cấu trúc A + B",\n  "explanation": "Dùng để...",\n  "examples": ["Example 1"]\n}');
      if(type === 'READING') setJsonContent('{\n  "doan van": []\n}');
      if(type === 'SENTENCE') setJsonContent('{\n  "sentence": "你好",\n  "pinyin": "nǐ hǎo",\n  "meaning": "Xin chào"\n}');
      if(type === 'FLASHCARD_SENTENCE') setJsonContent('{\n  "sentences": []\n}');
  }

  const handleBlockSpecificImport = async (e: React.ChangeEvent<HTMLInputElement>, block: any) => {
    const targetInput = e.target;
    const file = targetInput.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          
          // Deep clone the content safely
          let existingContent = JSON.parse(JSON.stringify(block.content || {}));

          if (!existingContent.words) existingContent.words = [];
          if (!existingContent.cards) existingContent.cards = [];
          if (!existingContent.sentences) existingContent.sentences = [];
          if (!existingContent.examples) existingContent.examples = [];
          if (!existingContent["doan van"]) existingContent["doan van"] = [];

          for (const row of data as any[]) {
            const term = row['Term'] || row['Cụm từ gốc'] || row['Từ vựng'] || row['term'] || row['Term '] || row['Mặt trước'];
            const pinyin = row['Pinyin'] || row['Phiên âm'] || row['pinyin'] || row['Pinyin '];
            const meaning = row['Meaning'] || row['Dịch nghĩa'] || row['meaning'] || row['Meaning '] || row['Mặt sau'];
            const audio_url = row['Audio URL'] || row['Audio'] || row['audio_url'] || row['Audio '];

            if (!term) continue;

            const parsedItem = {
              term: String(term).trim(),
              pinyin: pinyin ? String(pinyin).trim() : '',
              meaning: meaning ? String(meaning).trim() : '',
              audio_url: audio_url ? String(audio_url).trim() : '',
              phonetic: pinyin ? String(pinyin).trim() : '' // Fallback alias
            };

            if (block.type === 'VOCABULARY') {
              existingContent.words.push(parsedItem);
            } else if (block.type === 'FLASHCARD') {
              existingContent.cards.push(parsedItem);
            } else if (block.type === 'SENTENCE') {
              existingContent.sentences.push({ text: parsedItem.term, meaning: parsedItem.meaning, phonetic: parsedItem.pinyin, audio_url: parsedItem.audio_url });
            } else if (block.type === 'GRAMMAR') {
              existingContent.examples.push({ text: parsedItem.term, meaning: parsedItem.meaning, phonetic: parsedItem.pinyin });
            } else if (block.type === 'FLASHCARD_SENTENCE') {
              existingContent.sentences.push({ text: parsedItem.term, meaning: parsedItem.meaning, phonetic: parsedItem.pinyin, audio_url: parsedItem.audio_url });
            } else if (block.type === 'READING') {
              existingContent["doan van"].push({ text: parsedItem.term, meaning: parsedItem.meaning, phonetic: parsedItem.pinyin, audio_url: parsedItem.audio_url });
            }
          }

          const token = localStorage.getItem('polyglot_token');
          const res = await fetch(`/api/v1/admin/blocks/${block.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content: existingContent })
          });
          
          if (!res.ok) throw new Error('API server từ chối dữ liệu (có thể do quá lớn hoặc lỗi kết nối).');

          // Auto-Sync logic for Excel Import
          if (block.type === 'VOCABULARY' || block.type === 'SENTENCE') {
            const targetType = block.type === 'VOCABULARY' ? 'FLASHCARD' : 'FLASHCARD_SENTENCE';
            const syncBlock = lesson.blocks.find((blk: any) => blk.type === targetType);
            if (syncBlock) {
              const updatedSyncContent = JSON.parse(JSON.stringify(syncBlock.content || {}));
              if (block.type === 'VOCABULARY') {
                const words = existingContent.words || [];
                updatedSyncContent.cards = words.map((w: any) => ({
                  term: w.term, pinyin: w.pinyin || w.phonetic, meaning: w.meaning, audio_url: w.audio_url
                }));
              } else {
                const sentences = existingContent.sentences || [];
                updatedSyncContent.sentences = sentences.map((s: any) => ({
                  text: s.text || s.term, meaning: s.meaning, phonetic: s.phonetic || s.pinyin, audio_url: s.audio_url
                }));
              }
              await fetch(`/api/v1/admin/blocks/${syncBlock.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: updatedSyncContent })
              });
            }
          }

          alert(`Đã Import thành công file Excel vào Data khối ${block.type}!`);
          targetInput.value = '';
          loadLesson();
        } catch (innerErr) {
          alert('Lỗi xử lý file vòng cuối: ' + (innerErr as Error).message);
          targetInput.value = '';
        }
      };
      reader.onerror = () => {
         alert('Lỗi khi đọc file bằng công cụ trình duyệt.');
         targetInput.value = '';
      }
      reader.readAsBinaryString(file);
    } catch (err) {
       alert('Lỗi khởi tạo Excel: ' + (err as Error).message);
       targetInput.value = '';
    }
  };

  const handleGenerateQuiz = async (quizBlock: any) => {
    // Collect all vocabulary from the lesson
    let allWords: any[] = [];
    lesson.blocks.forEach((b: any) => {
      if (b.type === 'VOCABULARY' && b.content.words) {
        allWords = [...allWords, ...b.content.words];
      }
    });

    if (allWords.length < 4) {
      return alert('Bạn cần có ít nhất 4 từ vựng trong khối VOCABULARY để có đủ đáp án trắc nghiệm!');
    }

    // Shuffle words to pick up to 20
    const shuffledWords = [...allWords].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, 20);

    const questions = selectedWords.map(word => {
      // Pick 3 random wrong meanings
      const otherWords = allWords.filter(w => w.term !== word.term);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const wrongMeanings = shuffledOthers.slice(0, 3).map(w => w.meaning);
      
      const options = [word.meaning, ...wrongMeanings].sort(() => 0.5 - Math.random());

      return {
        question: `Nghĩa của từ "${word.term}" ${word.pinyin ? `(${word.pinyin})` : ''} là gì?`,
        options,
        correct: word.meaning
      };
    });

    const token = localStorage.getItem('polyglot_token');
    await fetch(`/api/v1/admin/blocks/${quizBlock.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: { questions } })
    });

    alert(`Đã tự động xáo trộn và tạo ${questions.length} câu hỏi trắc nghiệm!`);
    loadLesson();
  };

  if(!lesson) return <div className="p-10 text-center font-bold text-gray-400">Loading blocks...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
       <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
          
          <header className="bg-indigo-900 text-white p-8 relative overflow-hidden flex justify-between items-center">
             <div className="relative z-10 w-2/3">
               <button onClick={() => router.push(`/admin/course-builder/${lesson.unit?.course_id}`)} className="text-indigo-400 hover:text-white font-bold text-sm mb-4 inline-block transition">&larr; Back to Course</button>
               <h1 className="text-3xl font-black">{lesson.title}</h1>
               <p className="text-indigo-200 mt-2 font-mono text-sm max-w-xl">Hệ thống ghép khối Nội dung theo dạng JSON linh hoạt. Các khối sẽ được Renderer phiên dịch ra Layout trên Mobile Học viên.</p>
             </div>
             <div className="relative z-10 w-1/3 flex justify-end gap-3 items-center">
                 <button onClick={() => setShowAddModal(true)} className="bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-xl font-bold shadow-lg transition text-white inline-flex items-center">
                    <span className="mr-2 text-xl leading-none">+</span> Bơm Khối Nội Dung (Block)
                 </button>
             </div>
          </header>

          <main className="p-8 bg-slate-50 min-h-[50vh]">
             {lesson.blocks?.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl bg-white">
                  <div className="text-6xl mb-4 opacity-50">🧩</div>
                  <h3 className="text-2xl font-bold text-gray-500">Chưa có Block Nội dung nào</h3>
                  <p className="text-gray-400 mt-2">Bấm Bơm Khối Nội Dung để tiêm JSON Vocabulary / Grammar vào bài.</p>
                </div>
             ) : (
                <div className="space-y-4">
                  {lesson.blocks?.map((b: any, index: number) => (
                    <div key={b.id} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex gap-4 hover:border-indigo-300 transition group items-start">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-500 flex items-center justify-center font-black rounded-lg shrink-0 mt-1">{b.seq_no}</div>
                       <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between mb-2">
                             <span className={`text-xs font-black uppercase px-2 py-1 rounded inline-block
                                  ${b.type === 'VOCABULARY' ? 'bg-amber-100 text-amber-700' : 
                                    b.type === 'GRAMMAR' ? 'bg-blue-100 text-blue-700' :
                                    b.type === 'QUIZ' ? 'bg-rose-100 text-rose-700' :
                                    b.type === 'FLASHCARD_SENTENCE' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}`}>{b.type}</span>
                             <button onClick={() => toggleBlock(b.id)} className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1 rounded-lg transition-colors">
                               {collapsedBlocks[b.id] ? '👀 Mở rộng JSON' : '🙈 Thu nhỏ lại'}
                             </button>
                          </div>
                          {!collapsedBlocks[b.id] && (
                            <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto overflow-y-auto max-h-96 w-full shadow-inner transition-all">{JSON.stringify(b.content, null, 2)}</pre>
                          )}
                       </div>
                       <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                           {['VOCABULARY', 'FLASHCARD', 'SENTENCE', 'GRAMMAR', 'FLASHCARD_SENTENCE', 'READING'].includes(b.type) && (
                              <>
                                <a href="/Template_Vocabulary.xlsx" download className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded text-center block transition-colors">
                                  📥 Tải Mẫu
                                </a>
                                <label className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded cursor-pointer text-center transition-colors">
                                  📤 Nạp Excel
                                  <input type="file" accept=".xlsx, .xls" className="hidden" onChange={(e) => handleBlockSpecificImport(e, b)} />
                                </label>
                              </>
                           )}
                           {b.type === 'QUIZ' && (
                              <button onClick={() => handleGenerateQuiz(b)} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold rounded shadow-sm">🪄 Tạo Quiz 20 Câu</button>
                           )}
                           <button onClick={() => handleEditBlock(b)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded">Edit JSON</button>
                           <button onClick={() => handleDeleteBlock(b.id)} className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded">Delete</button>
                       </div>
                    </div>
                  ))}
                </div>
             )}
          </main>
       </div>

       {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in zoom-in-95 duration-200">
             <div className="bg-white p-8 rounded-2xl shadow-2xl w-[600px] border border-indigo-100 relative">
               <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-xl font-bold text-gray-400 hover:text-black">✕</button>
               <h2 className="text-2xl font-black mb-6 text-gray-800">Cấy Nội Dung Payload</h2>
               <div className="space-y-4">
                  <div>
                    <label className="font-bold text-sm block mb-1">Loại Giáo Cụ (Khối Block)</label>
                    <select value={blockType} onChange={handleTypeChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 border-b-4 border-b-indigo-200">
                       <option value="VOCABULARY">📖 VOCABULARY (Từ Vựng)</option>
                       <option value="FLASHCARD">🃏 FLASHCARD (Luyện thẻ)</option>
                       <option value="QUIZ">❓ QUIZ (Trắc nghiệm)</option>
                       <option value="GRAMMAR">📋 GRAMMAR (Ngữ Pháp)</option>
                       <option value="READING">📚 READING (Bài Đọc)</option>
                       <option value="SENTENCE">💬 SENTENCE (Mẫu câu)</option>
                       <option value="FLASHCARD_SENTENCE">🃏 FLASHCARD - SENTENCE (Luyện thẻ mẫu câu)</option>
                    </select>
                  </div>

                  {/* SMART FORMS */}
                  {(blockType === 'VOCABULARY' || blockType === 'FLASHCARD') && (
                     <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <div className="col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-indigo-700 block mb-1">Cụm từ gốc (Term)</label>
                           <input type="text" value={vocabData.term} onChange={e=>setVocabData({...vocabData, term: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="VD: Hello, 你好..."/>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                           <label className="text-xs font-bold text-indigo-700 block mb-1">Phiên âm (Pinyin/Pronun)</label>
                           <input type="text" value={vocabData.pinyin} onChange={e=>setVocabData({...vocabData, pinyin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="VD: nǐ hǎo"/>
                        </div>
                        <div className="col-span-2">
                           <label className="text-xs font-bold text-indigo-700 block mb-1">Dịch nghĩa (Meaning)</label>
                           <input type="text" value={vocabData.meaning} onChange={e=>setVocabData({...vocabData, meaning: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="VD: Xin chào"/>
                        </div>
                        <div className="col-span-2">
                           <label className="text-xs font-bold text-indigo-700 block mb-1">Audio URL (Không bắt buộc)</label>
                           <input type="text" value={vocabData.audio_url} onChange={e=>setVocabData({...vocabData, audio_url: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="https://..."/>
                        </div>
                     </div>
                  )}

                  {blockType === 'QUIZ' && (
                     <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                        <div>
                           <label className="text-xs font-bold text-rose-700 block mb-1">Câu hỏi chung (Question)</label>
                           <input type="text" value={quizData.question} onChange={e=>setQuizData({...quizData, question: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300" placeholder="Hôm nay là thứ mấy..."/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <input type="text" value={quizData.optA} onChange={e=>setQuizData({...quizData, optA: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Đáp án A"/>
                           <input type="text" value={quizData.optB} onChange={e=>setQuizData({...quizData, optB: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Đáp án B"/>
                           <input type="text" value={quizData.optC} onChange={e=>setQuizData({...quizData, optC: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Đáp án C"/>
                           <input type="text" value={quizData.optD} onChange={e=>setQuizData({...quizData, optD: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" placeholder="Đáp án D"/>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-rose-700 block mb-1">Đáp án đúng (Correct Option)</label>
                           <select value={quizData.correct} onChange={e=>setQuizData({...quizData, correct: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 font-bold">
                              <option value="0">Đáp án A</option>
                              <option value="1">Đáp án B</option>
                              <option value="2">Đáp án C</option>
                              <option value="3">Đáp án D</option>
                           </select>
                        </div>
                     </div>
                  )}

                  {/* FALLBACK JSON */}
                  {['GRAMMAR', 'READING', 'SENTENCE', 'FLASHCARD_SENTENCE'].includes(blockType) && (
                     <div>
                       <label className="font-bold text-sm block mb-1 text-slate-700">Code JSON Tùy Biến (Sắp có Form thông minh riêng)</label>
                       <textarea value={jsonContent} onChange={e => setJsonContent(e.target.value)}
                         className="w-full h-40 px-4 py-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                     </div>
                  )}
                  
                  <button onClick={handleAddBlock} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 text-lg">LƯU XUỐNG DATABASE</button>
               </div>
             </div>
          </div>
       )}
    </div>
  );
}
