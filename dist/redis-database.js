"use strict";
// import { createClient } from 'redis';
// import * as dotenv from 'dotenv';
// // dotenv.config(); // Load environment variables from .env file
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
// const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
// export const redisClient = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASSWORD || 'your_default_password', // Use environment variable for password
//     socket: {
//         host: redisUrl,
//         port: 15535
//     }
// });
// redisClient.on('error', (err) => console.error('Redis Client Error:', err));
// // Function to connect and handle initial connection errors
// export const connectRedis = async () => {
//   try {
//     await redisClient.connect();
//     await redisClient.set('foo', 'bar')
//     const result = await redisClient.get('foo');
//     console.log(result)  // >>> bar
//     console.log('Connected to Redis successfully.');
//   } catch (err) {
//     console.error('Failed to connect to Redis:', err);
//     process.exit(1); 
//   }
// };
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD;
// Parse Redis URL to determine if it's local or cloud
const isLocalRedis = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');
exports.redisClient = (0, redis_1.createClient)(Object.assign({ url: redisUrl }, (isLocalRedis ? {} : {
    username: 'default',
    password: redisPassword,
})));
exports.redisClient.on('error', (err) => console.error('Redis Client Error:', err));
// Function to connect and handle initial connection errors
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.redisClient.connect();
        yield exports.redisClient.set('foo', 'bar');
        const result = yield exports.redisClient.get('foo');
        console.log(`Redis test: ${result}`); // >>> bar
        console.log(`Connected to Redis successfully: ${isLocalRedis ? 'LOCAL' : 'CLOUD'}`);
    }
    catch (err) {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);
    }
});
exports.connectRedis = connectRedis;
