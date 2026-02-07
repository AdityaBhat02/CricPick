import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-black z-0" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <Link to="/" className="absolute top-8 left-8 text-muted-foreground hover:text-white flex items-center gap-2 transition-colors z-20 font-bold group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-panel p-10 relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-lg shadow-primary/10">
                        <Shield size={40} />
                    </div>
                    <h1 className="text-4xl font-heading font-bold mb-3 text-white">Welcome Back</h1>
                    <p className="text-muted-foreground">Authenticate to access admin controls</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 font-medium"
                    >
                        <AlertCircle size={20} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full glass-input rounded-xl px-5 py-4 focus:outline-none"
                            placeholder="admin@cricpick.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full glass-input rounded-xl px-5 py-4 focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 mt-2 font-bold text-lg"
                    >
                        Sign In <ArrowRight size={20} />
                    </motion.button>
                </form>

                <div className="mt-8 text-center text-muted-foreground text-sm font-medium">
                    New to the platform? <Link to="/signup" className="text-primary hover:text-emerald-300 font-bold transition-colors ml-1">Create Account</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
