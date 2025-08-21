"use strict";
// src/database.ts
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
exports.closeAllConnections = exports.getAllConnections = exports.getConnection = exports.connectMultipleDatabases = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Database configurations
const databases = [
    {
        name: 'main',
        uri: process.env.MONGODB_URI || '',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    {
        name: 'hisMajesty',
        uri: process.env.MONGODB_URI_TWO || '',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    {
        name: 'schedulr',
        uri: process.env.MONGODB_URI_SCHEDULR || '',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    {
        name: 'autostat',
        uri: process.env.MONGODB_URI_AUTOSTAT || '',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    }
];
// Store connections
const connections = new Map();
// Connect to multiple databases
const connectMultipleDatabases = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connectionPromises = databases.map((dbConfig) => __awaiter(void 0, void 0, void 0, function* () {
            if (!dbConfig.uri) {
                console.warn(`URI missing for database: ${dbConfig.name}`);
                return null;
            }
            try {
                const connection = yield mongoose_1.default.createConnection(dbConfig.uri, dbConfig.options);
                connections.set(dbConfig.name, connection);
                console.log(`Connected to ${dbConfig.name} database`);
                return connection;
            }
            catch (error) {
                console.error(`Error connecting to ${dbConfig.name} database:`, error);
                return null;
            }
        }));
        const results = yield Promise.allSettled(connectionPromises);
        // Check if at least one connection succeeded
        const successfulConnections = results.filter(result => result.status === 'fulfilled' && result.value !== null);
        if (successfulConnections.length === 0) {
            console.error('Failed to connect to any database');
            process.exit(1);
        }
        console.log(`Successfully connected to ${successfulConnections.length} database(s)`);
    }
    catch (error) {
        console.error('Error in database connections setup:', error);
        process.exit(1);
    }
});
exports.connectMultipleDatabases = connectMultipleDatabases;
// Get specific database connection
const getConnection = (name) => {
    const connection = connections.get(name);
    if (!connection) {
        throw new Error(`Database connection '${name}' not found`);
    }
    return connection;
};
exports.getConnection = getConnection;
// Get all connections
const getAllConnections = () => {
    return connections;
};
exports.getAllConnections = getAllConnections;
// Close all connections
const closeAllConnections = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const closePromises = Array.from(connections.values()).map(connection => connection.close());
        yield Promise.all(closePromises);
        connections.clear();
        console.log('All database connections closed');
    }
    catch (error) {
        console.error('Error closing database connections:', error);
    }
});
exports.closeAllConnections = closeAllConnections;
// Add a function to check if connections are ready
const isConnectionReady = (name) => {
    const connection = connections.get(name);
    return connection ? connection.readyState === 1 : false;
};
// Add a function to wait for connection
const waitForConnection = (name_1, ...args_1) => __awaiter(void 0, [name_1, ...args_1], void 0, function* (name, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (isConnectionReady(name)) {
            return getConnection(name);
        }
        yield new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Timeout waiting for database connection '${name}'`);
});
// Legacy single connection function (for backward compatibility)
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const mainDbUri = process.env.MONGODB_URI;
    if (!mainDbUri) {
        console.error('MongoDB URI is missing. Check your environment variables.');
        process.exit(1);
    }
    try {
        yield mongoose_1.default.connect(mainDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB (legacy connection)');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
