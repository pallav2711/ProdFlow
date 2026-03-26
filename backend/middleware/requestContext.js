const { randomUUID } = require('crypto');

const requestContext = (req, res, next) => {
  const incomingRequestId = req.get('X-Request-ID');
  const requestId = incomingRequestId || randomUUID();
  const start = process.hrtime.bigint();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1000000;

    const logEntry = {
      level: res.statusCode >= 500 ? 'error' : 'info',
      event: 'request_completed',
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(elapsedMs.toFixed(2)),
      ip: req.ip
    };

    const output = JSON.stringify(logEntry);
    if (res.statusCode >= 500) {
      console.error(output);
      return;
    }
    console.log(output);
  });

  next();
};

module.exports = requestContext;
