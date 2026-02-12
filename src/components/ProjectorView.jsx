import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Gavel, Clock, BarChart3, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuction } from '../context/AuctionContext';

const ProjectorView = () => {
    const { teams: contextTeams, players } = useAuction();

    const [gameState, setGameState] = useState({
        currentPlayer: null,
        currentBid: 0,
        winningTeam: null,
        winningTeamId: null,
        isSold: false,
        timer: 60,
        teams: null, // Will store live team data from broadcast
        timestamp: null
    });

    const [showSummary, setShowSummary] = useState(false);

    // Use broadcasted team data if available (during active auction), otherwise use context
    const teams = gameState.teams || contextTeams;

    useEffect(() => {
        const channel = new BroadcastChannel('auction_sync');
        channel.onmessage = (event) => {
            if (event.data.type === 'UPDATE') {
                setGameState(event.data.payload);
                if (event.data.payload.isSold && !gameState.isSold) {
                    triggerConfetti();
                }
            }
        };
        return () => channel.close();
    }, [gameState.isSold]);

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#34d399', '#f59e0b', '#ffffff'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#34d399', '#f59e0b', '#ffffff'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const soldPlayers = players.filter(p => p.status === 'Sold').slice(-5).reverse();

    const BriefSummary = () => {
        const topBuys = [...players].filter(p => p.status === 'Sold').sort((a, b) => b.soldPrice - a.soldPrice).slice(0, 3);
        const sortedTeams = [...teams].sort((a, b) => b.remainingBudget - a.remainingBudget);
        const totalSold = players.filter(p => p.status === 'Sold').length;
        const totalUnsold = players.filter(p => p.status === 'Unsold').length;

        return (
            <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-8">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 h-full max-h-[85vh]">

                    {/* Team Standings */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col border border-white/10 dark:bg-black/40">
                        <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                            <Users className="text-primary" /> Team Purses
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {sortedTeams.map((team, idx) => (
                                <div key={team.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="font-mono text-muted-foreground w-6 text-sm">#{idx + 1}</div>
                                        <img src={team.logo} className="w-10 h-10 rounded-xl bg-black/50 object-cover" />
                                        <div>
                                            <div className="font-bold text-white">{team.name}</div>
                                            <div className="text-xs text-muted-foreground">{team.players.length} Players</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-primary font-mono font-bold">
                                            {formatCurrency(team.projectedBudget || team.remainingBudget)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Buys */}
                    <div className="glass-panel rounded-3xl p-6 flex flex-col border border-white/10 dark:bg-black/40">
                        <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                            <Trophy className="text-accent" /> Top Buys
                        </h3>
                        <div className="space-y-4">
                            {topBuys.map((player, idx) => {
                                const team = teams.find(t => t.id === player.soldToTeamId);
                                return (
                                    <div key={player.id} className="p-4 bg-gradient-to-r from-white/5 to-transparent rounded-2xl border border-white/5 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 text-8xl font-black text-white/5 -mr-4 -mt-8 rotate-12 transition-transform group-hover:scale-110">{idx + 1}</div>
                                        <div className="flex items-center gap-4 relative z-10">
                                            <img src={player.image} className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10" />
                                            <div>
                                                <div className="text-xl font-bold text-white">{player.name}</div>
                                                <div className="text-accent font-mono font-bold text-lg">{formatCurrency(player.soldPrice)}</div>
                                                {team && (
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium bg-black/20 px-2 py-1 rounded w-fit">
                                                        <img src={team.logo} className="w-3 h-3 rounded-full" />
                                                        <span>{team.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {topBuys.length === 0 && <div className="text-muted-foreground text-center py-20">No high value sales yet</div>}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col gap-6">
                        <div className="glass-panel rounded-3xl p-8 border border-white/10 dark:bg-black/40 flex-1 flex flex-col justify-center">
                            <h3 className="text-2xl font-heading font-bold text-white mb-8 text-center">Auction Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 text-center">
                                    <div className="text-5xl font-heading font-bold text-emerald-400 mb-2">{totalSold}</div>
                                    <div className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Sold</div>
                                </div>
                                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 text-center">
                                    <div className="text-5xl font-heading font-bold text-red-400 mb-2">{totalUnsold}</div>
                                    <div className="text-xs uppercase tracking-widest text-red-500 font-bold">Unsold</div>
                                </div>
                                <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20 text-center col-span-2">
                                    <div className="text-5xl font-heading font-bold text-blue-400 mb-2">{players.length - totalSold - totalUnsold}</div>
                                    <div className="text-xs uppercase tracking-widest text-blue-500 font-bold">Remaining</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {gameState.currentPlayer && (
                    <button
                        onClick={() => setShowSummary(false)}
                        className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-4 rounded-full text-white transition-colors backdrop-blur-md z-50"
                    >
                        <Activity size={24} />
                    </button>
                )}
            </div>
        );
    };

    if (!gameState.currentPlayer) {
        return (
            <div className="h-screen w-screen bg-background flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-black to-slate-900 z-0" />
                <BriefSummary />
                <div className="absolute bottom-10 left-0 right-0 text-center z-[60]">
                    <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 animate-pulse shadow-2xl">
                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_currentColor]"></div>
                        <span className="text-primary font-mono font-bold uppercase tracking-widest text-sm">Waiting for Auctioneer</span>
                    </div>
                </div>
            </div>
        );
    }

    const winningTeam = teams.find(t => t.id === gameState.winningTeamId) || gameState.winningTeam;

    return (
        <div className="h-screen w-screen bg-background text-foreground overflow-hidden relative flex font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-black z-0" />

            <button
                onClick={() => setShowSummary(!showSummary)}
                className="absolute top-8 right-8 z-50 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full backdrop-blur-xl flex items-center gap-2 transition-all font-bold text-sm"
            >
                <BarChart3 size={18} className="text-primary" />
                {showSummary ? 'Hide Stats' : 'View Stats'}
            </button>

            <AnimatePresence>
                {showSummary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40"
                    >
                        <BriefSummary />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Sidebar */}
            <div className="w-[28%] h-full bg-black/20 backdrop-blur-lg border-r border-white/5 z-20 flex flex-col relative">
                {/* Last Sold */}
                <div className="flex-1 p-6 flex flex-col border-b border-white/5">
                    <div className="flex items-center gap-2 mb-6 text-primary">
                        <Activity size={20} />
                        <h3 className="font-heading font-bold text-lg uppercase tracking-wider">Live Feed</h3>
                    </div>

                    <div className="space-y-4">
                        {soldPlayers.map((p, idx) => {
                            const team = teams.find(t => t.id === p.soldToTeamId);
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={p.id}
                                    className={`flex gap-4 p-4 rounded-2xl border ${idx === 0 ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5 opacity-70'}`}
                                >
                                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-black/50" />
                                    <div>
                                        <div className="font-bold text-white">{p.name}</div>
                                        <div className="text-primary font-mono font-bold text-sm">{formatCurrency(p.soldPrice)}</div>
                                        {team && (
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                                <img src={team.logo} className="w-4 h-4 rounded-full" />
                                                <span className="truncate max-w-[120px]">{team.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        {soldPlayers.length === 0 && <div className="text-muted-foreground text-sm italic">Auction just started...</div>}
                    </div>
                </div>

                {/* Team Grid */}
                <div className="h-[40%] bg-black/40 overflow-y-auto custom-scrollbar p-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Team Budgets</h3>
                    <div className="space-y-2">
                        {teams.map(team => (
                            <div key={team.id} className={`p-3 rounded-xl flex items-center justify-between border ${gameState.winningTeam?.id === team.id ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'bg-white/5 border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <img src={team.logo} className="w-6 h-6 rounded-full" />
                                    <span className="font-bold text-sm text-slate-200 truncate max-w-[100px]">{team.name}</span>
                                </div>
                                <div className="font-mono text-xs font-bold text-primary">
                                    {formatCurrency(team.projectedBudget || team.remainingBudget)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 h-full relative z-10 flex flex-col items-center justify-center p-12">

                <div className="flex items-center gap-16 w-full max-w-6xl">
                    {/* Player Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={gameState.currentPlayer.id}
                        className="w-[45%] aspect-[3/4] relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group"
                    >
                        <img src={gameState.currentPlayer.image} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-6xl font-heading font-bold text-white leading-none mb-3"
                            >
                                {gameState.currentPlayer.name}
                            </motion.h1>
                            <div className="flex gap-3">
                                <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold uppercase text-sm tracking-wide shadow-lg shadow-primary/20">
                                    {gameState.currentPlayer.role}
                                </span>
                                {gameState.currentPlayer.style && (
                                    <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-medium text-sm border border-white/10">
                                        {gameState.currentPlayer.style}
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Panel */}
                    <div className="flex-1 space-y-12">
                        {/* Current Bid */}
                        <div>
                            <div className="text-muted-foreground text-xl uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-3">
                                <div className="h-px bg-white/20 flex-1"></div>
                                Current Bid
                                <div className="h-px bg-white/20 flex-1"></div>
                            </div>
                            <motion.div
                                key={gameState.currentBid}
                                initial={{ scale: 1.1, textShadow: "0 0 0px rgba(52,211,153,0)" }}
                                animate={{ scale: 1, textShadow: "0 0 30px rgba(52,211,153,0.3)" }}
                                className="text-[7rem] font-heading font-bold text-white leading-none text-center tabular-nums tracking-tighter"
                            >
                                {formatCurrency(gameState.currentBid)}
                            </motion.div>
                        </div>

                        {/* Timer */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                    <motion.circle
                                        cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        className={`${gameState.timer <= 10 ? 'text-red-500' : 'text-primary'}`}
                                        initial={{ strokeDasharray: 377, strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: 377 - (377 * gameState.timer) / 60 }}
                                        transition={{ duration: 1, ease: "linear" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-3xl font-mono font-bold ${gameState.timer <= 10 ? 'text-red-500' : 'text-white'}`}>{gameState.timer}</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Bidder */}
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Gavel size={100} />
                            </div>
                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Winning Bidder</div>
                            {winningTeam ? (
                                <div className="flex items-center gap-6 relative z-10">
                                    <img src={winningTeam.logo} className="w-20 h-20 rounded-2xl bg-black/40 shadow-xl border border-white/10" />
                                    <div>
                                        <div className="text-3xl font-bold text-white mb-1">{winningTeam.name}</div>
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Leading Position
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-2xl text-slate-500 italic py-4">Waiting for optimal bid...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {gameState.isSold && (
                    <motion.div
                        initial={{ opacity: 0, scale: 3, rotate: -20 }}
                        animate={{ opacity: 1, scale: 1, rotate: -5 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-[100px] opacity-50" />
                            <div className="relative bg-white text-primary font-black text-[12rem] px-20 py-8 border-[12px] border-primary rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] leading-none transform rotate-[-5deg]">
                                SOLD!
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectorView;
