import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Copy, Users, Share2, TrendingUp, Loader2, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Referrals() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ count: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  
  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code || '...'}`;

  useEffect(() => {
    if (user) fetchReferralStats();
  }, [user]);

  const fetchReferralStats = async () => {
    try {
        const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', user.id);

        const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('type', 'referral_bonus');

        const totalEarnings = txData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

        setStats({
            count: count || 0,
            earnings: totalEarnings
        });

    } catch (error) {
        console.error('Error fetching referral stats:', error);
    } finally {
        setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('تم نسخ الرابط!');
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'لعبة المكعب المختلف',
          text: 'اشترك في هذه اللعبة الممتعة واكسب المال! استخدم كود الدعوة الخاص بي.',
          url: referralLink,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-center text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        
        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <Gift size={32} className="text-yellow-300" />
        </div>
        
        <h2 className="text-3xl font-bold mb-3">برنامج الشركاء</h2>
        <p className="text-indigo-100 mb-8 text-sm leading-relaxed max-w-xs mx-auto opacity-90">
          ادعُ أصدقاءك واحصل على <span className="font-bold text-yellow-300 bg-white/10 px-1 rounded">10%</span> من أرباحهم مدى الحياة.
        </p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-white/20 max-w-sm mx-auto shadow-lg">
            <div className="flex-1 text-left truncate font-mono text-xs text-indigo-50 px-3">
                {referralLink}
            </div>
            <div className="flex gap-1">
                <button onClick={copyLink} className="bg-white text-indigo-600 p-2.5 rounded-lg hover:bg-indigo-50 transition-colors" title="نسخ">
                    <Copy size={18} />
                </button>
                <button onClick={shareLink} className="bg-indigo-500/50 text-white p-2.5 rounded-lg hover:bg-indigo-500 transition-colors" title="مشاركة">
                    <Share2 size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
            إحصائياتك
        </h3>
        
        {loading ? (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-indigo-600" />
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">الأصدقاء المدعوين</p>
                    <p className="text-3xl font-black text-indigo-900 dark:text-indigo-300">{stats.count}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl text-center border border-green-100 dark:border-green-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">أرباح الإحالة</p>
                    <p className="text-3xl font-black text-green-600 dark:text-green-400">{stats.earnings.toFixed(5)} $</p>
                </div>
            </div>
        )}
        
        <div className="mt-6 bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border border-gray-100 dark:border-slate-700">
            <p className="font-bold mb-2 text-gray-700 dark:text-gray-300 text-sm">كيف يعمل؟</p>
            <ul className="list-disc list-inside space-y-2">
                <li>شارك الرابط أعلاه مع أصدقائك.</li>
                <li>عندما يسجل صديقك ويبدأ اللعب، نربط حسابه بك.</li>
                <li>في كل مرة ينهي صديقك مستوى ويربح، نضيف لك 10% من قيمة ربحه تلقائياً.</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
