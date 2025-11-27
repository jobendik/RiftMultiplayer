import { Server, Socket } from 'socket.io';

interface QueuedPlayer {
    userId: number;
    socketId: string;
    modeId: string;
    timestamp: number;
}

const queue: QueuedPlayer[] = [];

export const setupMatchmaking = (io: Server, socket: Socket) => {
    const userId = (socket as any).userId;

    socket.on('start_queue', (data) => {
        const { modeId } = data;
        console.log(`User ${userId} joined queue for ${modeId}`);

        // Check if already in queue
        if (queue.find(p => p.userId === userId)) {
            return;
        }

        const player: QueuedPlayer = {
            userId,
            socketId: socket.id,
            modeId,
            timestamp: Date.now()
        };

        queue.push(player);

        // Try to find a match
        findMatch(io, modeId);
    });

    socket.on('cancel_queue', () => {
        console.log(`User ${userId} left queue`);
        const index = queue.findIndex(p => p.userId === userId);
        if (index !== -1) {
            queue.splice(index, 1);
        }
    });

    socket.on('disconnect', () => {
        const index = queue.findIndex(p => p.userId === userId);
        if (index !== -1) {
            queue.splice(index, 1);
        }
    });
};

const findMatch = (io: Server, modeId: string) => {
    // Filter players for this mode
    const playersInMode = queue.filter(p => p.modeId === modeId);

    if (playersInMode.length >= 2) {
        // Match the first two
        const p1 = playersInMode[0];
        const p2 = playersInMode[1];

        if (!p1 || !p2) return;

        // Remove from queue
        const idx1 = queue.indexOf(p1);
        if (idx1 !== -1) queue.splice(idx1, 1);

        const idx2 = queue.indexOf(p2);
        if (idx2 !== -1) queue.splice(idx2, 1);

        const matchId = `match_${Date.now()}_${p1.userId}_${p2.userId}`;
        console.log(`Match found: ${matchId} (${p1.userId} vs ${p2.userId})`);

        // Notify players
        [p1, p2].forEach(p => {
            if (p) {
                io.to(p.socketId).emit('match_found', {
                    id: matchId,
                    modeId,
                    opponentId: p.userId === p1.userId ? p2.userId : p1.userId
                });
            }
        });
    }
};
