/**
 * Gateway Request Logging Middleware
 * Captures Method, Path, Timestamp, Target Upstream Service, and Response Duration.
 */
function gatewayLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const targetService = req.targetService || 'Gateway (Local)';
    const status = res.statusCode;

    const statusBadge =
      status >= 500
        ? `\x1b[31m${status}\x1b[0m` // Red
        : status >= 400
        ? `\x1b[33m${status}\x1b[0m` // Yellow
        : status >= 300
        ? `\x1b[36m${status}\x1b[0m` // Cyan
        : `\x1b[32m${status}\x1b[0m`; // Green

    console.log(
      `[${new Date().toISOString()}] [API-GATEWAY] ${req.method} ${req.originalUrl} -> ${targetService} | Status: ${statusBadge} | ${duration}ms`
    );
  });

  next();
}

module.exports = gatewayLogger;
