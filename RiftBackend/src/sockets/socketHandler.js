"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = exports.getSocketId = exports.sendToUser = void 0;
const matchmakingHandler_1 = require("./matchmakingHandler");
const gameHandler_1 = require("./gameHandler");
const PartyManager_1 = require("../managers/PartyManager");
// Map to store userId -> socketId
const userSockets = new Map();
// Helper to send message to specific user from outside
const sendToUser = (io, userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit(event, data);
        return true;
    }
    return false;
};
exports.sendToUser = sendToUser;
const getSocketId = (userId) => {
    return userSockets.get(userId);
};
exports.getSocketId = getSocketId;
const setupSocket = (io) => {
    // Middleware for authentication
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (token && token.startsWith('mock-jwt-token-')) {
            const userId = parseInt(token.split('-').pop() || '0');
            socket.userId = userId;
            next();
        }
        else {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`User ${userId} connected (Socket: ${socket.id})`);
        // Register user socket
        userSockets.set(userId, socket.id);
        // Initialize Matchmaking
        (0, matchmakingHandler_1.setupMatchmaking)(io, socket);
        // Initialize Game Networking
        (0, gameHandler_1.setupGameHandler)(io, socket);
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
            }
            else {
                console.log(`User ${recipientId} is offline`);
            }
            // Echo back to sender (for confirmation/optimistic update sync)
            socket.emit('message_sent', message);
        });
        socket.on('party_chat', (data) => {
            const { content, tempId } = data;
            const party = PartyManager_1.partyManager.getUserParty(userId);
            if (!party)
                return;
            const message = {
                id: Date.now(),
                senderId: userId,
                senderName: `User ${userId}`, // Ideally fetch username
                content,
                timestamp: new Date().toISOString(),
                tempId,
                isParty: true
            };
            // Broadcast to all party members
            party.members.forEach(member => {
                const socketId = userSockets.get(member.userId);
                if (socketId) {
                    io.to(socketId).emit('party_chat', message);
                }
            });
        });
    });
};
exports.setupSocket = setupSocket;
//# sourceMappingURL=socketHandler.js.map