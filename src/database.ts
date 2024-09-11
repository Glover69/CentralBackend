// src/database.ts

import mongoose, { ConnectOptions } from 'mongoose';

import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const dbUrl = process.env.MONGODB_URI;

if (!dbUrl) {
  console.error('MongoDB URI is missing. Check your environment variables.');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export { connectDB };
