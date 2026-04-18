'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Xin hãy nhập địa chỉ email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function LandingPortal() {
  const [settings, setSettings] = useState({
     platform_name: 'Polyglot Hub',
     tagline: 'E-Learning Ecosystem',
     description: 'Nền tảng Học thuật chuyên nghiệp tích hợp ngôn ngữ học và Spaced Repetition System.',
     company_name: 'TSOL',
     company_description: 'TSOL là đơn vị chủ quản quản lý hạ tầng học thuật.',
     company_url: 'https://thegioigiaiphap.vn'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
     fetch(`/api/v1/public/settings`)
       .then(res => res.json())
       .then(data => {
          if (data && data.platform_name) setSettings(data);
       })
       .catch(err => console.error(err));
  }, []);

  const onSubmit = async (data: LoginSchemaType) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      
      const payload = await res.json();
      localStorage.setItem('polyglot_token', payload.access_token);
      
      if (payload.role === 'SUPER_ADMIN' || payload.role === 'ADMIN') {
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
    <div className="relative min-h-screen bg-[#050B14] overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* High-Tech Background Grids & Ornaments */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none"></div>
      
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none duration-[10000ms]"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none duration-[8000ms]"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-teal-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none duration-[12000ms]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10 lg:flex-row lg:justify-between lg:px-24">
        
        {/* Left Side: Brand Identity */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-12 lg:mb-0">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform duration-300 cursor-default">
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
          
          <p className="max-w-xl mt-4 text-xl text-slate-400 mb-12 font-light leading-relaxed">
            {settings.description}
          </p>

          <a href={settings.company_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-3 px-6 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-emerald-500/50 text-white font-medium transition-all shadow-lg backdrop-blur-xl group cursor-pointer">
             <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[10px] group-hover:scale-110 transition-transform shadow-inner">
               {settings.company_name.substring(0, 4)}
             </div>
             <span>Khám phá sinh thái {settings.company_name}</span>
             <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>

        {/* Right Side: Professional Login Portal */}
        <div className="w-full max-w-md lg:w-5/12">
          <div className="relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700/50 p-8 sm:p-10 backdrop-blur-2xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full filter blur-[60px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full filter blur-[50px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-3xl font-bold text-white tracking-tight">Đăng Nhập</h3>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>
                <p className="text-slate-400 mb-8 text-sm">Truy cập không gian học thuật cá nhân hóa.</p>

                {errorMsg && (
                  <div className="mb-6 flex items-start space-x-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 transition-all">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium text-red-400 leading-snug">{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Tài khoản Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input 
                        {...register('email')}
                        type="email"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                        placeholder="your.email@tsol.vn"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-400 ml-1 font-medium">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between ml-1">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Mật khẩu</label>
                       <a href="#" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Quên mật khẩu?</a>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <input 
                        {...register('password')}
                        type="password"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:bg-slate-800 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-400 ml-1 font-medium">{errors.password.message}</p>}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full mt-2 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed group/btn"
                  >
                    {isSubmitting ? (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <span>Truy cập hệ thống</span>
                        <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer Version Notice */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-40 z-20 pointer-events-none">
         <p className="text-slate-500 text-[10px] font-mono tracking-[0.2em] uppercase">Polyglot LMS System v2.0 - Secure Module</p>
      </div>
    </div>
  );
}
