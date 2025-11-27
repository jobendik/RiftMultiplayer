import { Server, Socket } from 'socket.io';
import { setupMatchmaking } from './matchmakingHandler';
import { setupGameHandler } from './gameHandler';

// Map to store userId -> socketId
const userSockets = new Map<number, string>();

export const setupSocket = (io: Server) => {
    // Middleware for authentication
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (token && token.startsWith('mock-jwt-token-')) {
            const userId = parseInt(token.split('-').pop() || '0');
            (socket as any).userId = userId;
            next();
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        console.log(`User ${userId} connected (Socket: ${socket.id})`);

        // Register user socket
        userSockets.set(userId, socket.id);

        // Initialize Matchmaking
        setupMatchmaking(io, socket);

        // Initialize Game Networking
        setupGameHandler(io, socket);

        // Broadcast presence update
        socket.broadcast.emit('presence_update', {
            userId: userId,
            status: 'online'
        });

        // Send current online users to the new user
        userSockets.forEach((_, onlineUserId) => {
            if (onlineUserId !== userId) {
                socket.emit('presence_update', {
                    userId: onlineUserId,
                    status: 'online'
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
            userSockets.delete(userId);

            // Broadcast offline status
            socket.broadcast.emit('presence_update', {
                userId: userId,
                status: 'offline'
            });
        });

        socket.on('chat_message', async (data) => {
            console.log(`Message from ${userId}:`, data);
            const { recipientId, content } = data;

            // Save to DB (optional, but good for persistence)
            // For now, just relay

            const message = {
                id: Date.now(),
                senderId: userId,
                recipientId,
                content,
                timestamp: new Date().toISOString(),
                tempId: data.tempId // Echo back tempId
            };

            // Send to recipient if online
            const recipientSocketId = userSockets.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('chat_message', message);
            } else {
                console.log(`User ${recipientId} is offline`);
            }

            // Echo back to sender (for confirmation/optimistic update sync)
            socket.emit('message_sent', message);
        });
    });
};
