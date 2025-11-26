import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { subscribe, send } = useWebSocket();
    const [conversations, setConversations] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const handleMessage = (message) => {
            setConversations(prev => {
                const convId = message.channelId || (message.senderId === 'me' ? message.recipientId : message.senderId);
                const existing = prev[convId] || [];

                // Check for duplicates
                if (existing.some(m => m.id === message.id)) return prev;

                return {
                    ...prev,
                    [convId]: [...existing, message]
                };
            });

            if (message.senderId !== 'me' && message.senderId !== activeConversationId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.senderId]: (prev[message.senderId] || 0) + 1
                }));
            }
        };

        const handleMessageSent = (message) => {
            setConversations(prev => {
                const convId = message.recipientId;
                const existing = prev[convId] || [];

                // Replace optimistic message (identified by tempId or similar content/timestamp)
                // For simplicity, we'll just filter out the optimistic one if we can identify it, 
                // or just append if we assume the optimistic one had a different ID.
                // But to avoid duplicates if we re-receive, we check ID.

                // Better approach: Remove the optimistic message (which had senderId='me' and a local ID)
                // and add the confirmed one.
                // However, matching them is hard without a unique client-generated ID passed through.

                // For now, let's just append and ensure we don't add duplicates by ID.
                // And since optimistic ID != server ID, we might get duplicates.
                // Let's NOT add the confirmed message if we already have an optimistic one?
                // No, we want the real ID.

                // Let's use a client-generated tempId.
                return {
                    ...prev,
                    [convId]: existing.map(m =>
                        (m.tempId && m.tempId === message.tempId) ? { ...message, senderId: 'me' } : m
                    )
                };
            });
        };

        const unsubChat = subscribe('chat_message', handleMessage);
        const unsubSent = subscribe('message_sent', handleMessageSent);

        return () => {
            unsubChat();
            unsubSent();
        };
    }, [subscribe, activeConversationId]);

    const sendMessage = (recipientId, content) => {
        const tempId = Date.now();
        const message = {
            recipientId,
            content,
            timestamp: new Date().toISOString(),
            tempId // Pass tempId to server to echo back
        };
        send('chat_message', message);

        // Optimistic update
        const convId = recipientId;
        setConversations(prev => ({
            ...prev,
            [convId]: [...(prev[convId] || []), { ...message, senderId: 'me', id: tempId }]
        }));
    };

    const openConversation = (id) => {
        setActiveConversationId(id);
        setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
    };

    const closeConversation = () => {
        setActiveConversationId(null);
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversationId,
            unreadCounts,
            sendMessage,
            openConversation,
            closeConversation
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
