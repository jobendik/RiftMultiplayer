import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const router = Router();

interface AuthenticatedRequest extends Request {
    userId?: number;
}

// Middleware to simulate auth check (simplified)
const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && token.startsWith('mock-jwt-token-')) {
        (req as AuthenticatedRequest).userId = parseInt(token.split('-').pop() || '0');
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.get('/friends', checkAuth, async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId!;

    try {
        // Find friendships where user is either userId or friendId
        // But our schema has explicit relations: friends (UserFriends) and friendOf (FriendUser)
        // We need to fetch both directions or normalize it.
        // In seed, we created mutual records, so checking 'friends' relation might be enough if we always create both.
        // Let's check 'friends' relation (where user is userId)

        const userWithFriends = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: {
                    include: {
                        friend: true
                    }
                }
            }
        });

        if (!userWithFriends) {
            return res.json([]);
        }

        const friends = userWithFriends.friends.map((f: any) => ({
            id: f.friend.id,
            username: f.friend.username,
            tag: '0000', // Mock tag for now
            status: 'offline', // Mock status for now
            avatar: '/assets/avatars/default.png', // Mock avatar
            activity: 'Online' // Mock activity
        }));

        res.json(friends);
    } catch (error) {
        console.error('Friends error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/friend-requests', checkAuth, async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId!;

    try {
        const incoming = await prisma.friendRequest.findMany({
            where: { receiverId: userId, status: 'PENDING' },
            include: { sender: true }
        });

        const outgoing = await prisma.friendRequest.findMany({
            where: { senderId: userId, status: 'PENDING' },
            include: { receiver: true }
        });

        const incomingDetails = incoming.map((r: any) => ({
            id: r.sender.id,
            username: r.sender.username,
            tag: '0000',
            avatar: '/assets/avatars/default.png'
        }));

        const outgoingDetails = outgoing.map((r: any) => ({
            id: r.receiver.id,
            username: r.receiver.username,
            tag: '0000',
            avatar: '/assets/avatars/default.png'
        }));

        res.json({ incoming: incomingDetails, outgoing: outgoingDetails });
    } catch (error) {
        console.error('Friend requests error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/party', checkAuth, (req: Request, res: Response) => {
    // Mock: Not in a party initially
    res.json(null);
});

router.get('/leaderboard', checkAuth, async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: { stats: true },
            orderBy: {
                stats: {
                    xp: 'desc'
                }
            },
            take: 100
        });

        const leaderboard = users.map((user: any, index: number) => ({
            rank: index + 1,
            id: user.id,
            username: user.username,
            level: user.stats?.level || 1,
            xp: user.stats?.xp || 0,
            wins: user.stats?.wins || 0,
            avatar: '/assets/avatars/default.png', // Placeholder
            tag: '0000' // Placeholder
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
