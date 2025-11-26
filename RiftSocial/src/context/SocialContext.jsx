import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';
import { api } from '../services/api';

const SocialContext = createContext(null);

export const SocialProvider = ({ children }) => {
    const { subscribe } = useWebSocket();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState({ incoming: [], outgoing: [] });
    const [party, setParty] = useState(null);

    // Initial fetch
    useEffect(() => {
        const fetchSocialData = async () => {
            try {
                const [friendsList, requests, currentParty] = await Promise.all([
                    api.getFriends(localStorage.getItem('auth_token')),
                    api.getFriendRequests(localStorage.getItem('auth_token')),
                    api.getParty(localStorage.getItem('auth_token'))
                ]);
                setFriends(friendsList);
                setFriendRequests(requests);
                setParty(currentParty);
            } catch (error) {
                console.error('Failed to fetch social data', error);
            }
        };

        fetchSocialData();
    }, []);

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
