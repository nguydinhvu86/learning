'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Xin hãy nhập địa chỉ email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Đăng nhập thất bại.');
      
      const payload = await res.json();
      localStorage.setItem('polyglot_token', payload.access_token);
      
      if (payload.role === 'SUPER_ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (payload.role === 'TEACHER') {
        window.location.href = '/teacher/dashboard';
      } else {
        window.location.href = '/student/dashboard';
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white text-center">Polyglot LMS</h1>
        <p className="mb-8 text-sm text-gray-400 text-center">Đăng nhập không gian học tập</p>
        
        {errorMsg && <div className="mb-4 rounded bg-red-500/20 p-3 text-red-400 text-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Email</label>
            <input 
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="student@polyglot.edu"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Mật khẩu</label>
            <input 
              {...register('password')}
              type="password"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
