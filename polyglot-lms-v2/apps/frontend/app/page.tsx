'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPortal() {
  const [settings, setSettings] = useState({
     platform_name: 'Polyglot Hub',
     tagline: 'E-Learning Ecosystem',
     description: 'Nền tảng Học thuật chuyên nghiệp tích hợp ngôn ngữ học và Spaced Repetition System.',
     company_name: 'TSOL',
     company_description: 'TSOL là đơn vị chủ quản quản lý hạ tầng học thuật.',
     company_url: 'https://thegioigiaiphap.vn'
  });

  useEffect(() => {
     fetch(`http://${window.location.hostname}:3001/api/v1/public/settings`)
       .then(res => res.json())
       .then(data => {
          if (data && data.platform_name) setSettings(data);
       })
       .catch(err => console.error(err));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050B14] overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* High-Tech Background Grids & Ornaments */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent"></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-teal-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center sm:px-6 lg:px-8">
        
        {/* Corporate Tagline Spotlight */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform duration-300">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <span>Đơn vị quản lý & vận hành: {settings.company_name}</span>
        </div>

        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl mb-6 drop-shadow-2xl">
          <span className="block">{settings.platform_name}</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 pb-2">
             {settings.tagline}
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto mt-4 text-xl text-slate-400 mb-12 font-light leading-relaxed">
          {settings.description}
        </p>

        {/* Portal Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full mb-20">
          {/* Student */}
          <Link href="/login" className="group relative rounded-3xl bg-slate-900/40 p-8 border border-slate-700/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(6,182,212,0.15)] hover:border-emerald-500/50 hover:bg-slate-800/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)] border border-emerald-500/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3 group-hover:text-emerald-300 transition-colors">Student Portal</h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed">Không gian luyện tập tương tác thuật toán. Tra cứu lộ trình, rèn luyện Flashcard & tự làm Quiz.</p>
            </div>
          </Link>

          {/* Teacher */}
          <Link href="/teacher/dashboard" className="group relative rounded-3xl bg-slate-900/40 p-8 border border-slate-700/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.15)] hover:border-green-500/50 hover:bg-slate-800/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 text-green-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)] border border-green-500/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3 group-hover:text-green-300 transition-colors">Teacher Studio</h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed">Hệ thống theo dõi sức học và tiến độ qua thời gian thực. Theo dõi kết quả và phê duyệt bài tập.</p>
            </div>
          </Link>

          {/* Admin */}
          <Link href="/admin/dashboard" className="group relative rounded-3xl bg-slate-900/40 p-8 border border-slate-700/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:border-teal-500/50 hover:bg-slate-800/60 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)] border border-teal-500/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3 group-hover:text-teal-300 transition-colors">Admin Control</h3>
                <p className="text-sm text-slate-400 text-center leading-relaxed">Hệ thống đầu não vận hành. Tạo khóa học mới, phê duyệt cấu trúc và import nội dung Excel.</p>
             </div>
          </Link>
        </div>

        {/* Corporate Banner */}
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
               <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <span className="text-3xl font-black text-white tracking-widest">{settings.company_name.substring(0, 4)}</span>
               </div>
               
               <div className="text-center md:text-left flex-1">
                 <h4 className="text-2xl font-bold text-white mb-2">{settings.company_name}</h4>
                 <p className="text-slate-400 leading-relaxed mb-5 text-justify md:text-left text-sm sm:text-base">
                   {settings.company_description}
                 </p>
                 <a href={settings.company_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg shadow-emerald-600/30 group/link">
                   <span>Visit {settings.company_name}</span>
                   <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </a>
               </div>
            </div>
        </div>
        
        <p className="mt-16 text-slate-600 text-sm font-mono tracking-widest uppercase">Polyglot LMS System v2.0</p>
      </div>
    </div>
  );
}
