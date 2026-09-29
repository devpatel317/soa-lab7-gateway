const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.ORDER_MONGO_URI || process.env.MONGO_URI || 'mongodb://order-db:27017/orderdb';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[Order Service] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    console.log(`[Order Service] Active DB URI: ${maskedURI}`);
  } catch (error) {
    console.error(`[Order Service] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

