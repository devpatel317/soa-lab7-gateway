require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'user-service',
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found on User Service`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[User Service Error]', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[User Service] running on port ${PORT}`);
});
