'use client';
import { useState, useEffect } from 'react';

export default function SubmissionReviewPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Scaffold UI Mock
    setSubmissions([
      {
        id: 'sub-1',
        student_name: 'Nguyen Van Hoc',
        assignment_title: 'Bài tập nói: Xin chào (Audio)',
        content_url: '#mock-audio.mp3', // Representing S3 key or Base64
        type: 'AUDIO',
        status: 'pending'
      },
      {
        id: 'sub-2',
        student_name: 'Tran Thi Tham',
        assignment_title: 'Viết thư ngỏ (Text)',
        content: 'Chào sư phụ, con học rất chăm chỉ ạ.',
        type: 'TEXT',
        status: 'pending'
      }
    ]);
  }, []);

  const submitReview = (id: string, score: number, feedback: string) => {
    alert(`Đã hoàn tất chấm bài (Submission ID: ${id})\nĐiểm: ${score}\nFeedback: ${feedback}`);
    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Pending Reviews</h1>

      {submissions.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-md text-center text-gray-500 font-semibold border-dashed border-2 border-gray-300">
          Chưa có bài tập nào cần dọn dẹp. Hãy nghỉ ngơi đi giáo viên! 🍵
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-6 rounded-xl shadow border-l-4 border-amber-500 flex flex-col md:flex-row gap-6">
              
              {/* Submission Target Context */}
              <div className="flex-1">
                <div className="text-xs font-bold tracking-wider text-amber-500 mb-1">CẦN CHẤM ĐIỂM</div>
                <h3 className="text-xl font-bold mb-1">{sub.student_name}</h3>
                <p className="text-sm font-semibold text-gray-500 mb-4">{sub.assignment_title}</p>
                
                <div className="bg-gray-100 p-4 rounded text-gray-800 italic">
                  {sub.type === 'AUDIO' ? (
                    <div>🎵 <a>[Đính kèm Audio Track Playback]</a></div>
                  ) : (
                    <p>"{sub.content}"</p>
                  )}
                </div>
              </div>

              {/* Grading Actions Form */}
              <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitReview(sub.id, parseInt(e.currentTarget.score.value), e.currentTarget.feedback.value);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-semibold mb-1">Score (0-100)</label>
                    <input name="score" type="number" min="0" max="100" required className="w-24 px-3 py-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Feedback</label>
                    <textarea name="feedback" rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded focus:border-indigo-500 focus:outline-none" placeholder="Nhận xét tuyệt vời..."></textarea>
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-indigo-500 transition">
                    Submit Grade
                  </button>
                </form>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
