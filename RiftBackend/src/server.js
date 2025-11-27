"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const game_routes_1 = __importDefault(require("./routes/game.routes"));
const shop_routes_1 = __importDefault(require("./routes/shop.routes"));
const socketHandler_1 = require("./sockets/socketHandler");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Make io accessible in routes
app.set('io', io);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/game', game_routes_1.default);
app.use('/api/shop', shop_routes_1.default);
// Socket.IO
(0, socketHandler_1.setupSocket)(io);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`RiftBackend running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map