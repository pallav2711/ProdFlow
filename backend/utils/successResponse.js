/**
 * Standard success response envelope.
 */
const sendSuccess = (
  res,
  {
    statusCode = 200,
    message,
    data = {},
    meta
  } = {}
) => {
  const payload = {
    success: true,
    ...(message ? { message } : {}),
    ...data,
    ...(meta ? { meta } : {}),
    requestId: res.getHeader('X-Request-ID'),
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(payload);
};

module.exports = sendSuccess;
