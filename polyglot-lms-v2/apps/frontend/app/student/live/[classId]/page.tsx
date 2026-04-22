'use client';
import Link from 'next/link';

export default function StudentLiveRoom({ params }: { params: { classId: string } }) {
  const roomName = `polyglot_lms_class_${params.classId}`;

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden text-white font-sans">
       <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700 py-3 px-6 flex items-center justify-between z-10 shadow-lg relative">
          <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
          <div className="flex items-center space-x-4 relative pointer-events-auto">
             <Link href={`/student/dashboard`} className="text-emerald-400 hover:text-white transition bg-slate-700/50 p-2 rounded-full hover:bg-slate-600/50 border border-slate-600/50">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </Link>
             <h1 className="font-bold text-lg flex items-center tracking-wide"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]"></span>Phòng Live: Học viên</h1>
          </div>
          <div className="flex text-xs font-bold text-slate-400 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700 relative pointer-events-none">
            Powered by Jitsi Meet
          </div>
       </header>
       <main className="flex-1 w-full relative">
          <iframe 
             src={`https://meet.jit.si/${roomName}?userInfo.displayName="Student"`}
             allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
             className="w-full h-full border-0 absolute inset-0"
             style={{ backgroundColor: '#0f172a' }}
          ></iframe>
       </main>
    </div>
  );
}
