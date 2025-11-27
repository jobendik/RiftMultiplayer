import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

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

router.get('/loadout', checkAuth, async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId!;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                currency: true,
                inventory: true
            }
        });

        if (user) {
            res.json({
                currency: user.currency,
                inventory: user.inventory,
                // In a real game, this would return equipped items from a Loadout model
                equipped: {
                    primary: 'AK47',
                    secondary: 'Pistol'
                }
            });
        } else {
            // Fallback for guest/dev users who don't exist in DB yet
            console.log(`User ${userId} not found, returning default loadout`);
            res.json({
                currency: { riftTokens: 0, plasmaCredits: 0 },
                inventory: [],
                equipped: {
                    primary: 'AK47',
                    secondary: 'Pistol'
                }
            });
        }
    } catch (error) {
        console.error('Loadout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/sync', checkAuth, async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).userId!;
    const { kills, score, timePlayed, won } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { stats: true, currency: true }
        });

        if (user && user.stats && user.currency) {
            // Calculate rewards
            const tokensEarned = Math.floor(score / 100);
            const xpEarned = score;

            let newLevel = user.stats.level;
            let newXp = user.stats.xp + xpEarned;
            let nextLevelXp = user.stats.nextLevelXp;

            // Level up logic
            if (newXp >= nextLevelXp) {
                newLevel++;
                newXp -= nextLevelXp;
                nextLevelXp = Math.floor(nextLevelXp * 1.2);
            }

            // Update Stats and Currency in a transaction
            const updatedUser = await prisma.$transaction(async (tx: any) => {
                // Update Stats
                const updatedStats = await tx.stats.update({
                    where: { userId: user.id },
                    data: {
                        matches: { increment: 1 },
                        wins: { increment: won ? 1 : 0 },
                        kills: { increment: kills }, // We now track total kills!
                        headshots: { increment: Math.floor(kills * 0.4) }, // Fake headshot stat
                        level: newLevel,
                        xp: newXp,
                        nextLevelXp: nextLevelXp
                    }
                });

                // Update Currency
                const updatedCurrency = await tx.currency.update({
                    where: { userId: user.id },
                    data: {
                        riftTokens: { increment: tokensEarned }
                    }
                });

                return { stats: updatedStats, currency: updatedCurrency };
            });

            console.log(`Synced stats for user ${userId}: +${tokensEarned} tokens, +${xpEarned} XP`);

            res.json({
                success: true,
                newLevel: updatedUser.stats.level,
                newXp: updatedUser.stats.xp,
                currencyEarned: tokensEarned
            });
        } else {
            res.status(404).json({ message: 'User not found or missing stats' });
        }
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
