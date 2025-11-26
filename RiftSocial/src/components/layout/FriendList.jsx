import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useChat } from '../../context/ChatContext';

export const FriendList = () => {
    const { friends } = useSocial();
    const { openConversation } = useChat();

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'in_game': return 'bg-purple-500';
            case 'away': return 'bg-yellow-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="fixed right-0 top-16 bottom-0 w-64 bg-[#080808] border-l border-slate-800 hidden xl:flex flex-col z-30">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Social Uplink</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h4 className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-3">Online ({friends.filter(f => f.status !== 'offline').length})</h4>
                    <div className="space-y-3">
                        {friends.filter(f => f.status !== 'offline').map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => openConversation(friend.id)}
                                className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-lg">
                                        {friend.avatar}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#080808] ${getStatusColor(friend.status)}`} />
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-sm font-bold text-slate-300 truncate group-hover:text-white">{friend.username}</div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                        {friend.status === 'in_game' ? <span className="text-purple-400">{friend.activity}</span> : friend.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-3">Offline ({friends.filter(f => f.status === 'offline').length})</h4>
                    <div className="space-y-3">
                        {friends.filter(f => f.status === 'offline').map(friend => (
                            <div key={friend.id} className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer p-2">
                                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-lg grayscale">
                                    {friend.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-400 truncate">{friend.username}</div>
                                    <div className="text-[10px] text-slate-600 truncate">{friend.lastSeen}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
