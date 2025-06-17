import { createClient } from 'redis';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD || 'your_default_password', // Use environment variable for password
    socket: {
        host: redisUrl,
        port: 15535
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Function to connect and handle initial connection errors
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisClient.set('foo', 'bar')
    const result = await redisClient.get('foo');
    console.log(result)  // >>> bar
    console.log('Connected to Redis successfully.');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1); 
  }
};

