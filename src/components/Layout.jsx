import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gavel, Users, UserPlus, BarChart3, Menu, X, LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Auction Room', icon: <Gavel size={20} /> },
        { path: '/admin/teams', label: 'Teams', icon: <Users size={20} /> },
        { path: '/admin/players', label: 'Players', icon: <UserPlus size={20} /> },
        { path: '/admin/summary', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans text-foreground bg-background transition-colors duration-500 selection:bg-primary/30 selection:text-primary">

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar Navigation (Desktop) */}
            <aside className="hidden md:flex w-72 flex-col h-screen sticky top-0 z-50 p-4">
                <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/20">

                    {/* Header */}
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-primary to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-primary/20 ring-1 ring-white/10">
                                <Gavel size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="font-heading font-bold text-lg tracking-tight text-white leading-tight">CricPick<br /><span className="text-primary">Buddy</span></h1>
                            </div>
                        </div>

                        {/* User Card */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Admin</p>
                                <div className="font-bold text-sm text-foreground truncate max-w-[100px]" title={user?.email}>{user?.email?.split('@')[0]}</div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-black/20 text-muted-foreground hover:text-primary hover:bg-black/40 transition-all"
                            >
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-2">Menu</div>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${isActive
                                            ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(52,211,153,0.15)] border border-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavDesktop"
                                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_currentColor]"
                                        />
                                    )}
                                    <span className={`transition-colors duration-300 ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium tracking-wide">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 bg-black/20 space-y-3">
                        <Link
                            to="/projector"
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all border border-indigo-400/20"
                        >
                            <BarChart3 size={18} />
                            <span>Projector View</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-semibold"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden glass-panel sticky top-0 z-50 px-4 py-3 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
                        <Gavel size={20} className="text-black" />
                    </div>
                    <span className="font-heading font-bold text-lg text-foreground">CricPick</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-white/5 text-muted-foreground"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-[60px] left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl p-4"
                    >
                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl ${location.pathname === item.path
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-muted-foreground hover:bg-white/5'
                                        }`}
                                >
                                    {item.icon}
                                    <span className="font-bold">{item.label}</span>
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 my-4" />
                            <Link
                                to="/projector"
                                target="_blank"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2"
                            >
                                <BarChart3 size={20} />
                                <span className="font-bold">Projector View</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut size={20} />
                                <span className="font-bold">Logout</span>
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-x-hidden">
                <div className="max-w-7xl mx-auto p-4 md:p-8 md:pt-10 pb-24">
                    {/* Breadcrumb / Title could go here */}
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
