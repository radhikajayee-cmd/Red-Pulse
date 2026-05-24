import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the local data directory exists for JSON fallback
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isConnected = false;

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-bank';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    
    // Set short timeout for local check so fallback triggers quickly if DB isn't running
    mongoose.set('strictQuery', false);
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log('MongoDB Connected Successfully.');
    isConnected = true;
    global.useMockDb = false;
  } catch (error) {
    console.warn('\n======================================================');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn('Reason:', error.message);
    console.warn('Falling back to LOCAL JSON DATABASE mode for testing!');
    console.warn('All data will be saved in backend/data/*.json');
    console.warn('======================================================\n');
    
    isConnected = false;
    global.useMockDb = true;
  }
};

export const getDbStatus = () => {
  return isConnected ? 'connected' : 'mock_db';
};
