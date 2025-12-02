import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Settings } from 'lucide-react';

export default function Admin() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && !profile.is_admin) {
        navigate('/');
        return;
    }
    fetchWithdrawals();
  }, [profile]);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
        .from('withdrawals')
        .select('*, profiles(email, display_name)')
        .order('created_at', { ascending: false });
    setWithdrawals(data || []);
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    // action: 'approved' or 'rejected'
    try {
        if (action === 'rejected') {
            // Refund balance
            const withdrawal = withdrawals.find(w => w.id === id);
            await supabase.rpc('process_game_win', { 
                p_user_id: withdrawal.user_id, 
                p_amount: withdrawal.amount,
                p_level: 0, // dummy
                p_is_final: false
            });
        }

        await supabase
            .from('withdrawals')
            .update({ status: action })
            .eq('id', id);
            
        toast.success(`تم ${action === 'approved' ? 'الموافقة على' : 'رفض'} الطلب`);
        fetchWithdrawals();
    } catch (err) {
        toast.error('حدث خطأ');
    }
  };

  if (!profile?.is_admin) return null;

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">طلبات السحب المعلقة</h3>
        </div>
        
        <div className="divide-y divide-gray-100">
            {loading ? (
                <div className="p-4 text-center">جاري التحميل...</div>
            ) : withdrawals.filter(w => w.status === 'pending').length === 0 ? (
                <div className="p-4 text-center text-gray-400">لا توجد طلبات معلقة</div>
            ) : (
                withdrawals.filter(w => w.status === 'pending').map(w => (
                    <div key={w.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="font-bold text-gray-900">{w.profiles?.display_name}</p>
                                <p className="text-xs text-gray-500">{w.profiles?.email}</p>
                            </div>
                            <span className="font-mono font-bold text-indigo-600">{w.amount} $</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all mb-3 text-gray-600">
                            {w.wallet_address}
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleAction(w.id, 'approved')}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-1"
                            >
                                <CheckCircle size={16} /> موافقة
                            </button>
                            <button 
                                onClick={() => handleAction(w.id, 'rejected')}
                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-200 flex items-center justify-center gap-1"
                            >
                                <XCircle size={16} /> رفض
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-50 pointer-events-none">
        <div className="flex items-center gap-2 mb-4">
            <Settings size={20} />
            <h3 className="font-bold">إعدادات اللعبة (قريباً)</h3>
        </div>
        <p className="text-sm text-gray-500">تعديل أسعار VIP ونسب الأرباح سيكون متاحاً هنا.</p>
      </div>
    </div>
  );
}
