import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import socialRoutes from './routes/social.routes';
import gameRoutes from './routes/game.routes';
import shopRoutes from './routes/shop.routes';
import { setupSocket } from './sockets/socketHandler';
import prisma from './prisma';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/shop', shopRoutes);

// Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`RiftBackend running on port ${PORT}`);
});
