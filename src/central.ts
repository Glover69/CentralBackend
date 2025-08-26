import express from "express";
import * as dotenv from "dotenv";
import http from "http"; 
import cors from "cors";
import { connectMultipleDatabases } from "./database";
import { Server as SocketIOServer } from "socket.io"; 
import { initializeTypingTestSocket } from "./typing-test/socket/server";
import { connectRedis } from "./redis-database";
import { setupRoutes } from "./routes-index";
import cookieParser from 'cookie-parser';


// dotenv.config();

const app = express();
const port = process.env.PORT;

// Temporary check - remove after confirming
// console.log('🔍 Environment check:');
// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('SCHEDULR_DEV_URL:', process.env.SCHEDULR_DEV_URL);
// console.log('MONGODB_URI_SCHEDULR:', process.env.MONGODB_URI_SCHEDULR);
// console.log('---');


// Middleware to parse JSON bodies
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
export const callbackCors = cors({
  origin: (origin, cb) => {
    // Allow top-level POSTs from Google and cases where Origin is 'null'
    if (!origin || origin === 'null' || origin === 'https://accounts.google.com') return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

const allowedOrigins = ['https://schedulr-omega.vercel.app', 'https://schedulr-git-dev-daniel-glovers-projects.vercel.app', 'http://localhost:4200', 'null', 'https://accounts.google.com', 'https://auto-stat-web-platform.vercel.app', 'https://typing-test-game-two.vercel.app', 'https://light-frank-crayfish.ngrok-free.app', 'http://localhost:6969', 'http://localhost:3000', 'https://mpampacereals.com', 'https://www.mpampacereals.com', 'https://data-collection-nine.vercel.app', 'http://localhost:8000', 'https://cv-gen-six.vercel.app'];

// Use CORS middleware with specific origins
app.use(cors({
  origin: function (origin, callback) {
    // More permissive for mobile browsers and OAuth flows
    if (!origin || allowedOrigins.includes(origin) || origin === 'null') {
      callback(null, true);
    } else {
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


const httpServer = http.createServer(app);

// Initialize Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  },
  path: "/socket/"
});


initializeTypingTestSocket(io);

// --- Main Application Start Function ---
async function startServer() {
  try {
    // Connect to All MongoDB databases
    await connectMultipleDatabases();

    // Connect to Redis
    await connectRedis();

    // Set up all routes after db connections are ready
    await setupRoutes(app)

    httpServer.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`[socket.io]: Socket.IO server is listening on path /socket/`);
    });

    
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}


// --- Start the Server ---
startServer();







