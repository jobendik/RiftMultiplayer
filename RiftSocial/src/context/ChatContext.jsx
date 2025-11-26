import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { subscribe, send } = useWebSocket();
    const [conversations, setConversations] = useState({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const unsubChat = subscribe('chat_message', (message) => {
            setConversations(prev => {
                const convId = message.channelId || message.senderId;
                const existing = prev[convId] || [];
                return {
                    ...prev,
                    [convId]: [...existing, message]
                };
            });

            if (message.senderId !== activeConversationId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [message.senderId]: (prev[message.senderId] || 0) + 1
                }));
            }
        });

        return () => unsubChat();
    }, [subscribe, activeConversationId]);

    const sendMessage = (recipientId, content) => {
        const message = {
            recipientId,
            content,
            timestamp: new Date().toISOString()
        };
        send('chat_message', message);

        // Optimistic update
        const convId = recipientId;
        setConversations(prev => ({
            ...prev,
            [convId]: [...(prev[convId] || []), { ...message, senderId: 'me', id: Date.now() }]
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
