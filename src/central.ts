import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import http from "http"; 
import cors from "cors";
import { CVGeneratorRoutes } from "./cv-generator/routes/CV-GeneratorRoutes";
import { profileGeneratorRoutes } from "./AI/profileGenerator";
import { connectDB } from "./database";
import { collectionRoutes } from "./cv-generator/routes/collection.routes";
import authRoutes from "./cv-generator/routes/auth.routes";
import reviewRoutes from "./his-majesty/routes/review.routes";
import { Socket, Server as SocketIOServer } from "socket.io"; // Import SocketIOServer
import { initializeTypingTestSocket } from "./typing-test/socket/server";
import { connectRedis } from "./redis-database";

dotenv.config();

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON bodies
app.use(express.json());
const allowedOrigins = ['http://localhost:4200', 'https://light-frank-crayfish.ngrok-free.app', 'http://localhost:6969', 'http://localhost:3000', 'https://mpampacereals.com', 'https://www.mpampacereals.com', 'https://data-collection-nine.vercel.app', 'http://localhost:8000', 'https://cv-gen-six.vercel.app'];

// Use CORS middleware with specific origins
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// // Connect to MongoDB
// connectDB();
// connectRedis()

// httpServer.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
//   console.log(`[socket.io]: Socket.IO server is listening on path /socket/`);
// });

// --- Main Application Start Function ---
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB(); // Assuming connectDB is also async and you want to await it

    // Connect to Redis
    await connectRedis();

    httpServer.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`[socket.io]: Socket.IO server is listening on path /socket/`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit if essential services fail to connect
  }
}

// --- Start the Server ---
startServer();

app.use('/api/cv-generator', CVGeneratorRoutes);
app.use('/api/ai', profileGeneratorRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use("/api/his-majesty/reviews", reviewRoutes);


