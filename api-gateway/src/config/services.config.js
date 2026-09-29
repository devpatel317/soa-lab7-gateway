require('dotenv').config();

/**
 * Service Discovery Configuration Registry
 * Externalizes microservice locations via environment variables.
 * Allows routing table to be updated dynamically without altering route handler code.
 */
function normalizeUrl(urlStr, defaultUrl) {
  let val = (urlStr || defaultUrl).trim();
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    if (val.includes('.onrender.com')) {
      val = `https://${val}`;
    } else if (val.includes('-service') && !val.startsWith('user-service') && !val.startsWith('product-service') && !val.startsWith('order-service')) {
      // Render auto-generated hostname like soa-user-service-bl6i
      val = `https://${val}.onrender.com`;
    } else if (!val.includes('.') && !val.includes('localhost') && val.startsWith('soa-')) {
      val = `https://${val}.onrender.com`;
    } else {
      val = `http://${val}`;
    }
  }
  return val.replace(/\/+$/, '');
}

const serviceRegistry = {
  port: parseInt(process.env.PORT, 10) || 8080,
  timeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS, 10) || 10000,
  services: {
    user: {
      name: 'User Service',
      url: normalizeUrl(process.env.USER_SERVICE_URL, 'http://user-service:3001'),
      pathPrefix: '/users',
    },
    product: {
      name: 'Product Service',
      url: normalizeUrl(process.env.PRODUCT_SERVICE_URL, 'http://product-service:3002'),
      pathPrefix: '/products',
    },
    order: {
      name: 'Order Service',
      url: normalizeUrl(process.env.ORDER_SERVICE_URL, 'http://order-service:3003'),
      pathPrefix: '/orders',
    },
  },
};

module.exports = serviceRegistry;
