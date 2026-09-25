require('dotenv').config();

/**
 * Service Discovery Configuration Registry
 * Externalizes microservice locations via environment variables.
 * Allows routing table to be updated dynamically without altering route handler code.
 */
const serviceRegistry = {
  port: parseInt(process.env.PORT, 10) || 8080,
  timeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS, 10) || 5000,
  services: {
    user: {
      name: 'User Service',
      url: process.env.USER_SERVICE_URL || 'http://user-service:3001',
      pathPrefix: '/users',
    },
    product: {
      name: 'Product Service',
      url: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
      pathPrefix: '/products',
    },
    order: {
      name: 'Order Service',
      url: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
      pathPrefix: '/orders',
    },
  },
};

module.exports = serviceRegistry;
