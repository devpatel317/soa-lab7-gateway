const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const TIMEOUT_MS = parseInt(process.env.HTTP_TIMEOUT_MS, 10) || 3000;

class ServiceError extends Error {
  constructor(message, statusCode, serviceName, details = null) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.serviceName = serviceName;
    this.details = details;
  }
}

/**
 * Fetch and validate User from User Service
 * @param {string} userId
 * @returns {Promise<Object>} User data
 */
async function getUserById(userId) {
  const url = `${USER_SERVICE_URL}/users/${userId}`;
  try {
    const response = await axios.get(url, { timeout: TIMEOUT_MS });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new ServiceError(
          `User with ID '${userId}' not found in User Service`,
          404,
          'user-service',
          error.response.data
        );
      }
      throw new ServiceError(
        `User Service returned error: ${error.response.statusText || error.response.status}`,
        error.response.status,
        'user-service',
        error.response.data
      );
    }
    // Network / timeout / service unavailable errors
    throw new ServiceError(
      `User Service is unavailable at ${USER_SERVICE_URL}. Service communication failed.`,
      503,
      'user-service',
      error.message
    );
  }
}

/**
 * Fetch and validate Product from Product Service
 * @param {string} productId
 * @returns {Promise<Object>} Product data
 */
async function getProductById(productId) {
  const url = `${PRODUCT_SERVICE_URL}/products/${productId}`;
  try {
    const response = await axios.get(url, { timeout: TIMEOUT_MS });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new ServiceError(
          `Product with ID '${productId}' not found in Product Service`,
          404,
          'product-service',
          error.response.data
        );
      }
      throw new ServiceError(
        `Product Service returned error: ${error.response.statusText || error.response.status}`,
        error.response.status,
        'product-service',
        error.response.data
      );
    }
    // Network / timeout / service unavailable errors
    throw new ServiceError(
      `Product Service is unavailable at ${PRODUCT_SERVICE_URL}. Service communication failed.`,
      503,
      'product-service',
      error.message
    );
  }
}

module.exports = {
  getUserById,
  getProductById,
  ServiceError,
};
