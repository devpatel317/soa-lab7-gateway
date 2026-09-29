const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.PRODUCT_MONGO_URI || process.env.MONGO_URI || 'mongodb://product-db:27017/productdb';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });
    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[Product Service] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    console.log(`[Product Service] Active DB URI: ${maskedURI}`);
  } catch (error) {
    console.error(`[Product Service] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

