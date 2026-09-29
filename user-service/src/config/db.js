const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.USER_MONGO_URI || process.env.MONGO_URI || 'mongodb://user-db:27017/userdb';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[User Service] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    console.log(`[User Service] Active DB URI: ${maskedURI}`);
  } catch (error) {
    console.error(`[User Service] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

