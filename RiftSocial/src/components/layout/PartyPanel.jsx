import React from 'react';
import { Crown, UserPlus, X, Shield } from 'lucide-react';
import { useSocial } from '../../context/SocialContext';

export const PartyPanel = () => {
    const { party } = useSocial();

    if (!party) return null;

    return (
        <div className="fixed bottom-4 right-4 xl:right-72 w-80 bg-[#0A0A0A] border border-slate-800 rounded-lg shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-purple-500" />
                    <span className="font-bold text-sm text-white uppercase tracking-wider">Fireteam ({party.members.length}/{party.maxSize})</span>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="p-2 space-y-1">
                {party.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-sm">
                                    {member.avatar}
                                </div>
                                {member.isLeader && (
                                    <div className="absolute -top-1 -left-1 text-yellow-500 bg-black rounded-full p-0.5">
                                        <Crown size={10} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-200">{member.username}</div>
                                <div className="text-[10px] text-slate-500 uppercase">{member.status}</div>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {/* Context actions would go here */}
                        </div>
                    </div>
                ))}

                {party.members.length < party.maxSize && (
                    <button className="w-full py-2 border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all mt-2">
                        <UserPlus size={14} /> Invite Agent
                    </button>
                )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/30 rounded-b-lg">
                <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest clip-path-polygon transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    Ready Up
                </button>
            </div>
        </div>
    );
};
