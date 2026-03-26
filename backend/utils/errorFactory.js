const AppError = require('./appError');

const validationError = (message, code = 'VALIDATION_ERROR', details) =>
  new AppError(message, 400, code, details);

const unauthorizedError = (message = 'Not authorized', code = 'AUTH_REQUIRED', details) =>
  new AppError(message, 401, code, details);

const forbiddenError = (message = 'Forbidden', code = 'FORBIDDEN', details) =>
  new AppError(message, 403, code, details);

const notFoundError = (message = 'Resource not found', code = 'RESOURCE_NOT_FOUND', details) =>
  new AppError(message, 404, code, details);

const conflictError = (message = 'Conflict', code = 'CONFLICT', details) =>
  new AppError(message, 409, code, details);

module.exports = {
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError
};
