import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { LEADERBOARD_DATA } from '../data/mockData';

export const LeaderboardView = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
        <SectionHeader title="Leaderboards" subtitle="Compete for global dominance" />
        <div className="bg-[#0A0A0A] border border-slate-800 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black/80 border-b border-slate-800 text-slate-500 text-xs uppercase tracking-widest font-mono">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Player</th>
                        <th className="p-4">Clan</th>
                        <th className="p-4 text-right">Kills</th>
                        <th className="p-4 text-right">KDR</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {LEADERBOARD_DATA.map((player) => (
                        <tr key={player.rank} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 font-bold">{player.rank <= 3 ? <span className="text-xl">{['🥇', '🥈', '🥉'][player.rank - 1]}</span> : <span className="text-slate-600">#{player.rank}</span>}</td>
                            <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{player.avatar}</span>
                                    <span className="text-slate-200 font-bold group-hover:text-cyan-400 transition-colors">{player.name}</span>
                                </div>
                            </td>
                            <td className="p-4 text-slate-400 font-mono text-sm">{player.clan}</td>
                            <td className="p-4 text-right text-cyan-400 font-mono">{player.kills.toLocaleString()}</td>
                            <td className="p-4 text-right text-purple-400 font-bold">{player.kdr}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
