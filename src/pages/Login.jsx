import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('أهلاً بك من جديد!');
      navigate('/');
    } catch (error) {
      toast.error('فشل تسجيل الدخول: تأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 font-sans transition-colors" dir="rtl">
      
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-500/30 mx-auto mb-6 transform rotate-3">
             C
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">تسجيل الدخول</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">تابع تقدمك وأرباحك في أي وقت</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none w-full max-w-md border border-gray-100 dark:border-slate-700 relative overflow-hidden">
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                <Mail size={14} />
                البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-left placeholder-gray-400 dark:text-white"
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <Lock size={14} />
                    كلمة المرور
                </label>
             </div>
            <input
              type="password"
              required
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-left placeholder-gray-400 dark:text-white"
              dir="ltr"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-6 shadow-lg shadow-gray-200 dark:shadow-none"
          >
            {loading ? 'جاري التحميل...' : (
                <>
                    <span>دخول</span>
                    <LogIn size={20} />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">ليس لديك حساب؟</p>
          <Link to="/register" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors">
            أنشئ حساباً جديداً
          </Link>
        </div>
      </div>
    </div>
  );
}
