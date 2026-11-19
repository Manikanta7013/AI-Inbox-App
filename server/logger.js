import crypto from 'node:crypto';

export function createRequestId(request) {
  return request.get('x-request-id') || crypto.randomUUID();
}

export function log(level, event, details = {}) {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else console.log(output);
}

export function requestLoggingMiddleware(request, response, next) {
  const requestId = createRequestId(request);
  const startedAt = process.hrtime.bigint();

  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  response.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    log('info', 'http_request', {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
}
