/**
 * MongoDB Database Connection
 * This module handles connecting to MongoDB using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('Missing MONGODB_URI (or legacy MONGO_URI) environment variable');
    }

    // Connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error and exit the process if connection fails
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events for better logging
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = connectDB;
