'use client';
import Link from 'next/link';

export default function Gradebook({ params }: { params: { classId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 flex items-center space-x-4">
          <Link href="/teacher/dashboard" className="text-gray-500 hover:text-indigo-600 transition p-2 rounded-full hover:bg-gray-100">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sổ Điểm (Gradebook)</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Module Đang Cập Nhật</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Hệ thống chấm bài và tính điểm tự động đang được xây dựng. Phiên bản tới sẽ hỗ trợ giáo viên gửi Review Feedback trực tiếp kèm điểm số qua Socket.IO.
          </p>
          <Link href={`/teacher/classes/${params.classId}`} className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500 transition shadow">
            Quay lại Quản lý Lớp
          </Link>
        </div>
      </main>
    </div>
  );
}
