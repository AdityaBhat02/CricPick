import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Tv, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const cards = [
        {
            title: "Auction Control",
            description: "Master control center for managing teams, players, and live bidding.",
            icon: <Gavel size={32} />,
            link: "/admin",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Projector Mode",
            description: "Immersive big-screen experience for the live audience.",
            icon: <Tv size={32} />,
            link: "/projector",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Player Registry",
            description: "Streamlined portal for adding new talent to the auction pool.",
            icon: <UserPlus size={32} />,
            link: "/register",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-black z-0" />
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl w-full">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-sm font-bold mb-6 backdrop-blur-md"
                    >
                        <ShieldCheck size={16} className="text-primary" /> Professional Auction System
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-7xl md:text-9xl font-heading font-bold mb-6 tracking-tighter text-white"
                    >
                        CricPick <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Pro</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                    >
                        The ultimate platform for managing professional cricket auctions with real-time bidding and analytics.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {cards.map((card, index) => (
                        <Link to={card.link} key={index} className="group">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                whileHover={{ y: -8 }}
                                className="h-full glass-panel p-10 flex flex-col relative overflow-hidden group-hover:bg-white/10 transition-all duration-300"
                            >
                                <div className={`absolute top-0 right-0 w-40 h-40 ${card.bg} rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-all opacity-50 group-hover:opacity-100`} />

                                <div className={`w-16 h-16 rounded-2xl ${card.bg} ${card.border} border flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <div className={card.color}>{card.icon}</div>
                                </div>

                                <h2 className="text-3xl font-heading font-bold mb-4 text-white hover:text-primary transition-colors">{card.title}</h2>
                                <p className="text-muted-foreground text-lg mb-8 flex-1 leading-relaxed">
                                    {card.description}
                                </p>

                                <div className={`flex items-center gap-3 font-bold ${card.color} opacity-80 group-hover:opacity-100 group-hover:gap-5 transition-all`}>
                                    Launch Module <ArrowRight size={20} />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-8 text-muted-foreground text-sm font-medium">
                v2.0.0 • Enterprise Edition
            </div>
        </div>
    );
};

export default LandingPage;
