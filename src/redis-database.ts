// import { createClient } from 'redis';
// import * as dotenv from 'dotenv';
// // dotenv.config(); // Load environment variables from .env file

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


import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL to determine if it's local or cloud
const isLocalRedis = redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1');

export const redisClient = createClient({
  url: redisUrl, // Use the full URL for both local and cloud Redis
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Function to connect and handle initial connection errors
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisClient.set('foo', 'bar');
    const result = await redisClient.get('foo');
    console.log(`Redis test: ${result}`); // >>> bar
    console.log(`Connected to Redis successfully: ${isLocalRedis ? 'LOCAL' : 'CLOUD'}`);
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1); 
  }
};