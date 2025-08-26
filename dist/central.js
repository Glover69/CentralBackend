"use strict";
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
exports.callbackCors = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const socket_io_1 = require("socket.io");
const server_1 = require("./typing-test/socket/server");
const redis_database_1 = require("./redis-database");
const routes_index_1 = require("./routes-index");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
// Temporary check - remove after confirming
// console.log('🔍 Environment check:');
// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('SCHEDULR_DEV_URL:', process.env.SCHEDULR_DEV_URL);
// console.log('MONGODB_URI_SCHEDULR:', process.env.MONGODB_URI_SCHEDULR);
// console.log('---');
// Middleware to parse JSON bodies
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((req, res, next) => {
    if (req.path.includes('google-auth')) {
        console.log('📱 OAuth Request Debug:');
        console.log('Origin:', req.headers.origin);
        console.log('Referer:', req.headers.referer);
        console.log('User-Agent:', req.headers['user-agent']);
        console.log('---');
    }
    next();
});
// 1) Callback route first, with relaxed CORS (or none)
exports.callbackCors = (0, cors_1.default)({
    origin: (origin, cb) => {
        // Allow top-level POSTs from Google and cases where Origin is 'null'
        if (!origin || origin === 'null' || origin === 'https://accounts.google.com')
            return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
});
const allowedOrigins = ['https://schedulr-omega.vercel.app', 'https://schedulr-git-dev-daniel-glovers-projects.vercel.app', 'http://localhost:4200', 'null', 'https://accounts.google.com', 'https://auto-stat-web-platform.vercel.app', 'https://typing-test-game-two.vercel.app', 'https://light-frank-crayfish.ngrok-free.app', 'http://localhost:6969', 'http://localhost:3000', 'https://mpampacereals.com', 'https://www.mpampacereals.com', 'https://data-collection-nine.vercel.app', 'http://localhost:8000', 'https://cv-gen-six.vercel.app'];
// Use CORS middleware with specific origins
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // More permissive for mobile browsers and OAuth flows
        if (!origin || allowedOrigins.includes(origin) || origin === 'null') {
            callback(null, true);
        }
        else {
            // Log the rejected origin for debugging
            console.log('🚫 CORS rejected origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    // Add these for better mobile compatibility
    optionsSuccessStatus: 200, // For legacy browser support
    preflightContinue: false
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
// --- Main Application Start Function ---
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to All MongoDB databases
            yield (0, database_1.connectMultipleDatabases)();
            // Connect to Redis
            yield (0, redis_database_1.connectRedis)();
            // Set up all routes after db connections are ready
            yield (0, routes_index_1.setupRoutes)(app);
            httpServer.listen(port, () => {
                console.log(`[server]: Server is running at http://localhost:${port}`);
                console.log(`[socket.io]: Socket.IO server is listening on path /socket/`);
            });
        }
        catch (error) {
            console.error("Failed to start the server:", error);
            process.exit(1);
        }
    });
}
// --- Start the Server ---
startServer();
