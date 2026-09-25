const mongoose = require('mongoose');
const Order = require('../models/order.model');
const { getUserById, getProductById, ServiceError } = require('../services/external.service');

// POST /orders
exports.createOrder = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    // Validate request body
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both userId and productId',
      });
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive integer greater than 0',
      });
    }

    // Step 1: Validate user by communicating with User Service
    console.log(`[Order Service] Validating user '${userId}' via User Service...`);
    const user = await getUserById(userId);

    // Step 2: Validate product by communicating with Product Service
    console.log(`[Order Service] Validating product '${productId}' via Product Service...`);
    const product = await getProductById(productId);

    // Step 3: Check stock availability
    if (product.stock !== undefined && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    // Step 4: Calculate total price
    const unitPrice = product.price;
    const totalPrice = Number((unitPrice * quantity).toFixed(2));

    // Step 5: Save order in Order DB
    const order = await Order.create({
      userId,
      productId,
      quantity,
      unitPrice,
      totalPrice,
      status: 'CONFIRMED',
      userDetails: {
        name: user.name,
        email: user.email,
      },
      productDetails: {
        name: product.name,
        category: product.category,
      },
    });

    console.log(`[Order Service] Order created successfully: ID ${order.id}`);

    res.status(201).json({
      success: true,
      message: 'Order created and validated successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        failedService: error.serviceName,
        details: error.details,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      details: error.message,
    });
  }
};

// GET /orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      details: error.message,
    });
  }
};

// GET /orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Order with ID ${id} not found (invalid ID format)`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
      details: error.message,
    });
  }
};
