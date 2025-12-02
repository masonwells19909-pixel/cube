import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Trophy, Star, TrendingUp, Tv, ChevronLeft } from 'lucide-react';

export default function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-white/20 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/40 rounded-full -ml-10 -mb-10 blur-2xl" />
        
        <div className="relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold mb-1">مرحباً، {profile?.display_name} 👋</h2>
                    <p className="text-indigo-100 text-sm opacity-90">استمر في التقدم، أنت تبلي بلاءً حسناً!</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-white/10 shadow-lg">
                    <Star size={14} className="text-yellow-300 fill-yellow-300" />
                    VIP {profile?.vip_level || 0}
                </div>
            </div>
            
            <div className="mt-8">
                <p className="text-xs text-indigo-200 font-medium mb-1 uppercase tracking-wide">الرصيد الحالي</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-5xl font-black tracking-tight">{Number(profile?.balance || 0).toFixed(5)}</h3>
                    <span className="text-xl opacity-80 font-medium">$</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Action */}
      <Link to="/game" className="group block relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-800 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-1 transition-all hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Play size={32} fill="currentColor" className="ml-1" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">ابدأ اللعب</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">حل الألغاز واكسب المال</p>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded-full text-gray-400 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <ChevronLeft size={24} />
            </div>
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4">
                <Trophy size={24} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">الألغاز المحلولة</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{profile?.total_solved || 0}</p>
        </div>
        
        <Link to="/referrals" className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 block transition-all hover:border-green-200 dark:hover:border-green-900 group">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">نظام الإحالة</p>
            <div className="flex items-baseline gap-1 mt-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">10%</p>
                <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/50 px-2 py-0.5 rounded-full">عمولة</span>
            </div>
        </Link>
      </div>

      {/* VIP Progress Info */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">حالة VIP</h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                المستوى {profile?.vip_level || 0}
            </span>
        </div>
        
        <div className="space-y-4">
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/30" 
                    style={{ width: `${Math.min(((profile?.total_solved || 0) / 1500) * 100, 100)}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>0</span>
                <span>1500 (VIP 1)</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl">
                حل المزيد من الألغاز لزيادة أرباحك لكل مستوى!
            </p>
        </div>
      </div>

      {/* Admin/Test Options */}
      {profile?.is_admin && (
        <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 border-dashed">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">أدوات المشرف</p>
            <button 
                onClick={() => navigate('/ads')}
                className="w-full bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl text-sm font-bold border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors"
            >
                <Tv size={16} />
                تجربة صفحة الإعلانات
            </button>
        </div>
      )}
    </div>
  );
}
