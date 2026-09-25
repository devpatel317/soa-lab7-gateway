const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('../config/services.config');
const { handleProxyError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Helper to build proxy middleware for each microservice dynamically
 */
function buildServiceProxy(serviceConfig) {
  return createProxyMiddleware({
    target: serviceConfig.url,
    changeOrigin: true,
    timeout: serviceRegistry.timeoutMs,
    proxyTimeout: serviceRegistry.timeoutMs,
    pathRewrite: (path) => {
      // Ensure full prefix is forwarded to downstream microservices
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${serviceConfig.pathPrefix}${cleanPath === '/' ? '' : cleanPath}`;
    },
    on: {
      proxyReq: (proxyReq, req) => {
        req.targetService = serviceConfig.name;
      },
      error: (err, req, res) => {
        handleProxyError(err, req, res, serviceConfig.name, serviceConfig.url);
      },
    },
    onProxyReq: (proxyReq, req) => {
      req.targetService = serviceConfig.name;
    },
    onError: (err, req, res) => {
      handleProxyError(err, req, res, serviceConfig.name, serviceConfig.url);
    },
  });
}

// -------------------------------------------------------------
// Tagging and routing to User Service (/users)
// -------------------------------------------------------------
router.use(
  serviceRegistry.services.user.pathPrefix,
  (req, res, next) => {
    req.targetService = serviceRegistry.services.user.name;
    next();
  },
  buildServiceProxy(serviceRegistry.services.user)
);

// -------------------------------------------------------------
// Tagging and routing to Product Service (/products)
// -------------------------------------------------------------
router.use(
  serviceRegistry.services.product.pathPrefix,
  (req, res, next) => {
    req.targetService = serviceRegistry.services.product.name;
    next();
  },
  buildServiceProxy(serviceRegistry.services.product)
);

// -------------------------------------------------------------
// Tagging and routing to Order Service (/orders)
// -------------------------------------------------------------
router.use(
  serviceRegistry.services.order.pathPrefix,
  (req, res, next) => {
    req.targetService = serviceRegistry.services.order.name;
    next();
  },
  buildServiceProxy(serviceRegistry.services.order)
);

module.exports = router;
