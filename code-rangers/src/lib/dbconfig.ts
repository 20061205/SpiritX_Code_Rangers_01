import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/code_rangers';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function connectMongo() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    
    const opts = {
      bufferCommands: false,
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default connectMongo;