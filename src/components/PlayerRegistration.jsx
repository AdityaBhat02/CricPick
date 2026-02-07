import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { UserPlus, ArrowLeft, Check, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const PlayerRegistration = () => {
    const { addPlayer } = useAuction();
    const [formData, setFormData] = useState({
        name: '',
        role: 'Batsman',
        style: '', // Combined style string
        battingStyle: 'Right Hand Bat',
        bowlingStyle: 'Right Arm Fast',
        basePrice: 1,
        image: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const [imageSource, setImageSource] = useState('url'); // 'url' or 'upload'
    const [imageFile, setImageFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) return;

        let finalStyle = '';
        if (formData.role === 'Batsman' || formData.role === 'Wicket Keeper') {
            finalStyle = formData.battingStyle;
        } else if (formData.role === 'Bowler') {
            finalStyle = formData.bowlingStyle;
        } else if (formData.role === 'All-Rounder') {
            finalStyle = `${formData.battingStyle} & ${formData.bowlingStyle}`;
        }

        const basePriceVal = parseFloat(formData.basePrice) * 1000000;

        if (imageSource === 'upload' && imageFile) {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('role', formData.role);
            data.append('style', finalStyle);
            data.append('basePrice', basePriceVal);
            data.append('status', 'Pending');
            data.append('imageFile', imageFile); // 'imageFile' matches backend multer config

            addPlayer(data);
        } else {
            addPlayer({
                name: formData.name,
                role: formData.role,
                style: finalStyle,
                basePrice: basePriceVal,
                image: formData.image,
                status: 'Pending'
            });
        }

        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // Reset form
        setFormData({
            ...formData,
            name: '',
            basePrice: 1,
            image: ''
        });
        setImageFile(null);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Home
                </Link>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-500 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                            <UserPlus size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Player Registration</h1>
                            <p className="text-slate-400 text-sm">Enter player details for the auction</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Player Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                placeholder="e.g. Virat Kohli"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option>Batsman</option>
                                    <option>Bowler</option>
                                    <option>All-Rounder</option>
                                    <option>Wicket Keeper</option>
                                </select>
                            </div>

                            {/* Conditional Style Inputs */}
                            {(formData.role === 'Batsman' || formData.role === 'All-Rounder' || formData.role === 'Wicket Keeper') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Batting Style</label>
                                    <select
                                        value={formData.battingStyle}
                                        onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    >
                                        <option>Right Hand Bat</option>
                                        <option>Left Hand Bat</option>
                                    </select>
                                </div>
                            )}

                            {(formData.role === 'Bowler' || formData.role === 'All-Rounder') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bowling Style</label>
                                    <select
                                        value={formData.bowlingStyle}
                                        onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    >
                                        <option>Right Arm Fast</option>
                                        <option>Right Arm Medium</option>
                                        <option>Right Arm Spin</option>
                                        <option>Left Arm Fast</option>
                                        <option>Left Arm Medium</option>
                                        <option>Left Arm Spin</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Base Price (Millions)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">M</span>
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                                        placeholder="e.g. 1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Photo Source</label>
                                <div className="flex bg-slate-950 rounded-lg p-1 border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setImageSource('url')}
                                        className={`text-xs px-3 py-1 rounded-md transition-all ${imageSource === 'url' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageSource('upload')}
                                        className={`text-xs px-3 py-1 rounded-md transition-all ${imageSource === 'upload' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>

                            {imageSource === 'url' ? (
                                <div className="relative">
                                    <Upload size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                                        placeholder="https://..."
                                    />
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition-all cursor-pointer"
                                    />
                                </div>
                            )}
                            <p className="text-[10px] text-slate-500 mt-2">
                                {imageSource === 'url' ? 'Paste a direct link to the image.' : 'Upload an image from your device.'} Leave empty for random avatar.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2"
                        >
                            <UserPlus size={20} /> Register Player
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-10 bg-emerald-500 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl font-bold"
                    >
                        <div className="bg-white/20 p-1 rounded-full"><Check size={16} /></div>
                        Player Registered! Awaiting Admin Approval.
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlayerRegistration;
