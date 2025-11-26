import React, { useState } from 'react';
import { GlitchText } from '../components/ui/GlitchText';
import { useAuth } from '../context/AuthContext';

export const AuthView = () => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('demo@rift.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await login(email, password);
        if (!success) {
            setError('Invalid credentials. Try demo@rift.com / password');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />

            <div className="relative z-10 w-full max-w-md p-8">
                <div className="text-center mb-10">
                    <GlitchText text="RIFT SOCIAL" className="text-4xl text-white mb-2" />
                    <p className="text-slate-500 text-sm uppercase tracking-widest">Enter the Simulation</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-black/50 p-8 border border-slate-800 backdrop-blur-sm">
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wide">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Identity</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-mono text-sm"
                            placeholder="AGENT ID / EMAIL"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase tracking-widest font-bold">Access Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all font-mono text-sm"
                            placeholder="PASSWORD"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
                            <input type="checkbox" className="accent-cyan-500" defaultChecked />
                            REMEMBER ME
                        </label>
                        <button type="button" className="hover:text-cyan-400 transition-colors">FORGOT KEY?</button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Authenticating...' : 'Initialize Session'}
                    </button>

                    <div className="text-center text-xs text-slate-600 mt-6">
                        NO ACCOUNT? <button type="button" className="text-cyan-500 hover:text-cyan-400 font-bold ml-1">REGISTER NEW AGENT</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
