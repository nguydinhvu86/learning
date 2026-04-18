'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../components/NotificationBell';

export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', phone: '', password: '' });
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('polyglot_token');
    router.push('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    
    fetch(`/api/v1/curriculum/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        // Load custom order from LocalStorage if available
        const savedOrder = localStorage.getItem('polyglot_user_course_order');
        if (savedOrder) {
           const orderArray = JSON.parse(savedOrder);
           const ordered = [...data].sort((a, b) => {
              const idxA = orderArray.indexOf(a.id);
              const idxB = orderArray.indexOf(b.id);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
           });
           setCourses(ordered);
        } else {
           setCourses(data);
        }
      } else {
        setCourses([]);
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      setCourses([]);
    });
    
    // Fetch dashboard stats from DB
    fetch(`/api/v1/progress/dashboard`, {
       headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(console.error);

    // Fetch user profile
    fetch(`/api/v1/auth/me`, {
       headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
       if (data.full_name !== undefined) {
         setProfile({ full_name: data.full_name, phone: data.phone || '', password: '' });
       }
    })
    .catch(console.error);

  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem('polyglot_token');
    try {
      await fetch(`/api/v1/auth/me`, {
        method: 'PUT',
        headers: { 
           'Authorization': `Bearer ${token}`, 
           'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profile)
      });
      setShowSettings(false);
      alert('Cập nhật thông tin lưu vết thành công!');
    } catch {
      alert('Lỗi cập nhật');
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
     setDraggedIndex(index);
     // For styling drag image
     e.dataTransfer.effectAllowed = 'move';
     setTimeout(() => {
       if (e.target instanceof HTMLElement) {
          e.target.style.opacity = '0.4';
       }
     }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
     e.preventDefault();
     e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
     e.preventDefault();
     if (draggedIndex === null || draggedIndex === index) return;
     
     const reorderedCourses = [...courses];
     const [removed] = reorderedCourses.splice(draggedIndex, 1);
     reorderedCourses.splice(index, 0, removed);
     
     setCourses(reorderedCourses);
     setDraggedIndex(null);
     
     // Save preferences
     localStorage.setItem('polyglot_user_course_order', JSON.stringify(reorderedCourses.map(c => c.id)));
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
     if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '1';
     }
     setDraggedIndex(null);
  };

  return (
    <div className="relative min-h-screen bg-[#050B14] overflow-hidden font-sans selection:bg-emerald-500/30 pb-20">
      {/* High-Tech Background Grids & Ornaments */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      
      <header className="relative z-50 bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(6,182,212,0.5)]">
               S
             </div>
             <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">Student Studio</h1>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => setShowSettings(true)} className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-900/40 px-3 py-1.5 rounded-lg border border-emerald-500/30">Cài đặt tài khoản</button>
            <NotificationBell />
            <button onClick={handleLogout} className="text-sm font-semibold text-slate-400 hover:text-slate-300 transition-colors">Đăng xuất</button>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Statistics Widgets */}
        <section className="mb-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-md overflow-hidden hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-[50px] group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="relative z-10">
               <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Mastered Lessons</h3>
               <p className="text-4xl font-black text-white">{stats?.lessons_mastered}</p>
            </div>
          </div>
          
          <div className="group relative bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-md overflow-hidden hover:border-green-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full filter blur-[50px] group-hover:bg-green-500/20 transition-all"></div>
            <div className="relative z-10">
               <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Items to Review</h3>
               <p className="text-4xl font-black text-white">{stats?.items_to_review}</p>
            </div>
          </div>
          
          <div className="group relative bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-md overflow-hidden hover:border-teal-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full filter blur-[50px] group-hover:bg-teal-500/20 transition-all"></div>
            <div className="relative z-10">
               <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span> Global Accuracy</h3>
               <p className="text-4xl font-black text-white">{stats?.accuracy_rate}%</p>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Trợ lý Lộ trình Học thuật</h2>
              <p className="text-slate-400 text-sm font-light">Kéo thả (drag & drop) các module để sắp xếp lại độ ưu tiên học tập</p>
            </div>
            <Link href="/student/placement" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-xl font-bold transition flex items-center shadow-[0_0_15px_rgba(6,182,212,0.15)] flex-shrink-0">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Bài test Đo lường Năng lực
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c, index) => (
              <div 
                key={c.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className="group cursor-grab active:cursor-grabbing bg-slate-900/60 rounded-3xl border border-slate-700/50 overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(6,182,212,0.2)] hover:border-emerald-500/50 backdrop-blur-lg transition-all duration-300"
              >
                <div className="h-32 bg-slate-800 flex items-center justify-between p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-transparent"></div>
                  <h3 className="text-2xl font-black text-white relative z-10 w-3/4 drop-shadow-md">{c.title}</h3>
                  <div className="w-12 h-12 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-slate-400 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
                     {c.language.includes('EN') ? '🇺🇸' : '🇨🇳'}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 flex justify-center rounded-lg font-bold uppercase tracking-widest">{c.language}</span>
                    <span className="text-slate-400 font-medium">Tiến độ: <strong className="text-white">{c.progress}%</strong></span>
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-8 border border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${c.progress}%` }}></div>
                  </div>
                  
                  <Link 
                     href={`/student/course/${c.id}`} 
                     onClick={(e) => e.stopPropagation()} 
                     onPointerDown={(e) => e.stopPropagation()}
                     className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
                  >
                    Vào học ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                  <h2 className="text-2xl font-bold text-white mb-6">Cài đặt Tài khoản</h2>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-slate-400 text-sm font-semibold mb-1">Họ và tên</label>
                        <input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="Nguyễn Văn A" />
                     </div>
                     <div>
                        <label className="block text-slate-400 text-sm font-semibold mb-1">Số điện thoại</label>
                        <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="0901234567" />
                     </div>
                     <div>
                        <label className="block text-slate-400 text-sm font-semibold mb-1">Đổi Mật khẩu (Bỏ trống nếu giữ nguyên)</label>
                        <input type="password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500" placeholder="********" />
                     </div>
                  </div>
                  <div className="mt-8 flex justify-end space-x-3">
                     <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-semibold transition">Hủy bỏ</button>
                     <button onClick={saveProfile} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition">Lưu cập nhật</button>
                  </div>
               </div>
            </div>
        )}
      </main>
    </div>
  );
}
