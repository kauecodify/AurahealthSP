const { logger } = require('./logger');

// Error handler middleware
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('❌ Error handler:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user
  });

  // Determine error type
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Format error response
  const errorResponse = {
    error: err.message || 'Internal server error',
    code,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Add validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    errorResponse.errors = err.errors;
  }

  // Add details for development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
}

// 404 handler
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not found',
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path
  });
}

// Validation error handler
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = 'VALIDATION_ERROR';
    this.errors = errors;
  }
}

// Not found error
class NotFoundError extends Error {
  constructor(entity, id) {
    super(`${entity} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
    this.entity = entity;
    this.id = id;
  }
}

// Unauthorized error
class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.code = 'UNAUTHORIZED';
  }
}

// Forbidden error
class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.code = 'FORBIDDEN';
  }
}

// Conflict error
class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.code = 'CONFLICT';
  }
}

// Rate limit error
class RateLimitError extends Error {
  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
    this.code = 'RATE_LIMIT_EXCEEDED';
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError
};
