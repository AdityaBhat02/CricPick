import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Gavel, ChevronRight, User, Trophy, Play, SkipForward, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const AuctionRoom = () => {
    const { players, teams, sellPlayer, updatePlayer, loading, error } = useAuction();
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentBid, setCurrentBid] = useState(0);
    const [winningTeamId, setWinningTeamId] = useState(null);
    const [isSold, setIsSold] = useState(false);
    const [timer, setTimer] = useState(60);
    const [customBidAmount, setCustomBidAmount] = useState(100000);

    // Get active players (exclude Pending)
    const activePlayers = players.filter(p => p.status !== 'Pending');
    const unsoldPlayers = activePlayers.filter(p => p.status === 'Unsold');

    const startAuction = (player) => {
        setCurrentPlayer(player);
        setCurrentBid(player.basePrice);
        setWinningTeamId(null);
        setIsSold(false);
        setTimer(60);
    };

    // Timer Logic
    useEffect(() => {
        if (!currentPlayer || isSold) return;
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [currentPlayer, isSold]);

    // Auto-handle timer expiry
    useEffect(() => {
        if (timer === 0 && currentPlayer && !isSold) {
            if (winningTeamId) {
                handleSell();
            } else {
                // Auto-pass logic could go here, but for now let's just Show visual alert
                // handleUnsold(true); 
            }
        }
    }, [timer, currentPlayer, isSold, winningTeamId]);

    // Broadcast state changes
    useEffect(() => {
        const channel = new BroadcastChannel('auction_sync');
        channel.postMessage({
            type: 'UPDATE',
            payload: {
                currentPlayer,
                currentBid,
                winningTeam: teams.find(t => t.id === winningTeamId) || null,
                isSold,
                timer
            }
        });
        return () => channel.close();
    }, [currentPlayer, currentBid, winningTeamId, isSold, teams, timer]);

    const handleBid = (amount) => {
        setCurrentBid(prev => prev + amount);
        setTimer(60); // Reset timer
    };

    const handleSell = () => {
        if (!winningTeamId || !currentPlayer) return;
        sellPlayer(currentPlayer.id, winningTeamId, currentBid);
        setIsSold(true);
        triggerConfetti();
    };

    const handleUnsold = (auto = false) => {
        if (!currentPlayer) return;
        if (auto || window.confirm(`Mark ${currentPlayer.name} as Unsold?`)) {
            updatePlayer(currentPlayer.id, { status: 'Unsold' }); // Using 'Unsold' (Passed)
            setCurrentPlayer(null);
            setTimer(60);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
            confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#34d399', '#f59e0b'] });
            confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#34d399', '#f59e0b'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    if (loading) return <div className="flex justify-center items-center h-[80vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (error) return <div className="text-center text-red-500 font-bold p-10 bg-red-500/10 rounded-xl border border-red-500/20">Error: {error}</div>;

    if (!currentPlayer) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel p-10 md:p-16 rounded-3xl max-w-2xl w-full mx-4 border border-white/10 shadow-2xl relative z-10"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30 rotate-3">
                        <Gavel size={40} className="text-white" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-foreground">Auction Control Center</h2>
                    <p className="text-lg text-muted-foreground mb-10">
                        Ready to start? <span className="text-primary font-bold">{unsoldPlayers.length}</span> players are waiting in the dugout.
                    </p>

                    {unsoldPlayers.length > 0 ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startAuction(unsoldPlayers[0])}
                            className="bg-primary hover:bg-emerald-400 text-primary-foreground font-bold py-4 px-10 rounded-xl text-lg shadow-xl shadow-primary/20 flex items-center gap-3 mx-auto transition-colors"
                        >
                            <Play size={22} fill="currentColor" /> Start First Player
                        </motion.button>
                    ) : (
                        <div className="text-accent text-2xl font-bold flex items-center justify-center gap-2 bg-accent/10 p-4 rounded-xl border border-accent/20">
                            <Trophy className="text-accent" /> Auction Complete!
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    const winningTeam = teams.find(t => t.id === winningTeamId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">

            {/* Left Col: Player Card */}
            <div className="lg:col-span-4 flex flex-col h-full">
                <motion.div
                    key={currentPlayer.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="relative flex-1 rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col"
                >
                    <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent z-0" />

                    <div className="relative z-10 p-6 flex flex-col h-full">
                        <div className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/10 bg-black/50 relative">
                            <img src={currentPlayer.image} alt={currentPlayer.name} className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                <h2 className="text-3xl font-heading font-bold text-white leading-none">{currentPlayer.name}</h2>
                                <span className="text-primary font-bold">{currentPlayer.role}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Base Price</span>
                                <div className="text-xl font-mono font-bold text-white">{formatCurrency(currentPlayer.basePrice)}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Style</span>
                                <div className="text-sm font-bold text-white truncate">{currentPlayer.style || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* SOLD OVERLAY */}
                    <AnimatePresence>
                        {isSold && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6"
                            >
                                <motion.div
                                    initial={{ scale: 3, rotate: -10 }}
                                    animate={{ scale: 1, rotate: -5 }}
                                    className="text-8xl font-black text-primary border-4 border-primary px-8 py-2 rounded-xl bg-primary/10 mb-8 transform -rotate-6"
                                >
                                    SOLD
                                </motion.div>
                                <div className="space-y-2 mb-8">
                                    <p className="text-muted-foreground uppercase tracking-widest text-sm">Sold To</p>
                                    <h3 className="text-3xl font-bold text-white">{winningTeam?.name}</h3>
                                    <p className="text-4xl font-mono font-bold text-accent">{formatCurrency(currentBid)}</p>
                                </div>
                                <button
                                    onClick={() => startAuction(unsoldPlayers.filter(p => p.id !== currentPlayer.id)[0] || null)}
                                    className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
                                >
                                    Next Player <SkipForward size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Right Col: Control Center */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full">

                {/* Stats Header */}
                <div className="glass-panel p-6 rounded-3xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div>
                        <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Current Bid</span>
                        <motion.div
                            key={currentBid}
                            initial={{ scale: 1.2, color: '#34d399' }}
                            animate={{ scale: 1, color: 'var(--foreground)' }}
                            className="text-6xl font-heading font-bold text-foreground tracking-tighter"
                        >
                            {formatCurrency(currentBid)}
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Timer */}
                        <div className="text-center">
                            <div className={`text-4xl font-mono font-bold ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
                                {timer}s
                            </div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Timer</span>
                        </div>

                        {/* Leader */}
                        <div className="text-right min-w-[150px]">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold block mb-1">Winning Team</span>
                            {winningTeam ? (
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-xl font-bold text-primary">{winningTeam.name}</span>
                                    {winningTeam.logo && <img src={winningTeam.logo} className="w-8 h-8 rounded-full border border-primary/50" />}
                                </div>
                            ) : (
                                <span className="text-xl font-bold text-slate-600 italic">No Bids</span>
                            )}
                        </div>
                    </div>
                    {winningTeam && <div className="absolute bottom-0 left-0 h-1 bg-primary w-full animate-pulse" />}
                </div>

                {/* Team Grid */}
                <div className="flex-1 glass-panel rounded-3xl p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-black/20">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Gavel size={16} /> Bidding Console
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {teams.map(team => {
                            const canAfford = team.remainingBudget >= (currentBid + 100000);
                            const isWinner = winningTeamId === team.id;

                            return (
                                <motion.button
                                    key={team.id}
                                    whileTap={{ scale: canAfford && !isSold ? 0.95 : 1 }}
                                    disabled={!canAfford || isSold}
                                    onClick={() => {
                                        setWinningTeamId(team.id);
                                        handleBid(100000);
                                    }}
                                    className={`relative p-4 rounded-2xl border text-left transition-all overflow-hidden group ${isWinner
                                        ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                                        : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/10'
                                        } ${!canAfford ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <img src={team.logo} className="w-10 h-10 rounded-full bg-black/40 object-cover" />
                                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(team.remainingBudget)}</span>
                                    </div>
                                    <div className="font-bold text-sm text-foreground truncate relative z-10">{team.name}</div>

                                    {/* Hover Bid Overlay */}
                                    {canAfford && !isSold && (
                                        <div className="absolute inset-0 bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <span className="text-primary-foreground font-bold text-sm uppercase">Bid +1L</span>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Quick Bids */}
                    <div className="glass-panel p-4 rounded-2xl flex gap-2 overflow-x-auto no-scrollbar">
                        {[200000, 500000, 1000000].map(amt => (
                            <button
                                key={amt}
                                disabled={isSold || !winningTeamId}
                                onClick={() => handleBid(amt)}
                                className="flex-1 min-w-[80px] py-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-sm font-bold text-foreground transition-all disabled:opacity-50"
                            >
                                +{(amt / 100000).toFixed(0)}L
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            disabled={isSold || !winningTeamId}
                            onClick={handleSell}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black text-xl rounded-2xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            SOLD <Gavel size={20} />
                        </button>
                        <button
                            disabled={isSold}
                            onClick={() => handleUnsold()}
                            className="px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold border border-white/5 transition-all text-sm disabled:opacity-50"
                        >
                            Pass
                        </button>
                    </div>
                </div>

                {/* Custom Bid */}
                <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase whitespace-nowrap">Custom Bid</span>
                    <input
                        type="range" min="100000" max="5000000" step="100000"
                        value={customBidAmount}
                        onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-800 rounded-full appearance-none accent-primary cursor-pointer"
                    />
                    <button
                        onClick={() => handleBid(customBidAmount)}
                        disabled={isSold || !winningTeamId}
                        className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-lg text-sm font-bold whitespace-nowrap transition-all"
                    >
                        +{formatCurrency(customBidAmount)}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AuctionRoom;
