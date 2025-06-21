"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const CV_GeneratorRoutes_1 = require("./cv-generator/routes/CV-GeneratorRoutes");
const profileGenerator_1 = require("./AI/profileGenerator");
const database_1 = require("./database");
const collection_routes_1 = require("./cv-generator/routes/collection.routes");
const auth_routes_1 = __importDefault(require("./cv-generator/routes/auth.routes"));
const auth_autostat_routes_1 = __importDefault(require("./autostat-web/routes/auth-autostat.routes"));
const match_process_routes_1 = __importDefault(require("./autostat-web/routes/match-process.routes"));
const review_routes_1 = __importDefault(require("./his-majesty/routes/review.routes"));
const socket_io_1 = require("socket.io"); // Import SocketIOServer
const server_1 = require("./typing-test/socket/server");
const redis_database_1 = require("./redis-database");
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
const allowedOrigins = ['http://localhost:4200', 'https://auto-stat-web-platform.vercel.app', 'https://typing-test-game-two.vercel.app', 'https://light-frank-crayfish.ngrok-free.app', 'http://localhost:6969', 'http://localhost:3000', 'https://mpampacereals.com', 'https://www.mpampacereals.com', 'https://data-collection-nine.vercel.app', 'http://localhost:8000', 'https://cv-gen-six.vercel.app'];
// Use CORS middleware with specific origins
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
const httpServer = http_1.default.createServer(app);
// Initialize Socket.IO server
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    },
    path: "/socket/"
});
(0, server_1.initializeTypingTestSocket)(io);
// // Connect to MongoDB
// connectDB();
// connectRedis()
// httpServer.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
//   console.log(`[socket.io]: Socket.IO server is listening on path /socket/`);
// });
// --- Main Application Start Function ---
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield (0, database_1.connectDB)(); // Assuming connectDB is also async and you want to await it
            // Connect to Redis
            yield (0, redis_database_1.connectRedis)();
            httpServer.listen(port, () => {
                console.log(`[server]: Server is running at http://localhost:${port}`);
                console.log(`[socket.io]: Socket.IO server is listening on path /socket/`);
            });
        }
        catch (error) {
            console.error("Failed to start the server:", error);
            process.exit(1); // Exit if essential services fail to connect
        }
    });
}
// --- Start the Server ---
startServer();
app.use('/api/cv-generator', CV_GeneratorRoutes_1.CVGeneratorRoutes);
app.use('/api/ai', profileGenerator_1.profileGeneratorRoutes);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/collections', collection_routes_1.collectionRoutes);
app.use("/api/his-majesty/reviews", review_routes_1.default);
app.use("/api/autostat-web/auth", auth_autostat_routes_1.default);
app.use("/api/autostat-web/match-processes", match_process_routes_1.default);
