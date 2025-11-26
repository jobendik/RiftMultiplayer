import { Router, Request, Response, NextFunction } from 'express';
import { USERS } from '../data/mockStore';

const router = Router();

interface AuthenticatedRequest extends Request {
    userId?: number;
}

// Middleware to simulate auth check (simplified - assumes same token structure)
const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && token.startsWith('mock-jwt-token-')) {
        (req as AuthenticatedRequest).userId = parseInt(token.split('-').pop() || '0');
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.get('/loadout', checkAuth, (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId!;
    const user = USERS.find(u => u.id === userId);

    if (user) {
        // Return simplified loadout for now
        res.json({
            currency: user.currency,
            // In a real game, this would return equipped items
            equipped: {
                primary: 'AK47',
                secondary: 'Pistol'
            }
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

router.post('/sync', checkAuth, (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId!;
    const { kills, score, timePlayed, won } = req.body;

    const user = USERS.find(u => u.id === userId);

    if (user) {
        // Update stats
        if (user.stats) {
            user.stats.matches += 1;
            user.stats.wins += won ? 1 : 0;
            user.stats.headshots += Math.floor(kills * 0.4); // Fake headshot stat
            // user.stats.kills += kills; // Add if we had a total kills field
        }

        // Award currency
        const tokensEarned = Math.floor(score / 100);
        const xpEarned = score;

        if (user.currency) {
            user.currency.riftTokens += tokensEarned;
        }

        user.xp += xpEarned;

        // Level up logic (simplified)
        if (user.xp !== undefined && user.nextLevelXp !== undefined && user.level !== undefined) {
            if (user.xp >= user.nextLevelXp) {
                user.level++;
                user.xp -= user.nextLevelXp;
                user.nextLevelXp = Math.floor(user.nextLevelXp * 1.2);
            }
        }

        console.log(`Synced stats for user ${userId}: +${tokensEarned} tokens, +${xpEarned} XP`);

        res.json({
            success: true,
            newLevel: user.level,
            newXp: user.xp,
            currencyEarned: tokensEarned
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

export default router;
