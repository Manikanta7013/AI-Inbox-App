import { log } from './logger.js';

export class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function notFoundHandler(request, response) {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.originalUrl} was not found`,
    },
  });
}

export function errorHandler(error, request, response, _next) {
  const statusCode = error instanceof ApiError
    ? error.statusCode
    : error instanceof SyntaxError && 'status' in error && error.status === 400
      ? 400
      : 500;
  const code = error instanceof ApiError
    ? error.code
    : statusCode === 400
      ? 'INVALID_JSON'
      : 'INTERNAL_SERVER_ERROR';

  log('error', 'http_error', {
    requestId: request.requestId,
    method: request.method,
    path: request.originalUrl,
    statusCode,
    code,
    message: error.message,
  });

  response.status(statusCode).json({
    error: {
      code,
      message: error instanceof ApiError
        ? error.message
        : statusCode === 400
          ? 'request body must contain valid JSON'
          : 'An unexpected server error occurred',
    },
  });
}
