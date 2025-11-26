import { Server, Socket } from 'socket.io';

export const setupSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

        socket.on('chat_message', (data) => {
            console.log('Received chat message:', data);

            // Echo back with timestamp and ID
            const message = {
                ...data,
                id: Date.now(),
                timestamp: new Date().toISOString()
            };

            // Broadcast to all (simplified for global chat)
            io.emit('chat_message', message);
        });

        // Simulation: Send random presence updates
        const presenceInterval = setInterval(() => {
            const statuses = ['online', 'offline', 'in_game', 'away'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const friendId = Math.floor(Math.random() * 4) + 2; // IDs 2-5

            socket.emit('presence_update', {
                userId: friendId,
                status: randomStatus
            });
        }, 10000);

        // Simulation: Send random chat messages
        const chatInterval = setInterval(() => {
            const messages = [
                "Anyone up for ranked?",
                "Did you see the new skin?",
                "gg last game",
                "invite pls",
                "brb 5 mins"
            ];
            const randomMsg = messages[Math.floor(Math.random() * messages.length)];
            const friendId = Math.floor(Math.random() * 4) + 2;

            socket.emit('chat_message', {
                id: Date.now(),
                senderId: friendId,
                content: randomMsg,
                timestamp: new Date().toISOString(),
                channelId: 'global'
            });
        }, 15000);

        socket.on('disconnect', () => {
            clearInterval(presenceInterval);
            clearInterval(chatInterval);
        });
    });
};
