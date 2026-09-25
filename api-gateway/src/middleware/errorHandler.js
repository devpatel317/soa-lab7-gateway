/**
 * Centralized Gateway Error Handling
 * Standardizes 502 Bad Gateway, 503 Service Unavailable, and 404/500 responses.
 */

function handleProxyError(err, req, res, targetServiceName, targetUrl) {
  console.error(`[API Gateway Proxy Error] Unable to forward ${req.method} ${req.originalUrl} to ${targetServiceName} (${targetUrl}):`, err.message);

  const isTimeout = err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT' || err.message.includes('timeout');
  const statusCode = isTimeout ? 504 : (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' ? 503 : 502);
  const errorTitle = isTimeout
    ? 'Gateway Timeout'
    : statusCode === 503
    ? 'Service Unavailable'
    : 'Bad Gateway';

  if (!res.headersSent) {
    res.status(statusCode).json({
      success: false,
      statusCode,
      error: errorTitle,
      message: `The upstream microservice '${targetServiceName}' is currently unreachable or failed to respond.`,
      details: {
        code: err.code || 'UPSTREAM_ERROR',
        targetService: targetServiceName,
        targetUrl,
        requestedPath: req.originalUrl,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'Not Found',
    message: `Route '${req.originalUrl}' does not exist on API Gateway.`,
    availableRoutes: ['/health', '/users', '/products', '/orders'],
    timestamp: new Date().toISOString(),
  });
}

function globalErrorHandler(err, req, res, next) {
  console.error('[API Gateway Internal Error]', err.stack || err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      error: 'Internal Gateway Error',
      message: err.message || 'An unexpected error occurred in the gateway.',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  handleProxyError,
  notFoundHandler,
  globalErrorHandler,
};
