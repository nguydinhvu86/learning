'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationBell from '../../components/NotificationBell';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('polyglot_token');
    router.push('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    
    fetch(`/api/v1/classes/my-classes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        console.error('Expected array of classes, got:', data);
        setClasses([]);
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      setClasses([]);
    });
    
    setStats({
      total_students: 37,
      pending_submissions: 8,
      at_risk_students: 2
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow relative z-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Teacher Studio</h1>
          <div className="flex items-center space-x-6">
            <NotificationBell />
            <button onClick={handleLogout} className="text-sm font-semibold text-emerald-600 hover:text-emerald-500">Sign out</button>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Statistics Widgets */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
            <h3 className="text-gray-500 text-sm font-semibold">Total Active Students</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_students}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-amber-500">
            <h3 className="text-gray-500 text-sm font-semibold">Pending Submissions</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats?.pending_submissions} <span className="text-sm font-normal text-gray-500">requires manual grading</span></p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-semibold">At-Risk Students</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats?.at_risk_students} <span className="text-sm font-normal text-gray-500">inactive {">"} 7 days</span></p>
          </div>
        </section>

        {/* Classes Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Classes</h2>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow transition">
              + Target Assignment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
                      <p className="text-sm font-medium text-indigo-600">{c.course_title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6 py-3 border-y border-gray-100">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {c.student_count} Học viên
                    </span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link href={`/teacher/classes/${c.id}`} className="flex-1 text-center bg-gray-100 text-gray-700 font-semibold py-2 rounded border border-gray-200 hover:bg-gray-200 transition">
                      Manage Roster
                    </Link>
                    <Link href={`/teacher/classes/${c.id}/gradebook`} className="flex-1 text-center bg-indigo-50 text-indigo-700 font-semibold py-2 rounded border border-indigo-100 hover:bg-indigo-100 transition">
                      Gradebook
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
