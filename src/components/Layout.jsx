import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Gamepad2, Wallet, Users, Settings, LogOut, ShieldCheck, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/game', icon: Gamepad2, label: 'اللعب' },
    { path: '/earnings', icon: Wallet, label: 'الأرباح' },
    { path: '/referrals', icon: Users, label: 'الإحالات' },
  ];

  if (profile?.is_admin) {
    navItems.push({ path: '/admin', icon: ShieldCheck, label: 'الإدارة' });
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-300 bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white pb-24 md:pb-0 relative overflow-hidden bg-grid-pattern" dir="rtl">
      
      {/* Animated Background Blobs - Enhanced for Dark Mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Top Bar */}
      <header className="glass sticky top-0 z-20 px-4 py-3 flex justify-between items-center border-b border-gray-200/50 dark:border-slate-700/50 transition-colors">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
             C
           </div>
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-900 dark:from-white dark:to-gray-300">المكعب</h1>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {user && (
                <div className="flex items-center gap-3 pl-1">
                    <div className="hidden md:block text-sm text-right">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{profile?.display_name || 'المستخدم'}</p>
                        <div className="flex items-center justify-end gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">VIP {profile?.vip_level || 0}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto md:max-w-4xl p-4 relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) - Glassmorphism */}
      <nav className="fixed bottom-4 left-4 right-4 glass rounded-2xl border border-white/20 dark:border-slate-700/50 md:hidden z-30 shadow-2xl shadow-indigo-900/10">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative rounded-xl",
                  isActive ? "text-indigo-600 dark:text-indigo-400 -translate-y-1" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                )}
              >
                <div className={clsx("p-1.5 rounded-xl transition-colors", isActive && "bg-indigo-50 dark:bg-indigo-500/20")}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={clsx("text-[10px] mt-0.5 font-medium transition-opacity", isActive ? "opacity-100" : "opacity-0 scale-0")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col fixed right-0 top-16 bottom-0 w-72 bg-white dark:bg-[#0f172a] border-l border-gray-200 dark:border-slate-800 p-6 transition-colors">
         <nav className="space-y-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200",
                    isActive 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30" 
                        : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    )}
                >
                    <Icon size={22} />
                    <span className="font-bold">{item.label}</span>
                </Link>
                );
            })}
         </nav>
      </aside>
    </div>
  );
}
