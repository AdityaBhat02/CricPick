import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Plus, Trash2, Users, Trophy, Wallet, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamManager = () => {
    const { teams, addTeam, deleteTeam, loading, error } = useAuction();
    const [newTeamName, setNewTeamName] = useState('');
    const [teamLogo, setTeamLogo] = useState('');
    const [budgetInMillions, setBudgetInMillions] = useState(10); // Default 10 Million

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-primary font-bold text-xl animate-pulse">Loading Teams...</div>;
    if (error) return <div className="text-center text-red-500 mt-20 p-4 bg-red-500/10 rounded-xl border border-red-500/20">Error: {error}</div>;

    const handleAddTeam = (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        addTeam({
            name: newTeamName,
            budget: parseInt(budgetInMillions) * 1000000,
            logo: teamLogo.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${newTeamName}&backgroundColor=0ea5e9`
        });

        setNewTeamName('');
        setTeamLogo('');
        setBudgetInMillions(10);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                        <Users className="text-primary" /> Team Management
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-1">Manage franchise teams & budgets</p>
                </div>
                <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4">
                    <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Teams</div>
                        <div className="text-foreground font-heading font-bold text-2xl leading-none">{teams.length}</div>
                    </div>
                </div>
            </header>

            {/* Add Team Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <h3 className="text-xl font-heading font-bold mb-6 text-foreground flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Plus size={18} className="text-emerald-500" />
                    </div>
                    Register New Team
                </h3>

                <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
                    <div className="md:col-span-5">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Team Name</label>
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="w-full glass-input rounded-xl px-4 py-3.5 focus:outline-none"
                            placeholder="e.g. Royal Challengers"
                        />
                    </div>

                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Logo URL (Optional)</label>
                        <input
                            type="text"
                            value={teamLogo}
                            onChange={(e) => setTeamLogo(e.target.value)}
                            className="w-full glass-input rounded-xl px-4 py-3.5 focus:outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Budget (Millions)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">M</span>
                            <input
                                type="number"
                                value={budgetInMillions}
                                min="1"
                                max="100"
                                onChange={(e) => setBudgetInMillions(e.target.value)}
                                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-12 flex justify-end mt-2">
                        <button
                            type="submit"
                            className="btn-primary py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 w-full md:w-auto font-bold"
                        >
                            <Plus size={20} /> Create Team
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Team List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {teams.map((team, index) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-panel p-0 rounded-3xl border border-white/5 group relative overflow-hidden hover:border-white/10 transition-colors"
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 flex items-start gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-black/40 p-1 shadow-lg border border-white/5 shrink-0">
                                    <img
                                        src={team.logo}
                                        alt={team.name}
                                        className="w-full h-full rounded-xl object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-heading font-bold text-lg text-foreground truncate">{team.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 uppercase tracking-wide font-semibold">
                                        <Shield size={12} /> Franchise
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteTeam(team.id)}
                                    className="text-muted-foreground hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Team"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-px bg-white/5 border-t border-white/5">
                                <div className="p-4 bg-black/20 hover:bg-black/30 transition-colors">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1">Available</span>
                                    <span className="text-primary font-mono font-bold text-sm">{formatCurrency(team.remainingBudget)}</span>
                                </div>
                                <div className="p-4 bg-black/20 hover:bg-black/30 transition-colors">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1">Total Size</span>
                                    <span className="text-white font-mono font-bold text-sm">{team.players.length} Players</span>
                                </div>
                            </div>

                            {/* Decorative blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {teams.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="text-muted-foreground" size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-foreground mb-2">No Teams Configured</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">Create your first franchise team using the form above to begin the auction process.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TeamManager;
