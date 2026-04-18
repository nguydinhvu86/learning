'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ClassRoster({ params }: { params: { classId: string } }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('polyglot_token');
    
    fetch(`/api/v1/classes/${params.classId}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      setLoading(false);
    });
  }, [params.classId]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải danh sách học viên...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/teacher/dashboard" className="text-gray-500 hover:text-indigo-600 transition p-2 rounded-full hover:bg-gray-100">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý Lớp & Học viên</h1>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-500 shadow">
            + Thêm Học Viên Lệch
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm tracking-wider uppercase">
                <th className="px-6 py-4 font-semibold">Học Viên</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Tiến độ chung</th>
                <th className="px-6 py-4 font-semibold">Tình trạng</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Lớp học chưa có học viên nào.</td></tr>
              ) : students.map(student => {
                 const isAtRisk = student.progress < 30; // random logic applied to mock

                 return (
                   <tr key={student.id} className="hover:bg-gray-50 transition group">
                     <td className="px-6 py-4 flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase">
                         {student.name.charAt(0)}
                       </div>
                       <div className="font-semibold text-gray-900">{student.name}</div>
                     </td>
                     <td className="px-6 py-4 text-gray-500">{student.email}</td>
                     <td className="px-6 py-4">
                       <div className="flex items-center space-x-3">
                         <div className="w-full bg-gray-200 rounded-full h-2 flex-1 min-w-[100px]">
                            <div className={`h-2 rounded-full ${isAtRisk ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${student.progress}%` }}></div>
                         </div>
                         <span className="text-sm font-semibold text-gray-700">{student.progress}%</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${isAtRisk ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isAtRisk ? 'At Risk' : 'Active'}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition">
                       <button className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded">View Profile</button>
                       <button className="text-red-600 font-semibold text-sm hover:text-red-800 bg-red-50 px-3 py-1 rounded">Remove</button>
                     </td>
                   </tr>
                 )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
