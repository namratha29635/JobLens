const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;

  if (primaryUri) {
    console.log('🔄 Attempting connection to primary MongoDB (Atlas)...');
    try {
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
        family: 4,
        maxPoolSize: 10,
      });
      console.log(`✅ Primary MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`\n⚠️  Primary MongoDB connection failed: ${err.message}`);
      console.warn('💡 Tip: If using MongoDB Atlas, make sure your IP is whitelisted (0.0.0.0/0) in Atlas Network Access.');
      console.log('⚡ Switching to embedded in-memory MongoDB fallback so the app continues working seamlessly...\n');
    }
  }

  // Fallback: Start MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const fallbackUri = mongodInstance.getUri();
    const conn = await mongoose.connect(fallbackUri, {
      dbName: 'joblens',
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ In-Memory MongoDB connected at ${fallbackUri}`);
    return conn;
  } catch (fallbackErr) {
    console.error('❌ Failed to initialize fallback MongoDB:', fallbackErr.message);
    process.exit(1);
  }
};

module.exports = connectDB;
