import { Router, Request, Response, NextFunction } from 'express';
import { USERS, FRIENDS, FRIEND_REQUESTS } from '../data/mockStore';

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

router.get('/friends', checkAuth, (req: Request, res: Response) => {
    // Simulate delay
    setTimeout(() => {
        const userId = (req as AuthenticatedRequest).userId!;
        const friendIds = FRIENDS[userId] || [];
        const friends = USERS.filter(u => friendIds.includes(u.id)).map(u => ({
            id: u.id,
            username: u.username,
            tag: u.tag,
            status: u.status || 'offline',
            avatar: u.avatar,
            activity: u.activity
        }));
        res.json(friends);
    }, 400);
});

router.get('/friend-requests', checkAuth, (req: Request, res: Response) => {
    setTimeout(() => {
        const userId = (req as AuthenticatedRequest).userId!;
        const requests = FRIEND_REQUESTS[userId] || { incoming: [], outgoing: [] };

        const incomingDetails = USERS.filter(u => requests.incoming.includes(u.id)).map(u => ({
            id: u.id,
            username: u.username,
            tag: u.tag,
            avatar: u.avatar
        }));

        const outgoingDetails = USERS.filter(u => requests.outgoing.includes(u.id)).map(u => ({
            id: u.id,
            username: u.username,
            tag: u.tag,
            avatar: u.avatar
        }));

        res.json({ incoming: incomingDetails, outgoing: outgoingDetails });
    }, 300);
});

router.get('/party', checkAuth, (req: Request, res: Response) => {
    setTimeout(() => {
        // Mock: Not in a party initially
        res.json(null);
    }, 200);
});

export default router;
