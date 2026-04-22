'use client';
import Link from 'next/link';

export default function TeacherLiveRoom({ params }: { params: { classId: string } }) {
  const roomName = `polyglot_lms_class_${params.classId}`;

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden text-white font-sans">
       <header className="bg-gray-800 border-b border-gray-700 py-3 px-6 flex items-center justify-between z-10 shadow-md">
          <div className="flex items-center space-x-4">
             <Link href={`/teacher/classes/${params.classId}`} className="text-gray-400 hover:text-white transition bg-gray-700 p-2 rounded-full hover:bg-gray-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </Link>
             <h1 className="font-bold text-lg flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>Phòng Live: Giảng viên</h1>
          </div>
          <div className="text-xs font-bold text-gray-500 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">Powered by Jitsi Meet API</div>
       </header>
       <main className="flex-1 w-full relative">
          <iframe 
             src={`https://meet.jit.si/${roomName}?userInfo.displayName="Giảng viên Polyglot LMS"`}
             allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
             className="w-full h-full border-0 absolute inset-0"
             style={{ backgroundColor: '#111827' }}
          ></iframe>
       </main>
    </div>
  );
}
