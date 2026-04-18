'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CourseHub({ params }: { params: { courseId: string } }) {
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    
    fetch(`/api/v1/curriculum/courses/${params.courseId}/roadmap`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setRoadmap(data.units ? data : null);
    })
    .catch(err => console.error('Fetch error:', err));
  }, [params.courseId]);

  if (!roadmap) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900 font-sans">Đang tải dữ liệu khóa học...</div>;
  }

  // Handle empty units or course
  if (!roadmap.title) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900 font-sans">Khóa học không tồn tại.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/student/dashboard" className="text-gray-500 hover:text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{roadmap.title}</h1>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          {roadmap.units?.map((unit: any, index: number) => (
            <div key={unit.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                <h2 className="text-lg font-bold text-indigo-900">
                  <span className="text-indigo-500 mr-2">Unit {index + 1}:</span>
                  {unit.title}
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {unit.lessons?.map((lesson: any) => (
                  <Link 
                    key={lesson.id} 
                    href={`/student/course/${params.courseId}/lesson/${lesson.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Status Icon */}
                      {lesson.status === 'completed' ? (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                      )}
                      
                      <div>
                        <h3 className={`font-semibold ${lesson.status === 'completed' ? 'text-gray-500' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                          {lesson.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="text-gray-300 group-hover:text-indigo-500 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
