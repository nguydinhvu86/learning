'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LessonViewer({ params }: { params: { courseId: string, lessonId: string } }) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [showPhonetics, setShowPhonetics] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [blockPages, setBlockPages] = useState<Record<string, number>>({});
  const [viewedBlocks, setViewedBlocks] = useState<Set<string>>(new Set());
  const [progressPercent, setProgressPercent] = useState(0);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedSessionState, setSavedSessionState] = useState<any>(null);

  const speak = (text: string, lang?: string) => {
    if ('speechSynthesis' in window) {
      // Auto-detect Chinese characters if no explicit language is provided
      const isChinese = /[\u4e00-\u9fa5]/.test(text);
      const selectedLang = lang || (isChinese ? 'zh-CN' : 'en-US');
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang;
      
      // Stop currently playing speech before starting new one
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    
    // Fetch blocks and backend progress concurrently
    Promise.all([
       fetch(`/api/v1/curriculum/lessons/${params.lessonId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
       }).then(res => res.json()),
       fetch(`/api/v1/progress/lesson/${params.lessonId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
       }).then(res => res.json()).catch(() => ({ completed_block_ids: [] }))
    ])
    .then(([blocksData, progressData]) => {
      if (Array.isArray(blocksData)) {
        setBlocks(blocksData);
        if (progressData && progressData.completed_block_ids) {
            setViewedBlocks(new Set(progressData.completed_block_ids));
        }
      } else {
        setBlocks([]);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      setLoading(false);
    });
  }, [params.lessonId]);

  // Session Boot Up and Checking Local Storage
  useEffect(() => {
    if (blocks.length === 0) return;
    
    const savedStr = localStorage.getItem(`polyglot_lesson_${params.lessonId}`);
    if (savedStr) {
       try {
          const state = JSON.parse(savedStr);
          setSavedSessionState(state);
          setShowResumeModal(true);
       } catch (e) {
          console.error("Invalid session format");
       }
    } else {
        // Start with empty progress (0%) if no session exists
        if (blocks.length > 0) {
           setViewedBlocks(new Set());
        }
    }
  }, [blocks.length, params.lessonId]);

  const handleResume = () => {
     if (savedSessionState) {
         setActiveBlockIndex(savedSessionState.activeBlockIndex || 0);
         setBlockPages(savedSessionState.blockPages || {});
         setViewedBlocks(new Set(savedSessionState.viewedBlocks || []));
     }
     setShowResumeModal(false);
  };

  const handleRestart = () => {
     localStorage.removeItem(`polyglot_lesson_${params.lessonId}`);
     setActiveBlockIndex(0);
     setBlockPages({});
     setViewedBlocks(new Set());
     setShowResumeModal(false);

     // Sync wipe with backend
     const token = localStorage.getItem('polyglot_token');
     if (token) {
        fetch(`/api/v1/progress/lesson-reset`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ lesson_id: params.lessonId })
        }).catch(err => console.error('Failed to reset backend mapping', err));
     }
  };

  const markBlockAsCompleted = (blockId: string) => {
     setViewedBlocks(prev => {
        const next = new Set(prev);
        next.add(blockId);
        return next;
     });
  };

  const undoBlockCompletion = async (blockId: string) => {
     // Remove from UI State
     setViewedBlocks(prev => {
        const next = new Set(prev);
        next.delete(blockId);
        return next;
     });

     // Force delete from Backend
     const token = localStorage.getItem('polyglot_token');
     if (!token) return;
     try {
       await fetch(`/api/v1/progress/lesson-pulse-undo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ lesson_id: params.lessonId, block_id: blockId })
       });
     } catch (e) {
       console.error('Failed to undo block completion', e);
     }
  };

  // Derive Percentage Completed
  useEffect(() => {
    if (blocks.length === 0) return;
    const percent = Math.round((viewedBlocks.size / blocks.length) * 100);
    setProgressPercent(percent);
  }, [viewedBlocks, blocks]);

  // Save State and dispatch backend Sync (Pulse)
  useEffect(() => {
     if (blocks.length === 0 || showResumeModal || viewedBlocks.size === 0) return;
     
     // 1. Session snapshot for LocalStorage 
     localStorage.setItem(`polyglot_lesson_${params.lessonId}`, JSON.stringify({
        activeBlockIndex,
        blockPages,
        viewedBlocks: Array.from(viewedBlocks)
     }));

     // 2. Pulse backend metrics for Teacher monitors (debounced 2 seconds)
     const pulseBackend = async () => {
         const token = localStorage.getItem('polyglot_token');
         if (!token) return;
         try {
             await fetch(`/api/v1/progress/lesson-pulse`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify({
                     lesson_id: params.lessonId,
                     completed_block_ids: Array.from(viewedBlocks),
                     percent: Math.round((viewedBlocks.size / blocks.length) * 100)
                 })
             });
         } catch(e) {}
     };
     
     const timer = setTimeout(() => pulseBackend(), 2000);
     return () => clearTimeout(timer);
  }, [activeBlockIndex, blockPages, viewedBlocks, blocks.length, params.lessonId, showResumeModal]);

  const handleQuizSelect = (blockId: string, option: string) => {
    setQuizAnswers(prev => ({ ...prev, [blockId]: option }));
  };

  const checkQuiz = async (identifier: string, correct: string, originalBlockId: string) => {
    const isCorrect = quizAnswers[identifier] === correct;
    setQuizResults(prev => ({ ...prev, [identifier]: isCorrect }));

    if (isCorrect) {
      submitProgress(originalBlockId, 'mastered', 100);
    } else {
      submitProgress(originalBlockId, 'in_progress', 0);
    }
  };

  const submitProgress = async (blockId: string, status: string, score: number) => {
    const token = localStorage.getItem('polyglot_token');
    if (!token) return;

    try {
      await fetch(`/api/v1/curriculum/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ block_id: blockId, status, score })
      });
    } catch (e) {
      console.error('Failed to submit progress:', e);
    }
  };

  const toggleFlashcard = (blockId: string) => {
    setFlippedCards(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  const handleStudentGenerateQuiz = (quizBlockId: string) => {
    let allWords: any[] = [];
    blocks.forEach((b: any) => {
      if (b.type === 'VOCABULARY' && b.content.words) {
        allWords = [...allWords, ...b.content.words];
      }
    });

    if (allWords.length < 4) {
      return alert('Bài học này chưa có đủ từ vựng để tạo bài tập xáo trộn!');
    }

    const shuffledWords = [...allWords].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, 20);

    const questions = selectedWords.map(word => {
      const otherWords = allWords.filter(w => w.term !== word.term);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const wrongMeanings = shuffledOthers.slice(0, 3).map(w => w.meaning);
      const options = [word.meaning, ...wrongMeanings].sort(() => 0.5 - Math.random());
      return {
        question: `Nghĩa của từ "${word.term}" là gì?`,
        phonetic: word.pinyin,
        options,
        correct: word.meaning
      };
    });

    setBlocks(prev => prev.map(b => {
      if (b.block_id === quizBlockId) {
        return { ...b, content: { ...b.content, questions } };
      }
      return b;
    }));

    setQuizAnswers(prev => {
       const newAnswers = { ...prev };
       Object.keys(newAnswers).forEach(k => {
         if (k.startsWith(quizBlockId + '_')) delete newAnswers[k];
       });
       return newAnswers;
    });
    setQuizResults(prev => {
       const newResults = { ...prev };
       Object.keys(newResults).forEach(k => {
         if (k.startsWith(quizBlockId + '_')) delete newResults[k];
       });
       return newResults;
    });
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">Đang tải bài học...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/student/course/${params.courseId}`} className="text-gray-500 hover:text-emerald-600 bg-gray-100 p-2 rounded-full transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Study Session</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
               onClick={() => setShowPhonetics(!showPhonetics)}
               className={`text-sm font-bold px-4 py-2 rounded-full transition ${showPhonetics ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}
            >
              Abc {showPhonetics ? '(Bật)' : '(Tắt)'}
            </button>
            <button 
               onClick={() => setShowMeaning(!showMeaning)}
               className={`text-sm font-bold px-4 py-2 rounded-full transition ${showMeaning ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'}`}
            >
              Nghĩa {showMeaning ? '(Bật)' : '(Tắt)'}
            </button>
            <div className="text-sm font-semibold text-emerald-600 outline outline-1 outline-emerald-200 bg-emerald-50 px-3 py-1 rounded-full">
              In Progress
            </div>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-5xl px-4 mt-8 pb-10">
        {blocks.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">Bài học này chưa có nội dung.</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* LATER MENU */}
            <div className="md:w-[280px] flex-shrink-0">
              <div className="sticky top-24 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-row md:flex-col gap-2 overflow-x-auto">
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2 ml-2 hidden md:block">Menu Bài Học</h3>
                {blocks.map((b: any, idx: number) => {
                  const isActive = activeBlockIndex === idx;
                  let icon = '🧩';
                  let title = b.type;
                  if (b.type === 'VOCABULARY') { icon = '📚'; title = 'Từ Vựng'; }
                  if (b.type === 'FLASHCARD') { icon = '🔄'; title = 'Luyện Thẻ'; }
                  if (b.type === 'SENTENCE') { icon = '💬'; title = 'Mẫu Câu'; }
                  if (b.type === 'GRAMMAR') { icon = '⚙️'; title = 'Ngữ Pháp'; }
                  if (b.type === 'READING') { icon = '📖'; title = 'Bài Đọc'; }
                  if (b.type === 'QUIZ') { icon = '❓'; title = 'Trắc Nghiệm'; }

                  return (
                    <button 
                      key={b.block_id} 
                      onClick={() => setActiveBlockIndex(idx)}
                      className={`flex items-center text-left py-3 px-4 rounded-2xl transition whitespace-nowrap md:whitespace-normal
                        ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200' : 'hover:bg-indigo-50 text-gray-600 font-medium group'}`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${isActive ? 'bg-indigo-500' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>{icon}</span>
                      <span>{title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTENT STREAM */}
            <div className="flex-1 min-w-0">
              {(() => {
                const block = blocks[activeBlockIndex];
                if (!block) return null;
                const content = block.content;
                const idx = activeBlockIndex;
                
                return (
                  <section key={block.block_id} className="relative animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="absolute -left-12 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm hidden lg:flex shadow-sm">
                      {idx + 1}
                    </div>

              {block.type === 'TEXT' && (
                <div className="prose max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-lg leading-relaxed text-gray-700">
                  {content.text}
                </div>
              )}

              {block.type === 'FLASHCARD' && (() => {
                const allCards = content.cards || [];
                const itemsPerPage = 10;
                const totalPages = Math.ceil(allCards.length / itemsPerPage);
                const currentPage = blockPages[block.block_id] || 0;
                const currentCards = allCards.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                return (
                 <div className="mb-8 bg-white p-8 rounded-2xl shadow-sm border border-indigo-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-indigo-50 gap-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold flex items-center text-indigo-800">
                        <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">🔄</span>
                        Thực hành Flashcard
                      </h3>
                      {totalPages > 1 && showFlashcards ? (
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Trang {currentPage + 1} / {totalPages}</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{allCards.length} Thẻ</span>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowFlashcards(!showFlashcards)} 
                      className="px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition"
                    >
                      {showFlashcards ? 'Thu gọn' : 'Bắt đầu luyện tập'}
                    </button>
                  </div>
                  
                  {showFlashcards && (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                      {currentCards.map((card: any, indexOnPage: number) => {
                      const absoluteIdx = currentPage * itemsPerPage + indexOnPage;
                      const fid = `${block.block_id}_${absoluteIdx}`;
                      return (
                        <div 
                          key={absoluteIdx}
                          className={`relative w-full h-48 cursor-pointer perspective-1000 transition-transform duration-500`}
                          onClick={() => toggleFlashcard(fid)}
                        >
                          <div className={`relative w-full h-full rounded-2xl shadow-md transition-all duration-500 transform-style-3d ${flippedCards[fid] ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex flex-col items-center justify-center backface-hidden">
                              <button onClick={(e) => { e.stopPropagation(); speak(card.term); }} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/40 transition">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/></svg>
                              </button>
                              <h2 className="text-4xl font-extrabold">{card.term}</h2>
                            </div>

                            {/* Back */}
                            <div className="absolute inset-0 w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border-2 border-indigo-100 text-gray-900 px-6 text-center">
                               {showPhonetics && (card.phonetic || card.pinyin) && <p className="text-lg text-indigo-600 font-mono font-bold mb-2">[{card.phonetic || card.pinyin}]</p>}
                               {showMeaning ? (
                                  <h2 className="text-2xl font-bold text-gray-800">{card.meaning}</h2>
                               ) : (
                                  <div className="text-gray-400 italic">Đã ẩn Nghĩa</div>
                               )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-8 pt-6 border-t border-indigo-50 flex items-center justify-between">
                        <button 
                          disabled={currentPage === 0} 
                          onClick={() => setBlockPages(p => ({...p, [block.block_id]: currentPage - 1}))}
                          className={`px-4 py-2 rounded-xl transition font-bold flex items-center ${currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                        >
                           &larr; Trang trước
                        </button>
                        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-[150px] sm:max-w-none">
                          {Array.from({length: totalPages}).map((_, pIdx) => (
                             <button 
                               key={pIdx} 
                               onClick={() => setBlockPages(p => ({...p, [block.block_id]: pIdx}))}
                               className={`w-8 h-8 rounded-lg font-bold text-sm transition flex-shrink-0 ${currentPage === pIdx ? 'bg-indigo-600 text-white shadow' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                             >
                                {pIdx + 1}
                             </button>
                          ))}
                        </div>
                        <button 
                          disabled={currentPage === totalPages - 1} 
                          onClick={() => setBlockPages(p => ({...p, [block.block_id]: currentPage + 1}))}
                          className={`px-4 py-2 rounded-xl transition font-bold flex items-center ${currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                        >
                           Trang sau &rarr;
                        </button>
                      </div>
                    )}
                    </>
                  )}
                 </div>
                );
              })()}

              {block.type === 'QUIZ' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded text-xs uppercase tracking-wider mr-3">Quiz</span>
                      Luyện tập kiến thức
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleStudentGenerateQuiz(block.block_id)} className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition flex items-center shadow-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Xáo trộn Đề Mới
                      </button>
                      <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{(content.questions || [content]).length} Câu hỏi</span>
                    </div>
                  </div>
                  
                  <div className="space-y-12">
                     {(content.questions || [content]).map((qItem: any, qIdx: number) => {
                       const identifier = `${block.block_id}_${qIdx}`;
                       let displayQuestion = qItem.question || '';
                       let displayPhonetic = qItem.phonetic || '';
                       
                       // Scrub hardcoded Admin DB Pinyin: Nghĩa của từ "X" (Y) là gì?
                       const match = displayQuestion.match(/\(([^)]+)\)/);
                       if (match && !displayPhonetic) {
                          displayPhonetic = match[1];
                          displayQuestion = displayQuestion.replace(/\s*\([^)]+\)/, "");
                       }

                       return (
                         <div key={qIdx} className="relative pb-8 border-b border-gray-50 last:border-b-0 last:pb-0">
                           <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center flex-wrap gap-2">
                             <span>{qIdx + 1}. {displayQuestion}</span>
                             {(quizAnswers[identifier] !== undefined && displayPhonetic) && (
                               <span className="text-gray-500 font-mono text-base font-normal">({displayPhonetic})</span>
                             )}
                           </h4>
                           
                           <div className="space-y-3">
                             {qItem.options?.map((opt: string) => {
                               const isSelected = quizAnswers[identifier] === opt;
                               const isRevealed = quizResults[identifier] !== undefined;
                               const isCorrectAnswer = opt === qItem.correct;
                               
                               let optionStyle = "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700";
                               if (isSelected) optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium ring-2 ring-emerald-500 ring-offset-1";
                               if (isRevealed) {
                                 if (isCorrectAnswer) optionStyle = "border-emerald-500 bg-emerald-100 text-emerald-800 font-bold ring-2 ring-emerald-500";
                                 else if (isSelected && !isCorrectAnswer) optionStyle = "border-red-500 bg-red-50 text-red-700 line-through opacity-70";
                                 else optionStyle = "border-gray-200 bg-gray-50 text-gray-400 opacity-50";
                               }

                               return (
                                 <button 
                                   key={opt}
                                   onClick={() => !isRevealed && handleQuizSelect(identifier, opt)}
                                   disabled={isRevealed}
                                   className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${optionStyle}`}
                                 >
                                   <div className="flex items-center justify-between">
                                     <span>{opt}</span>
                                     {isRevealed && isCorrectAnswer && <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                     {isRevealed && isSelected && !isCorrectAnswer && <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                                   </div>
                                 </button>
                               );
                             })}
                           </div>

                           <div className="mt-4 flex justify-end">
                             {!quizResults[identifier] && quizAnswers[identifier] !== undefined ? (
                               <button onClick={() => checkQuiz(identifier, qItem.correct, block.block_id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow transition text-sm">
                                 Kiểm Tra
                               </button>
                             ) : quizResults[identifier] === true ? (
                               <div className="text-emerald-600 font-bold flex items-center bg-emerald-50 px-3 py-1 rounded text-sm">Chính xác 🎉</div>
                             ) : quizResults[identifier] === false ? (
                               <div className="text-red-600 font-bold flex items-center bg-red-50 px-3 py-1 rounded text-sm">Chưa đúng</div>
                             ) : null}
                           </div>
                         </div>
                       );
                     })}
                  </div>
                </div>
              )}
              {block.type === 'VOCABULARY' && (() => {
                const allWords = content.words || [content];
                const itemsPerPage = 10;
                const totalPages = Math.ceil(allWords.length / itemsPerPage);
                const currentPage = blockPages[block.block_id] || 0;
                const currentWords = allWords.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                return (
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">📚</span>
                      Từ vựng mới
                    </h3>
                    {totalPages > 1 ? (
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Trang {currentPage + 1} / {totalPages}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{allWords.length} Từ vựng</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentWords.map((word: any, i: number) => (
                      <div key={i} className="flex items-center p-4 border border-gray-100 hover:border-indigo-200 rounded-xl hover:bg-indigo-50 transition group">
                        <button onClick={() => speak(word.term)} className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-indigo-200 text-indigo-600 flex flex-shrink-0 items-center justify-center mr-4 transition shadow-sm">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/></svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-2xl font-black text-gray-900 truncate">{word.term}</div>
                          {showPhonetics && (word.phonetic || word.pinyin) && <div className="text-sm font-mono text-indigo-500 font-bold truncate">{word.phonetic || word.pinyin}</div>}
                          {showMeaning && <div className="text-gray-600 mt-1 truncate">{word.meaning}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                      <button 
                        disabled={currentPage === 0} 
                        onClick={() => setBlockPages(p => ({...p, [block.block_id]: currentPage - 1}))}
                        className={`px-4 py-2 rounded-xl transition font-bold flex items-center ${currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                      >
                         &larr; Trang trước
                      </button>
                      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-[150px] sm:max-w-none">
                        {Array.from({length: totalPages}).map((_, pIdx) => (
                           <button 
                             key={pIdx} 
                             onClick={() => setBlockPages(p => ({...p, [block.block_id]: pIdx}))}
                             className={`w-8 h-8 rounded-lg font-bold text-sm transition flex-shrink-0 ${currentPage === pIdx ? 'bg-indigo-600 text-white shadow' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'}`}
                           >
                              {pIdx + 1}
                           </button>
                        ))}
                      </div>
                      <button 
                        disabled={currentPage === totalPages - 1} 
                        onClick={() => setBlockPages(p => ({...p, [block.block_id]: currentPage + 1}))}
                        className={`px-4 py-2 rounded-xl transition font-bold flex items-center ${currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                      >
                         Trang sau &rarr;
                      </button>
                    </div>
                  )}
                 </div>
                );
              })()}

              {block.type === 'SENTENCE' && (() => {
                const allSentences = content.sentences || [];
                const itemsPerPage = 10;
                const totalPages = Math.ceil(allSentences.length / itemsPerPage);
                const currentPage = blockPages[block.block_id] || 0;
                const currentSentences = allSentences.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                return (
                 <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-50">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3">💬</span>
                      Mẫu câu giao tiếp
                    </h3>
                    {totalPages > 1 ? (
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Trang {currentPage + 1} / {totalPages}</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{allSentences.length} Mẫu câu</span>
                    )}
                  </div>
                  <div className="space-y-4">
                    {currentSentences.map((sent: any, i: number) => (
                      <div key={i} className="flex p-4 bg-gray-50 rounded-xl items-start group hover:bg-emerald-50/50 transition">
                         <button onClick={() => speak(sent.text)} className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 group-hover:text-emerald-600 group-hover:border-emerald-300 flex items-center justify-center mr-4 transition flex-shrink-0 mt-1 shadow-sm">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/></svg>
                        </button>
                        <div>
                          <div className="text-xl font-bold text-gray-800">{sent.text}</div>
                          {showPhonetics && sent.phonetic && <div className="text-md text-emerald-600 font-bold font-mono my-1">{sent.phonetic}</div>}
                          {showMeaning && <div className="text-gray-600 italic">{sent.meaning}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-emerald-100 flex items-center justify-between">
                      <button 
                        disabled={currentPage === 0} 
                        onClick={() => setBlockPages(p => ({...p, [block.block_id]: currentPage - 1}))}
                        className={`px-4 py-2 rounded-xl transition font-bold flex items-center ${currentPage === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                         &larr; Trang trước
                      </button>
                      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-[150px] sm:max-w-none">
                        {Array.from({length: totalPages}).map((_, pIdx) => (
                           <button 
                             key={pIdx} 
                             onClick={() => setBlockPages(p => ({...p, [block.block_id]: pIdx}))}
                             className={`w-8 h-8 rounded-lg font-bold text-sm transition flex-shrink-0 ${currentPage === pIdx ? 'bg-emerald-600 text-white shadow' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                           >
                              {pIdx + 1}
                           </button>
                        ))}
                      </div>
                      <button 
                        disabled={currentPage === totalPages - 1} 
                        onClick={() => setBlockPages(p => ({...p, [block.block_id]: currentPage + 1}))}
                        className={`px-4 py-2 rounded-xl transition font-bold flex items-center ${currentPage === totalPages - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                      >
                         Trang sau &rarr;
                      </button>
                    </div>
                  )}
                 </div>
                );
              })()}

              {block.type === 'GRAMMAR' && (
                <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center text-amber-800">
                    <span className="w-8 h-8 rounded bg-amber-200 text-amber-700 flex items-center justify-center mr-3">⚙️</span>
                    Ngữ pháp
                  </h3>
                  <p className="text-lg text-gray-800 font-bold mb-4 bg-white p-4 rounded-xl border border-amber-100">{content.rule}</p>
                  <div className="space-y-3">
                    {content.examples?.map((ex: any, i: number) => (
                      <div key={i} className="pl-4 border-l-2 border-amber-300">
                        <div className="flex items-center space-x-3 mb-1">
                          <button onClick={() => speak(ex.text)} className="text-amber-600 hover:text-amber-800">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd"/></svg>
                          </button>
                          <span className="text-lg font-bold text-gray-800">{ex.text}</span>
                        </div>
                        {showPhonetics && ex.phonetic && <div className="text-sm font-mono text-amber-600 font-bold pl-8 mb-1">{ex.phonetic}</div>}
                        {showMeaning && <div className="text-gray-600 pl-8">{ex.meaning}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {block.type === 'READING' && (
                <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center text-sky-800">
                    <span className="w-8 h-8 rounded bg-sky-100 text-sky-600 flex items-center justify-center mr-3">📖</span>
                    Bài đọc
                  </h3>
                  <div className="space-y-6">
                    {content.paragraphs?.map((para: any, i: number) => (
                      <div key={i} className="relative group">
                        <button onClick={() => speak(para.text)} className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-sky-500 hover:bg-sky-100 hover:border-sky-300 flex items-center justify-center transition shadow-sm opacity-50 group-hover:opacity-100">
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/></svg>
                        </button>
                        <div className="text-xl text-gray-800 leading-relaxed font-serif track-wide">{para.text}</div>
                        {showPhonetics && para.phonetic && <div className="text-md text-sky-600 font-bold font-mono my-2">{para.phonetic}</div>}
                        {showMeaning && <div className="text-gray-500 bg-gray-50 p-4 rounded-lg mt-2 text-sm">{para.meaning}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                    {/* Explicit Anti-Cheat Completion Marker */}
                    <div className="mt-12 flex justify-center border-t border-gray-100 pt-8 pb-6">
                       {viewedBlocks.has(block.block_id) ? (
                          <button onClick={() => undoBlockCompletion(block.block_id)} className="px-6 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center shadow-inner border border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition group cursor-pointer">
                             <span className="flex items-center group-hover:hidden">
                               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                               Đã hoàn thành phần này
                             </span>
                             <span className="hidden items-center group-hover:flex">
                               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                               Hủy hoàn thành
                             </span>
                          </button>
                       ) : (
                          <button 
                             onClick={() => markBlockAsCompleted(block.block_id)}
                             className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 flex items-center transform hover:scale-105 duration-200 cursor-pointer"
                          >
                             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                             Đánh dấu Đã học xong / Hoàn thành
                          </button>
                       )}
                    </div>
             </section>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {blocks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="h-1 w-full bg-gray-100"><div className="h-1 bg-green-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div></div>
          <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
             <div className="text-gray-500 font-bold flex items-center">
                 <span className="text-green-500 mr-2">✓</span> {progressPercent}% Hoàn Thành
             </div>
             <Link href={`/student/course/${params.courseId}`} className={`px-8 py-3 rounded-xl font-bold transition shadow-lg ${progressPercent === 100 ? 'bg-green-600 text-white shadow-green-600/30 hover:bg-green-700' : 'bg-gray-900 text-white shadow-gray-900/30 hover:bg-black'}`}>
               {progressPercent === 100 ? 'Hoàn Thành Bài Tập' : 'Thoát ra ngoài'}
             </Link>
          </div>
        </div>
      )}

      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                   🕰️
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Phiên học đang dang dở!</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                   Hệ thống ghi nhận bạn đang học bài này từ trước. Bạn muốn tiếp tục bài học cũ hay làm mới lại từ đầu?
                </p>
                <div className="flex flex-col space-y-3">
                   <button onClick={handleResume} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30">
                      ▶️ Tiếp tục phiên học
                   </button>
                   <button onClick={handleRestart} className="w-full py-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200 transition">
                      🔄 Bắt đầu lại từ đầu
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
