require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'product-service',
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/products', productRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found on Product Service`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Product Service Error]', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[Product Service] running on port ${PORT}`);
});
