'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Modals
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // User Admin Modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT', course_ids: [] as string[] });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [metadata, setMetadata] = useState<{programs: any[], levels: any[], frameworks: any[]}>({ programs: [], levels: [], frameworks: [] });
  const [newCourse, setNewCourse] = useState({ title: '', program_id: '', level_id: '', description: '' });

  // Add Metadata Inputs
  const [newProgram, setNewProgram] = useState({ title: '', language: 'EN', description: '' });
  const [newLevel, setNewLevel] = useState({ name: '', framework_id: '', order: 1 });

  // System Settings Config
  const [siteSettings, setSiteSettings] = useState({
     platform_name: '', tagline: '', description: '', company_name: '', company_description: '', company_url: ''
  });

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('polyglot_token');
    router.push('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    
    fetch(`http://${window.location.hostname}:3001/api/v1/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(json => {
       if (json.success) {
         setStats(json.data);
       }
    })
    .catch(err => console.error('Fetch error:', err));

    // Preload metadata
    if (token) fetchMetadata(token);
  }, []);

  const fetchMetadata = async (token: string) => {
    fetch(`http://${window.location.hostname}:3001/api/v1/admin/metadata`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setMetadata(data))
    .catch(() => {});
  };

  const loadUsers = async () => {
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
  };

  const handleCreateUser = async () => {
     if(!newUser.email || !newUser.password || !newUser.name) return alert('Vui lòng điền đủ thông tin Email, Tên và Mật khẩu.');
     const token = localStorage.getItem('polyglot_token');
     const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
     });
     if(res.ok) {
        setShowCreateUserModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'STUDENT', course_ids: [] });
        loadUsers();
     } else {
        alert('Tạo thất bại. Email có thể đã tồn tại.');
     }
  };

  const handleUpdateUser = async () => {
     if(!editingUser) return;
     const token = localStorage.getItem('polyglot_token');

     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: editingUser.name, email: editingUser.email, password: editingUser.new_password, course_ids: editingUser.course_ids })
     });

     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: editingUser.role })
     });

     setShowEditUserModal(false);
     setEditingUser(null);
     loadUsers();
  };

  const handleToggleLock = async (user: any) => {
     if(!confirm(`Bạn chắc chắn muốn ${user.is_active ? 'KHÓA' : 'MỞ KHÓA'} tài khoản này?`)) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: user.is_active ? 'locked' : 'active' })
     });
     loadUsers();
  };

  const loadCourses = async () => {
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/courses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setCourses(data);
  };

  const handleBroadcast = async () => {
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/notifications/admin/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage })
    });
    const result = await res.json();
    if (result.success) {
       setShowBroadcastModal(false);
       setBroadcastTitle('');
       setBroadcastMessage('');
       alert(`Đã bắn thành công thông báo siêu tốc tới ${result.count_sent} User online!`);
    }
  };

  const handleCreateCourse = async () => {
    if(!newCourse.title || !newCourse.program_id || !newCourse.level_id) return alert('Điền đủ thông tin bắt buộc!');
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newCourse)
    });
    const result = await res.json();
    if (result.success) {
      setShowCourseModal(false);
      setNewCourse({ title: '', program_id: '', level_id: '', description: '' });
      loadCourses();
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/v1/public/settings`);
      const data = await res.json();
      if(data && data.platform_name) setSiteSettings(data);
    } catch(err) { console.error(err); }
  };

  const handleSaveSettings = async () => {
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/settings`, {
       method: 'PUT',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify(siteSettings)
    });
    if(res.ok) alert('✅ Cập nhật cấu hình Website thành công!');
    else alert('❌ Có lỗi xảy ra khi lưu cấu hình.');
  };

  const handleCreateProgram = async () => {
    if(!newProgram.title || !newProgram.language) return alert('Điền đủ thông tin Program!');
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newProgram)
    });
    if (res.ok) {
        setNewProgram({ title: '', language: 'EN', description: '' });
        fetchMetadata(token!);
        alert('Tạo Chương trình thành công!');
    }
  };

  const handleCreateLevel = async () => {
    if(!newLevel.name || !newLevel.framework_id) return alert('Điền đủ thông tin Level!');
    const token = localStorage.getItem('polyglot_token');
    const res = await fetch(`http://${window.location.hostname}:3001/api/v1/admin/levels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newLevel)
    });
    if (res.ok) {
        setNewLevel({ name: '', framework_id: '', order: 1 });
        fetchMetadata(token!);
        alert('Tạo Cấp độ thành công!');
    }
  };

  const handleEditProgram = async (p: any) => {
     const newTitle = prompt('Sửa Tên Chương Trình:', p.title);
     if(!newTitle) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/programs/${p.id}`, { 
       method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ title: newTitle, language: p.language, description: p.description })
     });
     fetchMetadata(token!);
  };

  const handleDeleteProgram = async (id: string) => {
     if(!confirm('🚨 CẢNH BÁO: Bạn có chắc muốn xóa Program này? Hành động này sẽ xóa luân lý toàn bộ Course bên dưới (Cascade)! Hệ thống không chịu trách nhiệm.')) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/programs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
     fetchMetadata(token!);
  };

  const handleEditLevel = async (l: any) => {
     const newName = prompt('Sửa Tên Cấp Độ:', l.name);
     if(!newName) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/levels/${l.id}`, { 
       method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ name: newName, framework_id: l.framework_id, order: l.order })
     });
     fetchMetadata(token!);
  };

  const handleDeleteLevel = async (id: string) => {
     if(!confirm('Xác nhận xóa LEVEL này khỏi hệ thống?')) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/levels/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
     fetchMetadata(token!);
  };

  const handleEditCourse = async (c: any) => {
     const newTitle = prompt('Sửa Tên Khóa Học:', c.title);
     if(!newTitle) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/courses/${c.id}`, { 
       method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ title: newTitle, program_id: c.program_id, level_id: c.level_id, description: c.description })
     });
     loadCourses();
  };

  const handleDeleteCourse = async (id: string) => {
     if(!confirm('🚨 CẢNH BÁO: Xóa Course sẽ làm mất toàn bộ Curriculum bên trong (Units, Lessons, Flashcards). Khó hồi phục. Vẫn xóa?')) return;
     const token = localStorage.getItem('polyglot_token');
     await fetch(`http://${window.location.hostname}:3001/api/v1/admin/courses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
     loadCourses();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col z-10 block">
        <h1 className="text-2xl font-bold mb-10 tracking-wider">Polyglot<span className="text-emerald-400">Hub</span></h1>
        
        <nav className="flex-1 space-y-4">
          <a onClick={() => setActiveTab('dashboard')} className={`block px-4 py-3 rounded font-semibold cursor-pointer transition ${activeTab === 'dashboard' ? 'bg-emerald-600 shadow' : 'hover:bg-slate-800'}`}>Dashboard</a>
          <a onClick={() => { setActiveTab('users'); loadUsers(); }} className={`block px-4 py-3 rounded font-semibold cursor-pointer transition ${activeTab === 'users' ? 'bg-emerald-600 shadow' : 'hover:bg-slate-800'}`}>Quản lý Học viên / GV</a>
          <a onClick={() => { setActiveTab('courses'); loadCourses(); }} className={`block px-4 py-3 rounded font-semibold cursor-pointer transition ${activeTab === 'courses' ? 'bg-emerald-600 shadow' : 'hover:bg-slate-800'}`}>Quản trị Khóa học</a>
          <a onClick={() => setActiveTab('config')} className={`block px-4 py-3 rounded font-semibold cursor-pointer transition ${activeTab === 'config' ? 'bg-emerald-600 shadow' : 'hover:bg-slate-800'}`}>Cấu hình Chương trình</a>
          <a onClick={() => { setActiveTab('website'); loadSettings(); }} className={`block px-4 py-3 rounded font-semibold cursor-pointer transition ${activeTab === 'website' ? 'bg-emerald-600 shadow' : 'hover:bg-slate-800'}`}>Cấu hình Website</a>
        </nav>

        <button onClick={handleLogout} className="mt-10 w-full px-4 py-3 bg-red-500 hover:bg-red-600 rounded font-bold shadow text-sm transition">Đăng xuất</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Admin Workspace</h2>
          <span className="bg-white rounded shadow px-5 py-2 text-sm font-semibold text-gray-500">Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in zoom-in duration-500">
            {/* KPI Grid */}
            <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6 border-b-4 border-emerald-500 transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng Học Viên</h3>
                <p className="text-5xl font-black text-gray-900 mt-3">{stats?.total_students}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 border-b-4 border-blue-500 transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lượt Ghi Danh (Enrollments)</h3>
                <p className="text-5xl font-black text-blue-600 mt-3">{stats?.active_enrollments}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 border-b-4 border-purple-500 transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lớp Đang Mở</h3>
                <p className="text-5xl font-black text-purple-600 mt-3">{stats?.total_classes}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 border-b-4 border-rose-500 transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Cảnh báo At-Risk</h3>
                <p className="text-5xl font-black text-rose-600 mt-3">{stats?.at_risk_students}</p>
              </div>
            </section>

            {/* Charts & Details */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Courses */}
              <div className="bg-white rounded-xl shadow p-8 h-full">
                <h3 className="text-2xl font-bold mb-6">Course Health Metrics</h3>
                <div className="space-y-8 mt-6">
                  {stats?.course_completion && Object.entries(stats.course_completion).map(([course, rate]) => (
                    <div key={course}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-gray-700 text-lg">{course}</span>
                        <span className="text-emerald-600 font-extrabold">{String(rate)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${rate}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3 bg-yellow-100 text-yellow-600 w-10 h-10 flex items-center justify-center rounded-xl">⚡</span> 
                  Quick Actions Hub
                </h3>
                <div className="space-y-4 pt-2">
                  <button onClick={() => setShowBroadcastModal(true)} className="w-full text-left bg-gray-50 hover:bg-blue-50 p-5 rounded-xl flex items-center justify-between border border-blue-100 transition shadow-sm hover:shadow-md cursor-pointer group">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition">Phát Ringtones/Thông Báo Toàn Server</h4>
                      <p className="text-sm text-gray-500 mt-1">Bắn WebSockets tức thì tới toàn bộ Student & Teacher</p>
                    </div>
                    <span className="text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition font-black text-xl">➔</span>
                  </button>

                  <button className="w-full text-left bg-gray-50 hover:bg-rose-50 p-5 rounded-xl flex items-center justify-between border border-rose-100 transition shadow-sm hover:shadow-md cursor-pointer group">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-rose-700 transition">Quét Học Viên Buông Thả (Rule-Engine)</h4>
                      <p className="text-sm text-gray-500 mt-1">Lọc sinh viên học lười biếng để nhắn tin hối lộ KPI</p>
                    </div>
                    <span className="text-rose-400 font-black text-xl">➔</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between mb-8 pb-8 border-b">
               <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Hồ sơ Cán bộ & Học viên</h2>
                  <p className="text-gray-500">Hệ thống giám sát nhân sự và quản lý tài khoản thành viên</p>
               </div>
               <button onClick={() => setShowCreateUserModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition shadow-indigo-600/20 flex items-center transform hover:scale-105 duration-200">
                  <span className="text-2xl mr-2 leading-none mb-1">+</span> Tạo Người Dùng Mới
               </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-black tracking-widest border-b border-gray-100">
                     <th className="px-6 py-5">Tên user</th>
                     <th className="px-6 py-5">Vai trò</th>
                     <th className="px-6 py-5">Trạng thái</th>
                     <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {users.length === 0 ? (
                     <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading DB...</td></tr>
                   ) : users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="px-6 py-5">
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500 mt-0.5">{u.email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide
                              ${u.role === 'TEACHER' ? 'bg-amber-100 text-amber-800' 
                              : u.role === 'STUDENT' ? 'bg-indigo-100 text-indigo-800' 
                              : 'bg-emerald-100 text-emerald-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase
                              ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {u.is_active ? '✅ Active' : '❌ Locked'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right space-x-2 flex items-center justify-end">
                           <button onClick={() => { setEditingUser({...u, new_password: ''}); setShowEditUserModal(true); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition shadow-sm border border-slate-200 flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Sửa Cấu hình
                           </button>
                           <button onClick={() => handleToggleLock(u)} className={`px-4 py-2 text-xs font-bold transition rounded-lg shadow-sm border ${u.is_active ? 'hover:bg-rose-50 text-rose-600 border-rose-200' : 'hover:bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                             {u.is_active ? 'Khóa' : 'Mở Khóa'}
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Thư viện Khóa học & Chương trình</h2>
            <p className="text-gray-500 mb-8 border-b pb-8">Giám sát tài nguyên đào tạo và ma trận phân bổ Curriculum.</p>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-800 uppercase text-xs font-black tracking-widest border-b border-emerald-100">
                     <th className="px-6 py-5">Tên Khóa Học</th>
                     <th className="px-6 py-5">Chương Trình</th>
                     <th className="px-6 py-5">Cấp độ Yêu cầu</th>
                     <th className="px-6 py-5 text-center">Tổng phân hệ (Units)</th>
                     <th className="px-6 py-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {courses.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading curriculum metadata...</td></tr>
                   ) : courses.map(c => (
                     <tr key={c.id} className="hover:bg-emerald-50/30 transition duration-150">
                        <td className="px-6 py-5 font-bold text-gray-900">{c.title}</td>
                        <td className="px-6 py-5">
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase shadow-sm border border-indigo-100">{c.program?.title || 'GENERAL'}</span>
                        </td>
                        <td className="px-6 py-5 font-mono text-sm font-bold text-gray-600">{c.level?.code || 'N/A'}</td>
                        <td className="px-6 py-5 text-center font-black text-emerald-600 text-lg">{c._count?.units || 0}</td>
                        <td className="px-6 py-5 text-right space-x-2">
                           <button onClick={() => handleEditCourse(c)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition border border-gray-300 shadow-sm">Sửa Info</button>
                           <button onClick={() => handleDeleteCourse(c.id)} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition border border-rose-200 shadow-sm">Xóa</button>
                           <button onClick={() => router.push(`/admin/course-builder/${c.id}`)} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition border border-emerald-200 shadow-sm">Mở Curriculum Builder</button>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>

            <button onClick={() => setShowCourseModal(true)} className="px-6 py-5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold w-full hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 transition flex items-center justify-center cursor-pointer">
              <span className="text-2xl mr-2 leading-none">+</span> Tạo Khóa học Mới
            </button>
          </div>
        )}

        {/* CONFIG/METADATA TAB */}
        {activeTab === 'config' && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Cấu hình Cốt lõi LMS</h2>
            <p className="text-gray-500 mb-8 border-b pb-8">Tạo và quản lý Cấu trúc phân nhánh Giáo dục (Programs / Levels).</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Program Builder */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Cây Chương Trình (Programs)</h3>
                
                <div className="space-y-4 mb-8">
                   {metadata.programs.map((p: any) => (
                      <div key={p.id} className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl flex justify-between items-center hover:bg-indigo-50 transition group">
                         <div>
                            <strong className="text-indigo-900 block">{p.title}</strong> 
                            <span className="text-xs text-indigo-500 uppercase tracking-widest bg-indigo-100 px-2 py-1 rounded inline-block mt-1">{p.language}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <button onClick={() => handleEditProgram(p)} className="text-xs font-bold bg-white text-indigo-600 border border-indigo-200 px-2 py-1 rounded shadow-sm hover:bg-indigo-600 hover:text-white transition opacity-0 group-hover:opacity-100">Sửa</button>
                            <button onClick={() => handleDeleteProgram(p.id)} className="text-xs font-bold bg-white text-rose-600 border border-rose-200 px-2 py-1 rounded shadow-sm hover:bg-rose-600 hover:text-white transition opacity-0 group-hover:opacity-100">Xóa</button>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-700 text-sm uppercase tracking-widest mb-4">Thêm Program Mới</h4>
                  <div className="space-y-4">
                    <input type="text" placeholder="Tên chương trình (Vd: Khóa Bồi Dưỡng IELTS)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProgram.title} onChange={e=>setNewProgram({...newProgram, title: e.target.value})} />
                    <input type="text" placeholder="Ngôn ngữ (Vd: EN, CN, JP)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newProgram.language} onChange={e=>setNewProgram({...newProgram, language: e.target.value})} />
                    <button onClick={handleCreateProgram} disabled={!newProgram.title} className="w-full bg-indigo-600 text-white font-bold py-3 justify-center text-center rounded-lg hover:bg-indigo-700 disabled:opacity-50">Lưu Chương Trình</button>
                  </div>
                </div>
              </div>

              {/* Levels Builder */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Cây Cấp Độ (Levels)</h3>
                
                <div className="space-y-4 mb-8">
                   {metadata.levels.map((l: any) => (
                      <div key={l.id} className="p-4 border border-rose-100 bg-rose-50/50 rounded-xl flex justify-between items-center hover:bg-rose-50 transition group">
                         <div>
                            <strong className="text-rose-900 block text-lg leading-none">{l.name}</strong> 
                            <span className="text-xs text-rose-500 uppercase font-black tracking-widest">{l.framework?.name}</span>
                         </div>
                         <div className="flex flex-col items-end space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 rounded-full border border-gray-200 shadow-inner">IDX: {l.order}</span>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                               <button onClick={() => handleEditLevel(l)} className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Sửa</button>
                               <button onClick={() => handleDeleteLevel(l.id)} className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100">Xóa</button>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-700 text-sm uppercase tracking-widest mb-4">Thêm Cấp Độ (Level)</h4>
                  <div className="space-y-4">
                    <input type="text" placeholder="Tên cấp độ (Vd: N5, HSK 3)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" value={newLevel.name} onChange={e=>setNewLevel({...newLevel, name: e.target.value})} />
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" value={newLevel.framework_id} onChange={e=>setNewLevel({...newLevel, framework_id: e.target.value})}>
                      <option value="">Chọn Chuẩn Kỹ Năng (Framework)</option>
                      {metadata.frameworks?.map((f:any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <button onClick={handleCreateLevel} disabled={!newLevel.name} className="w-full bg-rose-600 text-white font-bold py-3 justify-center text-center rounded-lg hover:bg-rose-700 disabled:opacity-50">Lưu Nấc Cấp Độ</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WEBSITE SETTINGS TAB */}
        {activeTab === 'website' && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Cấu hình Trang chủ (Website Config)</h2>
            <p className="text-gray-500 mb-8 border-b pb-8">Ghi đè nội dung hiển thị trên Landing Page public bên ngoài. Thay đổi Tên nền tảng, Đơn vị chủ quản, và Link liên kết.</p>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-4xl">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tên Nền Tảng (Platform Name)</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900" value={siteSettings.platform_name} onChange={e => setSiteSettings({...siteSettings, platform_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tagline (Slogan)</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" value={siteSettings.tagline} onChange={e => setSiteSettings({...siteSettings, tagline: e.target.value})} />
                  </div>
               </div>

               <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả Nền tảng</label>
                  <textarea rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 leading-relaxed" value={siteSettings.description} onChange={e => setSiteSettings({...siteSettings, description: e.target.value})}></textarea>
               </div>

               <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-widest text-sm">Thông tin Đơn vị chủ quản</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Tên Đơn vị / Công ty</label>
                       <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={siteSettings.company_name} onChange={e => setSiteSettings({...siteSettings, company_name: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Website liên kết (Company URL)</label>
                       <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={siteSettings.company_url} onChange={e => setSiteSettings({...siteSettings, company_url: e.target.value})} />
                     </div>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả Đơn vị chủ quản</label>
                      <textarea rows={3} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={siteSettings.company_description} onChange={e => setSiteSettings({...siteSettings, company_description: e.target.value})}></textarea>
                  </div>
               </div>

               <button onClick={handleSaveSettings} className="w-full bg-emerald-600 text-white font-bold py-4 text-lg rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 flex justify-center items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  Lưu thay đổi Cấu hình
               </button>
            </div>
          </div>
        )}

      </main>

      {/* MODAL CREATE USER */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white w-[500px] p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-indigo-100">
            <button onClick={() => setShowCreateUserModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 font-black text-xl leading-none transition">✕</button>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">👤</div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">Tạo Người Dùng Mới</h2>
            <p className="text-gray-500 mb-8 border-b pb-6">Thiết lập tài khoản tự động phân luồng hồ sơ (Student/Teacher).</p>
            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                 <input type="text" placeholder="Tên đầy đủ (Vd: Nguyễn Văn A)" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Email hệ thống</label>
                 <input type="email" placeholder="email@congty.com" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu khởi tạo</label>
                 <input type="password" placeholder="••••••••" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò cấp phát</label>
                 <select className="w-full px-5 py-3 bg-indigo-50 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-indigo-800 font-bold outline-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="STUDENT">Học viên (STUDENT)</option>
                    <option value="TEACHER">Giáo viên (TEACHER)</option>
                    <option value="ACADEMIC_MANAGER">Quản lý Học vụ (ACADEMIC_MANAGER)</option>
                    <option value="CENTER_MANAGER">Quản lý Trung tâm (CENTER_MANAGER)</option>
                    <option value="SUPER_ADMIN">Quản trị Cao cấp (SUPER_ADMIN)</option>
                 </select>
              </div>

              {newUser.role === 'STUDENT' && (
                 <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <label className="block text-sm font-bold text-emerald-800 mb-3">Ghi danh Khóa học (Trực tiếp mở khóa trên Portal)</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                       {courses.map(c => (
                          <label key={c.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-emerald-100 rounded transition">
                             <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" 
                               checked={newUser.course_ids.includes(c.id)}
                               onChange={(e) => {
                                  const cids = e.target.checked 
                                     ? [...newUser.course_ids, c.id] 
                                     : newUser.course_ids.filter(id => id !== c.id);
                                  setNewUser({...newUser, course_ids: cids });
                               }}
                             />
                             <span className="font-semibold text-gray-700">{c.title} <span className="text-xs text-gray-400 font-normal">({c.level?.code || 'No Level'})</span></span>
                          </label>
                       ))}
                       {courses.length === 0 && <span className="text-xs text-gray-500">Hệ thống chưa có khóa học nào. Vui lòng tạo phía trên.</span>}
                    </div>
                 </div>
              )}

              <button onClick={handleCreateUser} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-lg mt-4">💾 LƯU NGƯỜI DÙNG</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white w-[500px] p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-200">
            <button onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 font-black text-xl leading-none transition">✕</button>
            <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">⚙️</div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">Sửa: {editingUser.name}</h2>
            <p className="text-gray-500 mb-8 border-b pb-6">Đổi thông tin lõi và quyền hạn truy cập của User này.</p>
            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tên hiển thị</label>
                 <input type="text" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tài khoản Email</label>
                 <input type="email" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Đổi Mật Khẩu <span className="text-xs text-gray-400 font-normal">(bỏ trống nếu giữ nguyên)</span></label>
                 <input type="password" placeholder="Nhập để đặt Password mới..." className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none placeholder-gray-400" value={editingUser.new_password} onChange={e => setEditingUser({...editingUser, new_password: e.target.value})} />
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Cấp quyền Hệ thống (Role)</label>
                 <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 text-slate-800 font-bold outline-none cursor-pointer" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                    <option value="STUDENT">Học viên (STUDENT)</option>
                    <option value="TEACHER">Giáo viên (TEACHER)</option>
                    <option value="ACADEMIC_MANAGER">Quản lý Học vụ (ACADEMIC_MANAGER)</option>
                    <option value="CENTER_MANAGER">Quản lý Trung tâm (CENTER_MANAGER)</option>
                    <option value="SUPER_ADMIN">Quản trị Cao cấp (SUPER_ADMIN)</option>
                 </select>
              </div>

              {editingUser.role === 'STUDENT' && (
                 <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <label className="block text-sm font-bold text-emerald-800 mb-3">Ghi danh Khóa học (Đồng bộ với Portal Học viên)</label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                       {courses.map(c => (
                          <label key={c.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-emerald-100 rounded transition">
                             <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" 
                               checked={editingUser.course_ids?.includes(c.id) || false}
                               onChange={(e) => {
                                  const baseIds = editingUser.course_ids || [];
                                  const cids = e.target.checked 
                                     ? [...baseIds, c.id] 
                                     : baseIds.filter((id: string) => id !== c.id);
                                  setEditingUser({...editingUser, course_ids: cids });
                               }}
                             />
                             <span className="font-semibold text-gray-700">{c.title} <span className="text-xs text-gray-400 font-normal">({c.level?.code || 'No Level'})</span></span>
                          </label>
                       ))}
                       {courses.length === 0 && <span className="text-xs text-gray-500">Chưa có khóa học nào được lập trình.</span>}
                    </div>
                 </div>
              )}

              <button onClick={handleUpdateUser} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition shadow-lg mt-4">💾 ÁP DỤNG THAY ĐỔI</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BROADCAST */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white w-[500px] p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowBroadcastModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black font-black text-xl leading-none transition">✕</button>
            
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">📣</div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">Phát Thông Báo Mạng Lưới</h2>
            <p className="text-gray-500 mb-8 border-b pb-6">Lời nhắn sẽ được đẩy trực tiếp tới màn hình của toàn bộ Student và Teacher ngay lúc này.</p>
            
            <div className="space-y-5">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề (Header)</label>
                 <input type="text" placeholder="Vd: Bảo trì server tối nay..." 
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
                   value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} />
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung (Message Detail)</label>
                 <textarea placeholder="Cả hệ thống chú ý..." 
                   className="w-full h-32 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none" 
                   value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)}></textarea>
              </div>

              <button 
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition duration-200 text-lg mt-4 disabled:opacity-50"
                onClick={handleBroadcast}
                disabled={!broadcastTitle || !broadcastMessage}
              >📡 BẮN WEBSOCKET BROADCAST</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREATE COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white w-[600px] p-8 rounded-3xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-emerald-100">
            <button onClick={() => setShowCourseModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-rose-500 font-black text-xl leading-none transition">✕</button>
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">📚</div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">Tạo Khóa Học Mới</h2>
            <p className="text-gray-500 mb-8 border-b pb-6">Thiết lập lộ trình mới vào Database hệ thống.</p>
            
            <div className="space-y-5">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tên Khóa Học <span className="text-red-500">*</span></label>
                 <input type="text" placeholder="Vd: Ngữ pháp HSK 2 Cơ bản..." 
                   className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition" 
                   value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Chương Trình <span className="text-red-500">*</span></label>
                   <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     value={newCourse.program_id} onChange={e => setNewCourse({...newCourse, program_id: e.target.value})}>
                     <option value="">Chọn Program...</option>
                     {metadata.programs.map(p => <option key={p.id} value={p.id}>{p.title} ({p.language})</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Cấp Độ <span className="text-red-500">*</span></label>
                   <select className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     value={newCourse.level_id} onChange={e => setNewCourse({...newCourse, level_id: e.target.value})}>
                     <option value="">Chọn Level...</option>
                     {metadata.levels.map(l => <option key={l.id} value={l.id}>{l.framework?.name} - {l.name}</option>)}
                   </select>
                </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả (Tùy chọn)</label>
                 <textarea placeholder="Mô tả sương sương về khóa học..." 
                   className="w-full h-24 px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none" 
                   value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})}></textarea>
              </div>

              <button 
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-1 transition duration-200 text-lg mt-4 disabled:opacity-50"
                onClick={handleCreateCourse}
                disabled={!newCourse.title || !newCourse.program_id || !newCourse.level_id}
              >✨ THÊM VÀO DATABASE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
