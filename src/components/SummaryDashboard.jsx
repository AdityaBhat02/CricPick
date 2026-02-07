import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { BarChart3, Users, AlertCircle, Trophy, IndianRupee, Clock, Activity, PieChart, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryDashboard = () => {
    const { teams, players } = useAuction();

    const totalSpent = teams.reduce((acc, team) => acc + (team.budget - team.remainingBudget), 0);
    const totalPlayersSold = players.filter(p => p.status === 'Sold').length;
    const unsoldPlayers = players.filter(p => p.status === 'Unsold');
    const pendingPlayers = players.filter(p => p.status === 'Pending');

    const topBuys = [...players]
        .filter(p => p.status === 'Sold')
        .sort((a, b) => b.soldPrice - a.soldPrice)
        .slice(0, 5);

    const recentActivity = [...players]
        .filter(p => p.status === 'Sold')
        .slice(-5)
        .reverse();

    const roles = ['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'];
    const roleStats = roles.map(role => {
        const count = players.filter(p => p.role === role).length;
        const soldCount = players.filter(p => p.role === role && p.status === 'Sold').length;
        return { role, count, soldCount };
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <header>
                <motion.h2 variants={itemVariants} className="text-3xl font-heading font-bold flex items-center gap-3 mb-2 text-foreground">
                    <div className="p-2 bg-gradient-to-br from-primary to-emerald-600 rounded-xl shadow-lg shadow-primary/20">
                        <BarChart3 className="text-white" size={24} />
                    </div>
                    Auction Review
                </motion.h2>
                <motion.p variants={itemVariants} className="text-muted-foreground ml-1">Real-time statistics and insights overview</motion.p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={<IndianRupee size={24} />}
                    label="Total Money Spent"
                    value={formatCurrency(totalSpent)}
                    color="text-emerald-400"
                    gradient="from-emerald-500/20 to-emerald-500/5"
                    borderColor="border-emerald-500/20"
                />
                <StatsCard
                    icon={<Users size={24} />}
                    label="Players Sold"
                    value={`${totalPlayersSold} / ${players.length}`}
                    color="text-blue-400"
                    progressColor="bg-blue-400"
                    gradient="from-blue-500/20 to-blue-500/5"
                    borderColor="border-blue-500/20"
                    progress={(totalPlayersSold / players.length) * 100}
                />
                <StatsCard
                    icon={<AlertCircle size={24} />}
                    label="Unsold Players"
                    value={unsoldPlayers.length}
                    color="text-amber-400"
                    gradient="from-amber-500/20 to-amber-500/5"
                    borderColor="border-amber-500/20"
                />
                <StatsCard
                    icon={<Clock size={24} />}
                    label="Pending Requests"
                    value={pendingPlayers.length}
                    color="text-purple-400"
                    gradient="from-purple-500/20 to-purple-500/5"
                    borderColor="border-purple-500/20"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main: Team Purses */}
                <div className="xl:col-span-2 space-y-8">
                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                                <Users className="text-primary" size={20} /> Team Standings
                            </h3>
                        </div>
                        <div className="grid gap-4">
                            {teams.map((team) => {
                                const spentPercentage = ((team.budget - team.remainingBudget) / team.budget) * 100;
                                return (
                                    <div key={team.id} className="group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="relative">
                                                <img src={team.logo} className="w-12 h-12 rounded-xl bg-black/40 object-cover shadow-lg border border-white/10" alt={team.name} />
                                                <div className="absolute -bottom-1 -right-1 bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded-full border border-white/10">
                                                    {team.players.length}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-lg">{team.name}</div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                                                    <span>Budget Used: {Math.round(spentPercentage)}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-primary font-mono font-bold text-lg">{formatCurrency(team.remainingBudget)}</div>
                                                <div className="text-xs text-muted-foreground">Remaining</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-black/40 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${spentPercentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Role Stats */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="text-blue-400" size={20} />
                            <h3 className="font-heading font-bold text-xl text-white">Role Composition</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {roleStats.map((stat) => (
                                <div key={stat.role} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-slate-300">{stat.role}</span>
                                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-lg text-white">
                                            {stat.soldCount}/{stat.count}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden flex">
                                        <div
                                            className="bg-blue-500 h-full"
                                            style={{ width: `${(stat.soldCount / players.length) * 100}%` }}
                                        />
                                        <div
                                            className="bg-slate-700 h-full opacity-30"
                                            style={{ width: `${((stat.count - stat.soldCount) / players.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar: Top Buys & Activity */}
                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-6 text-accent">
                            <Trophy size={20} />
                            <h3 className="font-heading font-bold text-xl text-white">Top Buys</h3>
                        </div>
                        <div className="space-y-4">
                            {topBuys.map((player, index) => {
                                const team = teams.find(t => t.id === player.soldToTeamId);
                                return (
                                    <div key={player.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <div className={`font-mono font-bold text-xl w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/5 ${index === 0 ? 'text-accent' : 'text-slate-500'
                                            }`}>
                                            #{index + 1}
                                        </div>
                                        <img src={player.image} alt={player.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-sm truncate">{player.name}</div>
                                            {team && <div className="text-[10px] text-muted-foreground truncate">{team.name}</div>}
                                        </div>
                                        <div className="text-primary font-mono font-bold text-sm">
                                            {formatCurrency(player.soldPrice)}
                                        </div>
                                    </div>
                                );
                            })}
                            {topBuys.length === 0 && <div className="text-center text-muted-foreground py-4">No data yet</div>}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-3xl">
                        <div className="flex items-center gap-2 mb-6 text-purple-400">
                            <Activity size={20} />
                            <h3 className="font-heading font-bold text-xl text-white">Feed</h3>
                        </div>
                        <div className="space-y-4 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10 z-0" />

                            {recentActivity.map((player) => (
                                <div key={player.id} className="relative z-10 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                    </div>
                                    <div className="pb-4">
                                        <div className="text-sm text-white">
                                            <span className="font-bold">{player.name}</span> sold for <span className="text-primary font-mono font-bold">{formatCurrency(player.soldPrice)}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">Just now</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const StatsCard = ({ icon, label, value, color, progressColor, gradient, borderColor, progress, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`glass-panel p-6 rounded-3xl border ${borderColor} relative overflow-hidden group`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 ${color} shadow-lg transition-colors`}>
                    {icon}
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <ArrowUpRight size={12} /> {trend}
                    </div>
                )}
            </div>

            <div className="text-2xl font-heading font-bold text-foreground mb-1">{value}</div>
            <div className="text-sm font-medium text-muted-foreground">{label}</div>

            {progress !== undefined && (
                <div className="w-full bg-slate-200 dark:bg-black/40 rounded-full h-1.5 mt-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${progressColor || color.replace('text-', 'bg-')}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    </motion.div>
);

export default SummaryDashboard;
