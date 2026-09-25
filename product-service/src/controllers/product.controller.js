const mongoose = require('mongoose');
const Product = require('../models/product.model');

// GET /products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message,
    });
  }
};

// GET /products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found (invalid ID format)`,
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.message,
    });
  }
};

// POST /products
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Please provide product name and price',
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock: stock !== undefined ? stock : 0,
      category,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create product',
      details: error.message,
    });
  }
};

// PUT /products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update product',
      details: error.message,
    });
  }
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Product ${id} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: error.message,
    });
  }
};
