const express = require('express');
const cors = require('cors');
const serviceRegistry = require('./config/services.config');
const gatewayLogger = require('./middleware/logger');
const gatewayRoutes = require('./routes/gateway.routes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = serviceRegistry.port;

// Global Middlewares
app.use(cors());
app.use(gatewayLogger);

/**
 * Gateway Health Check Endpoint (GET /health)
 * Reports the status of the API Gateway itself and its configured service discovery endpoints.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString(),
    serviceRegistry: {
      user: {
        name: serviceRegistry.services.user.name,
        path: serviceRegistry.services.user.pathPrefix,
        targetUrl: serviceRegistry.services.user.url,
      },
      product: {
        name: serviceRegistry.services.product.name,
        path: serviceRegistry.services.product.pathPrefix,
        targetUrl: serviceRegistry.services.product.url,
      },
      order: {
        name: serviceRegistry.services.order.name,
        path: serviceRegistry.services.order.pathPrefix,
        targetUrl: serviceRegistry.services.order.url,
      },
    },
    version: '1.0.0',
  });
});

// Proxy routes to downstream microservices (streamed directly without consuming body)
app.use('/', gatewayRoutes);

// Centralized 404 handler
app.use(notFoundHandler);

// Centralized global error handler
app.use(globalErrorHandler);

// Start Gateway Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`[API GATEWAY] Listening on http://0.0.0.0:${PORT}`);
  console.log('Service Discovery Registry:');
  console.log(`  -> User Service:    ${serviceRegistry.services.user.url} (Prefix: ${serviceRegistry.services.user.pathPrefix})`);
  console.log(`  -> Product Service: ${serviceRegistry.services.product.url} (Prefix: ${serviceRegistry.services.product.pathPrefix})`);
  console.log(`  -> Order Service:   ${serviceRegistry.services.order.url} (Prefix: ${serviceRegistry.services.order.pathPrefix})`);
  console.log('====================================================');
});
