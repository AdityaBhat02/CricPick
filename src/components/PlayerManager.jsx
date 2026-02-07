import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { UserPlus, Trash2, Users, Search, Filter, Check, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerManager = () => {
    const { players, teams, addPlayer, deletePlayer, updatePlayer, loading, error } = useAuction();
    const [name, setName] = useState('');
    const [role, setRole] = useState('All-Rounder');
    const [battingStyle, setBattingStyle] = useState('Right Hand Bat');
    const [bowlingStyle, setBowlingStyle] = useState('Right Arm Fast');
    const [basePrice, setBasePrice] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('approved');

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-primary font-bold text-xl animate-pulse">Loading Players...</div>;
    if (error) return <div className="text-center text-red-500 mt-20 p-4 bg-red-500/10 rounded-xl border border-red-500/20">Error: {error}</div>;

    const handleAddPlayer = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        let finalStyle = '';
        if (role === 'Batsman' || role === 'Wicket Keeper') {
            finalStyle = battingStyle;
        } else if (role === 'Bowler') {
            finalStyle = bowlingStyle;
        } else if (role === 'All-Rounder') {
            finalStyle = `${battingStyle} & ${bowlingStyle}`;
        }

        addPlayer({
            name,
            role,
            style: finalStyle,
            basePrice: parseFloat(basePrice) * 1000000,
            image: `https://api.dicebear.com/7.x/micah/svg?seed=${name}&backgroundColor=f1f5f9`,
            status: 'Unsold'
        });

        setName('');
        setRole('All-Rounder');
        setBasePrice(1);
    };

    const handleApprove = (id) => {
        updatePlayer(id, { status: 'Unsold' });
    };

    const handleDecline = (id) => {
        if (window.confirm("Are you sure you want to decline and remove this player?")) {
            deletePlayer(id);
        }
    };

    const pendingPlayers = players.filter(p => p.status === 'Pending');
    const approvedPlayers = players.filter(p => p.status !== 'Pending');

    const displayedPlayers = (activeTab === 'pending' ? pendingPlayers : approvedPlayers).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 1,
            notation: "compact",
            compactDisplay: "short"
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        <Users className="text-primary" /> Player Management
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-1">Add & manage the auction pool</p>
                </div>

                <div className="flex gap-4">
                    <div
                        className={`glass-panel px-5 py-3 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${activeTab === 'pending' ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 border-white/5'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <div className={`p-2.5 rounded-xl ${pendingPlayers.length > 0 ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Requests</div>
                            <div className={`font-heading font-bold text-2xl leading-none ${pendingPlayers.length > 0 ? 'text-orange-400' : 'text-slate-500'}`}>{pendingPlayers.length}</div>
                        </div>
                    </div>

                    <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-4">
                        <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
                            <Users size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Pool</div>
                            <div className="text-foreground font-heading font-bold text-2xl leading-none">{approvedPlayers.length}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/5">
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'approved' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                >
                    Active Players
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
                >
                    Pending Requests
                    {pendingPlayers.length > 0 && <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-black">{pendingPlayers.length}</span>}
                </button>
            </div>

            {/* Add Player Form (Only visible in Approved tab) */}
            <AnimatePresence>
                {activeTab === 'approved' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden"
                    >
                        <h3 className="text-xl font-heading font-bold mb-6 text-foreground flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <UserPlus size={18} className="text-emerald-500" />
                            </div>
                            Direct Entry
                        </h3>
                        <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end relative z-10">
                            <div className="lg:col-span-1">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Player Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full glass-input rounded-xl px-4 py-3.5 focus:outline-none"
                                    placeholder="e.g. Virat Kohli"
                                />
                            </div>

                            <div className="lg:col-span-1">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Role</label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full glass-input rounded-xl px-4 py-3.5 focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option className="bg-slate-900">Batsman</option>
                                        <option className="bg-slate-900">Bowler</option>
                                        <option className="bg-slate-900">All-Rounder</option>
                                        <option className="bg-slate-900">Wicket Keeper</option>
                                    </select>
                                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Conditional Inputs */}
                            {(role === 'Batsman' || role === 'All-Rounder' || role === 'Wicket Keeper') && (
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Batting Style</label>
                                    <select
                                        value={battingStyle}
                                        onChange={(e) => setBattingStyle(e.target.value)}
                                        className="w-full glass-input rounded-xl px-4 py-3.5 focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option className="bg-slate-900">Right Hand Bat</option>
                                        <option className="bg-slate-900">Left Hand Bat</option>
                                    </select>
                                </div>
                            )}

                            {(role === 'Bowler' || role === 'All-Rounder') && (
                                <div className="lg:col-span-1">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Bowling Style</label>
                                    <select
                                        value={bowlingStyle}
                                        onChange={(e) => setBowlingStyle(e.target.value)}
                                        className="w-full glass-input rounded-xl px-4 py-3.5 focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option className="bg-slate-900">Right Arm Fast</option>
                                        <option className="bg-slate-900">Right Arm Medium</option>
                                        <option className="bg-slate-900">Right Arm Spin</option>
                                        <option className="bg-slate-900">Left Arm Fast</option>
                                        <option className="bg-slate-900">Left Arm Medium</option>
                                        <option className="bg-slate-900">Left Arm Spin</option>
                                    </select>
                                </div>
                            )}

                            <div className="lg:col-span-1">
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 ml-1">Base Price (M)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">M</span>
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex justify-end mt-2">
                                <button
                                    type="submit"
                                    className="btn-primary py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 font-bold w-full md:w-auto"
                                >
                                    <UserPlus size={20} /> Add to Pool
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Search Bar */}
            <div className="sticky top-4 z-30">
                <div className="glass-panel rounded-2xl p-2 border border-white/10 flex items-center shadow-2xl shadow-black/20 backdrop-blur-xl">
                    <Search className="ml-4 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search players by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-white focus:ring-0 outline-none placeholder:text-muted-foreground font-medium"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="mr-2 p-2 hover:bg-white/10 rounded-full text-muted-foreground">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-20">
                <AnimatePresence>
                    {displayedPlayers.map((player, index) => {
                        const soldTeam = teams.find(t => t.id === player.soldToTeamId);
                        const isSold = player.status === 'Sold';
                        const isPending = player.status === 'Pending';

                        return (
                            <motion.div
                                key={player.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.03 }}
                                className={`glass-panel p-0 rounded-3xl border group relative overflow-hidden flex flex-col ${isPending ? 'border-orange-500/20 bg-orange-500/5' :
                                    isSold ? 'border-emerald-500/20' : 'border-white/5'
                                    }`}
                            >
                                {/* Header / Badge */}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border shadow-lg backdrop-blur-md ${isSold ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        isPending ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            'bg-slate-800/80 text-slate-400 border-white/10'
                                        }`}>
                                        {player.status}
                                    </span>
                                </div>

                                {/* Actions (Delete) */}
                                {activeTab === 'approved' && (
                                    <button
                                        onClick={() => deletePlayer(player.id)}
                                        className="absolute top-4 left-4 text-muted-foreground hover:text-red-400 bg-black/40 hover:bg-black/60 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-md border border-white/5"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                {/* Image Section */}
                                <div className="w-full h-40 bg-black/40 relative overflow-hidden group-hover:h-44 transition-all duration-500">
                                    <img
                                        src={player.image || `https://api.dicebear.com/7.x/micah/svg?seed=${player.name}&backgroundColor=1e293b`}
                                        alt={player.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

                                    <div className="absolute bottom-4 left-6 right-6">
                                        <h4 className="font-heading font-bold text-xl text-white truncate leading-tight">{player.name}</h4>
                                        <span className="text-xs font-bold text-primary uppercase tracking-wide">{player.role}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-2 flex-1 flex flex-col gap-3">
                                    {player.style && (
                                        <div className="text-xs text-muted-foreground font-medium line-clamp-1 flex items-center gap-1.5">
                                            <Tag size={12} /> {player.style}
                                        </div>
                                    )}

                                    <div className="mt-auto space-y-2">
                                        <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Base</span>
                                            <span className="text-white font-mono font-bold text-sm">{formatCurrency(player.basePrice)}</span>
                                        </div>

                                        {isSold && (
                                            <div className="flex justify-between items-center bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                                                <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider">Sold</span>
                                                <span className="text-emerald-400 font-mono font-bold text-sm">{formatCurrency(player.soldPrice)}</span>
                                            </div>
                                        )}

                                        {soldTeam && (
                                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                                                <img src={soldTeam.logo} className="w-5 h-5 rounded-full" />
                                                <span className="text-xs font-bold text-slate-300 truncate">{soldTeam.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pending Actions */}
                                {activeTab === 'pending' && (
                                    <div className="p-4 pt-0 grid grid-cols-2 gap-3 mt-auto">
                                        <button
                                            onClick={() => handleDecline(player.id)}
                                            className="px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-bold text-xs transition-colors"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleApprove(player.id)}
                                            className="px-3 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 font-bold text-xs transition-all"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {displayedPlayers.length === 0 && (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-24 text-center glass-panel border-dashed border-white/10 rounded-3xl"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="text-muted-foreground" size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-foreground">No players found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or add a new player.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PlayerManager;
