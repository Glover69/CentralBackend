// src/database.ts

import mongoose, { Connection, ConnectOptions } from 'mongoose';
// dotenv.config(); // Load environment variables from .env file

// Define database configuration interface
interface DatabaseConfig {
  name: string;
  uri: string;
  options?: ConnectOptions;
}


// Database configurations
const databases: DatabaseConfig[] = [  
  {
    name: 'main',
    uri: process.env.MONGODB_URI || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  },
  {
    name: 'hisMajesty',
    uri: process.env.MONGODB_URI_TWO || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  },
  {
    name: 'schedulr',
    uri: process.env.MONGODB_URI_SCHEDULR || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  },
  {
    name: 'autostat',
    uri: process.env.MONGODB_URI_AUTOSTAT || '',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  }
];

// Store connections
const connections: Map<string, Connection> = new Map();


// Connect to multiple databases
const connectMultipleDatabases = async () => {
  try {
    const connectionPromises = databases.map(async (dbConfig) => {
      if (!dbConfig.uri) {
        console.warn(`URI missing for database: ${dbConfig.name}`);
        return null;
      }

      try {
        const connection = await mongoose.createConnection(dbConfig.uri, dbConfig.options);
        connections.set(dbConfig.name, connection);
        console.log(`Connected to ${dbConfig.name} database`);
        return connection;
      } catch (error) {
        console.error(`Error connecting to ${dbConfig.name} database:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(connectionPromises);
    
    // Check if at least one connection succeeded
    const successfulConnections = results.filter(result => 
      result.status === 'fulfilled' && result.value !== null
    );

    if (successfulConnections.length === 0) {
      console.error('Failed to connect to any database');
      process.exit(1);
    }

    console.log(`Successfully connected to ${successfulConnections.length} database(s)`);
  } catch (error) {
    console.error('Error in database connections setup:', error);
    process.exit(1);
  }
};


// Get specific database connection
const getConnection = (name: string): Connection => {
  const connection = connections.get(name);
  if (!connection) {
    throw new Error(`Database connection '${name}' not found`);
  }
  return connection;
};

// Get all connections
const getAllConnections = (): Map<string, Connection> => {
  return connections;
};

// Close all connections
const closeAllConnections = async () => {
  try {
    const closePromises = Array.from(connections.values()).map(connection => 
      connection.close()
    );
    await Promise.all(closePromises);
    connections.clear();
    console.log('All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};


// Add a function to check if connections are ready
const isConnectionReady = (name: string): boolean => {
  const connection = connections.get(name);
  return connection ? connection.readyState === 1 : false;
};

// Add a function to wait for connection
const waitForConnection = async (name: string, timeout = 10000): Promise<Connection> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (isConnectionReady(name)) {
      return getConnection(name);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`Timeout waiting for database connection '${name}'`);
};


// Legacy single connection function (for backward compatibility)
const connectDB = async () => {
  const mainDbUri = process.env.MONGODB_URI;
  
  if (!mainDbUri) {
    console.error('MongoDB URI is missing. Check your environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mainDbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('Connected to MongoDB (legacy connection)');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};


export { 
  connectDB, 
  connectMultipleDatabases, 
  getConnection, 
  getAllConnections, 
  closeAllConnections 
};
