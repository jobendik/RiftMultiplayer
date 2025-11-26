import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const SocialContext = createContext(null);

export const SocialProvider = ({ children }) => {
    const { subscribe } = useWebSocket();
    const { isAuthenticated, token } = useAuth();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
    const [party, setParty] = useState(null);

    // Initial fetch
    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const fetchSocialData = async () => {
            try {
                const [friendsList, requests, currentParty] = await Promise.all([
                    api.getFriends(token),
                    api.getFriendRequests(token),
                    api.getParty(token)
                ]);
                setFriends(friendsList);
                setFriendRequests(requests);
                setParty(currentParty);
            } catch (error) {
                console.error('Failed to fetch social data', error);
            }
        };

        fetchSocialData();
    }, [isAuthenticated, token]);

    // Real-time updates
    useEffect(() => {
        const unsubPresence = subscribe('presence_update', ({ userId, status }) => {
            setFriends(prev => prev.map(f =>
                f.id === userId ? { ...f, status } : f
            ));
        });

        const unsubFriendReq = subscribe('friend_request', (request) => {
            setFriendRequests(prev => ({
                ...prev,
                incoming: [...prev.incoming, request]
            }));
        });

        const unsubPartyUpdate = subscribe('party_update', (updatedParty) => {
            setParty(updatedParty);
        });

        return () => {
            unsubPresence();
            unsubFriendReq();
            unsubPartyUpdate();
        };
    }, [subscribe]);

    return (
        <SocialContext.Provider value={{ friends, friendRequests, party }}>
            {children}
        </SocialContext.Provider>
    );
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) {
        throw new Error('useSocial must be used within a SocialProvider');
    }
    return context;
};
