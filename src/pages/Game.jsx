import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Clock, PlayCircle, AlertTriangle, Zap } from 'lucide-react';

// Config for levels
const LEVEL_CONFIG = {
  1: { cubes: 4, grid: 2 },
  2: { cubes: 6, grid: 3 }, 
  3: { cubes: 8, grid: 3 },
  4: { cubes: 10, grid: 4 }, 
  5: { cubes: 12, grid: 4 },
  6: { cubes: 14, grid: 4 },
  7: { cubes: 16, grid: 4 },
  8: { cubes: 18, grid: 5 },
  9: { cubes: 20, grid: 5 },
  10: { cubes: 22, grid: 5 },
  11: { cubes: 23, grid: 5 },
  12: { cubes: 24, grid: 5 } 
};

// Helper to generate colors (Enhanced for Dark Mode)
const generateColors = (level, isDark) => {
  const hue = Math.floor(Math.random() * 360);
  
  // Dark mode: Less brightness, more saturation for "neon" feel
  // Light mode: Pastel colors
  const saturation = isDark ? 70 + Math.random() * 20 : 70 + Math.random() * 20;
  const lightness = isDark ? 45 + Math.random() * 10 : 60 + Math.random() * 10;
  
  const baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
  // Difficulty factor
  const diff = Math.max(3, 25 - (level * 1.8)); 
  const diffLightness = lightness + (Math.random() > 0.5 ? diff : -diff);
  
  const targetColor = `hsl(${hue}, ${saturation}%, ${diffLightness}%)`;
  
  return { baseColor, targetColor };
};

export default function Game() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [level, setLevel] = useState(1);
  const [colors, setColors] = useState({ baseColor: '#ccc', targetColor: '#ccc' });
  const [targetIndex, setTargetIndex] = useState(0);
  const [gameState, setGameState] = useState('playing'); 
  const [waitTime, setWaitTime] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Detect Dark Mode for color generation
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (location.state?.adWatched) {
        setWaitTime(0);
        setGameState('playing');
        setLevel(12);
        toast.success('تم مشاهدة الإعلان بنجاح! حظاً موفقاً.');
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    startLevel(level);
  }, [level]);

  useEffect(() => {
    let interval;
    if (gameState === 'waiting' && waitTime > 0) {
      interval = setInterval(() => {
        setWaitTime((prev) => prev - 1);
      }, 1000);
    } else if (waitTime === 0 && gameState === 'waiting') {
      setGameState('playing');
      setLevel(12);
    }
    return () => clearInterval(interval);
  }, [gameState, waitTime]);

  const startLevel = (lvl) => {
    const config = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[1];
    const { baseColor, targetColor } = generateColors(lvl, isDark);
    setColors({ baseColor, targetColor });
    setTargetIndex(Math.floor(Math.random() * config.cubes));
  };

  const handleCubeClick = async (index) => {
    if (processing || gameState !== 'playing') return;
    
    if (index === targetIndex) {
      if (level < 12) {
        await processReward(level, false);
        setLevel(prev => prev + 1);
      } else {
        await processReward(level, true);
        toast.success('مبروك! لقد أكملت جميع المستويات!', { 
            duration: 4000,
            icon: '🏆',
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        setLevel(1);
      }
    } else {
      handleLoss();
    }
  };

  const processReward = async (currentLevel, isFinal) => {
    setProcessing(true);
    try {
      // Determine amount locally as fallback, but DB is authority
      let amount = 0.000025;
      if (isFinal) amount = 0.025;

      // Call Secure RPC
      const { data, error } = await supabase.rpc('process_game_win', {
        p_user_id: user.id,
        p_amount: amount,
        p_level: currentLevel,
        p_is_final: isFinal
      });

      if (error) throw error;
      
      // Show reward toast
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-white dark:bg-slate-800 border border-green-100 dark:border-green-900 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 pointer-events-auto`}>
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-xl">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">ربح جديد!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">+{amount} $</p>
          </div>
        </div>
      ), { duration: 1500 });

      refreshProfile(); 
      
    } catch (err) {
      console.error("Reward Error:", err);
      // Even if error, we let user continue playing but show warning
      toast.error('تم تخطي المستوى (لم يتم حفظ الربح لضعف الاتصال)', { 
          id: 'error-toast',
          style: { fontSize: '12px' }
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleLoss = () => {
    if (level === 12) {
      setGameState('waiting');
      setWaitTime(300); 
    } else {
      toast.error('خطأ! العودة للمستوى 1', { icon: '❌' });
      setLevel(1);
    }
  };

  const config = LEVEL_CONFIG[level];
  const cols = Math.ceil(Math.sqrt(config.cubes));
  
  if (gameState === 'waiting') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 glass-card rounded-[2rem]">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-red-500/10">
            <Clock size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">انتظر قليلاً!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">لقد خسرت في المستوى الأخير. يجب عليك الانتظار للمحاولة مرة أخرى.</p>
        
        <div className="text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-10 tracking-wider bg-gray-50 dark:bg-slate-900 px-8 py-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-inner">
            {Math.floor(waitTime / 60)}:{(waitTime % 60).toString().padStart(2, '0')}
        </div>

        <button 
            onClick={() => navigate('/ads')}
            className="w-full max-w-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
        >
            <PlayCircle size={24} />
            <span>مشاهدة إعلان لتخطي الانتظار</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-8 px-2">
        <div className="flex flex-col">
             <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">المستوى</span>
             <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 flex items-baseline gap-1">
                {level} <span className="text-gray-300 dark:text-slate-600 text-lg font-normal">/ 12</span>
             </span>
        </div>
        <div className="glass-card px-5 py-3 rounded-2xl flex flex-col items-end">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-bold mb-1">الرصيد الحالي</span>
            <span className="font-bold text-gray-800 dark:text-white text-lg font-mono tracking-tight">{Number(profile?.balance || 0).toFixed(5)} $</span>
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className="grid gap-3 w-full max-w-[350px] aspect-square glass-card p-4 rounded-[2rem] transition-colors duration-300"
        style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` 
        }}
      >
        {Array.from({ length: config.cubes }).map((_, i) => (
            <motion.button
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCubeClick(i)}
                className="w-full aspect-square rounded-xl shadow-sm transition-all hover:shadow-md relative overflow-hidden border-2 border-transparent hover:border-white/20"
                style={{ 
                    backgroundColor: i === targetIndex ? colors.targetColor : colors.baseColor 
                }}
            >
                {/* Glossy effect for "Surface" feel */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            </motion.button>
        ))}
      </div>

      <p className="mt-10 text-gray-400 dark:text-slate-500 text-sm text-center flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-5 py-2.5 rounded-full border border-gray-100 dark:border-slate-700 backdrop-blur-sm">
        <AlertTriangle size={16} />
        اختر المكعب ذو اللون المختلف
      </p>
    </div>
  );
}
