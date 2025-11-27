"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
// Middleware to simulate auth check (simplified - assumes same token structure)
const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token && token.startsWith('mock-jwt-token-')) {
        req.userId = parseInt(token.split('-').pop() || '0');
        next();
    }
    else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
router.get('/loadout', checkAuth, async (req, res) => {
    const userId = req.userId;
    try {
        const user = await prisma_1.default.user.findUnique({
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
        }
        else {
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
    }
    catch (error) {
        console.error('Loadout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/sync', checkAuth, async (req, res) => {
    const userId = req.userId;
    const { kills, score, timePlayed, won } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({
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
            const updatedUser = await prisma_1.default.$transaction(async (tx) => {
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
        }
        else {
            res.status(404).json({ message: 'User not found or missing stats' });
        }
    }
    catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=game.routes.js.map