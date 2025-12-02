import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Wallet, History, ArrowUpRight, Loader2 } from 'lucide-react';

export default function Earnings() {
  const { user, profile, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('withdraw'); 
  
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount < 0.25) {
        toast.error('الحد الأدنى للسحب هو 0.25$');
        setSubmitting(false);
        return;
    }

    if (withdrawAmount > (profile?.balance || 0)) {
        toast.error('رصيدك غير كافٍ');
        setSubmitting(false);
        return;
    }

    try {
        const { data: pending } = await supabase
            .from('withdrawals')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .single();
            
        if (pending) {
            toast.error('لديك طلب سحب قيد الانتظار بالفعل');
            setSubmitting(false);
            return;
        }

        const { error } = await supabase.rpc('request_withdrawal', {
            p_amount: withdrawAmount,
            p_wallet_address: walletAddress,
            p_method: 'USDT-Binance'
        });

        if (error) throw error;

        toast.success('تم إرسال طلب السحب بنجاح');
        setAmount('');
        setWalletAddress('');
        refreshProfile();
        fetchTransactions();

    } catch (err) {
        toast.error('حدث خطأ أثناء المعالجة');
        console.error(err);
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 text-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-medium">الرصيد الحالي القابل للسحب</p>
        <h2 className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{Number(profile?.balance || 0).toFixed(4)} <span className="text-2xl font-normal text-gray-400">$</span></h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-gray-100 dark:bg-slate-800 rounded-2xl">
        <button 
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'withdraw' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-slate-500'}`}
        >
            طلب سحب
        </button>
        <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-slate-500'}`}
        >
            سجل المعاملات
        </button>
      </div>

      {activeTab === 'withdraw' ? (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-8 text-indigo-900 dark:text-indigo-100">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Wallet size={20} />
                </div>
                <h3 className="font-bold text-lg">سحب الأرباح (USDT)</h3>
            </div>
            
            <form onSubmit={handleWithdraw} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">طريقة السحب</label>
                    <div className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-medium">
                        USDT - Binance Wallet
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">عنوان المحفظة (Wallet Address)</label>
                    <input 
                        type="text"
                        required
                        placeholder="0x..."
                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none dark:text-white transition-all"
                        value={walletAddress}
                        onChange={e => setWalletAddress(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">المبلغ (الحد الأدنى 0.25$)</label>
                    <input 
                        type="number"
                        step="0.01"
                        min="0.25"
                        required
                        placeholder="0.00"
                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none dark:text-white transition-all"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 mt-4"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>جاري المعالجة...</span>
                        </>
                    ) : (
                        <>
                            <span>إرسال الطلب</span>
                            <ArrowUpRight size={20} />
                        </>
                    )}
                </button>
            </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-gray-500">
                    <History size={20} />
                </div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200">آخر العمليات</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500">جاري التحميل...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500">لا توجد معاملات بعد</div>
                ) : (
                    transactions.map(tx => (
                        <div key={tx.id} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">
                                    {tx.type === 'game_reward' ? 'مكافأة مستوى' : 
                                     tx.type === 'referral_bonus' ? 'مكافأة إحالة' : 
                                     tx.type === 'withdrawal' ? 'سحب أرباح' : tx.type}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm')}</p>
                            </div>
                            <div className={`font-mono font-bold text-lg ${Number(tx.amount) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toFixed(5)} $
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
}
