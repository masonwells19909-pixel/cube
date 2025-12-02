import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, Gift } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const referralCode = searchParams.get('ref');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (password.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        setLoading(false);
        return;
    }

    try {
      await signUp(email, password, fullName, referralCode);
      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/'); 
    } catch (error) {
      console.error("Signup Error:", error);
      let msg = error.message;
      if (msg.includes('Database error')) msg = 'حدث خطأ في النظام، يرجى المحاولة لاحقاً';
      if (msg.includes('User already registered')) msg = 'البريد الإلكتروني مسجل بالفعل';
      toast.error(msg);
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
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">انضم إلينا</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">أنشئ حسابك وابدأ رحلة الربح</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-indigo-100/50 dark:shadow-none w-full max-w-md border border-gray-100 dark:border-slate-700 relative overflow-hidden">
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                <User size={14} />
                الاسم الكامل
            </label>
            <input
              type="text"
              required
              placeholder="مثال: محمد أحمد"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-right placeholder-gray-400 dark:text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                <Mail size={14} />
                البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-left placeholder-gray-400 dark:text-white"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                <Lock size={14} />
                كلمة المرور
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-left placeholder-gray-400 dark:text-white"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {referralCode && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Gift size={20} />
              </div>
              <div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">دعوة خاصة من</p>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{referralCode}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    <span>إنشاء الحساب</span>
                    <ArrowRight size={20} />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">لديك حساب بالفعل؟</p>
          <Link to="/login" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors">
            سجل الدخول الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
