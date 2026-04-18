'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CurriculumBuilderPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);

  const loadCurriculum = async () => {
    const token = localStorage.getItem('polyglot_token');
    if (!token) return router.push('/login');
    const res = await fetch(`/api/v1/admin/courses/${courseId}/curriculum`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setCourse(data);
  };

  useEffect(() => {
    if (courseId) loadCurriculum();
  }, [courseId]);

  const handleAddUnit = async () => {
     const title = prompt('Tên Phân hệ (Unit):', 'Unit mới');
     const order = prompt('Thứ tự sắp xếp (số nguyên):', '1');
     if(!title || !order) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`/api/v1/admin/units`, {
       method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ course_id: courseId, title, order })
     });
     loadCurriculum();
  };

  const handleEditUnit = async (u: any) => {
     const title = prompt('Sửa Tên Unit:', u.title);
     const order = prompt('Sửa Thứ tự:', String(u.order));
     if(!title || !order) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`/api/v1/admin/units/${u.id}`, {
       method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ title, order })
     });
     loadCurriculum();
  };

  const handleDeleteUnit = async (id: string) => {
     if(!confirm('Xóa Unit sẽ mất hết các Lesson bên trong?')) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`/api/v1/admin/units/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
     loadCurriculum();
  };

  const handleAddLesson = async (unit_id: string) => {
     const title = prompt('Tên Bài học (Lesson):', 'Bài học mới');
     const order = prompt('Thứ tự:', '1');
     if(!title || !order) return;
     const token = localStorage.getItem('polyglot_token');
     const res = await fetch(`/api/v1/admin/lessons`, {
       method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ unit_id, title, order })
     });
     if (res.ok) {
       const newLessonResponse = await res.json();
       const newLessonId = newLessonResponse.lesson.id;
       const defaultBlocks = [
         { type: 'VOCABULARY', content: { words: [] } },
         { type: 'FLASHCARD', content: { cards: [] } },
         { type: 'GRAMMAR', content: { rule: "Ngữ pháp căn bản", examples: [] } },
         { type: 'SENTENCE', content: { sentences: [] } },
         { type: 'READING', content: { paragraphs: [] } },
         { type: 'QUIZ', content: { question: "Câu hỏi ví dụ", options: ["A", "B", "C", "D"], correct: "A" } },
       ];

       for (let i = 0; i < defaultBlocks.length; i++) {
          await fetch(`/api/v1/admin/blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ lesson_id: newLessonId, type: defaultBlocks[i].type, seq_no: i + 1, content: defaultBlocks[i].content })
          });
       }
     }
     loadCurriculum();
  };

  const handleEditLesson = async (l: any) => {
     const title = prompt('Sửa Tên Lesson:', l.title);
     const order = prompt('Sửa Thứ tự:', String(l.order));
     if(!title || !order) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`/api/v1/admin/lessons/${l.id}`, {
       method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ title, order })
     });
     loadCurriculum();
  };

  const handleDeleteLesson = async (id: string) => {
     if(!confirm('Xóa Lesson này?')) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`/api/v1/admin/lessons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
     loadCurriculum();
  };

  if(!course) return <div className="p-10 text-center font-bold text-gray-400">Loading course tree...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
       <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 block">
          
          {/* Header */}
          <header className="bg-slate-900 text-white p-8 flex justify-between items-center relative overflow-hidden">
             <div className="relative z-10">
               <button onClick={() => router.push('/admin/dashboard')} className="text-emerald-400 hover:text-white font-bold text-sm mb-4 inline-block transition">&larr; Quay lại Admin Dashboard</button>
               <h1 className="text-4xl font-black">{course.title}</h1>
               <p className="text-slate-400 mt-2 font-mono text-sm max-w-xl">Cấu trúc đa tầng (Units & Lessons) chuẩn vị LMS hiện đại.</p>
             </div>
             <div className="relative z-10">
               <button onClick={handleAddUnit} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-bold shadow-lg transition shadow-emerald-500/30 text-white text-lg flex items-center">
                 <span className="mr-2 text-2xl leading-none">+</span> TẠO UNIT MỚI
               </button>
             </div>
             
             {/* Abstract geometric bg */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          </header>

          {/* Builder Area */}
          <main className="p-8 pb-20 bg-slate-50 min-h-[50vh]">
             {course.units?.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-3xl bg-white">
                  <div className="text-6xl mb-4 opacity-50">📂</div>
                  <h3 className="text-2xl font-bold text-gray-500">Curriculum trống trơn!</h3>
                  <p className="text-gray-400 mt-2">Bấm phím TẠO UNIT MỚI để bắt đầu dựng khung xương Khóa học.</p>
                </div>
             ) : (
                <div className="space-y-6">
                  {course.units?.map((u: any) => (
                    <div key={u.id} className="bg-white border-2 border-indigo-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                       
                       {/* UNIT HEADER */}
                       <div className="bg-indigo-50 px-6 py-4 flex justify-between items-center group">
                          <div>
                             <span className="bg-indigo-200 text-indigo-800 text-[10px] font-black px-2 py-1 rounded-md mb-1 inline-block uppercase tracking-widest">IDX: {u.order}</span>
                             <h3 className="text-xl font-black text-indigo-900 leading-none">{u.title}</h3>
                          </div>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                             <button onClick={() => handleEditUnit(u)} className="bg-white border text-xs px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-indigo-600 shadow-sm transition">Sửa</button>
                             <button onClick={() => handleDeleteUnit(u.id)} className="bg-white border text-xs px-3 py-1.5 rounded-lg font-bold text-slate-600 hover:text-rose-600 shadow-sm transition">Xóa</button>
                          </div>
                       </div>

                       {/* LESSONS LIST */}
                       <div className="p-6">
                          <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[1.35rem] before:w-[2px] before:bg-indigo-100">
                             {u.lessons?.map((l: any) => (
                               <div key={l.id} className="relative flex items-center group">
                                  <div className="w-10 h-10 bg-white border-2 border-emerald-300 text-emerald-600 rounded-full flex items-center justify-center font-black z-10 shadow-sm mr-4 flex-shrink-0 text-sm">
                                     {l.order}
                                  </div>
                                  <div className="flex-1 bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-emerald-300 transition flex justify-between items-center cursor-default">
                                    <div className="flex items-center space-x-3">
                                      <h4 className="font-bold text-slate-800 text-md">{l.title}</h4>
                                      <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded shadow-inner">
                                        📄 {l._count?.blocks || 0} Blocks
                                      </span>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition relative z-20">
                                       <button onClick={() => router.push(`/admin/lesson-builder/${l.id}`)} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition">Gắn Nội Dung &gt;</button>
                                       <button onClick={() => handleEditLesson(l)} className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition">Sửa</button>
                                       <button onClick={() => handleDeleteLesson(l.id)} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition">Xóa</button>
                                    </div>
                                  </div>
                               </div>
                             ))}
                             
                             <div className="relative flex items-center mt-3 pt-3">
                                <div className="w-10 h-10 bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-full flex items-center justify-center z-10 mr-4"></div>
                                <button onClick={() => handleAddLesson(u.id)} className="bg-white border-2 border-dashed border-indigo-200 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 font-bold py-3 px-6 rounded-xl transition text-sm flex items-center">
                                   + Thêm Bài học (Lesson) vào Unit
                                </button>
                             </div>
                          </div>
                       </div>

                    </div>
                  ))}
                </div>
             )}
          </main>
       </div>
    </div>
  );
}
