import { Router } from 'express';
import { USERS } from '../data/mockStore';

const router = Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Simulate delay
    setTimeout(() => {
        const user = USERS.find(u => u.email === email && u.password === password);

        if (user) {
            // In a real app, we would generate a JWT here
            const token = 'mock-jwt-token-' + user.id;
            // Don't send password back
            const { password, ...userWithoutPassword } = user;
            res.json({ token, user: userWithoutPassword });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }, 800);
});

router.get('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    // Simulate delay
    setTimeout(() => {
        if (token && token.startsWith('mock-jwt-token-')) {
            // Extract ID from mock token
            const userId = parseInt(token.split('-').pop() || '0');
            const user = USERS.find(u => u.id === userId);

            if (user) {
                const { password, ...userWithoutPassword } = user;
                res.json(userWithoutPassword);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } else {
            res.status(401).json({ message: 'Invalid token' });
        }
    }, 500);
});

export default router;
