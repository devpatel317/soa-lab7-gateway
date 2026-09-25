const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 3003;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'order-service',
    status: 'UP',
    port: PORT,
    dependencies: {
      userService: process.env.USER_SERVICE_URL || 'http://user-service:3001',
      productService: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    },
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/orders', orderRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found on Order Service`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Order Service Error]', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[Order Service] running on port ${PORT}`);
  console.log(`[Order Service] Configured User Service URL: ${process.env.USER_SERVICE_URL || 'http://user-service:3001'}`);
  console.log(`[Order Service] Configured Product Service URL: ${process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002'}`);
});
